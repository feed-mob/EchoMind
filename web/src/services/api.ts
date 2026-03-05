import { API_URL } from '../config/api';

// Types
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
  selectedIdeaId?: string | null;
  selectedSettingId?: string | null;
  groupId: string;
  createdAt: string;
  updatedAt: string;
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

// API Service
export const api = {
  users: {
    login: async (data: { email: string; name?: string; avatar?: string }): Promise<{
      user: User;
      isNewUser: boolean;
      joinedGroupIds: string[];
    }> => {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to login');
      return response.json();
    },
    loginWithGoogle: async (data: { credential: string }): Promise<{
      user: User;
      isNewUser: boolean;
      joinedGroupIds: string[];
    }> => {
      const response = await fetch(`${API_URL}/api/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Failed to login with Google');
      }
      return response.json();
    },

    listGroups: async (userId: string): Promise<UserGroupMembership[]> => {
      const response = await fetch(`${API_URL}/api/users/${userId}/groups`);
      if (!response.ok) throw new Error('Failed to fetch user groups');
      return response.json();
    },
  },

  // Groups
  groups: {
    list: async (): Promise<Group[]> => {
      const response = await fetch(`${API_URL}/api/groups`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      return response.json();
    },

    getById: async (id: string): Promise<Group> => {
      const response = await fetch(`${API_URL}/api/groups/${id}`);
      if (!response.ok) throw new Error('Failed to fetch group');
      return response.json();
    },

    create: async (data: { name: string; department?: string; icon?: string; creatorUserId: string }): Promise<Group> => {
      const response = await fetch(`${API_URL}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },

    update: async (id: string, data: Partial<Group>): Promise<Group> => {
      const response = await fetch(`${API_URL}/api/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update group');
      return response.json();
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/api/groups/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete group');
    },

    listInvitations: async (groupId: string): Promise<GroupInvitation[]> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/invitations`);
      if (!response.ok) throw new Error('Failed to fetch invitations');
      return response.json();
    },

    listMembers: async (groupId: string): Promise<GroupMember[]> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    },

    inviteByEmail: async (
      groupId: string,
      data: { email: string; invitedByUserId?: string },
    ): Promise<
      | { type: 'existing_user_added'; user: User }
      | { type: 'invitation_created'; invitation: GroupInvitation }
    > => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to invite member');
      return response.json();
    },

    getSettings: async (groupId: string): Promise<GroupSettings> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/settings`);
      if (!response.ok) throw new Error('Failed to fetch group settings');
      return response.json();
    },

    updateSettings: async (groupId: string, data: GroupSettings): Promise<GroupSettings> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update group settings');
      return response.json();
    },
  },

  // Ideas
  ideas: {
    listByGroup: async (groupId: string): Promise<Idea[]> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/ideas`);
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },

    getById: async (id: string): Promise<Idea> => {
      const response = await fetch(`${API_URL}/api/ideas/${id}`);
      if (!response.ok) throw new Error('Failed to fetch idea');
      return response.json();
    },

    create: async (groupId: string, data: { title: string; content?: string; authorId: string }): Promise<Idea> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create idea');
      return response.json();
    },

    update: async (id: string, data: { title?: string; content?: string; status?: string }): Promise<Idea> => {
      const response = await fetch(`${API_URL}/api/ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update idea');
      return response.json();
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/api/ideas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete idea');
    },
  },

  comments: {
    listByIdea: async (ideaId: string): Promise<IdeaComment[]> => {
      const response = await fetch(`${API_URL}/api/ideas/${ideaId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },

    create: async (ideaId: string, data: { content: string; authorId: string }): Promise<IdeaComment> => {
      const response = await fetch(`${API_URL}/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },

    update: async (commentId: string, data: { content: string; authorId: string }): Promise<IdeaComment> => {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update comment');
      return response.json();
    },

    delete: async (commentId: string, data: { authorId: string }): Promise<void> => {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to delete comment');
    },
  },

  // Goals
  goals: {
    listByGroup: async (groupId: string): Promise<Goal[]> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/goals`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      return response.json();
    },

    getById: async (id: string): Promise<Goal> => {
      const response = await fetch(`${API_URL}/api/goals/${id}`);
      if (!response.ok) throw new Error('Failed to fetch goal');
      return response.json();
    },

    create: async (
      groupId: string,
      data: {
        title: string;
        description?: string;
        status?: string;
        successMetrics?: unknown;
        constraints?: unknown;
        selectedIdeaId?: string | null;
        selectedSettingId?: string | null;
      },
    ): Promise<Goal> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create goal');
      return response.json();
    },

    update: async (
      id: string,
      data: {
        title?: string;
        description?: string;
        status?: string;
        successMetrics?: unknown;
        constraints?: unknown;
        selectedIdeaId?: string | null;
        selectedSettingId?: string | null;
      },
    ): Promise<Goal> => {
      const response = await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update goal');
      return response.json();
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete goal');
    },
  },

  // AI evaluation settings
  aiEvaluationSettings: {
    listByGroup: async (groupId: string): Promise<AiEvaluationSetting[]> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/ai-evaluation-settings`);
      if (!response.ok) throw new Error('Failed to fetch AI evaluation settings');
      return response.json();
    },

    create: async (
      groupId: string,
      data: {
        goalId: string;
        model: string;
        impactWeight: number;
        feasibilityWeight: number;
        originalityWeight: number;
        selectedIdeaIds: string[];
      },
    ): Promise<{ setting: AiEvaluationSetting; results: Array<Omit<AiEvaluationResult, 'id' | 'createdAt' | 'idea'>> }> => {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/ai-evaluation-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save AI evaluation settings');
      return response.json();
    },
  },

  aiEvaluationResults: {
    listBySetting: async (settingId: string): Promise<AiEvaluationResult[]> => {
      const response = await fetch(`${API_URL}/api/ai-evaluation-settings/${settingId}/results`);
      if (!response.ok) throw new Error('Failed to fetch AI evaluation results');
      return response.json();
    },
  },
};
