import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupTopNav from '../components/GroupTopNav';
import GroupSettingsContent from '../components/group-settings/GroupSettingsContent';
import { api, type Group } from '../service';

export default function GroupSettings() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const groupData = await api.groups.getById(groupId);
        setGroup(groupData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load group settings');
      } finally {
        setLoading(false);
      }
    };

    void fetchGroup();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading group settings...</p>
        </div>
      </div>
    );
  }

  if (error || !group || !groupId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Group not found'}</p>
          <button onClick={() => navigate('/group')} className="text-primary hover:underline">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <main className="flex-1 flex flex-col overflow-hidden">
        <GroupTopNav group={group} activeTab="settings" />
        <GroupSettingsContent groupId={groupId} />
      </main>
    </div>
  );
}
