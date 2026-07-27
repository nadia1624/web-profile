'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Briefcase, ChevronRight, Layers, Building2, Users } from 'lucide-react';
import Image from 'next/image';
import { StaggerContainer, StaggerItem } from '@/components/MotionWrappers';

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  location?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
  description?: string | null;
  responsibilities: string[];
  technologies: string[];
  companyLogo?: string | null;
  displayOrder: number;
}

interface FilterableExperiencesProps {
  experiences: ExperienceItem[];
}

export function isOrganizationExp(exp: ExperienceItem): boolean {
  const type = (exp.employmentType || '').toLowerCase();
  return (
    type.includes('organization') ||
    type.includes('organisasi') ||
    type.includes('bem') ||
    type.includes('himpunan') ||
    type.includes('ukm') ||
    type.includes('student org')
  );
}

export default function FilterableExperiences({ experiences }: FilterableExperiencesProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'organization'>('work');

  const workExperiences = experiences.filter((exp) => !isOrganizationExp(exp));
  const orgExperiences = experiences.filter((exp) => isOrganizationExp(exp));

  const filteredExperiences = activeTab === 'work' ? workExperiences : orgExperiences;

  const renderExperienceList = (items: ExperienceItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 glass-panel rounded-2xl text-muted-foreground my-4">
          <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm">No experience records found in this category.</p>
        </div>
      );
    }

    return (
      <StaggerContainer className="space-y-6 max-w-4xl mx-auto">
        {items.map((exp) => {
          const isOrg = isOrganizationExp(exp);

          return (
            <StaggerItem key={exp.id}>
              <div className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-2xl border border-border transition-all duration-300 hover:border-purple-500/40 relative overflow-hidden group">
                {/* Header Row: Logo, Role, Company, and Category Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center text-purple-500 shadow-sm">
                      {exp.companyLogo ? (
                        <Image
                          src={exp.companyLogo}
                          alt={exp.company}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : isOrg ? (
                        <Users className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Briefcase className="w-5 h-5 text-purple-500" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-heading text-foreground group-hover:text-purple-500 transition-colors">
                        {exp.position}
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-500 light:text-purple-700 font-semibold mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                  </div>

                  {/* Date & Employment Type Badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-medium border border-border">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span>
                        {new Date(exp.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })}{' '}
                        -{' '}
                        {exp.isCurrent || !exp.endDate
                          ? 'Present'
                          : new Date(exp.endDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })}
                      </span>
                    </div>

                    {exp.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {exp.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-4 leading-relaxed italic border-l-2 border-purple-500/40 pl-3">
                    {exp.description}
                  </p>
                )}

                {/* Key Responsibilities & Achievements */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                      Key Responsibilities & Contributions
                    </p>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp: string, rIdx: number) => (
                        <li
                          key={rIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed"
                        >
                          <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies / Skills Used */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-500" />
                      Skills:
                    </span>
                    {exp.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="tech-tag text-[10px] sm:text-xs font-medium bg-secondary text-foreground border border-border px-2.5 py-0.5 rounded-lg hover:border-purple-500/30 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    );
  };

  return (
    <div className="w-full space-y-8 max-w-4xl mx-auto">
      {/* Exactly 2 Filter Tabs (Work & Internship vs Organization) */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setActiveTab('work')}
          className={`px-6 py-3 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer active:scale-95 flex items-center gap-2.5 ${
            activeTab === 'work'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30 light:shadow-purple-400/20'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-purple-500/40'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Work & Internship</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
            {workExperiences.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('organization')}
          className={`px-6 py-3 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer active:scale-95 flex items-center gap-2.5 ${
            activeTab === 'organization'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30 light:shadow-indigo-400/20'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-indigo-500/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Organization</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
            {orgExperiences.length}
          </span>
        </button>
      </div>

      {/* Render Selected List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderExperienceList(filteredExperiences)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
