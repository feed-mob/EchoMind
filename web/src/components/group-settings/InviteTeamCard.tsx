import type { KeyboardEvent, RefObject } from 'react';

type InviteTeamCardProps = {
  inviteDraft: string;
  inviteEmails: string[];
  inviteInputRef: RefObject<HTMLInputElement | null>;
  inviteLoading: boolean;
  inviteResult: string | null;
  onInviteDraftBlur: () => void;
  onInviteDraftChange: (value: string) => void;
  onInviteDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveInviteEmail: (email: string) => void;
  onSendInvites: () => void;
};

export default function InviteTeamCard({
  inviteDraft,
  inviteEmails,
  inviteInputRef,
  inviteLoading,
  inviteResult,
  onInviteDraftBlur,
  onInviteDraftChange,
  onInviteDraftKeyDown,
  onRemoveInviteEmail,
  onSendInvites,
}: InviteTeamCardProps) {
  return (
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
                  <button className="inline-flex items-center" onClick={() => onRemoveInviteEmail(email)} aria-label={`Remove ${email}`}>
                    <span className="material-icons text-xs">close</span>
                  </button>
                </span>
              ))}
              <input
                ref={inviteInputRef}
                type="text"
                value={inviteDraft}
                onChange={(event) => onInviteDraftChange(event.target.value)}
                onKeyDown={onInviteDraftKeyDown}
                onBlur={onInviteDraftBlur}
                placeholder="Add emails..."
                className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-sm text-slate-800 dark:text-slate-100 focus:ring-0 placeholder:text-slate-600 dark:placeholder:text-slate-300"
              />
            </div>
          </div>
          <button
            onClick={onSendInvites}
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
  );
}
