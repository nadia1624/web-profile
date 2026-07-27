'use client';

import { useState, useTransition } from 'react';
import { 
  createExperience, 
  updateExperience, 
  deleteExperience, 
  reorderExperiences 
} from '@/actions/experience';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  PlusCircle, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  MapPin,
  Upload
} from 'lucide-react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

interface ExperienceProps {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  description?: string | null;
  responsibilities: string[];
  technologies: string[];
  companyLogo?: string | null;
  displayOrder: number;
}

interface ExperienceManagerProps {
  experiences: ExperienceProps[];
}

export default function ExperienceManager({ experiences }: ExperienceManagerProps) {
  const router = useRouter();
  const [list, setList] = useState<ExperienceProps[]>(experiences);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form toggle states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [respInput, setRespInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const resetForm = () => {
    setCompany('');
    setPosition('');
    setEmploymentType('Full-time');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setResponsibilities([]);
    setRespInput('');
    setTechnologies([]);
    setTechInput('');
    setCompanyLogo(null);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (exp: ExperienceProps) => {
    setCompany(exp.company);
    setPosition(exp.position);
    setEmploymentType(exp.employmentType);
    setLocation(exp.location || '');
    
    // Format dates to YYYY-MM-DD for input fields
    const sDate = new Date(exp.startDate).toISOString().split('T')[0];
    setStartDate(sDate);
    
    if (exp.endDate) {
      const eDate = new Date(exp.endDate).toISOString().split('T')[0];
      setEndDate(eDate);
    } else {
      setEndDate('');
    }
    
    setIsCurrent(exp.isCurrent);
    setDescription(exp.description || '');
    setResponsibilities([...exp.responsibilities]);
    setTechnologies([...exp.technologies]);
    setCompanyLogo(exp.companyLogo || null);
    
    setEditingId(exp.id);
    setIsOpen(true);
  };

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || 'Failed to upload company logo.');
      }

      setCompanyLogo(result.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload company logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Add responsibility bullet
  const addResponsibility = () => {
    if (respInput.trim() !== '') {
      setResponsibilities([...responsibilities, respInput.trim()]);
      setRespInput('');
    }
  };

  const removeResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  // Add technology badge
  const addTechnology = () => {
    if (techInput.trim() !== '' && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSave = () => {
    if (!company || !position || !startDate) {
      setToast({ type: 'error', text: 'Company name, Position, and Start Date are required.' });
      return;
    }

    startTransition(async () => {
      try {
        let result;
        const dataPayload = {
          company,
          position,
          employmentType,
          location: location || null,
          startDate,
          endDate: isCurrent ? null : (endDate && endDate.trim() !== '' ? endDate : null),
          isCurrent,
          description: description || null,
          responsibilities,
          technologies,
          companyLogo,
        };

        if (editingId) {
          result = await updateExperience(editingId, dataPayload);
        } else {
          result = await createExperience(dataPayload);
        }

        if (result?.success) {
          setToast({ 
            type: 'success', 
            text: editingId ? 'Experience successfully updated!' : 'Experience successfully created!' 
          });
          
          setIsOpen(false);
          resetForm();
          router.refresh();
        } else {
          setToast({ type: 'error', text: result?.error || 'Failed to save experience.' });
        }
      } catch (err: any) {
        setToast({ type: 'error', text: err.message || 'Error occurred while saving experience.' });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the experience at "${name}"?`)) {
      startTransition(async () => {
        const result = await deleteExperience(id);
        if (result.success) {
          setToast({ type: 'success', text: 'Experience successfully deleted!' });
          setList(list.filter((item) => item.id !== id));
        } else {
          setToast({ type: 'error', text: result.error || 'Failed to delete experience.' });
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
      const result = await reorderExperiences(ids);
      if (!result.success) {
        setToast({ type: 'error', text: 'Failed to save display ordering.' });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl animate-slide-up ${
          toast.type === 'success' 
            ? 'border-emerald-500/20 bg-zinc-900 text-emerald-400' 
            : 'border-red-500/20 bg-zinc-900 text-red-400'
        } text-sm`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-zinc-500 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-purple-400" />
          Experiences Ledger
        </h2>
        {!isOpen && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        )}
      </div>

      {/* Editor Panel (Conditional) */}
      {isOpen && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6 animate-slide-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-bold font-heading text-white">
              {editingId ? 'Edit Work Experience' : 'Add New Work Experience'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo upload left column */}
            <div className="md:col-span-1 flex flex-col items-center p-6 border border-zinc-900 bg-zinc-900/10 rounded-2xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4 block w-full text-left">
                Company Logo
              </span>

              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-4">
                {companyLogo ? (
                  <Image src={companyLogo} alt="Logo preview" fill className="object-cover" />
                ) : (
                  <Briefcase className="w-8 h-8 text-zinc-700" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
              </label>
            </div>

            {/* Info Right Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Company & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Universitas Andalas"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Position / Title</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Laboratory Secretary"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Type & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Contract">Contract</option>
                    <option value="Student Organization">Student Organization</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Padang, West Sumatra"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Dates & Current */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
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
                  <label className={`text-[10px] font-bold uppercase tracking-wider text-zinc-400 ${isCurrent ? 'opacity-30' : ''}`}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrent}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="isCurrent" className="text-xs text-zinc-300 font-medium cursor-pointer">
                    Current Position
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description / Role Overview</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a general overview of the role..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                />
              </div>

              {/* Responsibilities list manager */}
              <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Responsibilities (Bullet Points)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={respInput}
                    onChange={(e) => setRespInput(e.target.value)}
                    placeholder="Describe a key responsibility or achievement..."
                    className="flex-grow bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {responsibilities.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic">No bullet points added. Add key activities above.</p>
                ) : (
                  <ul className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                    {responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-900 text-xs text-zinc-300 leading-relaxed">
                        <span className="mt-0.5">• {resp}</span>
                        <button
                          type="button"
                          onClick={() => removeResponsibility(idx)}
                          className="text-zinc-500 hover:text-red-400 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Technologies tag list manager */}
              <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Technologies Used</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g. Next.js, BPMN (Press enter or click Add)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology();
                      }
                    }}
                    className="flex-grow bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded"
                    >
                      {tech}
                      <button type="button" onClick={() => removeTechnology(tech)} className="text-purple-400 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Form actions */}
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
                  disabled={isPending || isUploadingLogo}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experiences List */}
      {list.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-zinc-500">
          <Briefcase className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p>No experiences registered in the CMS database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((exp, index) => (
            <div
              key={exp.id}
              className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left Column details */}
              <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-850 overflow-hidden shrink-0 flex items-center justify-center text-purple-400">
                  {exp.companyLogo ? (
                    <Image src={exp.companyLogo} alt={exp.company} width={48} height={48} className="object-cover" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                {/* Title */}
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">{exp.position}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{exp.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -{' '}
                      {exp.isCurrent || !exp.endDate
                        ? 'Present'
                        : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                    <span>&bull;</span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      (exp.employmentType || '').toLowerCase().includes('organisa') || (exp.employmentType || '').toLowerCase().includes('organization') || (exp.employmentType || '').toLowerCase().includes('bem')
                        ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                        : 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                    }`}>
                      {exp.employmentType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Right Column */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {/* Reorder actions */}
                <div className="flex items-center gap-1 mr-2 border-r border-zinc-900 pr-3">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || isPending}
                    className="p-2 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === list.length - 1 || isPending}
                    className="p-2 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit & Delete actions */}
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-purple-400 hover:border-purple-500/25 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id, exp.company)}
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
