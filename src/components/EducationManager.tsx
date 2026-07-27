'use client';

import { useState, useTransition } from 'react';
import { 
  createEducation, 
  updateEducation, 
  deleteEducation, 
  reorderEducation 
} from '@/actions/education';
import { 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Calendar
} from 'lucide-react';

interface EducationProps {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date | null;
  description?: string | null;
  gpa?: string | null;
  achievement?: string | null;
  displayOrder: number;
}

interface EducationManagerProps {
  educationList: EducationProps[];
}

export default function EducationManager({ educationList }: EducationManagerProps) {
  const [list, setList] = useState<EducationProps[]>(educationList);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [gpa, setGpa] = useState('');
  const [achievement, setAchievement] = useState('');

  const resetForm = () => {
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setGpa('');
    setAchievement('');
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (edu: EducationProps) => {
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setFieldOfStudy(edu.fieldOfStudy);
    
    const sDate = new Date(edu.startDate).toISOString().split('T')[0];
    setStartDate(sDate);
    
    if (edu.endDate) {
      const eDate = new Date(edu.endDate).toISOString().split('T')[0];
      setEndDate(eDate);
    } else {
      setEndDate('');
    }

    setDescription(edu.description || '');
    setGpa(edu.gpa || '');
    setAchievement(edu.achievement || '');
    setEditingId(edu.id);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!institution || !degree || !fieldOfStudy || !startDate) {
      setToast({ type: 'error', text: 'Institution, Degree, Field of Study, and Start Date are required.' });
      return;
    }

    startTransition(async () => {
      let result;
      const dataPayload = {
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate: endDate || null,
        description: description || null,
        gpa: gpa || null,
        achievement: achievement || null,
      };

      if (editingId) {
        result = await updateEducation(editingId, dataPayload);
      } else {
        result = await createEducation(dataPayload);
      }

      if (result.success) {
        setToast({ 
          type: 'success', 
          text: editingId ? 'Education successfully updated!' : 'Education successfully created!' 
        });
        window.location.reload();
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to save education.' });
      }
    });
  };

  const handleDelete = (id: string, inst: string) => {
    if (confirm(`Are you sure you want to delete education entry for "${inst}"?`)) {
      startTransition(async () => {
        const result = await deleteEducation(id);
        if (result.success) {
          setToast({ type: 'success', text: 'Education entry successfully deleted!' });
          setList(list.filter((item) => item.id !== id));
        } else {
          setToast({ type: 'error', text: result.error || 'Failed to delete education entry.' });
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
      const result = await reorderEducation(ids);
      if (!result.success) {
        setToast({ type: 'error', text: 'Failed to save education ordering.' });
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
          <GraduationCap className="w-4 h-4 text-purple-400" />
          Education Ledger
        </h2>
        {!isOpen && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}
      </div>

      {/* Form Editor */}
      {isOpen && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6 animate-slide-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-bold font-heading text-white">
              {editingId ? 'Edit Education Entry' : 'Add New Education Entry'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Institution & Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Institution Name</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Universitas Andalas"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Degree (Level)</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Science (S.Kom)"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* Field & GPA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Field of Study</label>
                <input
                  type="text"
                  required
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Information Systems"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">GPA Score (Optional)</label>
                <input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="e.g. 3.85 / 4.00"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">End Date (Blank if active)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description / Focus areas</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="List major courses or topics studied..."
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
              />
            </div>

            {/* Achievements */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Key Achievement (Optional)</label>
              <input
                type="text"
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                placeholder="e.g. Appointed as Laboratory Secretary"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-zinc-500">
          <GraduationCap className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p>No education history entries registered in the CMS database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((edu, index) => (
            <div
              key={edu.id}
              className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 overflow-hidden shrink-0 flex items-center justify-center text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">{edu.institution}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{edu.degree} &bull; {edu.fieldOfStudy}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -{' '}
                      {edu.endDate
                        ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                        : 'Present'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {/* Reorder */}
                <div className="flex items-center gap-1 mr-2 border-r border-zinc-900 pr-3">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || isPending}
                    className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === list.length - 1 || isPending}
                    className="p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(edu)}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-purple-400 hover:border-purple-500/25 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(edu.id, edu.institution)}
                  disabled={isPending}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-red-400 hover:border-red-500/25 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
