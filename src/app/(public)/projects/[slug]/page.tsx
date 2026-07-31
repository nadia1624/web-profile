import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectBySlug } from '@/actions/project';
import { FadeIn, ScrollReveal } from '@/components/MotionWrappers';
import { ArrowLeft, Github, ExternalLink, Calendar, User, Tag, Sparkles, LayoutGrid, FileText, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: project.thumbnail ? [{ url: project.thumbnail }] : [],
    },
  };
}

function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  );
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  const caseStudy = project.caseStudy;

  return (
    <div className="w-full min-h-screen pb-24 relative">
      {/* Background ambient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Banner / Cover */}
      <div className="relative w-full h-[30vh] md:h-[45vh] bg-secondary overflow-hidden border-b border-border flex items-center justify-center">
        {project.thumbnail ? (
          <>
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              priority
              className="object-cover opacity-30 blur-sm scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
            <div className="relative z-20 w-full max-w-5xl px-6 aspect-video max-h-[70%] rounded-2xl overflow-hidden border border-border shadow-2xl">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center">
            <LayoutGrid className="w-20 h-20 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 relative z-20">
        {/* Back Link */}
        <FadeIn delay={0.05}>
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-purple-500 light:hover:text-purple-700 font-semibold transition-colors mb-6 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </FadeIn>

        {/* Title & Metadata Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8 border-b border-border">
          <div className="lg:col-span-8">
            <FadeIn delay={0.1}>
              <span className="text-xs uppercase tracking-wider font-bold text-purple-500 light:text-purple-700 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded">
                {project.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground mt-4 leading-tight">
                {project.title}
              </h1>
            </FadeIn>

            <FadeIn delay={0.2} className="flex flex-wrap items-center gap-6 mt-6 text-xs text-muted-foreground">
              {project.role && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <span>Role: {project.role}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Added: {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar / Links */}
          <div className="lg:col-span-4 flex items-center lg:justify-end gap-3 w-full">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-purple-600 light:hover:bg-purple-600 text-foreground hover:text-white light:hover:text-white font-medium text-xs border border-border hover:border-purple-500 transition-all flex-1 lg:flex-none cursor-pointer"
              >
                <Github className="w-4 h-4" />
                Repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-900/20 hover:shadow-purple-700/30 transition-all flex-1 lg:flex-none cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>
        </section>

        {/* Technologies Grid */}
        <FadeIn delay={0.3} className="py-6 flex flex-wrap items-center gap-2 border-b border-border">
          <Tag className="w-4 h-4 text-muted-foreground mr-2" />
          {project.technologies.map((pt: any) => (
            <span
              key={pt.technology.id}
              className="text-xs bg-secondary text-foreground px-3 py-1 rounded-lg border border-border"
            >
              {pt.technology.name}
            </span>
          ))}
        </FadeIn>

        {/* Project Overview Section */}
        <section className="py-10">
          <ScrollReveal className="glass-panel p-8 sm:p-10 rounded-3xl border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-foreground">Project Overview</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Comprehensive summary & core objectives</p>
                </div>
              </div>

              {/* Overview Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-foreground border border-border">
                  {project.category}
                </span>
                {project.role && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 light:text-purple-700 border border-purple-500/20">
                    Role: {project.role}
                  </span>
                )}
              </div>
            </div>

            {/* Description Content */}
            <div className="text-foreground/90 leading-relaxed text-sm sm:text-base space-y-4">
              {project.fullDescription.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* CASE STUDY DETAIL SECTIONS */}
        {caseStudy && (
          <div className="mt-12 space-y-16 pt-12 border-t border-border">
            {/* Case Study Heading */}
            <ScrollReveal className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                Detail
              </h2>
            </ScrollReveal>

            {/* Overview / Background / Problem */}
            {(caseStudy.overview || caseStudy.background || caseStudy.problem) && (
              <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {caseStudy.overview && (
                  <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="text-sm uppercase font-bold tracking-wider border-b border-border pb-3 mb-4 text-purple-500 light:text-purple-700">
                      Problem Context
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">{caseStudy.overview}</p>
                  </div>
                )}
                {caseStudy.background && (
                  <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="text-sm uppercase font-bold tracking-wider border-b border-border pb-3 mb-4 text-purple-500 light:text-purple-700">
                      Background Analysis
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">{caseStudy.background}</p>
                  </div>
                )}
                {caseStudy.problem && (
                  <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="text-sm uppercase font-bold tracking-wider border-b border-border pb-3 mb-4 text-red-500">
                      Pain Point
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">{caseStudy.problem}</p>
                  </div>
                )}
              </ScrollReveal>
            )}

            {/* Process Modeling (BPMN / AS-IS vs TO-BE) */}
            {(caseStudy.process || caseStudy.asIsProcess || caseStudy.toBeProcess || caseStudy.bpmn) && (
              <ScrollReveal className="space-y-6">
                <h3 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Business Process Design & Modeling
                </h3>
                
                {caseStudy.process && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{caseStudy.process}</p>
                )}

                {/* AS-IS vs TO-BE Process grid */}
                {(caseStudy.asIsProcess || caseStudy.toBeProcess) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {caseStudy.asIsProcess && (
                      <div className="p-6 rounded-xl bg-secondary/60 border border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Current State (AS-IS)</span>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">{caseStudy.asIsProcess}</p>
                      </div>
                    )}
                    {caseStudy.toBeProcess && (
                      <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 light:text-purple-700">Future State (TO-BE)</span>
                        <p className="text-xs sm:text-sm text-foreground mt-2 leading-relaxed">{caseStudy.toBeProcess}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* BPMN Diagram rendering (OPTIONAL: Only rendered if caseStudy.bpmn is present) */}
                {caseStudy.bpmn && typeof caseStudy.bpmn === 'string' && caseStudy.bpmn.trim() !== '' && (
                  <div className="mt-6 rounded-2xl overflow-hidden border border-border bg-secondary/40 p-6 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">BPMN 2.0 Business Process Diagram</span>
                    <div className="relative w-full aspect-video max-h-[380px]">
                      <Image
                        src={caseStudy.bpmn}
                        alt="BPMN Diagram"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </ScrollReveal>
            )}

            {/* Requirements Analysis & UML */}
            {(caseStudy.requirementsAnalysis || caseStudy.uml) && (
              <ScrollReveal className="space-y-6">
                <h3 className="text-lg font-bold font-heading text-foreground">Requirements Analysis & UML Modeling</h3>
                
                {caseStudy.requirementsAnalysis && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{caseStudy.requirementsAnalysis}</p>
                )}

                {/* UML Diagram rendering (OPTIONAL: Only rendered if caseStudy.uml is present) */}
                {caseStudy.uml && typeof caseStudy.uml === 'string' && caseStudy.uml.trim() !== '' && (
                  <div className="rounded-2xl overflow-hidden border border-border bg-secondary/40 p-6 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">UML Notations Diagram</span>
                    <div className="relative w-full aspect-video max-h-[380px]">
                      <Image
                        src={caseStudy.uml}
                        alt="UML Diagram"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </ScrollReveal>
            )}



            {/* UI/UX Design & Database Design */}
            {(caseStudy.uiUxDesign || caseStudy.databaseDesign) && (
              <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {caseStudy.uiUxDesign && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-heading text-foreground">UI/UX Design</h3>
                    {isImageUrl(caseStudy.uiUxDesign) ? (
                      <div className="rounded-2xl overflow-hidden border border-border bg-secondary/40 p-4 flex flex-col items-center">
                        <div className="relative w-full aspect-video max-h-[220px]">
                          <Image
                            src={caseStudy.uiUxDesign}
                            alt="UI/UX Design"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">{caseStudy.uiUxDesign}</p>
                    )}
                  </div>
                )}
                {caseStudy.databaseDesign && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-heading text-foreground">Database ERD Schema</h3>
                    {isImageUrl(caseStudy.databaseDesign) ? (
                      <div className="rounded-2xl overflow-hidden border border-border bg-secondary/40 p-4 flex flex-col items-center">
                        <div className="relative w-full aspect-video max-h-[220px]">
                          <Image
                            src={caseStudy.databaseDesign}
                            alt="Database Diagram"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">{caseStudy.databaseDesign}</p>
                    )}
                  </div>
                )}
              </ScrollReveal>
            )}

            {/* Development, Testing, and UAT */}
            {(caseStudy.development || caseStudy.testing || caseStudy.uat) && (
              <ScrollReveal className="space-y-8">
                <h3 className="text-lg font-bold font-heading text-foreground">Implementation & Quality Assurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {caseStudy.development && (
                    <div className="p-6 rounded-xl bg-secondary/40 border border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500 light:text-purple-700 mb-2">Development Phase</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{caseStudy.development}</p>
                    </div>
                  )}
                  {caseStudy.testing && (
                    <div className="p-6 rounded-xl bg-secondary/40 border border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500 light:text-purple-700 mb-2">Testing Methodology</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{caseStudy.testing}</p>
                    </div>
                  )}
                  {caseStudy.uat && (
                    <div className="p-6 rounded-xl bg-secondary/40 border border-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500 light:text-purple-700 mb-2">User Acceptance (UAT)</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{caseStudy.uat}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* Screenshot gallery */}
            {caseStudy.applicationScreenshots && caseStudy.applicationScreenshots.length > 0 && (
              <ScrollReveal className="space-y-6">
                <h3 className="text-lg font-bold font-heading text-foreground">Application Screenshots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {caseStudy.applicationScreenshots.map((scr: string, sIdx: number) => (
                    <div key={sIdx} className="rounded-2xl overflow-hidden border border-border bg-secondary aspect-video relative group">
                      <Image
                        src={scr}
                        alt={`Screenshot ${sIdx + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* Case Study Results */}
            {caseStudy.result && (
              <ScrollReveal className="p-8 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Outcome & Results
                </h3>
                <p className="text-sm sm:text-base text-foreground mt-4 leading-relaxed">{caseStudy.result}</p>
              </ScrollReveal>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
