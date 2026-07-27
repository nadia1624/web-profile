'use client';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/MotionWrappers';
import { 
  Code2, 
  Layout, 
  Server, 
  Database, 
  TestTube2, 
  Wrench,
  Sparkles
} from 'lucide-react';

interface TechItem {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
}

interface TechStackSectionProps {
  technologies?: TechItem[];
}

export default function TechStackSection({ technologies = [] }: TechStackSectionProps) {
  // Pre-defined categories matching exact prompt requirement
  const stackCategories = [
    {
      name: 'Languages',
      icon: Code2,
      color: 'text-purple-500',
      items: ['PHP', 'JavaScript', 'Java', 'Python'],
    },
    {
      name: 'Frontend',
      icon: Layout,
      color: 'text-blue-500',
      items: ['HTML', 'CSS', 'Bootstrap', 'React.js', 'Tailwind CSS'],
    },
    {
      name: 'Backend',
      icon: Server,
      color: 'text-emerald-500',
      items: ['Laravel', 'Node.js', 'Express.js'],
    },
    {
      name: 'Database',
      icon: Database,
      color: 'text-cyan-500',
      items: ['MySQL', 'PostgreSQL', 'Sequelize ORM'],
    },
    {
      name: 'Testing',
      icon: TestTube2,
      color: 'text-amber-500',
      items: ['Jest', 'React Testing Library', 'Selenium WebDriver', 'Black Box & UAT'],
    },
    {
      name: 'Tools',
      icon: Wrench,
      color: 'text-indigo-500',
      items: ['Git', 'GitHub', 'Visual Studio Code', 'Figma'],
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">
            Technical Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">
            Technologies & Tools
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
            Technologies and development tools utilized to build scalable web systems.
          </p>
        </div>
      </ScrollReveal>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {stackCategories.map((cat) => {
          const CategoryIcon = cat.icon;

          return (
            <StaggerItem
              key={cat.name}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-border flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
                  <div className={`w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center ${cat.color}`}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-foreground">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {cat.items.length} tools & frameworks
                    </p>
                  </div>
                </div>

                {/* Tech Badges Grid */}
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="tech-tag text-xs font-medium bg-secondary text-foreground border border-border px-3 py-1.5 rounded-xl hover:border-purple-500/40 hover:text-purple-500 light:hover:text-purple-700 transition-all cursor-default flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/70" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
