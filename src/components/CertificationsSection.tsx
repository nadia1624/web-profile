'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  GraduationCap, 
  Calendar, 
  ExternalLink, 
  Maximize2, 
  X, 
  ZoomIn
} from 'lucide-react';
import Image from 'next/image';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/MotionWrappers';

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date | string;
  credentialId?: string | null;
  credentialUrl?: string | null;
  certificateImage?: string | null;
  type?: string | null; // "Certification" or "Training"
  description?: string | null;
}

interface CertificationsSectionProps {
  certifications: CertificationItem[];
}

export function isTraining(cert: CertificationItem): boolean {
  const type = (cert.type || '').toLowerCase();
  const name = (cert.name || '').toLowerCase();
  return (
    type.includes('training') ||
    type.includes('workshop') ||
    type.includes('pelatihan') ||
    name.includes('training') ||
    name.includes('workshop') ||
    name.includes('pelatihan')
  );
}

export default function CertificationsSection({ certifications }: CertificationsSectionProps) {
  const [activeTab, setActiveTab] = useState<'certification' | 'training'>('certification');
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    org: string;
  } | null>(null);

  const certList = certifications.filter((c) => !isTraining(c));
  const trainingList = certifications.filter((c) => isTraining(c));

  const filteredItems = activeTab === 'certification' ? certList : trainingList;

  const renderCardGrid = (items: CertificationItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 glass-panel rounded-2xl text-muted-foreground my-4">
          <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm">No entries found in this category.</p>
        </div>
      );
    }

    return (
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const itemIsTraining = isTraining(item);

          return (
            <StaggerItem
              key={item.id}
              className="glass-panel glass-panel-hover rounded-2xl border border-border flex flex-col justify-between overflow-hidden group transition-all duration-300"
            >
              <div>
                {/* Certificate Image Preview Banner */}
                {item.certificateImage ? (
                  <div className="relative w-full aspect-[16/10] bg-secondary overflow-hidden border-b border-border group/img">
                    <Image
                      src={item.certificateImage}
                      alt={item.name}
                      fill
                      sizes="(max-w-768px) 100vw, 380px"
                      className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />
                    
                    {/* Hover Lightbox Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        onClick={() =>
                          setSelectedImage({
                            url: item.certificateImage!,
                            title: item.name,
                            org: item.issuingOrganization,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <ZoomIn className="w-4 h-4" />
                        Preview Image
                      </button>
                    </div>

                    {/* Badge */}
                    <span
                      className={`absolute top-3 left-3 z-10 text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${
                        itemIsTraining
                          ? 'bg-blue-950/80 light:bg-blue-50/90 text-blue-400 light:text-blue-700 border-blue-500/30'
                          : 'bg-purple-950/80 light:bg-purple-50/90 text-purple-400 light:text-purple-700 border-purple-500/30'
                      }`}
                    >
                      {itemIsTraining ? 'Training / Workshop' : 'Certification'}
                    </span>
                  </div>
                ) : (
                  <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                        itemIsTraining
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      }`}
                    >
                      {itemIsTraining ? 'Training / Workshop' : 'Certification'}
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold font-heading text-foreground group-hover:text-purple-500 transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-xs text-purple-500 light:text-purple-700 font-semibold mt-1">
                    {item.issuingOrganization}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0 mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                {item.credentialId ? (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ID: {item.credentialId}
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  {item.certificateImage && (
                    <button
                      onClick={() =>
                        setSelectedImage({
                          url: item.certificateImage!,
                          title: item.name,
                          org: item.issuingOrganization,
                        })
                      }
                      className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                      title="View Certificate Image"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-400 font-medium flex items-center gap-1 transition-colors"
                    >
                      Verify
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    );
  };

  return (
    <div className="w-full space-y-12">
      {/* Section Header */}
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-500">
            Qualifications & Continuous Learning
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mt-1">
            Certifications & Training
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
            Professional certifications, technical workshops, and enterprise architecture training programs.
          </p>
        </div>
      </ScrollReveal>

      {/* 2 Filter Tabs Only */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setActiveTab('certification')}
          className={`px-6 py-3 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer active:scale-95 flex items-center gap-2.5 ${
            activeTab === 'certification'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30 light:shadow-purple-400/20'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-purple-500/40'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certifications</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
            {certList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer active:scale-95 flex items-center gap-2.5 ${
            activeTab === 'training'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30 light:shadow-blue-400/20'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-blue-500/40'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Trainings & Workshops</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
            {trainingList.length}
          </span>
        </button>
      </div>

      {/* Render Filtered Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderCardGrid(filteredItems)}
        </motion.div>
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-card rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-secondary/30">
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                    {selectedImage.title}
                  </h3>
                  <p className="text-xs text-purple-500 light:text-purple-700 font-semibold mt-0.5">
                    {selectedImage.org}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-border transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Image Viewer */}
              <div className="relative w-full h-[50vh] sm:h-[65vh] bg-black flex items-center justify-center p-4 overflow-hidden">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
