import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  icon: string;
  iconColor: string;
  value: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
}

export default function StatCard({ title, icon, iconColor, value, footer, footerClassName }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <span className={`material-icons ${iconColor}`}>{icon}</span>
      </div>
      <p className="text-slate-900 dark:text-white text-3xl font-bold">{value}</p>
      {footer && (
        <div className={`flex items-center gap-1 text-sm font-bold ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
}
