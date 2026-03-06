import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api, type GroupInvitation, type GroupMember, type GroupSettings } from '../../service';

type GroupSettingsContentProps = {
  groupId: string;
};

const VISIBILITY_OPTIONS: GroupSettings['workspaceVisibility'][] = [
  'Members only',
  'Specific groups',
  'Internal organization',
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  return initials || 'U';
}

export default function GroupSettingsContent({ groupId }: GroupSettingsContentProps) {
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

  const fetchSettingsData = async () => {
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
  };

  useEffect(() => {
    setSettingsLoading(true);
    void fetchSettingsData();
  }, [groupId]);

  const saveSettings = async (next: GroupSettings) => {
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
  };

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

  const handleInviteDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
      setInviteResult(
        `已处理 ${results.length} 个邮箱：${existingCount} 个老用户已直接加入，${invitedCount} 个已发送邀请。`,
      );
    } catch (err) {
      console.error('Failed to invite members:', err);
      setInviteResult(err instanceof Error ? err.message : '邀请失败，请重试');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <span className="material-icons text-m text-primary">settings</span>
              Privacy Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Public Access</p>
                  <p className="mt-1 text-xs text-slate-500">Allow anyone with the link to view this workspace.</p>
                </div>
                <button
                  type="button"
                  disabled={settingsLoading || settingsSaving}
                  onClick={handlePublicAccessToggle}
                  aria-pressed={publicAccessEnabled}
                  className={`inline-flex h-6 w-[45px] min-w-[45px] shrink-0 items-center rounded-full border px-0.5 transition-all disabled:opacity-60 ${
                    publicAccessEnabled
                      ? 'bg-primary border-primary shadow-[0_0_0_3px_rgba(19,127,236,0.15)]'
                      : 'bg-slate-300 border-slate-300 dark:bg-slate-700 dark:border-slate-700'
                  } ${publicAccessEnabled ? 'justify-end' : 'justify-start'}`}
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Collaboration</p>
                  <p className="mt-1 text-xs text-slate-500">Permit AI agents to participate and auto-evaluate ideas.</p>
                </div>
                <button
                  type="button"
                  disabled={settingsLoading || settingsSaving}
                  onClick={handleAiCollaborationToggle}
                  aria-pressed={aiCollabEnabled}
                  className={`inline-flex h-6 w-[45px] min-w-[45px] shrink-0 items-center rounded-full border px-0.5 transition-all disabled:opacity-60 ${
                    aiCollabEnabled
                      ? 'bg-primary border-primary shadow-[0_0_0_3px_rgba(19,127,236,0.15)]'
                      : 'bg-slate-300 border-slate-300 dark:bg-slate-700 dark:border-slate-700'
                  } ${aiCollabEnabled ? 'justify-end' : 'justify-start'}`}
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Workspace Visibility</p>
                <select
                  disabled={settingsLoading || settingsSaving}
                  value={visibility}
                  onChange={(event) =>
                    handleVisibilityChange(event.target.value as GroupSettings['workspaceVisibility'])
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settingsSaving
                  ? 'Saving settings...'
                  : settingsError
                    ? settingsError
                    : settingsLoading
                      ? 'Loading settings...'
                      : 'Settings synced'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <span className="material-icons text-base">info</span>
              <span className="text-xs font-semibold uppercase tracking-wider">Storage Usage</span>
            </div>
            <div className="mb-2 h-1.5 w-full rounded-full bg-primary/20">
              <div className="h-1.5 w-[0%] rounded-full bg-primary"></div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">0 of 10 GB used</p>
          </div>
        </aside>

        <section className="space-y-8">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg shadow-slate-200/40 dark:shadow-none">
            <div className="absolute right-4 top-2 opacity-5">
              <span className="material-icons text-[120px]">person_add</span>
            </div>
            <div className="relative z-10 max-w-3xl">
              <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Invite your team</h3>
              <p className="mb-6 text-slate-600 dark:text-slate-300">
                Bring collaborators together and evaluate ideas in one shared workspace.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-3 text-slate-400">
                    <span className="material-icons text-lg">mail</span>
                  </div>
                  <div className="min-h-[48px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                    {inviteEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {email}
                        <button
                          className="inline-flex items-center"
                          onClick={() => removeInviteEmail(email)}
                          aria-label={`Remove ${email}`}
                        >
                          <span className="material-icons text-xs">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      ref={inviteInputRef}
                      type="text"
                      value={inviteDraft}
                      onChange={(event) => setInviteDraft(event.target.value)}
                      onKeyDown={handleInviteDraftKeyDown}
                      onBlur={handleInviteDraftBlur}
                      placeholder="Add emails..."
                      className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-sm text-slate-800 dark:text-slate-100 focus:ring-0 placeholder:text-slate-600 dark:placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <button
                  onClick={() => void handleSendInvites()}
                  disabled={inviteLoading || (inviteEmails.length === 0 && !inviteDraft.trim())}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons text-lg">send</span>
                  {inviteLoading ? 'Sending...' : 'Send Invites'}
                </button>
              </div>
              {inviteResult && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{inviteResult}</p>}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-end gap-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Active Members</h3>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {members.length} Members
                </span>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500">
                No members yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {members.map((member) => {
                  const displayName = member.user.name || member.user.email;
                  return (
                    <div
                      key={member.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {member.user.avatar ? (
                            <img src={member.user.avatar} alt={displayName} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {getInitials(displayName)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white leading-tight">{displayName}</p>
                            <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                          </div>
                        </div>
                      </div>
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="material-icons text-sm">history</span>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}

                <button
                  onClick={() => inviteInputRef.current?.focus()}
                  className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 text-slate-400 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary flex flex-col items-center justify-center"
                >
                  <span className="material-icons mb-2 text-3xl">person_add_alt</span>
                  <span className="font-medium">Add another member</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Pending Invitations</h3>
            {invitations.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No pending invitations.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <p className="font-medium">{invitation.email}</p>
                    <p className="mt-1 text-xs text-slate-500">Invited {new Date(invitation.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
