import { useState } from 'react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; logo?: File }) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | undefined>();

  if (!isOpen) return null;

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSubmit({ name: groupName, logo: logoFile });
      setGroupName('');
      setLogoPreview(null);
      setLogoFile(undefined);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setLogoPreview(null);
    setLogoFile(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          type="button"
        >
          <span className="material-icons text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">close</span>
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create New Group</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Set up a new group to start generating and evaluating ideas with your team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Group logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-icons text-slate-400 text-3xl">groups</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Upload group logo</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Recommended size: 512x512px. Max 2MB.</p>
                <label className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer inline-block">
                  Select Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="e.g. Marketing Q4 Strategy"
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
              >
                Create Group
                <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-8 h-12 text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
