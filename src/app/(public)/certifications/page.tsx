import { getCertifications } from '@/actions/certification';
import { FadeIn } from '@/components/MotionWrappers';
import { Award } from 'lucide-react';
import CertificationsSection from '@/components/CertificationsSection';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {certifications.length === 0 ? (
        <FadeIn delay={0.2} className="text-center py-16 glass-panel rounded-2xl text-muted-foreground max-w-md mx-auto">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p>No certification or training entries found in the database.</p>
          <p className="text-xs mt-1 text-muted-foreground/60">Access `/admin/login` to configure and add records.</p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.2}>
          <CertificationsSection certifications={certifications as any} />
        </FadeIn>
      )}
    </div>
  );
}
