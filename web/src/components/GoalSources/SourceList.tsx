import SourceCard from './SourceCard';
import AddSourceButton from './AddSourceButton';
import type { Source } from './types';

interface SourceListProps {
  sources: Source[];
  onAddSource: () => void;
}

export default function SourceList({ sources, onAddSource }: SourceListProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Information Sources</h3>
        <div className="flex gap-3">
          <button
            onClick={onAddSource}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Source
          </button>
        </div>
      </div>

      {/* Source List */}
      <div className="flex flex-col gap-3">
        {sources.map((source) => {
          // Map source to SourceCard props
          const commonProps = {
            id: source.id,
            title: source.title,
            description: source.description,
          };

          switch (source.type) {
            case 'ai':
              return (
                <SourceCard
                  key={source.id}
                  {...commonProps}
                  type="ai"
                  aiType={source.aiType}
                  updatedAt={source.updatedAt}
                  onView={source.onView}
                  onAnalyze={source.onAnalyze}
                />
              );
            case 'pdf':
              return (
                <SourceCard
                  key={source.id}
                  {...commonProps}
                  type="pdf"
                  fileType={source.fileType}
                  uploadedAt={source.uploadedAt}
                  onOpen={source.onOpen}
                  updatedAt=""
                />
              );
            case 'manual':
              return (
                <SourceCard
                  key={source.id}
                  {...commonProps}
                  type="manual"
                  entryType={source.entryType}
                  modifiedAt={source.modifiedAt}
                  onEdit={source.onEdit}
                  updatedAt=""
                />
              );
            default:
              return null;
          }
        })}

        {/* Add New Source Button */}
        <AddSourceButton onClick={onAddSource} />
      </div>
    </div>
  );
}
