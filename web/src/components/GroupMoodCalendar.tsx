import { useMemo } from 'react';
import type { TeamMoodTrend } from '../service/types';

interface GroupMoodCalendarProps {
  trend: TeamMoodTrend[];
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function GroupMoodCalendar({ trend }: GroupMoodCalendarProps) {
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

  const getMoodColor = (mood: number | null): string => {
    if (mood === null) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    if (mood >= 4.5) return 'bg-green-500/10 border border-green-500/20 text-green-600 font-bold';
    if (mood >= 3.5) return 'bg-[#1754cf]/10 border border-[#1754cf]/20 text-[#1754cf] font-bold';
    if (mood >= 2.5) return 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 font-bold';
    return 'bg-red-500/10 border border-red-500/20 text-red-600 font-bold';
  };

  return (
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
  );
}
