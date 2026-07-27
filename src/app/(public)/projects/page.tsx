import { getProjects } from '@/actions/project';
import FilterableProjects from '@/components/FilterableProjects';
import { FadeIn } from '@/components/MotionWrappers';
import { FolderKanban } from 'lucide-react';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <FadeIn delay={0.1} className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">My Portfolio</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">Projects & Case Studies</h1>
        <p className="text-muted-foreground mt-2">
          Explore dynamic web applications and structured systems analysis blueprints.
        </p>
      </FadeIn>

      {/* Interactive filterable projects component */}
      <FadeIn delay={0.2}>
        <FilterableProjects projects={projects as any} />
      </FadeIn>
    </div>
  );
}
