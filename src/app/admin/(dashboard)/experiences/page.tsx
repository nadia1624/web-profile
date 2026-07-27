import { getExperiences } from '@/actions/experience';
import ExperienceManager from '@/components/ExperienceManager';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Experience Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Add, edit, delete, and reorder your academic and professional work experiences.
        </p>
      </div>

      <ExperienceManager experiences={experiences as any} />
    </div>
  );
}
