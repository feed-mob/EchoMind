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
  memberCount: number;
  ideaCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  title: string;
  content?: string;
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

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  successMetrics?: unknown;
  constraints?: unknown;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

// API Service
export const api = {
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

    create: async (data: { name: string; department?: string; icon?: string }): Promise<Group> => {
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
};
