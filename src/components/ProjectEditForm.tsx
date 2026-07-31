'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProject } from '@/actions/project';
import { upsertCaseStudy } from '@/actions/case-study';
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  X,
  Upload,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { uploadImageFile } from '@/lib/upload-helper';

interface TechProps {
  id: string;
  name: string;
  category: string;
}

interface ProjectEditFormProps {
  project: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    role?: string | null;
    thumbnail?: string | null;
    projectImages: string[];
    liveUrl?: string | null;
    githubUrl?: string | null;
    featured: boolean;
    technologies: {
      technologyId: string;
    }[];
    caseStudy?: {
      overview?: string | null;
      background?: string | null;
      problem?: string | null;
      process?: string | null;
      analysis?: string | null;
      solution?: string | null;
      design?: string | null;
      development?: string | null;
      testing?: string | null;
      result?: string | null;
      businessProcess?: string | null;
      asIsProcess?: string | null;
      toBeProcess?: string | null;
      requirementsAnalysis?: string | null;
      bpmn?: string | null;
      uml?: string | null;
      uiUxDesign?: string | null;
      databaseDesign?: string | null;
      applicationScreenshots: string[];
      uat?: string | null;
    } | null;
  };
  allTechnologies: TechProps[];
}

export default function ProjectEditForm({ project, allTechnologies }: ProjectEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Project fields state
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [shortDescription, setShortDescription] = useState(project.shortDescription);
  const [fullDescription, setFullDescription] = useState(project.fullDescription);
  const [category, setCategory] = useState(project.category);
  const [role, setRole] = useState(project.role || '');
  const [liveUrl, setLiveUrl] = useState(project.liveUrl || '');
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || '');
  const [featured, setFeatured] = useState(project.featured);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    project.technologies.map((t) => t.technologyId)
  );
  const [thumbnail, setThumbnail] = useState<string | null>(project.thumbnail || null);

  // Case Study fields state
  const [showCaseStudy, setShowCaseStudy] = useState(!!project.caseStudy);
  const [csOverview, setCsOverview] = useState(project.caseStudy?.overview || '');
  const [csBackground, setCsBackground] = useState(project.caseStudy?.background || '');
  const [csProblem, setCsProblem] = useState(project.caseStudy?.problem || '');
  const [csProcess, setCsProcess] = useState(project.caseStudy?.process || '');
  const [csAnalysis, setCsAnalysis] = useState(project.caseStudy?.analysis || '');
  const [csSolution, setCsSolution] = useState(project.caseStudy?.solution || '');
  const [csDesign, setCsDesign] = useState(project.caseStudy?.design || '');
  const [csDevelopment, setCsDevelopment] = useState(project.caseStudy?.development || '');
  const [csTesting, setCsTesting] = useState(project.caseStudy?.testing || '');
  const [csResult, setCsResult] = useState(project.caseStudy?.result || '');
  const [csBusinessProcess, setCsBusinessProcess] = useState(project.caseStudy?.businessProcess || '');
  const [csAsIsProcess, setCsAsIsProcess] = useState(project.caseStudy?.asIsProcess || '');
  const [csToBeProcess, setCsToBeProcess] = useState(project.caseStudy?.toBeProcess || '');
  const [csRequirementsAnalysis, setCsRequirementsAnalysis] = useState(project.caseStudy?.requirementsAnalysis || '');
  const [csUat, setCsUat] = useState(project.caseStudy?.uat || '');
  const [csBpmn, setCsBpmn] = useState<string | null>(project.caseStudy?.bpmn || null);
  const [csUml, setCsUml] = useState<string | null>(project.caseStudy?.uml || null);
  const [csDatabaseDesign, setCsDatabaseDesign] = useState<string | null>(project.caseStudy?.databaseDesign || null);
  const [csUiUxDesign, setCsUiUxDesign] = useState(project.caseStudy?.uiUxDesign || '');
  const [csScreenshots, setCsScreenshots] = useState<string[]>(project.caseStudy?.applicationScreenshots || []);

  // Uploading states
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingBpmn, setIsUploadingBpmn] = useState(false);
  const [isUploadingUml, setIsUploadingUml] = useState(false);
  const [isUploadingDb, setIsUploadingDb] = useState(false);
  const [isUploadingScreen, setIsUploadingScreen] = useState(false);

  // Group technologies by category
  const techsByCategory: { [key: string]: TechProps[] } = {};
  allTechnologies.forEach((tech) => {
    if (!techsByCategory[tech.category]) {
      techsByCategory[tech.category] = [];
    }
    techsByCategory[tech.category].push(tech);
  });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void,
    loader: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loader(true);
    try {
      const url = await uploadImageFile(file);
      setter(url);
      setToast({ type: 'success', text: 'Gambar berhasil diunggah!' });
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Gagal mengunggah file gambar.' });
    } finally {
      loader(false);
      e.target.value = '';
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingScreen(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageFile(files[i]);
        urls.push(url);
      }
      setCsScreenshots((prev) => [...prev, ...urls]);
      setToast({ type: 'success', text: `${urls.length} gambar screenshot berhasil diunggah!` });
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Gagal mengunggah screenshot.' });
    } finally {
      setIsUploadingScreen(false);
      e.target.value = '';
    }
  };

  const handleRemoveScreenshot = (idx: number) => {
    setCsScreenshots(csScreenshots.filter((_, i) => i !== idx));
  };

  const handleTechToggle = (techId: string) => {
    if (selectedTechs.includes(techId)) {
      setSelectedTechs(selectedTechs.filter((id) => id !== techId));
    } else {
      setSelectedTechs([...selectedTechs, techId]);
    }
  };

  const handleSave = () => {
    if (!title || !shortDescription || !fullDescription) {
      setToast({ type: 'error', text: 'Title, Short Description, and Full Description are required.' });
      return;
    }

    startTransition(async () => {
      // Helper to ensure raw Base64 data URLs are not sent over Server Action bridge
      const safeUrl = (url: string | null | undefined) => (url && typeof url === 'string' && !url.startsWith('data:') ? url : null);
      const safeUrls = (urls: string[]) => (Array.isArray(urls) ? urls.filter((u) => u && typeof u === 'string' && !u.startsWith('data:')) : []);

      const caseStudyPayload = showCaseStudy ? {
        overview: csOverview || null,
        background: csBackground || null,
        problem: csProblem || null,
        process: csProcess || null,
        analysis: csAnalysis || null,
        solution: csSolution || null,
        design: csDesign || null,
        development: csDevelopment || null,
        testing: csTesting || null,
        result: csResult || null,
        businessProcess: csBusinessProcess || null,
        asIsProcess: csAsIsProcess || null,
        toBeProcess: csToBeProcess || null,
        requirementsAnalysis: csRequirementsAnalysis || null,
        bpmn: safeUrl(csBpmn),
        uml: safeUrl(csUml),
        uiUxDesign: csUiUxDesign || null,
        databaseDesign: safeUrl(csDatabaseDesign),
        applicationScreenshots: safeUrls(csScreenshots),
        uat: csUat || null,
      } : null;

      const result = await updateProject(project.id, {
        title,
        slug: slug || null,
        shortDescription,
        fullDescription,
        category,
        role: role || null,
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured,
        thumbnail: safeUrl(thumbnail),
        projectImages: [],
        technologyIds: selectedTechs,
        caseStudy: caseStudyPayload,
      });

      if (result.success) {
        setToast({ type: 'success', text: 'Project & Case study updated successfully!' });
        router.refresh();
        setTimeout(() => {
          router.push('/admin/projects');
        }, 1000);
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to update project.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl ${
          toast.type === 'success' ? 'border-emerald-500/20 bg-zinc-900 text-emerald-400' : 'border-red-500/20 bg-zinc-900 text-red-400'
        } text-sm`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-zinc-500 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column upload */}
        <div className="space-y-6 lg:col-span-1">
          {/* Thumbnail */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4 block w-full text-left">
              Project Thumbnail
            </span>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-805 bg-zinc-900 flex items-center justify-center mb-4">
              {thumbnail ? (
                <Image src={thumbnail} alt="Thumbnail preview" fill className="object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-zinc-750" />
              )}
              {isUploadingThumb && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer">
                {isUploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Upload className="w-3.5 h-3.5" />}
                {thumbnail ? 'Ganti Gambar' : 'Upload Image'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, setThumbnail, setIsUploadingThumb)}
                  className="hidden"
                  disabled={isUploadingThumb}
                />
              </label>
              {thumbnail && (
                <button
                  type="button"
                  onClick={() => setThumbnail(null)}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Hapus Gambar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Associated Tech */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block w-full">
              Associated Technologies
            </span>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {Object.keys(techsByCategory).map((catName) => (
                <div key={catName} className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                    {catName}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {techsByCategory[catName].map((tech) => (
                      <label key={tech.id} className="flex items-center gap-2.5 text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedTechs.includes(tech.id)}
                          onChange={() => handleTechToggle(tech.id)}
                          className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-purple-500 cursor-pointer"
                        />
                        <span>{tech.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column fields */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project fields */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
              Project Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live URL</label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Short Description</label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Description</label>
              <textarea
                rows={5}
                required
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="featured" className="text-xs text-zinc-300 font-semibold cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Featured Project
              </label>
            </div>
          </div>

          {/* Case Study */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
            <button
              type="button"
              onClick={() => setShowCaseStudy(!showCaseStudy)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <span className="text-xs uppercase font-bold tracking-wider text-white">
                Case Study Details
              </span>
              {showCaseStudy ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {showCaseStudy && (
              <div className="space-y-6 pt-4 border-t border-zinc-900 animate-slide-down">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Overview</label>
                    <textarea
                      rows={4}
                      value={csOverview}
                      onChange={(e) => setCsOverview(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Background</label>
                    <textarea
                      rows={4}
                      value={csBackground}
                      onChange={(e) => setCsBackground(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Problem</label>
                    <textarea
                      rows={4}
                      value={csProblem}
                      onChange={(e) => setCsProblem(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Business Process</label>
                  <textarea
                    rows={2}
                    value={csBusinessProcess}
                    onChange={(e) => setCsBusinessProcess(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">AS-IS Process</label>
                    <textarea
                      rows={3}
                      value={csAsIsProcess}
                      onChange={(e) => setCsAsIsProcess(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">TO-BE Process</label>
                    <textarea
                      rows={3}
                      value={csToBeProcess}
                      onChange={(e) => setCsToBeProcess(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Requirements Analysis</label>
                    <textarea
                      rows={4}
                      value={csRequirementsAnalysis}
                      onChange={(e) => setCsRequirementsAnalysis(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">UI/UX Design</label>
                    <textarea
                      rows={4}
                      value={csUiUxDesign}
                      onChange={(e) => setCsUiUxDesign(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Testing & UAT</label>
                    <textarea
                      rows={4}
                      value={csUat}
                      onChange={(e) => setCsUat(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-zinc-900 pt-6">
                  {/* BPMN */}
                  <div className="flex flex-col items-center p-4 border border-zinc-900 rounded-xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">BPMN Diagram</span>
                    <div className="relative w-full aspect-video rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3">
                      {csBpmn ? (
                        <Image src={csBpmn} alt="BPMN" fill className="object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-700" />
                      )}
                      {isUploadingBpmn && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white cursor-pointer">
                      <Upload className="w-3 h-3" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setCsBpmn, setIsUploadingBpmn)}
                        className="hidden"
                        disabled={isUploadingBpmn}
                      />
                    </label>
                  </div>

                  {/* UML */}
                  <div className="flex flex-col items-center p-4 border border-zinc-900 rounded-xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">UML Diagram</span>
                    <div className="relative w-full aspect-video rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3">
                      {csUml ? (
                        <Image src={csUml} alt="UML" fill className="object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-700" />
                      )}
                      {isUploadingUml && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white cursor-pointer">
                      <Upload className="w-3 h-3" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setCsUml, setIsUploadingUml)}
                        className="hidden"
                        disabled={isUploadingUml}
                      />
                    </label>
                  </div>

                  {/* Database ERD */}
                  <div className="flex flex-col items-center p-4 border border-zinc-900 rounded-xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Database ERD</span>
                    <div className="relative w-full aspect-video rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3">
                      {csDatabaseDesign ? (
                        <Image src={csDatabaseDesign} alt="ERD" fill className="object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-700" />
                      )}
                      {isUploadingDb && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[9px] font-bold text-zinc-300 hover:text-white cursor-pointer">
                      <Upload className="w-3 h-3" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setCsDatabaseDesign, setIsUploadingDb)}
                        className="hidden"
                        disabled={isUploadingDb}
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery screenshots */}
                <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-6">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Application Screenshots Gallery</label>
                  <label className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer">
                    {isUploadingScreen ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Upload className="w-3.5 h-3.5" />}
                    Add Screenshots
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                      disabled={isUploadingScreen}
                    />
                  </label>

                  {csScreenshots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                      {csScreenshots.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-850 bg-zinc-900 group">
                          <Image src={url} alt={`Screenshot ${idx + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900">
            <Link href="/admin/projects" className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-450 hover:text-white text-xs font-semibold">
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={isPending || isUploadingThumb || isUploadingBpmn || isUploadingUml || isUploadingDb || isUploadingScreen}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
