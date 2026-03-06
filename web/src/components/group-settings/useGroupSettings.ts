import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api, type GroupInvitation, type GroupMember, type GroupSettings } from '../../service';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type UseGroupSettingsArgs = {
  groupId: string;
};

export function useGroupSettings({ groupId }: UseGroupSettingsArgs) {
  const { user } = useAuth();
  const inviteInputRef = useRef<HTMLInputElement | null>(null);
  const [inviteDraft, setInviteDraft] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(false);
  const [aiCollabEnabled, setAiCollabEnabled] = useState(true);
  const [visibility, setVisibility] = useState<GroupSettings['workspaceVisibility']>('Members only');

  const fetchSettingsData = useCallback(async () => {
    try {
      const [invitationData, memberData, groupSettings] = await Promise.all([
        api.groups.listInvitations(groupId),
        api.groups.listMembers(groupId),
        api.groups.getSettings(groupId),
      ]);
      setInvitations(invitationData);
      setMembers(memberData);
      setPublicAccessEnabled(groupSettings.publicAccessEnabled);
      setAiCollabEnabled(groupSettings.aiCollaborationEnabled);
      setVisibility(groupSettings.workspaceVisibility);
      setSettingsError(null);
    } catch (err) {
      console.error('Failed to load group settings data:', err);
      setSettingsError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    setSettingsLoading(true);
    void fetchSettingsData();
  }, [fetchSettingsData]);

  const saveSettings = useCallback(
    async (next: GroupSettings) => {
      try {
        setSettingsSaving(true);
        setSettingsError(null);
        const updated = await api.groups.updateSettings(groupId, next);
        setPublicAccessEnabled(updated.publicAccessEnabled);
        setAiCollabEnabled(updated.aiCollaborationEnabled);
        setVisibility(updated.workspaceVisibility);
      } catch (err) {
        console.error('Failed to save group settings:', err);
        setSettingsError(err instanceof Error ? err.message : 'Failed to save settings');
        void fetchSettingsData();
      } finally {
        setSettingsSaving(false);
      }
    },
    [fetchSettingsData, groupId],
  );

  const handlePublicAccessToggle = () => {
    void saveSettings({
      publicAccessEnabled: !publicAccessEnabled,
      aiCollaborationEnabled: aiCollabEnabled,
      workspaceVisibility: visibility,
    });
  };

  const handleAiCollaborationToggle = () => {
    void saveSettings({
      publicAccessEnabled,
      aiCollaborationEnabled: !aiCollabEnabled,
      workspaceVisibility: visibility,
    });
  };

  const handleVisibilityChange = (next: GroupSettings['workspaceVisibility']) => {
    void saveSettings({
      publicAccessEnabled,
      aiCollaborationEnabled: aiCollabEnabled,
      workspaceVisibility: next,
    });
  };

  const pushInviteEmail = (raw: string) => {
    const email = normalizeEmail(raw);
    if (!email || !email.includes('@')) return;
    setInviteEmails((prev) => (prev.includes(email) ? prev : [...prev, email]));
  };

  const handleInviteDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return;
    event.preventDefault();
    pushInviteEmail(inviteDraft);
    setInviteDraft('');
  };

  const handleInviteDraftBlur = () => {
    if (!inviteDraft.trim()) return;
    pushInviteEmail(inviteDraft);
    setInviteDraft('');
  };

  const removeInviteEmail = (email: string) => {
    setInviteEmails((prev) => prev.filter((item) => item !== email));
  };

  const handleSendInvites = async () => {
    if (inviteDraft.trim()) {
      pushInviteEmail(inviteDraft);
      setInviteDraft('');
    }

    const payloadEmails = inviteDraft.trim()
      ? Array.from(new Set([...inviteEmails, normalizeEmail(inviteDraft)]))
      : inviteEmails;

    if (payloadEmails.length === 0) return;

    try {
      setInviteLoading(true);
      setInviteResult(null);

      const results = await Promise.all(
        payloadEmails.map((email) =>
          api.groups.inviteByEmail(groupId, {
            email,
            invitedByUserId: user?.id,
          }),
        ),
      );

      const existingCount = results.filter((item) => item.type === 'existing_user_added').length;
      const invitedCount = results.length - existingCount;

      setInviteEmails([]);
      await fetchSettingsData();
      setInviteResult(`已处理 ${results.length} 个邮箱：${existingCount} 个老用户已直接加入，${invitedCount} 个已发送邀请。`);
    } catch (err) {
      console.error('Failed to invite members:', err);
      setInviteResult(err instanceof Error ? err.message : '邀请失败，请重试');
    } finally {
      setInviteLoading(false);
    }
  };

  return {
    settings: {
      aiCollabEnabled,
      invitations,
      members,
      publicAccessEnabled,
      settingsError,
      settingsLoading,
      settingsSaving,
      visibility,
    },
    invite: {
      inviteDraft,
      inviteEmails,
      inviteInputRef,
      inviteLoading,
      inviteResult,
    },
    actions: {
      focusInviteInput: () => inviteInputRef.current?.focus(),
      handleAiCollaborationToggle,
      handleInviteDraftBlur,
      handleInviteDraftKeyDown,
      handlePublicAccessToggle,
      handleSendInvites,
      handleVisibilityChange,
      removeInviteEmail,
      setInviteDraft,
    },
  };
}
