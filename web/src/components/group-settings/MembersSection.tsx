import type { GroupMember } from '../../service';

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

type MembersSectionProps = {
  members: GroupMember[];
  onAddMember: () => void;
};

export default function MembersSection({ members, onAddMember }: MembersSectionProps) {
  return (
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
            onClick={onAddMember}
            className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 text-slate-400 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary flex flex-col items-center justify-center"
          >
            <span className="material-icons mb-2 text-3xl">person_add_alt</span>
            <span className="font-medium">Add another member</span>
          </button>
        </div>
      )}
    </div>
  );
}
