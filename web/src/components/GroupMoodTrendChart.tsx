import { useMemo } from 'react';
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
import type { TeamMoodTrend } from '../service/types';

interface GroupMoodTrendChartProps {
  trend: TeamMoodTrend[];
  timeRange: string;
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function GroupMoodTrendChart({ trend, timeRange }: GroupMoodTrendChartProps) {
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

  return (
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
  );
}
