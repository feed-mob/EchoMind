import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../service';
import type { Mood, MoodStats, RedemptionEligibility, RedemptionHistory } from '../service/types';
import MoodCalendar from '../components/MoodCalendar';
import MoodTrendChart from '../components/MoodTrendChart';
import EmotionalPuzzle from '../components/EmotionalPuzzle';
import WorryRelease from '../components/WorryRelease';
import Loading from "../components/Loading";
import HomeTopHeader from '../components/HomeTopHeader';
import MoodSpaceSidebar from '../components/MoodSpaceSidebar';

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

              <div className="flex flex-col gap-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MoodTrendChart
                    timeRange={timeRange}
                    entries={entries}
                    onTimeRangeChange={setTimeRange}
                  />

                  <MoodCalendar
                    currentDate={currentDate}
                    dailySentiment={stats?.dailySentiment}
                    onNavigateMonth={navigateMonth}
                  />
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
