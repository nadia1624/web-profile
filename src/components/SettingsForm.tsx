'use client';

import { useState, useTransition } from 'react';
import { updateAdminSettings } from '@/actions/auth';
import { Save, Loader2, Key, User, Mail, AlertCircle, CheckCircle, X } from 'lucide-react';

interface AdminProps {
  id: string;
  name: string;
  email: string;
}

interface SettingsFormProps {
  currentAdmin: AdminProps | null;
}

export default function SettingsForm({ currentAdmin }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile fields state
  const [name, setName] = useState(currentAdmin?.name || '');
  const [email, setEmail] = useState(currentAdmin?.email || '');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!name || !email) {
      setToast({ type: 'error', text: 'Name and Email are required.' });
      return;
    }

    startTransition(async () => {
      const result = await updateAdminSettings({ name, email });
      if (result.success) {
        setToast({ type: 'success', text: 'Information updated successfully!' });
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to update info.' });
      }
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', text: 'New password and Confirm password do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setToast({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    startTransition(async () => {
      const result = await updateAdminSettings({
        name,
        email,
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setToast({ type: 'success', text: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to update password.' });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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

      {/* Info Account Form */}
      <form onSubmit={handleSaveInfo} className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
        <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
          <User className="w-4 h-4 text-purple-400" />
          Account Information
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Display Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Info
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handleSavePassword} className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
        <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Key className="w-4 h-4 text-purple-400" />
          Change Password
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type new password"
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            disabled={isPending}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
