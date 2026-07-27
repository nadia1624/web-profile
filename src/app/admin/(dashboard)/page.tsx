import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  FolderKanban, 
  Briefcase, 
  Layers, 
  Award, 
  GraduationCap, 
  ArrowUpRight, 
  Plus, 
  User2,
  Settings,
  Sparkles
} from 'lucide-react';

export const revalidate = 0; // Always fresh data

export default async function AdminDashboardPage() {
  // 1. Fetch statistics from Database
  const [projectsCount, experiencesCount, skillsCount, certsCount, eduCount] = await Promise.all([
    prisma.project.count(),
    prisma.experience.count(),
    prisma.skill.count(),
    prisma.certification.count(),
    prisma.education.count(),
  ]);

  // 2. Fetch recent entries for activity log
  const [recentProjects, recentExperiences] = await Promise.all([
    prisma.project.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, createdAt: true },
    }),
    prisma.experience.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, position: true, company: true, createdAt: true },
    }),
  ]);

  const stats = [
    { name: 'Total Projects', value: projectsCount, icon: FolderKanban, href: '/admin/projects', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 light:bg-purple-50 light:text-purple-700' },
    { name: 'Total Experiences', value: experiencesCount, icon: Briefcase, href: '/admin/experiences', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 light:bg-blue-50 light:text-blue-700' },
    { name: 'Total Skills', value: skillsCount, icon: Layers, href: '/admin/skills', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 light:bg-emerald-50 light:text-emerald-700' },
    { name: 'Certifications', value: certsCount, icon: Award, href: '/admin/certifications', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 light:bg-amber-50 light:text-amber-700' },
    { name: 'Education Entries', value: eduCount, icon: GraduationCap, href: '/admin/education', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20 light:bg-pink-50 light:text-pink-700' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground text-xs mt-1">
            Summary of all dynamic content currently stored in your portfolio CMS.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-secondary hover:bg-purple-600 light:hover:bg-purple-600 text-foreground hover:text-white light:hover:text-white border border-border hover:border-purple-500 transition-colors">
            View Live Portfolio
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.href} className="block group">
              <div className="glass-panel p-6 rounded-2xl border border-border group-hover:border-purple-500/30 transition-all flex flex-col items-start h-full">
                <div className={`p-3 rounded-xl border shrink-0 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold font-heading text-foreground mt-6 block">
                  {stat.value}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-2 block">
                  {stat.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main split dashboard panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
            <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Quick CMS Actions
            </h2>

            <div className="flex flex-col gap-2.5">
              <Link href="/admin/projects" className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/60 hover:bg-purple-500/10 border border-border hover:border-purple-500/30 text-xs font-semibold text-foreground transition-all">
                <span>Manage Projects</span>
                <Plus className="w-4 h-4 text-purple-500" />
              </Link>
              <Link href="/admin/experiences" className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/60 hover:bg-blue-500/10 border border-border hover:border-blue-500/30 text-xs font-semibold text-foreground transition-all">
                <span>Add Work Experience</span>
                <Plus className="w-4 h-4 text-blue-500" />
              </Link>
              <Link href="/admin/profile" className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/60 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 text-xs font-semibold text-foreground transition-all">
                <span>Update Profile Bio</span>
                <User2 className="w-4 h-4 text-emerald-500" />
              </Link>
              <Link href="/admin/settings" className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
                <span>Change Admin Password</span>
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Updates Log */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
            <h2 className="text-sm font-bold font-heading text-foreground">Recent CMS Modifications</h2>

            <div className="space-y-6">
              {/* Recent projects */}
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-3">Recently Added Projects</h3>
                {recentProjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No projects added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentProjects.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-secondary/40 border border-border">
                        <div>
                          <p className="text-xs font-bold text-foreground">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{p.category}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent experiences */}
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-3">Recently Added Experience</h3>
                {recentExperiences.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No experiences added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentExperiences.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-secondary/40 border border-border">
                        <div>
                          <p className="text-xs font-bold text-foreground">{e.position}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{e.company}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
