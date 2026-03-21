import { useMemo } from 'react';
import type { Mood } from '../service/types';
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

interface MoodTrendChartProps {
  timeRange: '7' | '30' | '90';
  entries: Mood[];
  onTimeRangeChange: (range: '7' | '30' | '90') => void;
}

export default function MoodTrendChart({
  timeRange,
  entries,
  onTimeRangeChange,
}: MoodTrendChartProps) {
  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const data: Array<{ date: string; mood: number; moodLabel: string }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find((e) => e.recordedAt.startsWith(dateStr));

      const moodValue = entry
        ? { awesome: 5, good: 4, neutral: 3, low: 2, poor: 1 }[entry.mood] || 3
        : 0;

      data.push({
        date: dateStr,
        mood: moodValue,
        moodLabel: entry?.mood || '',
      });
    }

    return data;
  }, [entries, timeRange]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Mood Trend
        </h2>
        <select
          value={timeRange}
          onChange={(e) =>
            onTimeRangeChange(e.target.value as '7' | '30' | '90')
          }
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
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1754cf" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1754cf" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
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
                      <div className="font-medium">
                        {date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
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
              activeDot={{
                r: 6,
                stroke: '#1754cf',
                strokeWidth: 2,
                fill: '#fff',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
