'use client';

import { useState, useMemo } from 'react';
import GroupCard from './GroupCard';
import CreateGroupCard from './CreateGroupCard';
import { Group } from '@/app/_types/group';

interface GroupGridProps {
  groups: Group[];
  onGroupClick?: (group: Group) => void;
  onCreateGroup?: () => void;
  searchQuery?: string;
}

export default function GroupGrid({ groups, onGroupClick, onCreateGroup, searchQuery = '' }: GroupGridProps) {
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;

    const query = searchQuery.toLowerCase();
    return groups.filter(
      (group) =>
        group.title.toLowerCase().includes(query) ||
        group.department.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  return (
    <section className="flex-1 overflow-y-auto p-8 scrollbar-hide">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} onClick={() => onGroupClick?.(group)} />
        ))}
        <CreateGroupCard onClick={onCreateGroup} />
      </div>
    </section>
  );
}
