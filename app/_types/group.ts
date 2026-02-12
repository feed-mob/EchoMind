export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
}

export interface Group {
  id: string;
  title: string;
  department: string;
  icon: string;
  memberCount: number;
  ideaCount: number;
  status: 'active' | 'evaluating' | 'completed';
  statusText: string;
  members: GroupMember[];
  lastActivity?: string;
}
