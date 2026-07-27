import { getProjects } from '@/actions/project';
import Link from 'next/link';
import { BookOpen, CheckCircle, AlertCircle, Edit2, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminCaseStudiesPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Case Study Registry</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Review which projects have detailed process designs, BPMN models, and UML diagrams.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
        <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-purple-400" />
          Project Analysis Status
        </h2>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No projects registered in the database. Please create a project first before managing case studies.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-zinc-400 border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-4 px-4">Project Title</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Case Study Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {projects.map((proj: any) => {
                  const hasCaseStudy = !!proj.caseStudy?.id;

                  return (
                    <tr key={proj.id} className="hover:bg-zinc-900/10">
                      <td className="py-4 px-4 font-semibold text-white">{proj.title}</td>
                      <td className="py-4 px-4">{proj.category}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          hasCaseStudy
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/15'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-850'
                        }`}>
                          {hasCaseStudy ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active Case Study
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-zinc-650" />
                              Not Configured
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/admin/projects/${proj.id}/edit`}>
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-purple-600 border border-zinc-850 hover:border-purple-500 text-zinc-400 hover:text-white transition-all text-xs font-semibold cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5" />
                            Manage Case Study
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
