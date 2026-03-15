import { useState } from 'react';
import { useParams } from 'react-router-dom';
import GoalSidebarNew from '../components/GoalSources/GoalSidebarNew';
import GoalHeader from '../components/GoalSources/GoalHeader';
import Tabs from '../components/GoalSources/Tabs';
import SourceList from '../components/GoalSources/SourceList';
import type { Goal, Source } from '../components/GoalSources/types';

// Mock data for goals
const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Quarterly Growth Goal',
    subtitle: '15% expansion • Active',
    status: 'active',
    statusColor: 'emerald',
  },
  {
    id: 'goal-2',
    title: 'Product Launch Q3',
    subtitle: 'Beta phase • In Progress',
    status: 'in_progress',
    statusColor: 'amber',
  },
  {
    id: 'goal-3',
    title: 'Brand Refresh',
    subtitle: 'Planning • On Hold',
    status: 'on_hold',
    statusColor: 'slate',
  },
  {
    id: 'goal-4',
    title: 'Mobile App Audit',
    subtitle: 'UX Review • Completed',
    status: 'completed',
    statusColor: 'emerald',
  },
];

// Mock data for sources
const mockSources: Source[] = [
  {
    id: 'source-1',
    type: 'ai',
    title: 'Market Analysis 2024',
    description: 'Autonomous synthesis of current SaaS market trends and competitor growth patterns for Q1-Q2.',
    aiType: 'AI Generated',
    updatedAt: 'Updated 2h ago',
    onView: () => console.log('View Market Analysis'),
  },
  {
    id: 'source-2',
    type: 'pdf',
    title: 'Q4 Performance Report',
    description: 'Internal audit of sales performance and organic traffic metrics from previous fiscal quarter.',
    fileType: 'PDF',
    uploadedAt: 'Uploaded Dec 12',
    onOpen: () => console.log('Open Q4 Report'),
  },
  {
    id: 'source-3',
    type: 'manual',
    title: 'Stakeholder Interview Notes',
    description: 'Direct feedback from C-level meeting regarding market expansion priorities.',
    entryType: 'Manual Entry',
    modifiedAt: 'Modified Jan 05',
    onEdit: () => console.log('Edit Interview Notes'),
  },
  {
    id: 'source-4',
    type: 'ai',
    title: 'Organic Channel Audit',
    description: 'AI-driven extraction of high-performing keywords and content clusters from site data.',
    aiType: 'AI Insights',
    updatedAt: 'Updated 1d ago',
    onAnalyze: () => console.log('Analyze Organic Channel'),
  },
];

export default function GroupGoalsNew() {
  const { groupId } = useParams<{ groupId: string }>();
  const [selectedGoalId, setSelectedGoalId] = useState('goal-1');
  const [activeTab, setActiveTab] = useState('sources');

  const handleEditGoal = () => {
    console.log('Edit goal:', selectedGoalId);
  };

  const handleAddSource = () => {
    console.log('Add new source');
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Sidebar */}
      <GoalSidebarNew
        goals={mockGoals}
        selectedGoalId={selectedGoalId}
        onSelectGoal={setSelectedGoalId}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Header Section with Background */}
        <GoalHeader
          title="Quarterly Growth Goal"
          description="Expand market reach by 15% through organic channels and strategic content partnerships."
          backgroundImage="https://lh3.googleusercontent.com/aida-public/AB6AXuA-cmcFw_5y8zTzeZAembefnP_oDPOQXqwmt2v3ItN5e5bYPVFR08sTgioTf9u4WlTP2u_DLypeaTpK-iRAmDxFSBECXgJWAAE5woUSdAhW_epeTOI8HMoq2VXytc8ZkZKABPZLOSqc5lbagg93XfXcvHG3k_IjLjwZyZqK5VN-pB7fwhmY2_yFE-gOI4LNw7fA4fEnkumUxL_k8GetrI-t644wxQtGXMkdF3mi83oHTOF1wkSwGyvBkic0JK7VsWCmSylZIcbvWQqE"
          onEdit={handleEditGoal}
        />

        {/* Tab Navigation & Content Container */}
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark px-8">
          {/* Tabs */}
          <Tabs
            tabs={[
              { id: 'detail', label: 'Detail' },
              { id: 'sources', label: 'Sources' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* Content */}
          {activeTab === 'sources' ? (
            <SourceList sources={mockSources} onAddSource={handleAddSource} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <p>Goal detail content will be displayed here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
