'use client';

import { 
  Workflow, 
  FileSearch, 
  Layers, 
  Database, 
  Code, 
  Cpu, 
  CheckSquare, 
  Server, 
  FileText, 
  BrainCircuit, 
  Users, 
  Sparkles,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/MotionWrappers';

interface SkillItem {
  name: string;
  category: string;
  icon?: string | null;
}

interface SkillsSectionProps {
  skills?: SkillItem[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  // Pre-defined structured skills fallback matching exact prompt requirements
  const defaultCategories = [
    {
      title: 'System Analysis',
      subtitle: 'Process Modeling & Architecture',
      color: 'purple',
      badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20 light:bg-purple-50 light:text-purple-700',
      borderHoverClass: 'hover:border-purple-500/40 hover:shadow-purple-950/10 light:hover:shadow-purple-200/30',
      icon: Activity,
      skills: [
        { name: 'Business Process Modeling (BPMN)', icon: Workflow },
        { name: 'Requirements Gathering & Analysis', icon: FileSearch },
        { name: 'System Modeling (UML, Use Case, DFD)', icon: Layers },
        { name: 'Database Design (ERD & SQL)', icon: Database },
      ],
    },
    {
      title: 'Technical Skills',
      subtitle: 'Development & Quality Assurance',
      color: 'blue',
      badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20 light:bg-blue-50 light:text-blue-700',
      borderHoverClass: 'hover:border-blue-500/40 hover:shadow-blue-950/10 light:hover:shadow-blue-200/30',
      icon: Cpu,
      skills: [
        { name: 'Web Application Development', icon: Code },
        { name: 'Software Development Life Cycle (SDLC)', icon: Cpu },
        { name: 'System Testing (Black Box & UAT)', icon: CheckSquare },
        { name: 'Database Management', icon: Server },
      ],
    },
    {
      title: 'Soft Skills',
      subtitle: 'Collaboration & Documentation',
      color: 'emerald',
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 light:bg-emerald-50 light:text-emerald-700',
      borderHoverClass: 'hover:border-emerald-500/40 hover:shadow-emerald-950/10 light:hover:shadow-emerald-200/30',
      icon: Sparkles,
      skills: [
        { name: 'Technical Documentation & Reporting', icon: FileText },
        { name: 'Analytical & Problem-Solving Skills', icon: BrainCircuit },
        { name: 'Communication & Collaboration', icon: Users },
        { name: 'Attention to Detail', icon: Sparkles },
      ],
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">
            Core Competencies
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">
            Skills & Expertise
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
            Core competencies developed through academic projects, internships, and hands-on experience.
          </p>
        </div>
      </ScrollReveal>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {defaultCategories.map((cat) => {
          const CategoryHeaderIcon = cat.icon;

          return (
            <StaggerItem
              key={cat.title}
              className={`glass-panel glass-panel-hover p-8 rounded-2xl border border-border flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${cat.borderHoverClass}`}
            >
              {/* Radial background glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              <div>

                <h3 className="text-xl font-bold font-heading text-foreground">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-6">
                  {cat.subtitle}
                </p>

                {/* Skill Items List */}
                <ul className="space-y-3.5 pt-4 border-t border-border">
                  {cat.skills.map((skill) => {
                    const SkillIcon = skill.icon || CheckCircle2;
                    return (
                      <li
                        key={skill.name}
                        className="flex items-center gap-3 text-xs sm:text-sm text-foreground group/item"
                      >
                        <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-purple-500 light:text-purple-700 shrink-0 group-hover/item:border-purple-500/40 transition-colors">
                          <SkillIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium group-hover/item:text-purple-500 light:group-hover/item:text-purple-700 transition-colors">
                          {skill.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
