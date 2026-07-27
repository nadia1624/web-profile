'use client';

import { useState, useTransition } from 'react';
import { 
  createCertification, 
  updateCertification, 
  deleteCertification 
} from '@/actions/certification';
import { 
  Award, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  ExternalLink,
  Upload
} from 'lucide-react';
import Image from 'next/image';

interface CertificationProps {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  credentialId?: string | null;
  credentialUrl?: string | null;
  certificateImage?: string | null;
  type?: string | null;
  description?: string | null;
}

interface CertificationManagerProps {
  certifications: CertificationProps[];
}

export default function CertificationManager({ certifications }: CertificationManagerProps) {
  const [list, setList] = useState<CertificationProps[]>(certifications);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Certification');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [description, setDescription] = useState('');
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const resetForm = () => {
    setName('');
    setType('Certification');
    setIssuingOrganization('');
    setIssueDate('');
    setCredentialId('');
    setCredentialUrl('');
    setDescription('');
    setCertificateImage(null);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (cert: CertificationProps) => {
    setName(cert.name);
    setType(cert.type || 'Certification');
    setIssuingOrganization(cert.issuingOrganization);
    
    const iDate = new Date(cert.issueDate).toISOString().split('T')[0];
    setIssueDate(iDate);

    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    setDescription(cert.description || '');
    setCertificateImage(cert.certificateImage || null);
    setEditingId(cert.id);
    setIsOpen(true);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImg(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      setCertificateImage(result.url);
    } catch (err) {
      alert('Failed to upload certificate image.');
    } finally {
      setIsUploadingImg(false);
    }
  };

  const handleSave = () => {
    if (!name || !issuingOrganization || !issueDate) {
      setToast({ type: 'error', text: 'Name, Issuing Organization, and Issue Date are required.' });
      return;
    }

    startTransition(async () => {
      let result;
      const dataPayload = {
        name,
        type,
        issuingOrganization,
        issueDate,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
        certificateImage: certificateImage || null,
        description: description || null,
      };

      if (editingId) {
        result = await updateCertification(editingId, dataPayload);
      } else {
        result = await createCertification(dataPayload);
      }

      if (result.success) {
        setToast({ 
          type: 'success', 
          text: editingId ? 'Certification successfully updated!' : 'Certification successfully created!' 
        });
        window.location.reload();
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to save certification.' });
      }
    });
  };

  const handleDelete = (id: string, certName: string) => {
    if (confirm(`Are you sure you want to delete the certification "${certName}"?`)) {
      startTransition(async () => {
        const result = await deleteCertification(id);
        if (result.success) {
          setToast({ type: 'success', text: 'Certification successfully deleted!' });
          setList(list.filter((item) => item.id !== id));
        } else {
          setToast({ type: 'error', text: result.error || 'Failed to delete certification.' });
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
          <Award className="w-4 h-4 text-purple-400" />
          Certifications Ledger
        </h2>
        {!isOpen && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        )}
      </div>

      {/* Form Editor */}
      {isOpen && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6 animate-slide-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-bold font-heading text-white">
              {editingId ? 'Edit Certification' : 'Add New Certification'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Certificate Copy Upload */}
            <div className="md:col-span-1 flex flex-col items-center p-6 border border-zinc-900 bg-zinc-900/10 rounded-2xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4 block w-full text-left">
                Certificate Image Preview
              </span>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-805 bg-zinc-900 flex items-center justify-center mb-4">
                {certificateImage ? (
                  <Image src={certificateImage} alt="Certificate copy" fill className="object-contain" />
                ) : (
                  <Award className="w-8 h-8 text-zinc-750" />
                )}
                {isUploadingImg && (
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
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImg}
                />
              </label>
            </div>

            {/* Right: Info fields */}
            <div className="md:col-span-2 space-y-6">
              {/* Name, Type & Issuer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1 flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Entry Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Certification">Certification (Sertifikat)</option>
                    <option value="Training">Training / Workshop (Pelatihan)</option>
                  </select>
                </div>
                <div className="sm:col-span-1 flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Title / Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. System Analyst Certification"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Issuing Organization</label>
                  <input
                    type="text"
                    required
                    value={issuingOrganization}
                    onChange={(e) => setIssuingOrganization(e.target.value)}
                    placeholder="e.g. FIT UNAND / CertiProf"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Date & Credential ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Credential ID (Optional)</label>
                  <input
                    type="text"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    placeholder="e.g. SFPC-987123"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Credential URL */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Verification URL</label>
                <input
                  type="url"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize course content or validated capabilities..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
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
                  disabled={isPending || isUploadingImg}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Certification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-zinc-500">
          <Award className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p>No certifications registered in the CMS database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((cert) => (
            <div
              key={cert.id}
              className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-805 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-850 overflow-hidden shrink-0 flex items-center justify-center text-purple-400">
                  {cert.certificateImage ? (
                    <Image src={cert.certificateImage} alt={cert.name} width={48} height={48} className="object-cover" />
                  ) : (
                    <Award className="w-5 h-5" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">{cert.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{cert.issuingOrganization}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                    {cert.credentialId && (
                      <>
                        <span>&bull;</span>
                        <span>ID: {cert.credentialId}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-white cursor-pointer mr-2"
                    title="Verify online"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleOpenEdit(cert)}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-purple-400 hover:border-purple-500/25 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cert.id, cert.name)}
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
