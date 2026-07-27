import Link from 'next/link';
import { Github, Linkedin, Instagram, Mail, ArrowUp } from 'lucide-react';

interface FooterProps {
  email?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
}

export default function Footer({ email, linkedinUrl, githubUrl, instagramUrl }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', href: githubUrl || '#', icon: Github, active: !!githubUrl },
    { name: 'LinkedIn', href: linkedinUrl || '#', icon: Linkedin, active: !!linkedinUrl },
    { name: 'Instagram', href: instagramUrl || '#', icon: Instagram, active: !!instagramUrl },
    { name: 'Email', href: email ? `mailto:${email}` : '#', icon: Mail, active: !!email },
  ];

  return (
    <footer className="w-full bg-zinc-950 light:bg-zinc-100 border-t border-zinc-900 light:border-zinc-200 py-12 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo / Name */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="text-xl font-bold font-heading text-white light:text-zinc-950">
            nadia<span className="text-purple-500">.</span>
          </Link>
          <p className="text-xs text-zinc-500 light:text-zinc-550 mt-1">
            Information Systems • Business Analyst • System Analyst • Web Developer
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            if (!link.active) return null;
            return (
              <a
                key={link.name}
                href={link.href}
                target={link.name !== 'Email' ? '_blank' : undefined}
                rel={link.name !== 'Email' ? 'noopener noreferrer' : undefined}
                className="p-2.5 rounded-full bg-zinc-900 light:bg-zinc-200/50 text-zinc-400 light:text-zinc-600 hover:text-purple-400 hover:bg-purple-950/20 light:hover:bg-purple-100/50 transition-all border border-zinc-800/50 light:border-zinc-200 hover:border-purple-500/20 light:hover:border-purple-500/30"
                aria-label={link.name}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-xs text-zinc-500 light:text-zinc-600">
          <p>&copy; {currentYear} Nadia Deari Hanifah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
