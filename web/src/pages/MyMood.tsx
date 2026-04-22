import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../service';
import type { Mood, MoodStats, RedemptionEligibility, RedemptionHistory } from '../service/types';
import MoodCalendar from '../components/MoodCalendar';
import MoodTrendChart from '../components/MoodTrendChart';
import MomentumCard from '../components/MomentumCard';
import EmotionalPuzzle from '../components/EmotionalPuzzle';
import WorryRelease from '../components/WorryRelease';
import Loading from "../components/Loading";
import HomeTopHeader from '../components/HomeTopHeader';
import MoodSpaceSidebar from '../components/MoodSpaceSidebar';

import { emotionSpectrum } from '../config/enum';

type MoodStatus = 'positive' | 'negative' | 'neutral';

export default function MyMood() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const moodKind = searchParams.get('kind') || 'positive';
  const moodStatus = moodKind as MoodStatus;

  const [entries, setEntries] = useState<Mood[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [redemptionEligibility, setRedemptionEligibility] = useState<RedemptionEligibility | null>(null);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');

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

      const [entriesData, statsData, redemptionEligibilityData, redemptionHistoryData] = await Promise.all([
        api.moods.list(user!.id, startDate.toISOString(), endDate.toISOString()),
        api.moods.getStats(user!.id),
        api.moods.getRedemptionEligibility(user!.id),
        api.moods.getRedemptionHistory(user!.id, 5),
      ]);

      setEntries(entriesData);
      setStats(statsData);
      setRedemptionEligibility(redemptionEligibilityData);
      setRedemptionHistory(redemptionHistoryData);

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
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <main className="flex-1 flex flex-col overflow-hidden">
        <HomeTopHeader activeMenu="mood" />

        <section className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">My Mood Journey</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <MomentumCard
                    redemptionEligibility={redemptionEligibility}
                    moodStatus={moodStatus}
                  />

                  {moodStatus == 'positive' && <EmotionalPuzzle
                    userId={user?.id}
                    redemptionEligibility={redemptionEligibility}
                    redemptionHistory={redemptionHistory}
                    quote="Every step forward is progress. Keep going!"
                    onGetReward={() => {
                      console.log('Reward claimed!');
                    }}
                  />}

                  {moodStatus == 'negative' && <WorryRelease
                    userId={user?.id}
                    redemptionEligibility={redemptionEligibility}
                    redemptionHistory={redemptionHistory}
                    onDumpSuccess={() => {
                      fetchMoodData();
                    }}
                  />}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <MoodCalendar
                    currentDate={currentDate}
                    dailySentiment={stats?.dailySentiment}
                    onNavigateMonth={navigateMonth}
                  />

                  <MoodTrendChart
                    timeRange={timeRange}
                    entries={entries}
                    onTimeRangeChange={setTimeRange}
                  />

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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <MoodSpaceSidebar />
          </div>
        </section>
      </main>

      {loading && (<Loading />)}
    </div>
  );
}
