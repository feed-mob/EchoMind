import { useMemo } from 'react';
import type { Mood } from '../service/types';
import { neutralColor, negativeColor, positiveColor, } from '../config/enum';
import { generateDayMood } from "../tools/functions";

const getDayColor = (k:string) => {
  if (k) {
    if (k == 'positive') {
      return positiveColor;
    }
    if (k == 'negative') {
      return negativeColor;
    }
    if(k == 'neutral' ){
      return neutralColor;
    }
  }
  return '#99a1af';
};


interface MoodCalendarProps {
  currentDate: Date;
  entries: Mood[];
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

export default function MoodCalendar({
  currentDate,
  entries,
  onNavigateMonth,
}: MoodCalendarProps) {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{
      date: number;
      specstrum?: string;
      color?: string;
      backgroundColor?: string;
    }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i });
    }

    const dayMood = generateDayMood(entries);

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      // const entry = entries.find((e) => e.recordedAt.startsWith(dateStr));

      const color = getDayColor(dayMood[dateStr]);
      const bgColor = color ? `${color}33` : '#fff';
      days.push({
        date: i,
        specstrum: dayMood[dateStr] ?? undefined,
        color: color,
        backgroundColor: bgColor,
      });
    }

    return days;
  }, [currentDate, entries]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {formatMonth(currentDate)}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => onNavigateMonth('prev')}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <span className="material-icons">chevron_left</span>
          </button>
          <button
            onClick={() => onNavigateMonth('next')}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-bold text-slate-400 uppercase py-2"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          const isCurrentMonth =
            index >=
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              ).getDay() &&
            index <
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              ).getDay() +
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  0
                ).getDate();
          const isToday =
            isCurrentMonth &&
            day.date === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth();

          const moodColor = day.color;
          const moodStyle = moodColor && isCurrentMonth ? { backgroundColor: day.backgroundColor, color: day.color } : undefined;
          const cellStyle = day.specstrum ? moodStyle : {border: `1px dashed #cad5e2`};

          return (
            <div
              key={index}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium
                ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : ''}
                ${isCurrentMonth && !day.specstrum ? 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800' : ''}
                ${isToday && !moodColor ? 'ring-4 ring-primary/20' : ''}
                ${isToday && moodColor ? 'ring-4 ring-white/30' : ''}
                transition-colors cursor-pointer
              `}
              style={cellStyle}
              title={day.specstrum}
            >
              <span className={day.specstrum ? 'font-bold' : ''}>{day.date}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{backgroundColor: positiveColor}}></span>
          <span className="text-xs font-medium text-slate-500">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{backgroundColor: neutralColor}}></span>
          <span className="text-xs font-medium text-slate-500">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{backgroundColor: negativeColor}}></span>
          <span className="text-xs font-medium text-slate-500">Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-slate-400"></span>
          <span className="text-xs font-medium text-slate-500">Missed Day</span>
        </div>
      </div>
    </div>
  );
}
