'use client';

import { useState, useTransition } from 'react';
import { 
  createProject, 
  updateProject, 
  deleteProject, 
  reorderProjects, 
  toggleProjectFeatured 
} from '@/actions/project';
import { upsertCaseStudy } from '@/actions/case-study';
import { 
  FolderKanban, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Upload,
  Sparkles,
  Layers,
  Image as ImageIcon,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { compressImage } from '@/lib/image-compressor';

interface TechProps {
  id: string;
  name: string;
  category: string;
}

interface ProjectProps {
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
  displayOrder: number;
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
}

interface ProjectManagerProps {
  projects: ProjectProps[];
  allTechnologies: TechProps[];
}

export default function ProjectManager({ projects, allTechnologies }: ProjectManagerProps) {
  const router = useRouter();
  const [list, setList] = useState<ProjectProps[]>(projects);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // View state: 'list' | 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Project fields state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [role, setRole] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  // Case Study fields state
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const [csOverview, setCsOverview] = useState('');
  const [csBackground, setCsBackground] = useState('');
  const [csProblem, setCsProblem] = useState('');
  const [csProcess, setCsProcess] = useState('');
  const [csAnalysis, setCsAnalysis] = useState('');
  const [csSolution, setCsSolution] = useState('');
  const [csDesign, setCsDesign] = useState('');
  const [csDevelopment, setCsDevelopment] = useState('');
  const [csTesting, setCsTesting] = useState('');
  const [csResult, setCsResult] = useState('');
  const [csBusinessProcess, setCsBusinessProcess] = useState('');
  const [csAsIsProcess, setCsAsIsProcess] = useState('');
  const [csToBeProcess, setCsToBeProcess] = useState('');
  const [csRequirementsAnalysis, setCsRequirementsAnalysis] = useState('');
  const [csUat, setCsUat] = useState('');
  const [csBpmn, setCsBpmn] = useState<string | null>(null);
  const [csUml, setCsUml] = useState<string | null>(null);
  const [csDatabaseDesign, setCsDatabaseDesign] = useState<string | null>(null);
  const [csUiUxDesign, setCsUiUxDesign] = useState('');
  const [csScreenshots, setCsScreenshots] = useState<string[]>([]);

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

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setShortDescription('');
    setFullDescription('');
    setCategory('Web Development');
    setRole('');
    setLiveUrl('');
    setGithubUrl('');
    setFeatured(false);
    setSelectedTechs([]);
    setThumbnail(null);

    // Case study reset
    setShowCaseStudy(false);
    setCsOverview('');
    setCsBackground('');
    setCsProblem('');
    setCsProcess('');
    setCsAnalysis('');
    setCsSolution('');
    setCsDesign('');
    setCsDevelopment('');
    setCsTesting('');
    setCsResult('');
    setCsBusinessProcess('');
    setCsAsIsProcess('');
    setCsToBeProcess('');
    setCsRequirementsAnalysis('');
    setCsUat('');
    setCsBpmn(null);
    setCsUml(null);
    setCsDatabaseDesign(null);
    setCsUiUxDesign('');
    setCsScreenshots([]);

    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setView('form');
  };

  const handleOpenEdit = (project: ProjectProps) => {
    setTitle(project.title);
    setSlug(project.slug);
    setShortDescription(project.shortDescription);
    setFullDescription(project.fullDescription);
    setCategory(project.category);
    setRole(project.role || '');
    setLiveUrl(project.liveUrl || '');
    setGithubUrl(project.githubUrl || '');
    setFeatured(project.featured);
    setThumbnail(project.thumbnail || null);
    
    // Technologies relations
    const tIds = project.technologies.map((t) => t.technologyId);
    setSelectedTechs(tIds);

    // Load Case study if existing
    if (project.caseStudy) {
      setCsOverview(project.caseStudy.overview || '');
      setCsBackground(project.caseStudy.background || '');
      setCsProblem(project.caseStudy.problem || '');
      setCsProcess(project.caseStudy.process || '');
      setCsAnalysis(project.caseStudy.analysis || '');
      setCsSolution(project.caseStudy.solution || '');
      setCsDesign(project.caseStudy.design || '');
      setCsDevelopment(project.caseStudy.development || '');
      setCsTesting(project.caseStudy.testing || '');
      setCsResult(project.caseStudy.result || '');
      setCsBusinessProcess(project.caseStudy.businessProcess || '');
      setCsAsIsProcess(project.caseStudy.asIsProcess || '');
      setCsToBeProcess(project.caseStudy.toBeProcess || '');
      setCsRequirementsAnalysis(project.caseStudy.requirementsAnalysis || '');
      setCsUat(project.caseStudy.uat || '');
      setCsBpmn(project.caseStudy.bpmn || null);
      setCsUml(project.caseStudy.uml || null);
      setCsDatabaseDesign(project.caseStudy.databaseDesign || null);
      setCsUiUxDesign(project.caseStudy.uiUxDesign || '');
      setCsScreenshots(project.caseStudy.applicationScreenshots || []);
      setShowCaseStudy(true);
    } else {
      setShowCaseStudy(false);
    }

    setEditingId(project.id);
    setView('form');
  };

  // Upload helpers
  const uploadFile = async (rawFile: File) => {
    const file = await compressImage(rawFile);
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: data,
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Upload failed');
    return result.url;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    loader: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loader(true);
    try {
      const url = await uploadFile(file);
      setter(url);
    } catch (err) {
      alert('Failed to upload file.');
    } finally {
      loader(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingScreen(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        urls.push(url);
      }
      setCsScreenshots([...csScreenshots, ...urls]);
    } catch (err) {
      alert('Failed to upload screenshots.');
    } finally {
      setIsUploadingScreen(false);
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
      let result;
      const dataPayload = {
        title,
        slug: slug || null,
        shortDescription,
        fullDescription,
        category,
        role: role || null,
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured,
        thumbnail,
        projectImages: [],
        technologyIds: selectedTechs,
      };

      if (editingId) {
        result = await updateProject(editingId, dataPayload);
      } else {
        result = await createProject(dataPayload);
      }

      if (result.success && result.data) {
        const projectId = result.data.id;
        
        // Save case study details if toggled on
        if (showCaseStudy) {
          const caseStudySaveResult = await upsertCaseStudy(projectId, {
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
            bpmn: csBpmn || null,
            uml: csUml || null,
            uiUxDesign: csUiUxDesign || null,
            databaseDesign: csDatabaseDesign || null,
            applicationScreenshots: csScreenshots,
            uat: csUat || null,
          });

          if (!caseStudySaveResult.success) {
            setToast({ type: 'error', text: 'Project saved, but Case Study failed: ' + caseStudySaveResult.error });
            return;
          }
        }

        setToast({ 
          type: 'success', 
          text: editingId ? 'Project & Case Study successfully updated!' : 'Project & Case Study successfully created!' 
        });

        resetForm();
        setView('list');
        router.refresh();
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to save project.' });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This deletes the project, case studies, and relationships.`)) {
      startTransition(async () => {
        const result = await deleteProject(id);
        if (result.success) {
          setToast({ type: 'success', text: 'Project successfully deleted!' });
          setList(list.filter((item) => item.id !== id));
        } else {
          setToast({ type: 'error', text: result.error || 'Failed to delete project.' });
        }
      });
    }
  };

  const handleToggleFeatured = (id: string, currentVal: boolean) => {
    startTransition(async () => {
      const result = await toggleProjectFeatured(id, !currentVal);
      if (result.success) {
        setToast({ type: 'success', text: 'Project featured status updated!' });
        setList(list.map((item) => item.id === id ? { ...item, featured: !currentVal } : item));
      } else {
        setToast({ type: 'error', text: result.error || 'Failed to toggle featured.' });
      }
    });
  };

  // Reorder methods
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newList.length) return;

    // Swap
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setList(newList);

    startTransition(async () => {
      const ids = newList.map((item) => item.id);
      const result = await reorderProjects(ids);
      if (!result.success) {
        setToast({ type: 'error', text: 'Failed to save display ordering.' });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl animate-slide-up ${
          toast.type === 'success' 
            ? 'border-emerald-500/20 bg-zinc-900 text-emerald-400' 
            : 'border-red-500/20 bg-zinc-900 text-red-400'
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
        <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-purple-400" />
          Projects & Case Studies Manager
        </h2>
        {view === 'list' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        )}
      </div>

      {/* 1. EDITOR FORM VIEW */}
      {view === 'form' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6 animate-slide-in pb-12">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-bold font-heading text-white">
              {editingId ? 'Edit Project Details' : 'Create New Project'}
            </h3>
            <button onClick={() => setView('list')} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Left Side: Media Upload */}
            <div className="space-y-6 lg:col-span-1">
              {/* Thumbnail card */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4 block w-full text-left">
                  Project Thumbnail
                </span>

                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-805 bg-zinc-900 flex items-center justify-center mb-4">
                  {thumbnail ? (
                    <Image src={thumbnail} alt="Thumbnail preview" fill className="object-cover" />
                  ) : (
                    <FolderKanban className="w-8 h-8 text-zinc-750" />
                  )}
                  {isUploadingThumb && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setThumbnail, setIsUploadingThumb)}
                    className="hidden"
                    disabled={isUploadingThumb}
                  />
                </label>
              </div>

              {/* Technologies Checkboxes grouped by category */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block w-full">
                  Associated Technologies
                </span>

                {allTechnologies.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic">No technologies entered. Configure under "Technologies" menu first.</p>
                ) : (
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
                )}
              </div>
            </div>

            {/* Form Right Side: Details & Case Study */}
            <div className="space-y-6 lg:col-span-2">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                  Project Details
                </span>

                {/* Title & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Project Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Village Administration Portal"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Custom URL Slug (Optional)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. village-portal"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Category & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Category</label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Systems Analysis / Web Application"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">My Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Lead Process Analyst"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Live & Repo URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Site URL</label>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">GitHub Repository URL</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Short Description (Grid lists)</label>
                  <textarea
                    rows={2}
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Enter a brief tag-line summary of what the project did..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>

                {/* Full Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Description</label>
                  <textarea
                    rows={5}
                    required
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Describe the context, technical details, and scope of this project..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>

                {/* Featured project checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-xs text-zinc-300 font-semibold cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Mark project as featured (displays on home screen)
                  </label>
                </div>
              </div>

              {/* 2. CASE STUDY COLLAPSIBLE EDITOR SECTION */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
                <button
                  type="button"
                  onClick={() => setShowCaseStudy(!showCaseStudy)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4.5 h-4.5 text-purple-400" />
                    <span className="text-xs uppercase font-bold tracking-wider text-white">
                      Dynamic Case Study Details (Optional)
                    </span>
                  </div>
                  {showCaseStudy ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>

                {showCaseStudy && (
                  <div className="space-y-6 pt-4 border-t border-zinc-900 animate-slide-down">
                    {/* Overview / Background / Problem */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Overview Summary</label>
                        <textarea
                          rows={4}
                          value={csOverview}
                          onChange={(e) => setCsOverview(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Historical Background</label>
                        <textarea
                          rows={4}
                          value={csBackground}
                          onChange={(e) => setCsBackground(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Business Problem</label>
                        <textarea
                          rows={4}
                          value={csProblem}
                          onChange={(e) => setCsProblem(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Processes (AS-IS, TO-BE, Business Process) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Primary Business Process Description</label>
                      <textarea
                        rows={2}
                        value={csBusinessProcess}
                        onChange={(e) => setCsBusinessProcess(e.target.value)}
                        placeholder="Explain the workflow that is being redesigned..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">AS-IS Process (Manual / Bottleneck)</label>
                        <textarea
                          rows={3}
                          value={csAsIsProcess}
                          onChange={(e) => setCsAsIsProcess(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">TO-BE Process (Automated / Solution)</label>
                        <textarea
                          rows={3}
                          value={csToBeProcess}
                          onChange={(e) => setCsToBeProcess(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Requirements Analysis, UI Design & UAT */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Requirements Analysis</label>
                        <textarea
                          rows={4}
                          value={csRequirementsAnalysis}
                          onChange={(e) => setCsRequirementsAnalysis(e.target.value)}
                          placeholder="Functional and Non-functional specifications..."
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">UI/UX Design Notes</label>
                        <textarea
                          rows={4}
                          value={csUiUxDesign}
                          onChange={(e) => setCsUiUxDesign(e.target.value)}
                          placeholder="Figma links, accessibility choices, layout style..."
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Testing & UAT Results</label>
                        <textarea
                          rows={4}
                          value={csUat}
                          onChange={(e) => setCsUat(e.target.value)}
                          placeholder="User Acceptance testing metrics and satisfaction scores..."
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Development & Testing Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Development Tech Description</label>
                        <textarea
                          rows={3}
                          value={csDevelopment}
                          onChange={(e) => setCsDevelopment(e.target.value)}
                          placeholder="Architecture, libraries, databases, servers..."
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Testing Strategy</label>
                        <textarea
                          rows={3}
                          value={csTesting}
                          onChange={(e) => setCsTesting(e.target.value)}
                          placeholder="Unit, integration, compatibility testing details..."
                          className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Outcome Results */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Case Study Results & Outcomes</label>
                      <textarea
                        rows={2}
                        value={csResult}
                        onChange={(e) => setCsResult(e.target.value)}
                        placeholder="Metrics of success, turnaround improvements, user feedback..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                      />
                    </div>

                    {/* Diagram Uploads (BPMN, UML, ERD) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-zinc-900 pt-6">
                      {/* BPMN Upload */}
                      <div className="flex flex-col items-center p-4 border border-zinc-900 rounded-xl">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">BPMN Diagram</span>
                        <div className="relative w-full aspect-video rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3">
                          {csBpmn ? (
                            <Image src={csBpmn} alt="BPMN Diagram" fill className="object-contain" />
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

                      {/* UML Upload */}
                      <div className="flex flex-col items-center p-4 border border-zinc-900 rounded-xl">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">UML Diagram</span>
                        <div className="relative w-full aspect-video rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3">
                          {csUml ? (
                            <Image src={csUml} alt="UML Diagram" fill className="object-contain" />
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

                      {/* ERD Database Diagram Upload */}
                      <div className="flex flex-col items-center p-4 border border-zinc-900 rounded-xl">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Database ERD</span>
                        <div className="relative w-full aspect-video rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3">
                          {csDatabaseDesign ? (
                            <Image src={csDatabaseDesign} alt="Database Diagram" fill className="object-contain" />
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

                    {/* Screenshot Gallery Upload */}
                    <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-6">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Application Screenshots Gallery</label>
                      <label className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer">
                        {isUploadingScreen ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Upload className="w-3.5 h-3.5" />}
                        Add Screenshots to Gallery
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

              {/* Form Action buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || isUploadingThumb || isUploadingBpmn || isUploadingUml || isUploadingDb || isUploadingScreen}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Project & Case Study
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECTS LIST VIEW */}
      {view === 'list' && (
        <>
          {list.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl text-zinc-500">
              <FolderKanban className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
              <p>No projects registered in the CMS database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((proj, index) => (
                <div
                  key={proj.id}
                  className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left info column */}
                  <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                    {/* Thumbnail preview */}
                    <div className="w-16 h-10 rounded bg-zinc-900 border border-zinc-850 overflow-hidden shrink-0 relative flex items-center justify-center text-purple-400">
                      {proj.thumbnail ? (
                        <Image src={proj.thumbnail} alt={proj.title} fill className="object-cover" />
                      ) : (
                        <FolderKanban className="w-4 h-4" />
                      )}
                    </div>
                    {/* Text */}
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                        {proj.title}
                        {proj.featured && (
                          <span className="text-[8px] bg-purple-950 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{proj.category}</p>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    {/* Featured toggle */}
                    <button
                      onClick={() => handleToggleFeatured(proj.id, proj.featured)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                        proj.featured
                          ? 'bg-purple-950/20 text-purple-400 border-purple-500/30'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                      }`}
                    >
                      {proj.featured ? 'Featured' : 'Feature'}
                    </button>

                    {/* Reorder buttons */}
                    <div className="flex items-center gap-1 mr-2 border-r border-zinc-900 pr-3 pl-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0 || isPending}
                        className="p-2 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === list.length - 1 || isPending}
                        className="p-2 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-purple-400 hover:border-purple-500/25 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id, proj.title)}
                      disabled={isPending}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-red-400 hover:border-red-500/25 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
