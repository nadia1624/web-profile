'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdmin } from '@/actions/auth';
import ThemeToggle from './ThemeToggle';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FolderKanban, 
  Layers, 
  Code2, 
  GraduationCap, 
  Award, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'Experiences', href: '/admin/experiences', icon: Briefcase },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Skills', href: '/admin/skills', icon: Layers },
    { name: 'Technologies', href: '/admin/technologies', icon: Code2 },
    { name: 'Education', href: '/admin/education', icon: GraduationCap },
    { name: 'Certifications', href: '/admin/certifications', icon: Award },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      startTransition(async () => {
        const result = await logoutAdmin();
        if (result.success) {
          router.refresh();
          router.push('/admin/login');
        }
      });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card light:bg-white border-r border-border light:border-zinc-200 w-64 shrink-0 relative z-30 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-border light:border-zinc-200 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-1.5 font-heading font-extrabold text-foreground text-lg">
          nadia<span className="text-purple-500">.</span>cms
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-[10px] bg-purple-500/10 text-purple-500 light:text-purple-700 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
            ADMIN
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-border light:border-zinc-200">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{isPending ? 'Logging out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible md and up) */}
      <div className="hidden md:block h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Top Header (hidden md and up) */}
      <div className="md:hidden w-full bg-card light:bg-white border-b border-border light:border-zinc-200 py-4 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
        <Link href="/admin" className="flex items-center gap-1.5 font-heading font-extrabold text-foreground text-base">
          nadia<span className="text-purple-500">.</span>cms
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Menu */}
          <div className="relative flex flex-col h-full animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
