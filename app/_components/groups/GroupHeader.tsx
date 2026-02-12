'use client';

import { useState } from 'react';

interface GroupHeaderProps {
  onCreateGroup?: () => void;
  onSearch?: (query: string) => void;
}

export default function GroupHeader({ onCreateGroup, onSearch }: GroupHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md border-bottom border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold tracking-tight">WIDEA</h1>
        <div className="relative w-full max-w-md ml-8">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search groups..."
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateGroup}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-icons text-sm">add</span>
          Create New Group
        </button>
      </div>
    </header>
  );
}
