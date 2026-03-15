type SourceType = 'ai' | 'pdf' | 'manual';

interface BaseSourceCardProps {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  type: SourceType;
}

interface AISourceCardProps extends BaseSourceCardProps {
  type: 'ai';
  aiType: string;
  icon?: string;
  onView?: () => void;
  onAnalyze?: () => void;
}

interface PDFSourceCardProps extends BaseSourceCardProps {
  type: 'pdf';
  fileType: string;
  uploadedAt: string;
  onOpen?: () => void;
}

interface ManualSourceCardProps extends BaseSourceCardProps {
  type: 'manual';
  entryType: string;
  modifiedAt: string;
  onEdit?: () => void;
}

type SourceCardProps = AISourceCardProps | PDFSourceCardProps | ManualSourceCardProps;

const typeConfig: Record<SourceType, { bgColor: string; textColor: string; icon: string }> = {
  ai: { bgColor: 'bg-primary/10', textColor: 'text-primary', icon: 'smart_toy' },
  pdf: { bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400', icon: 'description' },
  manual: { bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-600 dark:text-emerald-400', icon: 'article' },
};

function getBadgeInfo(props: SourceCardProps): { text: string; colorClass: string } {
  switch (props.type) {
    case 'ai':
      return {
        text: props.aiType,
        colorClass: 'text-primary bg-primary/10',
      };
    case 'pdf':
      return {
        text: props.fileType,
        colorClass: 'text-slate-400 bg-slate-100 dark:bg-slate-700',
      };
    case 'manual':
      return {
        text: props.entryType,
        colorClass: 'text-slate-400 bg-slate-100 dark:bg-slate-700',
      };
    default:
      return { text: '', colorClass: '' };
  }
}

function getActionButton(props: SourceCardProps): { text: string; onClick?: () => void } | null {
  switch (props.type) {
    case 'ai':
      if (props.onView) return { text: 'View', onClick: props.onView };
      if (props.onAnalyze) return { text: 'Analyze', onClick: props.onAnalyze };
      return null;
    case 'pdf':
      return props.onOpen ? { text: 'Open', onClick: props.onOpen } : null;
    case 'manual':
      return props.onEdit ? { text: 'Edit', onClick: props.onEdit } : null;
    default:
      return null;
  }
}

function getTimestamp(props: SourceCardProps): string {
  switch (props.type) {
    case 'pdf':
      return props.uploadedAt;
    case 'manual':
      return props.modifiedAt;
    default:
      return props.updatedAt;
  }
}

export default function SourceCard(props: SourceCardProps) {
  const config = typeConfig[props.type];
  const badge = getBadgeInfo(props);
  const action = getActionButton(props);
  const timestamp = getTimestamp(props);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group flex items-center gap-4">
      {/* Icon */}
      <div className={`p-2 ${config.bgColor} rounded-lg ${config.textColor} flex-shrink-0`}>
        <span className="material-symbols-outlined">{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 dark:text-white">{props.title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{props.description}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${badge.colorClass}`}>
          {badge.text}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {timestamp}
        </span>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-4 text-sm font-bold"
        >
          {action.text}
        </button>
      )}
    </div>
  );
}
