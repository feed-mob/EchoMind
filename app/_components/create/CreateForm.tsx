'use client';

import { useState } from 'react';

interface CreateFormProps {
  onSubmit?: (data: { name: string; logo?: File }) => void;
  onSkip?: () => void;
}

export default function CreateForm({ onSubmit, onSkip }: CreateFormProps) {
  const [orgName, setOrgName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ name: orgName, logo: logoFile || undefined });
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setLogoFile(file);
      }
    };
    input.click();
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create Your Organization
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Let's start by setting up your workspace basics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-600 flex-shrink-0">
              {logoFile ? (
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Logo preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="material-icons text-4xl">business</span>
              )}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Upload organization logo
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Recommended size: 512x512px. Max 2MB.
              </p>
              <button
                type="button"
                onClick={handleFileSelect}
                className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all"
              >
                Select Image
              </button>
            </div>
          </div>

          {/* Organization Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="e.g. Acme Creative Agency"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              type="submit"
              className="w-full sm:flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
            >
              Next: Invite Members
              <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="w-full sm:w-auto px-8 h-12 text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              I'll do this later
            </button>
          </div>
        </form>

        <p className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
          Step 1 of 2: Organization Basics
        </p>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-8 flex gap-6 text-[11px] text-slate-400 uppercase font-bold tracking-widest">
        <a className="hover:text-primary transition-colors" href="#">
          Need Help?
        </a>
        <span className="text-slate-200 dark:text-slate-800">|</span>
        <a className="hover:text-primary transition-colors" href="#">
          Documentation
        </a>
        <span className="text-slate-200 dark:text-slate-800">|</span>
        <a className="hover:text-primary transition-colors" href="#">
          Terms of Service
        </a>
      </div>
    </main>
  );
}
