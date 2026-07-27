import { getProfile } from '@/actions/profile';
import { getEducationList } from '@/actions/education';
import { getCertifications } from '@/actions/certification';
import { getSkills } from '@/actions/skills';
import { FadeIn, StaggerContainer, StaggerItem, ScrollReveal } from '@/components/MotionWrappers';
import SkillsSection from '@/components/SkillsSection';
import TechStackSection from '@/components/TechStackSection';
import ProfileCard from '@/components/ProfileCard';
import CertificationsSection from '@/components/CertificationsSection';
import { GraduationCap, Award, CheckCircle2, MapPin, Mail, Phone, Calendar, ExternalLink, User } from 'lucide-react';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function AboutPage() {
  const profile = await getProfile();
  const education = await getEducationList();
  const certifications = await getCertifications();
  const skills = await getSkills();

  const name = profile?.name || 'Nadia Deari Hanifah';
  const headline = profile?.headline || 'Information Systems Graduate & IT System Analyst';
  const bio = profile?.bio || 'Information Systems graduate with hands-on experience in business process analysis, requirements analysis, system design, and web-based information system development. Skilled in analyzing business needs, modeling business processes using BPMN, designing system architecture and databases, and translating business requirements into practical system solutions. Experienced in supporting the development and testing of information systems through internships, academic projects, and organizational activities.';
  const email = profile?.email || 'nadyadearihanifah@gmail.com';
  const phone = profile?.phone || '+62 831-2451-7280';
  const location = profile?.location || 'Jakarta, Indonesia';

  const skillsByCategory: { [key: string]: typeof skills } = {};
  skills.forEach((skill: any) => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. PERSONAL PROFILE BRIEF */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <FadeIn delay={0.1}>
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">About Me</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">My Background</h1>
            <p className="text-purple-500 light:text-purple-700 font-medium text-sm sm:text-base mt-2">{headline}</p>
          </FadeIn>

          <FadeIn delay={0.2} className="text-muted-foreground mt-6 leading-relaxed space-y-4 text-sm sm:text-base">
            <p>{bio}</p>
          </FadeIn>

          {/* Strategic Quick Contact Cards */}
          <FadeIn delay={0.3} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-6 border-t border-border w-full">
            {/* Location */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 light:bg-white border border-border">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Location</p>
                <p className="text-xs font-semibold text-foreground truncate">{location}</p>
              </div>
            </div>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 light:bg-white border border-border hover:border-purple-500/40 group transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email</p>
                <p className="text-xs font-semibold text-foreground group-hover:text-purple-500 transition-colors truncate" title={email}>
                  {email}
                </p>
              </div>
            </a>

            {/* Phone */}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 light:bg-white border border-border hover:border-purple-500/40 group transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Phone</p>
                  <p className="text-xs font-semibold text-foreground group-hover:text-purple-500 transition-colors truncate">
                    {phone}
                  </p>
                </div>
              </a>
            )}
          </FadeIn>
        </div>

        {/* Right Photo Column */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <FadeIn delay={0.25} className="w-full">
            <ProfileCard
              imageSrc={profile?.profileImage || '/images/nadia_profile.jpg'}
              name={name}
              headline={headline}
              gpa="3.86 / 4.00"
              enableZoom={false}
            />
          </FadeIn>
        </div>
      </section>

            {/* 3. EDUCATION TIMELINE */}
      <section className="mt-20">
        <ScrollReveal>
          <div className="border-b border-border pb-4 mb-8">
            <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-purple-500" />
              Education History
            </h2>
          </div>
        </ScrollReveal>

        {education.length === 0 ? (
          <ScrollReveal className="text-center py-8 text-muted-foreground text-sm">
            No education entries in the database yet.
          </ScrollReveal>
        ) : (
          <StaggerContainer className="space-y-6 relative before:absolute before:left-3 sm:before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {education.map((edu: any) => (
              <StaggerItem key={edu.id} className="relative pl-8 sm:pl-16 group">
                {/* Timeline node */}
                <div className="timeline-dot absolute left-1.5 sm:left-[17px] top-1.5 w-3 h-3 rounded-full bg-background border-2 border-purple-500 group-hover:bg-purple-500 transition-colors" />

                <div className="glass-panel p-6 rounded-2xl border border-border hover:border-purple-500/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold font-heading text-foreground">{edu.institution}</h3>
                      <p className="text-xs text-purple-500 font-medium">
                        {edu.degree} &bull; {edu.fieldOfStudy}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -{' '}
                        {edu.endDate
                          ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                          : 'Present'}
                      </span>
                    </div>
                  </div>

                  {edu.description && <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{edu.description}</p>}

                  {edu.gpa && (
                    <div className="tech-tag inline-block mt-4 text-xs font-semibold px-2.5 py-1 rounded bg-secondary text-foreground border border-border">
                      GPA: {edu.gpa}
                    </div>
                  )}

                  {edu.achievement && (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-purple-500">Achievement: </span>
                        {edu.achievement}
                      </p>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* 2. SKILLS & EXPERTISE SECTION */}
      <SkillsSection />

      {/* 3. TECH STACK SECTION */}
      <TechStackSection />


    </div>
  );
}
