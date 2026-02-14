import { Children, cloneElement, type MouseEvent as ReactMouseEvent, type ReactElement, useEffect, useRef, useState } from 'react';

type ConfirmBubbleProps = {
  message: string;
  onConfirm: () => void | Promise<void>;
  children: ReactElement;
  placement?: 'top' | 'bottom';
  confirmText?: string;
  cancelText?: string;
  confirmTone?: 'default' | 'danger';
  disabled?: boolean;
};

export default function ConfirmBubble({
  message,
  onConfirm,
  children,
  placement = 'top',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmTone = 'default',
  disabled = false,
}: ConfirmBubbleProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const child = Children.only(children) as ReactElement<{
    onClick?: (event: ReactMouseEvent) => void;
    disabled?: boolean;
  }>;

  const handleTriggerClick = (event: ReactMouseEvent) => {
    child.props.onClick?.(event);
    if (event.defaultPrevented || disabled || confirming) return;
    setOpen((prev) => !prev);
  };

  const handleCancel = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  };

  const handleConfirm = async (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setConfirming(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setConfirming(false);
    }
  };

  const panelPositionClass =
    placement === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : 'top-full left-1/2 -translate-x-1/2 mt-2';
  const arrowPositionClass =
    placement === 'top'
      ? 'top-full left-1/2 -translate-x-1/2'
      : 'bottom-full left-1/2 -translate-x-1/2';

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      {cloneElement(child, {
        onClick: handleTriggerClick,
        disabled: child.props.disabled || disabled || confirming,
      })}
      {open && (
        <div
          className={`absolute z-50 w-64 ${panelPositionClass}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3">
            <p className="text-xs text-slate-700 dark:text-slate-200">{message}</p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                onClick={handleCancel}
                disabled={confirming}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`px-2.5 py-1.5 text-xs font-semibold text-white rounded-md disabled:opacity-50 ${
                  confirmTone === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
                }`}
                onClick={(event) => void handleConfirm(event)}
                disabled={confirming}
              >
                {confirmText}
              </button>
            </div>
          </div>
          <div
            className={`absolute h-3 w-3 rotate-45 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${arrowPositionClass}`}
          />
        </div>
      )}
    </div>
  );
}
