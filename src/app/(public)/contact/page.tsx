import { getProfile } from '@/actions/profile';
import ContactForm from '@/components/ContactForm';
import { FadeIn, FadeInLeft, FadeInRight } from '@/components/MotionWrappers';
import { Mail, MapPin, Phone, Github, Linkedin, MessageSquare } from 'lucide-react';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ContactPage() {
  const profile = await getProfile();

  const email = profile?.email || 'nadiadearihanifah@gmail.com';
  const phone = profile?.phone || '+62 822-8888-8888';
  const location = profile?.location || 'Padang, West Sumatra, Indonesia';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com';
  const githubUrl = profile?.githubUrl || 'https://github.com';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <FadeIn delay={0.1} className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">Contact</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">Get In Touch</h1>
        <p className="text-muted-foreground mt-2">Have a question or want to collaborate? Feel free to drop a message.</p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <FadeInLeft delay={0.2} className="glass-panel p-8 rounded-2xl border border-border space-y-8">
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Contact Details
            </h2>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email Me</h3>
                  <a href={`mailto:${email}`} className="text-xs sm:text-sm text-purple-500 hover:underline mt-1 break-all block">
                    {email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              {profile?.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Call Me</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{phone}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">My Location</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{location}</p>
                </div>
              </div>
            </div>

            {/* Social shortcuts */}
            <div className="pt-6 border-t border-border flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Social Connections</span>
              <div className="flex items-center gap-3">
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button flex items-center gap-2 py-2 px-4 rounded-xl bg-secondary hover:bg-purple-500/10 text-foreground hover:text-purple-500 text-xs border border-border hover:border-purple-500/30 transition-all"
                >
                  <Linkedin className="w-4 h-4 text-purple-500" />
                  LinkedIn
                </a>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button flex items-center gap-2 py-2 px-4 rounded-xl bg-secondary hover:bg-purple-500/10 text-foreground hover:text-purple-500 text-xs border border-border hover:border-purple-500/30 transition-all"
                >
                  <Github className="w-4 h-4 text-purple-500" />
                  GitHub
                </a>
              </div>
            </div>
          </FadeInLeft>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <FadeInRight delay={0.2}>
            <ContactForm />
          </FadeInRight>
        </div>
      </div>
    </div>
  );
}
