import type { GroupInvitation } from '../../service';

type PendingInvitationsSectionProps = {
  invitations: GroupInvitation[];
};

export default function PendingInvitationsSection({ invitations }: PendingInvitationsSectionProps) {
  return (
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
  );
}
