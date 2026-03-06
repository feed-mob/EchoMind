import type { GroupSettings } from '../../service';
import { VISIBILITY_OPTIONS } from './constants';

type PrivacySettingsCardProps = {
  aiCollabEnabled: boolean;
  onAiToggle: () => void;
  onPublicToggle: () => void;
  onVisibilityChange: (next: GroupSettings['workspaceVisibility']) => void;
  publicAccessEnabled: boolean;
  settingsError: string | null;
  settingsLoading: boolean;
  settingsSaving: boolean;
  visibility: GroupSettings['workspaceVisibility'];
};

function ToggleSwitch({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={checked}
      className={`inline-flex h-6 w-[45px] min-w-[45px] shrink-0 items-center rounded-full border px-0.5 transition-all disabled:opacity-60 ${
        checked
          ? 'bg-primary border-primary shadow-[0_0_0_3px_rgba(19,127,236,0.15)]'
          : 'bg-slate-300 border-slate-300 dark:bg-slate-700 dark:border-slate-700'
      } ${checked ? 'justify-end' : 'justify-start'}`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}

export default function PrivacySettingsCard({
  aiCollabEnabled,
  onAiToggle,
  onPublicToggle,
  onVisibilityChange,
  publicAccessEnabled,
  settingsError,
  settingsLoading,
  settingsSaving,
  visibility,
}: PrivacySettingsCardProps) {
  return (
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
          <ToggleSwitch checked={publicAccessEnabled} disabled={settingsLoading || settingsSaving} onClick={onPublicToggle} />
        </div>

        <div className="flex items-start justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Collaboration</p>
            <p className="mt-1 text-xs text-slate-500">Permit AI agents to participate and auto-evaluate ideas.</p>
          </div>
          <ToggleSwitch checked={aiCollabEnabled} disabled={settingsLoading || settingsSaving} onClick={onAiToggle} />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Workspace Visibility</p>
          <select
            disabled={settingsLoading || settingsSaving}
            value={visibility}
            onChange={(event) => onVisibilityChange(event.target.value as GroupSettings['workspaceVisibility'])}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {settingsSaving
            ? 'Saving settings...'
            : settingsError
              ? settingsError
              : settingsLoading
                ? 'Loading settings...'
                : 'Settings synced'}
        </p>
      </div>
    </div>
  );
}
