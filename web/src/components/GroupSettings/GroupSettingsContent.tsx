import InviteTeamCard from './InviteTeamCard';
import MembersSection from './MembersSection';
import PendingInvitationsSection from './PendingInvitationsSection';
import PrivacySettingsCard from './PrivacySettingsCard';
import StorageUsageCard from './StorageUsageCard';
import { useGroupSettings } from './useGroupSettings';

type GroupSettingsContentProps = {
  groupId: string;
};

export default function GroupSettingsContent({ groupId }: GroupSettingsContentProps) {
  const { actions, invite, settings } = useGroupSettings({ groupId });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <PrivacySettingsCard
            aiCollabEnabled={settings.aiCollabEnabled}
            onAiToggle={actions.handleAiCollaborationToggle}
            onPublicToggle={actions.handlePublicAccessToggle}
            onVisibilityChange={actions.handleVisibilityChange}
            publicAccessEnabled={settings.publicAccessEnabled}
            settingsError={settings.settingsError}
            settingsLoading={settings.settingsLoading}
            settingsSaving={settings.settingsSaving}
            visibility={settings.visibility}
          />
          <StorageUsageCard />
        </aside>

        <section className="space-y-8">
          <InviteTeamCard
            inviteDraft={invite.inviteDraft}
            inviteEmails={invite.inviteEmails}
            inviteInputRef={invite.inviteInputRef}
            inviteLoading={invite.inviteLoading}
            inviteResult={invite.inviteResult}
            onInviteDraftBlur={actions.handleInviteDraftBlur}
            onInviteDraftChange={actions.setInviteDraft}
            onInviteDraftKeyDown={actions.handleInviteDraftKeyDown}
            onRemoveInviteEmail={actions.removeInviteEmail}
            onSendInvites={() => void actions.handleSendInvites()}
          />
          <MembersSection members={settings.members} onAddMember={actions.focusInviteInput} />
          <PendingInvitationsSection invitations={settings.invitations} />
        </section>
      </div>
    </div>
  );
}
