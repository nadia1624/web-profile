'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/actions/profile';
import { Upload, Loader2, Save, AlertCircle, CheckCircle, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';

interface ProfileProps {
  id: string;
  name: string;
  headline: string;
  shortBio: string;
  bio: string;
  profileImage?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  cvUrl?: string | null;
}

interface ProfileFormProps {
  profile: ProfileProps | null;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form fields state
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    headline: profile?.headline || '',
    shortBio: profile?.shortBio || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    linkedinUrl: profile?.linkedinUrl || '',
    githubUrl: profile?.githubUrl || '',
    instagramUrl: profile?.instagramUrl || '',
  });

  // Media states
  const [profileImage, setProfileImage] = useState<string | null>(profile?.profileImage || null);
  const [cvUrl, setCvUrl] = useState<string | null>(profile?.cvUrl || null);
  
  // Upload statuses
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const result = await res.json();
      setProfileImage(result.url);
    } catch (err: any) {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // CV PDF upload handler
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCV(true);
    setUploadError(null);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const result = await res.json();
      setCvUrl(result.url);
    } catch (err: any) {
      setUploadError('Failed to upload CV file. Please try again.');
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfile({
        ...formData,
        profileImage,
        cvUrl,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile successfully updated!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'border-emerald-500/20 bg-emerald-950/15 text-emerald-400' 
            : 'border-red-500/20 bg-red-950/15 text-red-400'
        } text-sm`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-950/15 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Uploads & Previews */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Photo Card */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4 block w-full text-left">
              Profile Photo
            </span>

            {/* Preview image */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 mb-4 flex items-center justify-center">
              {profileImage ? (
                <Image src={profileImage} alt="Profile Photo Preview" fill className="object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-zinc-700" />
              )}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
            </label>
          </div>

          {/* Curriculum Vitae (CV) Card */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4 block w-full text-left">
              Curriculum Vitae (PDF)
            </span>

            <div className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-900 mb-4 overflow-hidden">
              <FileText className="w-8 h-8 text-purple-400 shrink-0" />
              <div className="text-left overflow-hidden w-full">
                <p className="text-xs font-semibold text-white truncate">
                  {cvUrl ? cvUrl.split('/').pop() : 'No CV Uploaded'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {cvUrl ? 'Document is active' : 'PDF format recommended'}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer">
              {isUploadingCV ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Upload className="w-3.5 h-3.5" />}
              {cvUrl ? 'Replace CV File' : 'Upload CV File'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCVUpload}
                className="hidden"
                disabled={isUploadingCV}
              />
            </label>
          </div>
        </div>

        {/* Right Side: Text Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Info */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
              Bio & Professional Summary
            </span>

            {/* Name & Headline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Headline</label>
                <input
                  type="text"
                  name="headline"
                  required
                  value={formData.headline}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Short Biography (Hero screen)</label>
              <textarea
                name="shortBio"
                required
                rows={3}
                value={formData.shortBio}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              />
            </div>

            {/* Full Bio */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Biography (About page)</label>
              <textarea
                name="bio"
                required
                rows={6}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
              Contact & Social Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Instagram URL</label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || isUploadingImage || isUploadingCV}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-purple-700/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
