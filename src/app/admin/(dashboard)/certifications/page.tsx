import { getCertifications } from '@/actions/certification';
import CertificationManager from '@/components/CertificationManager';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminCertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Certification Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Add, edit, and delete professional and academic certifications displayed in your About page.
        </p>
      </div>

      <CertificationManager certifications={certifications as any} />
    </div>
  );
}
