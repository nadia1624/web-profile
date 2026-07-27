import { notFound } from 'next/navigation';
import { getProjectById } from '@/actions/project';
import { getTechnologies } from '@/actions/skills';
import ProjectEditForm from '@/components/ProjectEditForm';

export const revalidate = 0; // Fetch fresh data on every visit

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectEditPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  const [project, technologies] = await Promise.all([
    getProjectById(resolvedParams.id),
    getTechnologies(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Edit Project Case Study</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Modify project parameters and dynamic business process modeling diagrams.
        </p>
      </div>

      <ProjectEditForm project={project as any} allTechnologies={technologies as any} />
    </div>
  );
}
