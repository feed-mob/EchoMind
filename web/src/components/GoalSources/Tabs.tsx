interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            onClick={() => onChange(tab.id)}
            className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
              isActive
                ? 'text-primary border-primary'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
