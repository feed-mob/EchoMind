import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../service';
import type { TeamMoodStats, TeamMoodDistribution, TeamMoodTrend, TeamInsights } from '../service/types';
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

// 情绪标签映射
const emotionLabels: Record<string, string> = {
  joyful: 'Joyful',
  calm: 'Calm',
  anxious: 'Anxious',
  stressed: 'Stressed',
  excited: 'Excited',
  tired: 'Tired',
  grateful: 'Grateful',
  frustrated: 'Frustrated',
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
  productive: 'Productive',
};

// 情绪分布颜色
const pieColors = ['#22C55E', '#EAB308', '#DC2626', '#F97316', '#1E40AF', '#EC4899', '#9CA3AF', '#6B7280'];

// 星期映射
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function GroupMood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [stats, setStats] = useState<TeamMoodStats | null>(null);
  const [distribution, setDistribution] = useState<TeamMoodDistribution[]>([]);
  const [trend, setTrend] = useState<TeamMoodTrend[]>([]);
  const [insights, setInsights] = useState<TeamInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取团队情绪数据（groupId 从后端根据当前用户获取）
  useEffect(() => {
    if (user?.id) {
      fetchTeamMoodData();
    }
  }, [timeRange, user?.id]);

  const fetchTeamMoodData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [statsData, distributionData, trendData, insightsData] = await Promise.all([
        api.moods.getTeamStats(user.id, timeRange),
        api.moods.getTeamDistribution(user.id, timeRange),
        api.moods.getTeamTrend(user.id, timeRange),
        api.moods.getTeamInsights(user.id, timeRange),
      ]);

      setStats(statsData);
      setDistribution(distributionData);
      setTrend(trendData);
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team mood data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const data: Array<{ date: string; mood: number; entries: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = trend.find(t => t.date === dateStr);
      data.push({
        date: dateStr,
        mood: dayData?.averageMood || 0,
        entries: dayData?.entries || 0,
      });
    }

    return data;
  }, [trend, timeRange]);

  // 生成日历数据
  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();

    const days: Array<{
      date: number;
      mood: number | null;
      emotion: string | null;
      isToday: boolean;
    }> = [];

    // 填充上个月的日期
    for (let i = 0; i < startOffset; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate.getDate(),
        mood: null,
        emotion: null,
        isToday: false,
      });
    }

    // 填充当月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      const dayTrend = trend.find(t => t.date === dateStr);

      days.push({
        date: i,
        mood: dayTrend?.averageMood ?? null,
        emotion: null,
        isToday: i === today.getDate() && month === today.getMonth(),
      });
    }

    return days;
  }, [trend]);

  // 获取情绪颜色
  const getMoodColor = (mood: number | null): string => {
    if (mood === null) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    if (mood >= 4.5) return 'bg-green-500/10 border border-green-500/20 text-green-600 font-bold';
    if (mood >= 3.5) return 'bg-[#1754cf]/10 border border-[#1754cf]/20 text-[#1754cf] font-bold';
    if (mood >= 2.5) return 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 font-bold';
    return 'bg-red-500/10 border border-red-500/20 text-red-600 font-bold';
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] font-sans">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1754cf] mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading team mood analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] font-sans">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <span className="material-icons text-red-500 text-5xl mb-4">error_outline</span>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
            <button
              onClick={fetchTeamMoodData}
              className="mt-4 px-4 py-2 bg-[#1754cf] text-white rounded-lg hover:bg-[#1754cf]/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-20 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/groups')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#1754cf] transition-colors"
            >
              <span className="material-icons text-xl">arrow_back</span>
              <span className="text-sm font-semibold hidden sm:inline">Back</span>
            </button>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">Team Mood Analytics</h1>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#1754cf]/10 border border-[#1754cf]/20 overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#1754cf] text-sm font-bold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 lg:px-20 py-8">
        {/* Title and Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Team Mood Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">Visualize and understand the emotional health of your workforce.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
                className="appearance-none flex h-10 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 pr-10 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1754cf] focus:border-transparent cursor-pointer"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
              </select>
              <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1754cf] mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading team mood analysis...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Stats Cards - 与设计稿一致 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Average Sentiment */}
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Average Sentiment</p>
                  <span className="material-icons text-green-500">sentiment_satisfied</span>
                </div>
                <p className="text-slate-900 dark:text-white text-3xl font-bold capitalize">
                  {stats?.topEmotion ? emotionLabels[stats.topEmotion] || stats.topEmotion : 'Neutral'}
                </p>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-bold">
                  <span className="material-icons text-sm">trending_up</span>
                  <span>+5.2% from last month</span>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Engagement Rate</p>
                  <span className="material-icons text-[#1754cf]">analytics</span>
                </div>
                <p className="text-slate-900 dark:text-white text-3xl font-bold">
                  {stats?.participationRate ? `${stats.participationRate}%` : '0%'}
                </p>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-bold">
                  <span className="material-icons text-sm">people</span>
                  <span>{stats?.activeMembers || 0} active members</span>
                </div>
              </div>

              {/* Top Emotion */}
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Team Vibe</p>
                  <span className="material-icons text-orange-500">bolt</span>
                </div>
                <p className="text-slate-900 dark:text-white text-3xl font-bold">
                  {stats?.averageMood ? stats.averageMood.toFixed(1) : '0.0'}
                </p>
                <div className="flex items-center gap-1 text-[#1754cf] text-sm font-bold">
                  <span className="material-icons text-sm">verified</span>
                  <span>out of 5.0</span>
                </div>
              </div>
            </div>

            {/* Calendar and Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Mood Calendar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                      <span className="material-icons text-slate-400">chevron_left</span>
                    </button>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                      <span className="material-icons text-slate-400">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase py-2">
                      {day}
                    </div>
                  ))}
                  {calendarData.map((day, i) => (
                    <div
                      key={i}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${
                        day.isToday
                          ? 'bg-[#1754cf] text-white font-bold ring-4 ring-[#1754cf]/20'
                          : getMoodColor(day.mood)
                      }`}
                    >
                      <span>{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sentiment Distribution</h3>
                <div className="flex items-center gap-8">
                  {/* 简化的环形图 */}
                  <div className="relative h-40 w-40 rounded-full border-[16px] border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    {distribution.length > 0 && (
                      <>
                        <div
                          className="absolute inset-0 rounded-full border-[16px] border-green-500 border-l-transparent border-b-transparent rotate-45"
                          style={{
                            clipPath: `polygon(50% 0%, 100% 0%, 100% ${Math.min(100, distribution[0]?.percentage || 0)}%, 50% 50%)`,
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full border-[16px] border-yellow-400 border-r-transparent border-t-transparent border-b-transparent -rotate-12"
                          style={{
                            clipPath: `polygon(0% 0%, 50% 0%, 50% 50%, 0% ${Math.min(100, distribution[1]?.percentage || 0)}%)`,
                          }}
                        />
                      </>
                    )}
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {distribution.length > 0 ? `${distribution[0]?.percentage || 0}%` : '0%'}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Positive</p>
                    </div>
                  </div>
                  {/* 图例 */}
                  <div className="flex flex-col gap-3">
                    {distribution.slice(0, 4).map((item, index) => (
                      <div key={item.emotion} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {emotionLabels[item.emotion] || item.emotion} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Trend and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Trend Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Mood Trend (Weekly)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1754cf" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1754cf" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return weekDays[date.getDay()];
                        }}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                                <div className="font-medium">{data.mood > 0 ? `Mood: ${data.mood.toFixed(1)}/5` : 'No data'}</div>
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
                        strokeWidth={3}
                        dot={{ fill: '#1754cf', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: '#1754cf', strokeWidth: 2, fill: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between mt-4 px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <span key={day} className="text-xs font-bold text-slate-400">{day}</span>
                  ))}
                </div>
              </div>

              {/* Team Insights */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#1754cf]/10 rounded-lg text-[#1754cf]">
                    <span className="material-icons">lightbulb</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Team Insights</h3>
                </div>
                <div className="space-y-3">
                  {insights?.positiveTrends && insights.positiveTrends.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <div className="flex items-start gap-2">
                        <span className="material-icons text-green-500 text-sm mt-0.5">check_circle</span>
                        <p className="text-sm text-green-800 dark:text-green-200">{insights.positiveTrends[0]}</p>
                      </div>
                    </div>
                  )}
                  {insights?.areasForImprovement && insights.areasForImprovement.length > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <span className="material-icons text-yellow-500 text-sm mt-0.5">warning</span>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{insights.areasForImprovement[0]}</p>
                      </div>
                    </div>
                  )}
                  {insights?.recommendations && insights.recommendations.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <span className="material-icons text-blue-500 text-sm mt-0.5">tips_and_updates</span>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{insights.recommendations[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
