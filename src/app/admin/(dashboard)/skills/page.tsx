import { getSkills } from '@/actions/skills';
import SkillsManager from '@/components/SkillsManager';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminSkillsPage() {
  const skills = await getSkills();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Skills Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Add, edit, delete, and reorder skill markers that appear in your About page.
        </p>
      </div>

      <SkillsManager skills={skills as any} />
    </div>
  );
}
