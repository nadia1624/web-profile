'use client';

import { useState, useTransition } from 'react';
import { 
  createTechnology, 
  updateTechnology, 
  deleteTechnology 
} from '@/actions/skills';
import { 
  Code2, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';

interface TechProps {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
}

interface TechnologiesManagerProps {
  technologies: TechProps[];
}

export default function TechnologiesManager({ technologies }: TechnologiesManagerProps) {
  const [list, setList] = useState<TechProps[]>(technologies);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Business & System Analysis');
  const [icon, setIcon] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('Business & System Analysis');
    setIcon('');
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (tech: TechProps) => {
    setName(tech.name);
    setCategory(tech.category);
    setIcon(tech.icon || '');
    setEditingId(tech.id);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!name || !category) {
      setToast({ type: 'error', text: 'Name and Category are required.' });
      return;
    }

    startTransition(async () => {
      let result;
      const dataPayload = { name, category, icon: icon || null };

      if (editingId) {
        result = await updateTechnology(editingId, dataPayload);
      } else {
        result = await createTechnology(dataPayload);
      }

      if (result.success) {
        setToast({ 
          type: 'success', 
          text: editingId ? 'Technology successfully updated!' : 'Technology successfully created!' 
        });
        window.location.reload();
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to save technology.' });
      }
    });
  };

  const handleDelete = (id: string, techName: string) => {
    if (confirm(`Are you sure you want to delete the technology "${techName}"? This will unlink it from any project.`)) {
      startTransition(async () => {
        const result = await deleteTechnology(id);
        if (result.success) {
          setToast({ type: 'success', text: 'Technology successfully deleted!' });
          setList(list.filter((item) => item.id !== id));
        } else {
          setToast({ type: 'error', text: result.error || 'Failed to delete technology.' });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl animate-slide-up ${
          toast.type === 'success' ? 'border-emerald-500/20 bg-zinc-900 text-emerald-400' : 'border-red-500/20 bg-zinc-900 text-red-400'
        } text-sm`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-zinc-500 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-purple-400" />
          Technologies List
        </h2>
        {!isOpen && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Technology
          </button>
        )}
      </div>

      {/* Form Editor */}
      {isOpen && (
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4 animate-slide-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold font-heading text-white">
              {editingId ? 'Edit Technology' : 'Create New Technology'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Technology Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next.js"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              >
                <option value="Business & System Analysis">Business & System Analysis</option>
                <option value="Web Development">Web Development</option>
                <option value="Database & Tools">Database & Tools</option>
                <option value="Testing & Quality">Testing & Quality</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Icon Key (Optional)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. nextjs, react, git"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900/80">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Technology
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-zinc-500">
          <Code2 className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p>No technologies entered in the database.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((tech) => (
            <div
              key={tech.id}
              className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-zinc-805 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-xs font-bold text-white">{tech.name}</h3>
                <span className="text-[9px] uppercase tracking-wider bg-purple-950/40 text-purple-300 border border-purple-500/10 px-2 py-0.5 rounded font-semibold mt-1 inline-block">
                  {tech.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(tech)}
                  className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-455 hover:text-purple-400 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tech.id, tech.name)}
                  disabled={isPending}
                  className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-455 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
