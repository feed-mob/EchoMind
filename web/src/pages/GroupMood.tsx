import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../service';
import type { TeamMoodStats, TeamMoodDistribution, TeamMoodTrend, TeamInsights } from '../service/types';
import { emotionSpectrum } from "../config/enum";
import GroupMoodCalendar from '../components/GroupMoodCalendar';
import GroupMoodTrendChart from '../components/GroupMoodTrendChart';
import SentimentDistribution from '../components/SentimentDistribution';
import TeamInsightsCard from '../components/TeamInsights';
import GroupActionableAdvice from '../components/GroupActionableAdvice';
import StatCard from '../components/StatCard';


export default function GroupMood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
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
              onClick={() => navigate('/my-mood')}
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
              <StatCard
                title="Average Sentiment"
                icon="sentiment_satisfied"
                iconColor="text-green-500"
                value={stats?.topEmotion ? emotionSpectrum[stats.topEmotion]?.label || stats.topEmotion : 'Neutral'}
                footer={
                  <>
                    <span className="material-icons text-sm">trending_up</span>
                    <span className="text-green-600 dark:text-green-400">+5.2% from last month</span>
                  </>
                }
                footerClassName="text-green-600 dark:text-green-400"
              />

              {/* Engagement Rate */}
              <StatCard
                title="Engagement Rate"
                icon="analytics"
                iconColor="text-[#1754cf]"
                value={stats?.participationRate ? `${stats.participationRate}%` : '0%'}
                footer={
                  <>
                    <span className="material-icons text-sm">people</span>
                    <span>{stats?.activeMembers || 0} active members</span>
                  </>
                }
                footerClassName="text-slate-500 dark:text-slate-400"
              />

              {/* Team Vibe */}
              <StatCard
                title="Team Vibe"
                icon="bolt"
                iconColor="text-orange-500"
                value={stats?.averageMood ? stats.averageMood.toFixed(1) : '0.0'}
                footer={
                  <>
                    <span className="material-icons text-sm">verified</span>
                    <span className="text-[#1754cf]">out of 5.0</span>
                  </>
                }
                footerClassName="text-[#1754cf]"
              />
            </div>

            {/* Mood Calendar */}
            <div className="grid grid-cols-1 mb-8">
              <GroupMoodCalendar trend={trend} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sentiment Distribution */}
              <SentimentDistribution distribution={distribution} />
              {/* Mood Trend Chart */}
              <GroupMoodTrendChart trend={trend} timeRange={timeRange} />

              {/* Team Insights */}
              <TeamInsightsCard insights={insights} />

              {/* ActionableAdvice */}
              <GroupActionableAdvice />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
