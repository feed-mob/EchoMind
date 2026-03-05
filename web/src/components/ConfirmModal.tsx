import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmTone?: 'default' | 'danger';
  confirmLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmTone = 'default',
  confirmLoading = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !confirmLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [confirmLoading, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!confirmLoading) onClose();
        }}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
            onClick={onClose}
            disabled={confirmLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 ${
              confirmTone === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
            }`}
            onClick={() => void onConfirm()}
            disabled={confirmLoading}
          >
            {confirmLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
