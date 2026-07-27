import { getProjects } from '@/actions/project';
import { getTechnologies } from '@/actions/skills';
import ProjectManager from '@/components/ProjectManager';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminProjectsPage() {
  const [projects, technologies] = await Promise.all([
    getProjects(),
    getTechnologies(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Project Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Create, modify, delete, and reorder projects and their detailed process analysis case studies.
        </p>
      </div>

      <ProjectManager projects={projects as any} allTechnologies={technologies as any} />
    </div>
  );
}
