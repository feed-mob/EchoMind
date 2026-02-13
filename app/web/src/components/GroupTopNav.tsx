import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEST_USER_ID } from '../config/constants';
import { api, type GroupInvitation, type GroupMember } from '../services/api';

type GroupTopNavProps = {
  group: {
    id: string;
    name: string;
  };
  activeTab: 'ideas' | 'goals' | 'ai';
  aiGoalId?: string;
  sticky?: boolean;
};

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

export default function GroupTopNav({ group, activeTab, aiGoalId, sticky = false }: GroupTopNavProps) {
  const navigate = useNavigate();
  const inviteInputRef = useRef<HTMLInputElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inviteDraft, setInviteDraft] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(false);
  const [aiCollabEnabled, setAiCollabEnabled] = useState(true);
  const [visibility, setVisibility] = useState('Members only');

  const fetchSettingsData = async () => {
    try {
      const [invitationData, memberData] = await Promise.all([
        api.groups.listInvitations(group.id),
        api.groups.listMembers(group.id),
      ]);
      setInvitations(invitationData);
      setMembers(memberData);
    } catch (err) {
      console.error('Failed to load group settings data:', err);
    }
  };

  useEffect(() => {
    if (!isSettingsOpen) return;
    void fetchSettingsData();
  }, [isSettingsOpen, group.id]);

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
          api.groups.inviteByEmail(group.id, {
            email,
            invitedByUserId: TEST_USER_ID,
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

  const navButtonClass = (tab: 'ideas' | 'goals' | 'ai') =>
    `px-4 h-full text-sm font-medium transition-all ${
      activeTab === tab
        ? 'text-primary bg-primary/10 hover:bg-primary/20'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <>
      <header
        className={`h-16 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-background-dark/50 backdrop-blur-md ${
          sticky ? 'sticky top-0 z-50' : ''
        }`}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/group')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
            aria-label="Back to groups"
          >
            <span className="material-icons">arrow_back</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">WIDEA</h1>
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
          <span className="text-lg font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{group.name}</span>
          <nav className="flex items-center gap-1 h-full">
            <button onClick={() => navigate(`/group/${group.id}`)} className={navButtonClass('ideas')}>
              Ideas
            </button>
            <button onClick={() => navigate(`/group/${group.id}/goals`)} className={navButtonClass('goals')}>
              Goals
            </button>
            <button
              onClick={() => navigate(`/group/${group.id}/ai-evaluate${aiGoalId ? `?goalId=${aiGoalId}` : ''}`)}
              className={`${navButtonClass('ai')} inline-flex items-center gap-1`}
            >
              <span className="material-icons text-base">auto_fix_high</span>
              AI Evaluate
            </button>
          </nav>
        </div>
        <button
          onClick={() => {
            setInviteResult(null);
            setIsSettingsOpen(true);
          }}
          className="icon-button inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Group settings"
          title="Group settings"
        >
          <span className="material-icons">settings</span>
        </button>
      </header>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/45 p-4 md:p-6">
          <div className="mx-auto h-full max-w-7xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-background-dark shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/70 dark:bg-slate-900/30">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Group Settings</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="icon-button text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Close settings"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

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
                            onClick={() => setPublicAccessEnabled((prev) => !prev)}
                            aria-pressed={publicAccessEnabled}
                            className={`inline-flex h-7 w-[80px] items-center rounded-full border px-0.5 transition-all ${
                              publicAccessEnabled
                                ? 'bg-primary border-primary shadow-[0_0_0_3px_rgba(19,127,236,0.15)]'
                                : 'bg-slate-300 border-slate-300 dark:bg-slate-700 dark:border-slate-700'
                            } ${publicAccessEnabled ? 'justify-end' : 'justify-start'}`}
                          >
                            <span className="h-6 w-6 rounded-full bg-white shadow-sm" />
                          </button>
                        </div>

                        <div className="flex items-start justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Collaboration</p>
                            <p className="mt-1 text-xs text-slate-500">Permit AI agents to participate and auto-evaluate ideas.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAiCollabEnabled((prev) => !prev)}
                            aria-pressed={aiCollabEnabled}
                            className={`inline-flex h-7 w-[80px] items-center rounded-full border px-0.5 transition-all ${
                              aiCollabEnabled
                                ? 'bg-primary border-primary shadow-[0_0_0_3px_rgba(19,127,236,0.15)]'
                                : 'bg-slate-300 border-slate-300 dark:bg-slate-700 dark:border-slate-700'
                            } ${aiCollabEnabled ? 'justify-end' : 'justify-start'}`}
                          >
                            <span className="h-6 w-6 rounded-full bg-white shadow-sm" />
                          </button>
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Workspace Visibility</p>
                          <select
                            value={visibility}
                            onChange={(event) => setVisibility(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option>Members only</option>
                            <option>Specific groups</option>
                            <option>Internal organization</option>
                          </select>
                        </div>
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
                                className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-sm focus:ring-0 placeholder:text-slate-400"
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
