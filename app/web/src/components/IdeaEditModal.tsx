import { useState, useEffect } from 'react';

interface Goal {
  id: string;
  name: string;
}

interface IdeaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; }) => void;
  groupName?: string;
  initialData?: {
    title?: string;
    description?: string;
  };
  mode?: 'create' | 'edit';
}

export default function IdeaEditModal({
  isOpen,
  onClose,
  onSubmit,
  groupName = '',
  initialData,
  mode = 'create'
}: IdeaEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedGoals([]);
    onClose();
  };

  const removeGoal = (goalId: string) => {
    setSelectedGoals(selectedGoals.filter(g => g.id !== goalId));
  };

  const insertMarkdown = (syntax: string) => {
    // TODO: Implement markdown insertion at cursor position
    console.log('Insert markdown:', syntax);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/85 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{mode === 'create' ? 'New Idea' : 'Edit Idea'}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{groupName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            type="button"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1"
                htmlFor="idea-title"
              >
                Title
              </label>
              <input
                id="idea-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-t-0 border-x-0 border-b-2 border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-0 text-2xl font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all"
                placeholder="Enter a descriptive title..."
                required
              />
            </div>

            {/* Content Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">
                Content Description
              </label>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**bold**')}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-xl">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*italic*')}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-xl">format_italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- list item')}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('`code`')}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-xl">code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[link](url)')}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                  >
                    <span className="material-symbols-outlined text-xl">link</span>
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-tight">
                    Markdown Supported
                  </span>
                </div>
                {/* Textarea */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-transparent border-none focus:ring-0 min-h-[240px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                  placeholder="Describe your idea in detail..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
              Submit Idea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
