import { getExperiences } from '@/actions/experience';
import { FadeIn } from '@/components/MotionWrappers';
import { Briefcase } from 'lucide-react';
import FilterableExperiences from '@/components/FilterableExperiences';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <FadeIn delay={0.1} className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">My Journey</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">Professional & Organizational Experience</h1>
        <p className="text-muted-foreground mt-2">
          Roles and contributions across internships, laboratory appointments, and student bodies.
        </p>
      </FadeIn>

      {experiences.length === 0 ? (
        <FadeIn delay={0.2} className="text-center py-16 glass-panel rounded-2xl text-muted-foreground">
          <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p>No experience entries found in the database.</p>
          <p className="text-xs mt-1 text-muted-foreground/60">Access `/admin/login` to configure and add records.</p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.2}>
          <FilterableExperiences experiences={experiences as any} />
        </FadeIn>
      )}
    </div>
  );
}
