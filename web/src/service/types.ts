export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface Group {
  id: string;
  name: string;
  department?: string | null;
  icon?: string | null;
  logo?: string | null;
  description?: string | null;
  status: string;
  publicAccessEnabled?: boolean;
  aiCollaborationEnabled?: boolean;
  workspaceVisibility?: string;
  memberCount: number;
  ideaCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSettings {
  publicAccessEnabled: boolean;
  aiCollaborationEnabled: boolean;
  workspaceVisibility: 'Members only' | 'Specific groups' | 'Internal organization';
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string;
  invitedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface UserGroupMembership {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  joinedAt: string;
  group: {
    id: string;
    name: string;
    department?: string | null;
    icon?: string | null;
    logo?: string | null;
    status: string;
  };
}

export interface Idea {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  commentCount?: number;
  status: string;
  groupId: string;
  authorId: string;
  author?: {
    name: string | null;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IdeaComment {
  id: string;
  content: string;
  ideaId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  successMetrics?: unknown;
  constraints?: unknown;
  creatorId: string;
  selectedIdeaId?: string | null;
  selectedSettingId?: string | null;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface AiEvaluationSetting {
  id: string;
  groupId: string;
  goalId: string;
  model: string;
  impactWeight: number;
  feasibilityWeight: number;
  originalityWeight: number;
  selectedIdeaIds: string[];
  createdAt: string;
}

export interface AiEvaluationResult {
  id: string;
  settingId: string;
  ideaId: string;
  review: string;
  impactScore: number;
  feasibilityScore: number;
  originalityScore: number;
  totalScore: number;
  rank: number;
  createdAt: string;
  idea: {
    id: string;
    title: string;
    content: string | null;
    author: {
      name: string | null;
    } | null;
  };
}

export interface Mood {
  id: string;
  userId: string;
  mood: string;
  emotion: string | null;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  // 情绪光谱系统 Emotion Spectrum System
  spectrum?: string | null;
  color?: string | null;
  icon?: string | null;
  intensity?: number | null;
}

export interface EmotionAnalysisResult {
  spectrum: string;
  emotion: string;
  intensity: number;
  keywords: string[];
  explanation: string;
}

export interface EmotionSpectrumConfig {
  label: string;
  color: string;
  bgGradient: string;
  icon: string;
  container: string;
}
