'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/actions/auth';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result.success) {
        // Successful login, refresh router and push to admin dashboard
        router.refresh();
        router.push('/admin');
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl border border-zinc-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold font-heading text-white">
            nadia<span className="text-purple-500">.</span>cms
          </span>
          <p className="text-xs text-zinc-500 mt-2">
            Administrator Authentication Panel
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs sm:text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="admin@nadia.com"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-700 outline-none transition-all"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-600" />
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-700 outline-none transition-all"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium hover:shadow-lg hover:shadow-purple-700/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-600 relative z-10">
        <p>&copy; Nadia Deari Hanifah. All rights reserved.</p>
        <p className="mt-1">Secure HTTP-Only Cookies Session Management</p>
      </div>
    </div>
  );
}
