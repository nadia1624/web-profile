import Link from 'next/link';
import Image from 'next/image';
import { getProfile } from '@/actions/profile';
import { getFeaturedProjects } from '@/actions/project';
import TypingText from '@/components/TypingText';
import { FadeIn, FadeInLeft, FadeInRight, StaggerContainer, StaggerItem, HoverScale, ScrollReveal } from '@/components/MotionWrappers';
import SkillsSection from '@/components/SkillsSection';
import TechStackSection from '@/components/TechStackSection';
import ProfileCard from '@/components/ProfileCard';
import { ArrowRight, FolderKanban, Calendar, Sparkles, Mail, Github, Linkedin, Send } from 'lucide-react';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const profile = await getProfile();
  const featuredProjects = await getFeaturedProjects(3);

  const name = profile?.name || 'Nadia Deari Hanifah';
  const headline = profile?.headline || 'Information Systems Graduate & IT System Analyst';
  const shortBio = profile?.shortBio || 'Information Systems graduate with hands-on experience in business process analysis, requirements analysis, system design, and web-based information system development.';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com/in/nadiadearihanifah';
  const githubUrl = profile?.githubUrl || 'https://github.com/nadia1624';
  const email = profile?.email || 'nadyadearihanifah@gmail.com';
  const profileImage = profile?.profileImage || '/images/nadia_profile.jpg';

  const roleKeywords = [
    'System Analyst',
    'Business Analyst',
    'Web Developer',
    'Information Systems Graduate',
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex items-center pt-28 pb-16 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-600/10 light:bg-purple-600/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-600/10 light:bg-blue-600/5 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full z-10">
          {/* Hero Left Column */}
          <div className="md:col-span-7 flex flex-col items-start text-left">

            <FadeInLeft delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading text-foreground leading-tight">
                Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-500">{name}</span>
              </h1>
            </FadeInLeft>

            <FadeInLeft delay={0.3} className="text-xl sm:text-2xl mt-4 font-medium min-h-[40px] text-muted-foreground">
              I am a <TypingText words={roleKeywords} />
            </FadeInLeft>

            <FadeInLeft delay={0.4} className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {shortBio}
            </FadeInLeft>

            <FadeInLeft delay={0.5} className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/projects">
                <HoverScale className="flex items-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium shadow-lg shadow-purple-900/30 light:shadow-purple-400/20 transition-all cursor-pointer">
                  View My Projects
                  <ArrowRight className="w-4 h-4" />
                </HoverScale>
              </Link>
              <Link href="/contact">
                <HoverScale className="flex items-center gap-2 px-6 py-3.5 bg-card hover:bg-secondary text-foreground rounded-full font-medium border border-border transition-all cursor-pointer">
                  Contact Me
                </HoverScale>
              </Link>
            </FadeInLeft>

            {/* Social Shortcuts */}
            <FadeInLeft delay={0.6} className="mt-10 flex items-center gap-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Connect with me:</span>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-purple-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-purple-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href={`mailto:${email}`} className="text-muted-foreground hover:text-purple-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </FadeInLeft>
          </div>

          {/* Hero Right Column */}
          <div className="md:col-span-5 flex justify-center items-center">
            <FadeInRight delay={0.3} className="w-full">
              <ProfileCard
                imageSrc={profileImage}
                name={name}
                headline={headline}
                gpa="3.86 / 4.00"
              />
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* 2. SKILLS & EXPERTISE SECTION */}
      <SkillsSection />

      {/* 3. TECH STACK SECTION */}
      <TechStackSection />

      {/* 3. FEATURED PROJECTS SECTION */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 md:mb-16 gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">Selected Work</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">Featured Case Studies</h2>
            </div>
            <Link href="/projects" className="text-sm font-semibold text-purple-500 hover:text-purple-400 transition-colors flex items-center gap-1 group">
              View All Projects
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {featuredProjects.length === 0 ? (
          <ScrollReveal className="text-center py-16 glass-panel rounded-2xl text-muted-foreground">
            <FolderKanban className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p>No featured projects found in the database.</p>
            <p className="text-xs mt-1 text-muted-foreground/60">Access `/admin/login` to configure and seed your portfolio.</p>
          </ScrollReveal>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {featuredProjects.map((project: any) => (
              <StaggerItem key={project.id} className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group h-full">
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
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground/40">
                      <FolderKanban className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-black/70 light:bg-white/80 text-purple-400 light:text-purple-700 border border-purple-500/20 backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold font-heading text-foreground group-hover:text-purple-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Role: {project.role || 'Contributor'}</p>
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-3 leading-relaxed flex-grow">
                    {project.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-6">
                    {project.technologies.slice(0, 3).map((pt: any) => (
                      <span key={pt.technology.id} className="tech-tag text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">
                        {pt.technology.name}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-[9px] text-muted-foreground/60 px-1 py-0.5">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>

                  <Link href={`/projects/${project.slug}`} className="mt-auto pt-6">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary group-hover:bg-purple-600 text-foreground group-hover:text-white text-xs font-semibold border border-border group-hover:border-purple-500 transition-all cursor-pointer active:scale-95">
                      Read Case Study
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="w-full py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <ScrollReveal className="relative w-full rounded-3xl overflow-hidden border border-border bg-card p-12 md:p-20 text-center flex flex-col items-center">
          <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs uppercase tracking-wider font-semibold text-purple-500 mb-4">Let's Collaborate</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground max-w-xl leading-tight">
            Interested in building secure systems or analyzing business processes?
          </h2>
          <p className="text-muted-foreground max-w-md mt-4 text-sm sm:text-base leading-relaxed">
            I'm currently looking for internships and project collaborations. Reach out to discuss how we can work together!
          </p>

          <Link href="/contact" className="mt-8">
            <HoverScale className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium shadow-lg shadow-purple-900/30 light:shadow-purple-400/20 transition-all cursor-pointer">
              Get In Touch
              <Send className="w-4 h-4" />
            </HoverScale>
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
