import { buildApiUrl, throwApiError } from './http';
import type { Group, GroupInvitation, GroupMember, GroupSettings, User } from './types';

export const groupsApi = {
  list: async (): Promise<Group[]> => {
    const response = await fetch(buildApiUrl('/api/groups'));
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
  },

  getById: async (id: string): Promise<Group> => {
    const response = await fetch(buildApiUrl(`/api/groups/${id}`));
    if (!response.ok) throw new Error('Failed to fetch group');
    return response.json();
  },

  create: async (data: { name: string; department?: string; icon?: string; creatorUserId: string }): Promise<Group> => {
    const response = await fetch(buildApiUrl('/api/groups'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await throwApiError(response, 'Failed to create group');
    }
    return response.json();
  },

  update: async (id: string, data: Partial<Group>): Promise<Group> => {
    const response = await fetch(buildApiUrl(`/api/groups/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update group');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(buildApiUrl(`/api/groups/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete group');
  },

  listInvitations: async (groupId: string): Promise<GroupInvitation[]> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/invitations`));
    if (!response.ok) throw new Error('Failed to fetch invitations');
    return response.json();
  },

  listMembers: async (groupId: string): Promise<GroupMember[]> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/members`));
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
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/invitations`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to invite member');
    return response.json();
  },

  getSettings: async (groupId: string): Promise<GroupSettings> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/settings`));
    if (!response.ok) throw new Error('Failed to fetch group settings');
    return response.json();
  },

  updateSettings: async (groupId: string, data: GroupSettings): Promise<GroupSettings> => {
    const response = await fetch(buildApiUrl(`/api/groups/${groupId}/settings`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update group settings');
    return response.json();
  },
};
