'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FolderKanban, ArrowRight, Github, ExternalLink, Sparkles } from 'lucide-react';

interface ProjectProps {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  role?: string | null;
  thumbnail?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured: boolean;
  technologies: {
    technology: {
      id: string;
      name: string;
    };
  }[];
}

interface FilterableProjectsProps {
  projects: ProjectProps[];
}

export default function FilterableProjects({ projects }: FilterableProjectsProps) {
  return (
    <div className="w-full">
      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-muted-foreground max-w-md mx-auto">
          <FolderKanban className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p>No projects found in the portfolio database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {projects.map((project) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={project.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group h-full relative"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-secondary overflow-hidden border-b border-border">
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    sizes="(max-w-768px) 100vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground/30">
                    <FolderKanban className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-4 left-4 z-10 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-zinc-900/80 light:bg-white/90 text-purple-400 light:text-purple-700 border border-purple-500/30 light:border-purple-400/40 backdrop-blur-sm shadow-sm">
                  {project.category}
                </span>
              </div>

              {/* Contents */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold font-heading text-foreground group-hover:text-purple-500 transition-colors">
                  {project.title}
                </h3>
                {project.role && (
                  <p className="text-[11px] text-muted-foreground mt-1">Role: {project.role}</p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-4 line-clamp-3 leading-relaxed flex-grow">
                  {project.shortDescription}
                </p>

                {/* Technologies tags */}
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {project.technologies.map((pt) => (
                    <span
                      key={pt.technology.id}
                      className="tech-tag text-[9px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border"
                    >
                      {pt.technology.name}
                    </span>
                  ))}
                </div>

                {/* Actions (Always aligned to bottom) */}
                <div className="flex items-center gap-3 mt-auto pt-6 border-t border-border">
                  <Link href={`/projects/${project.slug}`} className="flex-grow">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary hover:bg-purple-600 light:hover:bg-purple-600 text-foreground hover:text-white light:hover:text-white text-xs font-semibold border border-border hover:border-purple-500 transition-all cursor-pointer active:scale-95">
                      Read Case Study
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-purple-500 border border-border hover:border-purple-500/30 transition-all shrink-0"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-purple-500 border border-border hover:border-purple-500/30 transition-all shrink-0"
                      title="Live Site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
