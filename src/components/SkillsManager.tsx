'use client';

import { useState, useTransition } from 'react';
import { 
  createSkill, 
  updateSkill, 
  deleteSkill, 
  reorderSkills 
} from '@/actions/skills';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';

interface SkillProps {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  displayOrder: number;
}

interface SkillsManagerProps {
  skills: SkillProps[];
}

import { useRouter } from 'next/navigation';

export default function SkillsManager({ skills }: SkillsManagerProps) {
  const router = useRouter();
  const [list, setList] = useState<SkillProps[]>(skills);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('System Analysis');
  const [icon, setIcon] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('System Analysis');
    setIcon('');
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (skill: SkillProps) => {
    setName(skill.name);
    setCategory(skill.category);
    setIcon(skill.icon || '');
    setEditingId(skill.id);
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
        result = await updateSkill(editingId, dataPayload);
      } else {
        result = await createSkill(dataPayload);
      }

      if (result.success) {
        setToast({ 
          type: 'success', 
          text: editingId ? 'Skill successfully updated!' : 'Skill successfully created!' 
        });
        setIsOpen(false);
        router.refresh();
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to save skill.' });
      }
    });
  };

  const handleDelete = (id: string, skillName: string) => {
    if (confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
      startTransition(async () => {
        const result = await deleteSkill(id);
        if (result.success) {
          setToast({ type: 'success', text: 'Skill successfully deleted!' });
          setList(list.filter((item) => item.id !== id));
        } else {
          setToast({ type: 'error', text: result.error || 'Failed to delete skill.' });
        }
      });
    }
  };

  // Reorder methods
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newList.length) return;

    // Swap
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setList(newList);

    startTransition(async () => {
      const ids = newList.map((item) => item.id);
      const result = await reorderSkills(ids);
      if (!result.success) {
        setToast({ type: 'error', text: 'Failed to save skill ordering.' });
      }
    });
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
          <Layers className="w-4 h-4 text-purple-400" />
          Skills List
        </h2>
        {!isOpen && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {/* Form Editor */}
      {isOpen && (
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4 animate-slide-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold font-heading text-white">
              {editingId ? 'Edit Skill' : 'Create New Skill'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Skill Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Business Process Modeling"
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
                <option value="System Analysis">System Analysis</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Icon ClassName (Optional)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. Activity, Database, Code"
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
              Save Skill
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-zinc-500">
          <Layers className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p>No skills entered in the database.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((skill, index) => (
            <div
              key={skill.id}
              className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-zinc-805 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-xs font-bold text-white">{skill.name}</h3>
                <span className="text-[9px] uppercase tracking-wider bg-purple-950/40 text-purple-300 border border-purple-500/10 px-2 py-0.5 rounded font-semibold mt-1 inline-block">
                  {skill.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Reorder */}
                <div className="flex items-center gap-1 mr-2 border-r border-zinc-900 pr-3">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || isPending}
                    className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === list.length - 1 || isPending}
                    className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(skill)}
                  className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-purple-400 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(skill.id, skill.name)}
                  disabled={isPending}
                  className="p-2 rounded bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-red-400 cursor-pointer"
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
