import { useRef } from 'react';

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export default function SimpleMarkdownEditor({
  value,
  onChange,
  rows = 10,
}: SimpleMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyWrap = (left: string, right = left, placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.slice(start, end) || placeholder;
    const replacement = `${left}${selected}${right}`;
    const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + left.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const applyList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.slice(start, end);

    let replacement = '';
    if (!selected) {
      replacement = '- ';
    } else {
      replacement = selected
        .split('\n')
        .map((line) => (line.trim() ? `- ${line}` : line))
        .join('\n');
    }

    const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" onClick={() => applyWrap('**', '**', 'bold text')}>
          <span className="material-icons text-sm">format_bold</span>
        </button>
        <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" onClick={() => applyWrap('*', '*', 'italic text')}>
          <span className="material-icons text-sm">format_italic</span>
        </button>
        <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" onClick={applyList}>
          <span className="material-icons text-sm">format_list_bulleted</span>
        </button>
        <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" onClick={() => applyWrap('# ', '', 'Heading')}>
          <span className="material-icons text-sm">title</span>
        </button>
        <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400" onClick={() => applyWrap('[', '](https://)', 'label')}>
          <span className="material-icons text-sm">link</span>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 p-4 leading-relaxed resize-none"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
