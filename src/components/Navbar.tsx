'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download, FolderGit2, Calendar, FileText, User2, Home, MessageSquare, Award } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  cvUrl?: string | null;
}

export default function Navbar({ cvUrl }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll handler to toggle glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About', href: '/about', icon: User2 },
    { name: 'Experience', href: '/experience', icon: Calendar },
    { name: 'Projects', href: '/projects', icon: FolderGit2 },
    { name: 'Certifications', href: '/certifications', icon: Award },
    { name: 'Contact', href: '/contact', icon: MessageSquare },
  ];

  const handleDownloadCV = () => {
    if (!cvUrl) {
      alert('File CV belum diunggah. Silakan unggah file CV terlebih dahulu melalui Halaman Admin -> Profil.');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = cvUrl;
      link.download = 'CV_Nadia_Deari_Hanifah.pdf';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(cvUrl, '_blank');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-nav py-4 shadow-lg shadow-purple-950/10' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-1 group">
            <span className="text-2xl font-bold font-heading tracking-tight text-white light:text-zinc-950 group-hover:text-purple-400 transition-colors">
              nadia<span className="text-purple-500">.</span>
            </span>
          </Link>
 
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm tracking-wide transition-colors py-2 ${
                    isActive
                      ? 'font-semibold text-white light:text-zinc-950'
                      : 'font-medium text-zinc-350 hover:text-white light:text-zinc-700 light:hover:text-zinc-950'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
 
          {/* Theme Toggle & CV Button (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <a
              href="/api/download-cv"
              download="CV_Nadia_Deari_Hanifah.pdf"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/20 hover:shadow-purple-700/30 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download CV
            </a>
          </div>

          {/* Mobile Menu Actions */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 p-2 text-zinc-350 hover:text-white light:text-zinc-900 light:hover:text-black focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Animated Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-6"
          >
            {/* Background Glows for Mobile Menu */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/10 light:bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 py-3 px-4 rounded-xl text-lg font-medium transition-all active:scale-95 ${
                        isActive
                          ? 'bg-purple-600/10 text-purple-500 border border-purple-500/20'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile CV Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full mt-auto"
            >
              <a
                href="/api/download-cv"
                download="CV_Nadia_Deari_Hanifah.pdf"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500 active:scale-95 transition-all cursor-pointer shadow-lg shadow-purple-900/30 light:shadow-purple-400/20"
              >
                <Download className="w-5 h-5" />
                Download CV
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
