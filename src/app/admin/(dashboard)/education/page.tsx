import { getEducationList } from '@/actions/education';
import EducationManager from '@/components/EducationManager';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminEducationPage() {
  const educationList = await getEducationList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Education Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Add, edit, delete, and reorder academic history records displayed on your About page.
        </p>
      </div>

      <EducationManager educationList={educationList as any} />
    </div>
  );
}
