'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GroupHeader from '@/app/_components/groups/GroupHeader';
import GroupGrid from '@/app/_components/groups/GroupGrid';
import { mockGroups } from '@/app/_lib/mockData';
import { Group } from '@/app/_types/group';

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleGroupClick = (group: Group) => {
    console.log('Group clicked:', group);
  };

  const handleCreateGroup = () => {
    router.push('/create');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        <GroupHeader onCreateGroup={handleCreateGroup} onSearch={handleSearch} />
        <GroupGrid
          groups={mockGroups}
          onGroupClick={handleGroupClick}
          onCreateGroup={handleCreateGroup}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}
