import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../service';
import type { Mood } from '../service/types';
import { moodColorMap } from '../config/enum';
import {
  AreaChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from 'recharts';

interface MoodStats {
  total: number;
  currentStreak: number;
  topEmotion: string | null;
  moodDistribution: Record<string, number>;
}

const emotionLabels: Record<string, string> = {
  joyful: 'Joyful',
  calm: 'Calm',
  anxious: 'Anxious',
  stressed: 'Stressed',
  excited: 'Excited',
  tired: 'Tired',
  grateful: 'Grateful',
  frustrated: 'Frustrated',
};

export default function MoodHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<Mood[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
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

      const [entriesData, statsData] = await Promise.all([
        api.moods.list(user!.id, startDate.toISOString(), endDate.toISOString()),
        api.moods.getStats(user!.id),
      ]);

      setEntries(entriesData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mood data');
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: number; mood?: string; emotion?: string; color?: string; backgroundColor?: string; entry?: Mood }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const entry = entries.find(e => e.recordedAt.startsWith(dateStr));

      const color = moodColorMap[entry?.mood];
      const bgColor = color ? `${color}33` : '';
      days.push({
        date: i,
        mood: entry?.mood ?? undefined,
        emotion: entry?.emotion ?? undefined,
        color: color,
        backgroundColor: bgColor,
        entry,
      });
    }

    return days;
  }, [currentDate, entries]);

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const data: Array<{ date: string; mood: number; moodLabel: string }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.recordedAt.startsWith(dateStr));

      const moodValue = entry ? { awesome: 5, good: 4, neutral: 3, low: 2, poor: 1 }[entry.mood] || 3 : 0;

      data.push({
        date: dateStr,
        mood: moodValue,
        moodLabel: entry?.mood || '',
      });
    }

    return data;
  }, [entries, timeRange]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
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
          <p className="text-slate-600 dark:text-slate-400">Loading mood history...</p>
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
              onClick={() => navigate('/groups')}
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
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Mood Journey</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Visualizing your emotional well-being over the last {timeRange} days.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
              <span className="material-icons text-3xl">local_fire_department</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Streak</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.currentStreak || 0} Days</p>
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
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
              <span className="material-icons text-3xl">sentiment_very_satisfied</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Emotion</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.topEmotion ? emotionLabels[stats.topEmotion] || stats.topEmotion : 'None'}</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Calendar and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formatMonth(currentDate)}</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase py-2">{day}</div>
              ))}
              {calendarDays.map((day, index) => {
                const isCurrentMonth = index >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() &&
                  index < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const isToday = isCurrentMonth && day.date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                // Get color based on emotion
                const moodColor = day.color;
                console.log("===== day ==> ", day)
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium
                      ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : ''}
                      ${isCurrentMonth && !day.mood ? 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800' : ''}
                      ${isToday && !moodColor ? 'ring-4 ring-primary/20' : ''}
                      ${isToday && moodColor ? 'ring-4 ring-white/30' : ''}
                      transition-colors cursor-pointer
                    `}
                    style={moodColor && isCurrentMonth ? {
                      backgroundColor: day.backgroundColor,
                      color: day.color,
                    } : undefined}
                  >
                    <span className={day.mood ? 'font-bold' : ''}>{day.date}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-xs font-medium text-slate-500">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs font-medium text-slate-500">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span className="text-xs font-medium text-slate-500">Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-dashed border-slate-400"></span>
                <span className="text-xs font-medium text-slate-500">Missed Day</span>
              </div>
            </div>
          </div>

          {/* Mood Trend Chart Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mood Trend</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
                  className="text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-3 py-2"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 3 Months</option>
                </select>
              </div>

              {/* Chart - Recharts */}
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1754cf" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1754cf" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={30}
                    />
                    <YAxis
                      domain={[1, 5]}
                      tickFormatter={(value) => {
                        const labels = ['', 'POOR', 'LOW', 'NEUTRAL', 'GOOD', 'AWESOME'];
                        return labels[value] || '';
                      }}
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length && label) {
                          const data = payload[0].payload;
                          const date = new Date(label as string);
                          return (
                            <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              <div className="font-medium">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <div className="mt-1">
                                {data.mood > 0 ? (
                                  <span className="capitalize text-white">
                                    {data.moodLabel} ({data.mood}/5)
                                  </span>
                                ) : (
                                  <span className="text-slate-400">No data</span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="none"
                      fill="url(#colorMood)"
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#1754cf"
                      strokeWidth={2}
                      dot={{ fill: '#1754cf', strokeWidth: 2, r: 4, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#1754cf', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Insight Card */}
            <div className="bg-primary p-6 rounded-xl text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500">
                <span className="material-icons text-[120px]">lightbulb</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Weekly Mood Insight</h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                  {stats?.topEmotion
                    ? `You've been feeling mostly ${emotionLabels[stats.topEmotion] || stats.topEmotion.toLowerCase()}. Keep tracking your mood to discover patterns!`
                    : 'Start logging your mood daily to receive personalized insights about your emotional patterns.'}
                </p>
                <button className="mt-4 px-4 py-2 bg-white text-primary rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
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