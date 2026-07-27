import { getTechnologies } from '@/actions/skills';
import TechnologiesManager from '@/components/TechnologiesManager';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminTechnologiesPage() {
  const technologies = await getTechnologies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Technologies Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Add, edit, and delete technologies. These items are associated with your projects.
        </p>
      </div>

      <TechnologiesManager technologies={technologies as any} />
    </div>
  );
}
