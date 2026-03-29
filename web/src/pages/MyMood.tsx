import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../service';
import type { Mood, MoodStats } from '../service/types';
import MoodCalendar from '../components/MoodCalendar';
import MoodTrendChart from '../components/MoodTrendChart';
import MomentumCard from '../components/MomentumCard';
import EmotionalPuzzle from '../components/EmotionalPuzzle';
import WorryRelease from '../components/WorryRelease';

import { getDaysByKind } from "../tools/functions";
import { emotionSpectrum } from '../config/enum';
import { MIN_PUZZLE_DAYS, MIN_NEGATIVE_DAYS } from "../config/constants";

type MoodStatus = 'positive' | 'negative' | 'neutral';

export default function MyMood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const moodKind = searchParams.get('kind') || 'positive';
  const moodStatus = moodKind as MoodStatus;

  const [entries, setEntries] = useState<Mood[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [kindCheckInDays, setKindCheckInDays] = useState<number>(0);

  useEffect(() => {
    if (user?.id) {
      fetchMoodData();
    }
  }, [user?.id, timeRange]);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const [entriesData, statsData] = await Promise.all([
        api.moods.list(user!.id, startDate.toISOString(), endDate.toISOString()),
        api.moods.getStats(user!.id),
      ]);

      setEntries(entriesData);
      setStats(statsData);
      const days = getDaysByKind(statsData.dailySentiment, moodKind);
      setKindCheckInDays(days);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mood data');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading my mood history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-icons text-red-500 text-5xl mb-4">error_outline</span>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchMoodData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 lg:px-20 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/group')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors group"
            >
              <span className="material-icons text-[20px]">arrow_back</span>
              <span className="text-sm font-semibold tracking-tight">Back to Dashboard</span>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mood History</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-icons text-[20px]">notifications</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-sm font-bold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-20 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Mood Journey</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Visualizing your emotional well-being over the last {timeRange} days.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
              <span className="material-icons text-3xl">local_fire_department</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">All Check-In</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.checkInDays || 0} Days</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
              <span className="material-icons text-3xl">calendar_month</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Recorded</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total || 0} Entries</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{
              color: stats?.mostFrequentMood ? emotionSpectrum[stats.mostFrequentMood]?.color : '',
              backgroundColor: stats?.mostFrequentMood ? `${emotionSpectrum[stats.mostFrequentMood]?.color}22` : '',
              }}>
              <span className="material-icons text-3xl">{stats?.mostFrequentMood ? emotionSpectrum[stats.mostFrequentMood]?.icon : 'sentiment_very_satisfied'} </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Emotion</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.mostFrequentMood ? emotionSpectrum[stats.mostFrequentMood]?.label || stats.mostFrequentMood : 'None'}</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Calendar and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Momentum Card */}
            <MomentumCard
              checkInDays={kindCheckInDays}
              moodStatus={moodStatus}
            />

            {/* Emotional Puzzle */}
            {moodStatus == 'positive' && <EmotionalPuzzle
              completedDays={kindCheckInDays}
              totalDays={MIN_PUZZLE_DAYS}
              quote="Every step forward is progress. Keep going!"
              onGetReward={() => {
                // TODO: Implement reward logic
                console.log('Reward claimed!');
              }}
            />}

            {moodStatus == 'negative' && <WorryRelease
              stats={stats}
              completedDays={kindCheckInDays}
              totalDays={MIN_NEGATIVE_DAYS}
            />}

          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Calendar Section */}
            <MoodCalendar
              currentDate={currentDate}
              dailySentiment={stats?.dailySentiment}
              onNavigateMonth={navigateMonth}
            />

            {/* Mood Trend Chart Section */}
            <MoodTrendChart
              timeRange={timeRange}
              entries={entries}
              onTimeRangeChange={setTimeRange}
            />

            {/* Weekly Insight Card */}
            <div className="bg-primary p-6 rounded-xl text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
                <span className="material-icons text-[120px]">lightbulb</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Weekly Mood Insight</h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                  {stats?.mostFrequentMood
                    ? `You've been feeling mostly ${emotionSpectrum[stats.mostFrequentMood].label || stats.mostFrequentMood.toLowerCase()}. Keep tracking your mood to discover patterns!`
                    : 'Start logging your mood daily to receive personalized insights about your emotional patterns.'}
                </p>
                <button onClick={() => navigate('/group/mood')} className="mt-4 px-4 py-2 bg-white text-primary rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
