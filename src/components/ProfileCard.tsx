'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Maximize2, X, Award, GraduationCap, Sparkles, CheckCircle2, Workflow } from 'lucide-react';

interface ProfileCardProps {
  imageSrc?: string | null;
  name: string;
  headline?: string;
  gpa?: string;
  showFloatingBadges?: boolean;
  enableZoom?: boolean;
}

export default function ProfileCard({
  imageSrc = '/images/nadia_profile.jpg',
  name = 'Nadia Deari Hanifah',
  headline = 'Information Systems Graduate & IT System Analyst',
  gpa = '3.86 / 4.00',
  showFloatingBadges = true,
  enableZoom = true,
}: ProfileCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const photo = imageSrc || '/images/nadia_profile.jpg';

  return (
    <div className="relative w-full max-w-[380px] mx-auto group select-none">
      {/* 1. Ambient Dynamic Glow Backdrop */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 rounded-[38px] opacity-25 group-hover:opacity-50 blur-2xl transition-all duration-700 pointer-events-none" />

      {/* 2. Glassmorphic Outer Card Wrapper */}
      <div className="relative rounded-[32px] overflow-hidden border border-purple-500/20 light:border-purple-300/60 bg-card/80 light:bg-white/95 backdrop-blur-2xl p-4 shadow-2xl shadow-purple-950/20 light:shadow-purple-200/50 transition-all duration-500 group-hover:border-purple-500/40">
        
        {/* Photo Container Frame */}
        <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden bg-secondary border border-border group/img">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover object-top transition-transform duration-700 group-hover/img:scale-105"
            priority
          />

          {/* Soft Bottom Mask Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover/img:opacity-40 transition-opacity duration-500" />

          {/* Top Right Zoom Lightbox Icon (only if enableZoom is true) */}
          {enableZoom && (
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute top-3.5 right-3.5 z-20 p-2.5 rounded-xl bg-black/50 hover:bg-purple-600 light:hover:bg-purple-600 text-white border border-white/20 opacity-0 group-hover/img:opacity-100 transition-all duration-300 backdrop-blur-md cursor-pointer active:scale-95"
              title="Expand Photo Preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* 3. Card Bottom Info Panel */}
        <div className="mt-4 px-1 pb-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold font-heading text-foreground group-hover:text-purple-500 transition-colors">
                {name}
              </h3>
              <p className="text-xs text-purple-500 light:text-purple-700 font-semibold mt-0.5">
                {headline}
              </p>
            </div>
          </div>

          {/* Key Specialization Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
            <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-500 light:text-purple-700 px-2.5 py-1 rounded-lg border border-purple-500/20 flex items-center gap-1">
              <Workflow className="w-3 h-3" />
              IT System Analyst
            </span>
            <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-500 light:text-blue-700 px-2.5 py-1 rounded-lg border border-blue-500/20 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              GPA {gpa}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Full-screen Lightbox Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full aspect-[4/5] rounded-3xl overflow-hidden border border-purple-500/40 bg-card shadow-2xl"
            >
              <Image src={photo} alt={name} fill className="object-cover object-top" />
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/80 text-white hover:bg-purple-600 border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
