/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type DragEvent, type ReactNode, type UIEvent, type ChangeEvent } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  type DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AreaChart, Area, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronUp,
  ChevronDown, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  CheckCircle2, 
  FolderOpen,
  Save,
  RotateCcw,
  Info,
  EyeOff,
  Timer,
  Tv,
  Maximize2,
  BarChart2,
  Upload,
  AlertCircle,
  Trophy,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Zap,
  X,
  Search,
  Tags,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  Users,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import Papa from 'papaparse';
import { THEME_COLORS, AVAILABLE_ICONS, CATEGORIES as DEFAULT_CATEGORIES } from './constants';

const formatHeader = (name: string) => name.toLowerCase().replace(/[\s-]+/g, '_');

function ElegantSelect({ 
  value, 
  options, 
  onChange, 
  label,
  renderIcon,
  onOpenChange,
  columns = 1
}: { 
  value: any, 
  options: any[], 
  onChange: (val: any) => void,
  label: string,
  renderIcon: (opt: any, isSelected: boolean) => ReactNode,
  onOpenChange?: (open: boolean) => void,
  columns?: number
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen || isAnimating);
    if (!isOpen) setSearchQuery("");
  }, [isOpen, isAnimating, onOpenChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-1.5 block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background border border-transparent hover:border-outline-variant focus:border-primary px-3 py-2 rounded-xl text-xs font-bold transition-all outline-none flex items-center justify-between group"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {renderIcon(selectedOption, true)}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence 
        onExitComplete={() => setIsAnimating(false)}
      >
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            onAnimationStart={() => setIsAnimating(true)}
            className={`absolute z-50 top-full left-0 ${columns > 1 ? 'w-[440px] -left-[100px]' : 'w-full min-w-[160px]'} bg-white border border-outline-variant shadow-2xl rounded-2xl overflow-hidden p-1.5 flex flex-col`}
          >
            <div className="p-2 pt-2.5 pb-2 sticky top-0 bg-white z-10 border-b border-outline-variant/30 mb-1">
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-on-surface-variant opacity-40" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent focus:border-primary/20 px-7 py-2 rounded-xl text-[11px] font-bold outline-none transition-all placeholder:text-on-surface-variant/40"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 p-1 hover:bg-slate-200 rounded-md text-on-surface-variant opacity-40 hover:opacity-100 transition-all"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            <div 
              className={`max-h-[320px] overflow-y-auto pt-2 pb-2 px-2 no-scrollbar ${
                columns > 1 ? 'grid gap-6' : 'flex flex-col'
              }`}
              style={columns > 1 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}
            >
              {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  title={opt.label || ''}
                  className={`flex items-center gap-2 rounded-xl transition-all text-left group overflow-hidden ${
                    columns > 1 ? 'p-3 justify-center aspect-square' : 'p-2 w-full mb-0.5 last:mb-0'
                  } ${
                    value === opt.value 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]' 
                      : 'hover:bg-slate-50 text-on-surface'
                  }`}
                >
                  <div className={`transition-transform ${columns > 1 ? 'scale-110 group-hover:scale-125' : ''}`}>
                    {renderIcon(opt, value === opt.value)}
                  </div>
                  {columns === 1 && (
                    <span className="text-xs font-bold truncate">{opt.label}</span>
                  )}
                </button>
              )) : (
                <div className="col-span-full py-8 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/20 italic">No matches found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableCategoryItem({ 
  cat, 
  index, 
  localCategories, 
  setLocalCategories,
  isOverlay = false
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cat.id });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : (isMenuOpen ? 100 : 0),
    position: 'relative' as const
  };

  const content = (
    <div 
      className={`bg-white border border-outline-variant p-6 rounded-[32px] flex items-center gap-6 group hover:border-primary/40 transition-all shadow-sm shadow-black/[0.02] ${isDragging && !isOverlay ? 'opacity-0' : ''} ${isOverlay ? 'shadow-2xl border-primary scale-[1.02] cursor-grabbing ring-4 ring-primary/10' : ''}`}
    >
      <div 
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
        className="cursor-grab active:cursor-grabbing text-on-surface-variant/20 hover:text-primary transition-colors p-2 -m-2"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 grid grid-cols-12 gap-6 items-center">
        <div className="col-span-3 space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Label Name</label>
          <input 
            type="text" 
            value={cat.name}
            onChange={(e) => {
              const next = [...localCategories];
              next[index] = { ...cat, name: e.target.value };
              setLocalCategories(next);
            }}
            className="w-full bg-background border border-transparent hover:border-outline-variant focus:border-primary px-3 py-2 rounded-xl text-sm font-bold transition-all outline-none"
          />
        </div>

        <div className="col-span-4 space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Description</label>
          <input 
            type="text" 
            value={cat.desc}
            onChange={(e) => {
              const next = [...localCategories];
              next[index] = { ...cat, desc: e.target.value };
              setLocalCategories(next);
            }}
            className="w-full bg-background border border-transparent hover:border-outline-variant focus:border-primary px-3 py-2 rounded-xl text-sm font-medium transition-all outline-none"
          />
        </div>

        <div className="col-span-2">
          <ElegantSelect 
            label="Theme Color"
            value={cat.accent}
            columns={5}
            onOpenChange={setIsMenuOpen}
            options={THEME_COLORS.map(t => ({ 
              value: t.accent, 
              label: t.name, 
              color: t.accent,
              accent: t.accent,
              name: t.name
            }))}
            onChange={(val) => {
              const theme = THEME_COLORS.find(t => t.accent === val);
              if (theme) {
                const { name: _themeName, ...themeStyles } = theme;
                const next = [...localCategories];
                next[index] = { ...cat, ...themeStyles };
                setLocalCategories(next);
              }
            }}
            renderIcon={(opt, isSelected) => (
              <div className={`w-4 h-4 rounded-full shadow-sm ring-1 ${isSelected ? 'ring-white scale-125' : 'ring-black/5'}`} style={{ backgroundColor: opt.accent }} />
            )}
          />
        </div>

        <div className="col-span-2">
          <ElegantSelect 
            label="Icon"
            value={AVAILABLE_ICONS.find(i => i.icon === cat.icon)?.name || 'Box'}
            columns={6}
            onOpenChange={setIsMenuOpen}
            options={AVAILABLE_ICONS.map(i => ({ value: i.name, label: i.name, icon: i.icon }))}
            onChange={(val) => {
              const found = AVAILABLE_ICONS.find(i => i.name === val);
              if (found) {
                const next = [...localCategories];
                next[index] = { ...cat, icon: found.icon };
                setLocalCategories(next);
              }
            }}
            renderIcon={(opt, isSelected) => {
              const Icon = opt.icon;
              return <Icon size={16} className={isSelected ? 'opacity-100' : 'opacity-70'} />;
            }}
          />
        </div>

        <div className="col-span-1 flex justify-end">
          <button 
            onClick={() => {
              if (localCategories.length > 1) {
                setLocalCategories(localCategories.filter((_, i) => i !== index));
              }
            }}
            className="p-3 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  if (isOverlay) return content;

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      layout
    >
      {content}
    </motion.div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<'labeling' | 'metrics' | 'settings'>('labeling');
  const [settingsBackup, setSettingsBackup] = useState<any[] | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<any[] | null>(null);
  const [localCategories, setLocalCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('categories_v1');
      return saved ? JSON.parse(saved).map((cat: any) => ({
        ...cat,
        icon: AVAILABLE_ICONS.find(i => i.name === cat.iconName)?.icon || AVAILABLE_ICONS[0].icon
      })) : DEFAULT_CATEGORIES.map(c => ({...c}));
    } catch { return DEFAULT_CATEGORIES.map(c => ({...c})); }
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [annotations, setAnnotations] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('annotations_v1');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [annotationMetrics, setAnnotationMetrics] = useState<Record<string, { start: string, end: string, duration: number }>>(() => {
    try {
      const saved = localStorage.getItem('metrics_v1');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [accumulatedTimes, setAccumulatedTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('accumulated_v1');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('tutorial_completed'));
  const [datasetPath, setDatasetPath] = useState(() => localStorage.getItem('dataset_path') || 'Blip-C Empty');
  const [currentImage, setCurrentImage] = useState(() => Number(localStorage.getItem('current_image_v1')) || 1);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || '');

  useEffect(() => {
    localStorage.setItem('user_name', userName);
  }, [userName]);
  const [isAtTutorialBottom, setIsAtTutorialBottom] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMobileLabelingOpen, setIsMobileLabelingOpen] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const prevImageRef = useRef(currentImage);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleImageDragOver = (e: any) => {
    e.preventDefault();
    setIsDraggingFiles(true);
  };

  const handleImageDragLeave = (e: any) => {
    e.preventDefault();
    setIsDraggingFiles(false);
  };

  const handleImageDrop = async (e: any) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    
    try {
      const files = await getAllFiles(e.dataTransfer);
      if (files.length > 0) {
        const imageFiles = files.filter(f => /\.(jpe?g|png|webp|tiff|bmp|svg)$/i.test(f.name));

        if (imageFiles.length > 0) {
          const firstItem = e.dataTransfer.items?.[0];
          const entry = firstItem?.webkitGetAsEntry?.();
          if (entry) {
            const newPath = `/${entry.name}`;
            setDatasetPath(newPath);
            localStorage.setItem('dataset_path', newPath);
          }

          imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
          setImageFiles(prev => {
            const combined = [...prev, ...imageFiles];
            setTotalImages(combined.length);
            if (currentImage === 0) setCurrentImage(1);
            return combined;
          });
        }
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [dragCounter, setDragCounter] = useState(0); // For identifying global drag enter/leave reliably
  const [isDraggingGT, setIsDraggingGT] = useState(false);
  const [isDraggingUser, setIsDraggingUser] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const getAllFiles = async (dataTransfer: DataTransfer): Promise<File[]> => {
    const files: File[] = [];
    const items = dataTransfer.items;
    
    if (!items) {
      return Array.from(dataTransfer.files || []);
    }

    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) entries.push(entry);
    }

    const traverse = async (entry: any) => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => entry.file(resolve, reject));
        files.push(file);
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const readBatch = (): Promise<any[]> => {
          return new Promise((resolve, reject) => {
            reader.readEntries(resolve, reject);
          });
        };

        let batch = await readBatch();
        while (batch.length > 0) {
          for (const child of batch) {
            await traverse(child);
          }
          batch = await readBatch();
        }
      }
    };

    for (const entry of entries) {
      await traverse(entry);
    }

    return files;
  };

  // Removed global window drag-and-drop listeners to localize ingestion to the image section.


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (active.id !== over?.id) {
      if (activeView === 'settings') {
        setSettingsDraft((items: any) => {
          const oldIndex = items.findIndex((item: any) => item.id === active.id);
          const newIndex = items.findIndex((item: any) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        setLocalCategories((items: any) => {
          const oldIndex = items.findIndex((item: any) => item.id === active.id);
          const newIndex = items.findIndex((item: any) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const attemptAutoLoad = async () => {
    if (imageFiles.length > 0) return;
    setIsAutoLoading(true);
    try {
      // Look for a manifest.json in the public/dataset folder
      const response = await fetch('/dataset/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        if (manifest.images && Array.isArray(manifest.images)) {
          const fetchedFiles = await Promise.all(
            manifest.images.map(async (imgName: string) => {
              const imgRes = await fetch(`/dataset/${imgName}`);
              const blob = await imgRes.blob();
              return new File([blob], imgName, { type: blob.type });
            })
          );
          
          if (fetchedFiles.length > 0) {
            setImageFiles(fetchedFiles);
            setTotalImages(fetchedFiles.length);
            setCurrentImage(1);
            setDatasetPath('/public/dataset');
            localStorage.setItem('dataset_path', '/public/dataset');
          }
        }
      }
    } catch (err) {
      console.log("Auto-load manifest not found or failed. This is expected if not configured.");
    } finally {
      setIsAutoLoading(false);
    }
  };

  useEffect(() => {
    // Only attempt auto-load on mount if running on localhost or similar dev environments
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal && imageFiles.length === 0 && Object.keys(annotations).length === 0) {
      attemptAutoLoad();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('annotations_v1', JSON.stringify(annotations));
    localStorage.setItem('metrics_v1', JSON.stringify(annotationMetrics));
    localStorage.setItem('accumulated_v1', JSON.stringify(accumulatedTimes));
    localStorage.setItem('current_image_v1', currentImage.toString());
    if (!showTutorial) {
      localStorage.setItem('tutorial_completed', 'true');
    }
    
    // Save categories (stripping component icons for serialization)
    const serializedCats = localCategories.map((cat: any) => ({
      ...cat,
      iconName: AVAILABLE_ICONS.find(i => i.icon === cat.icon)?.name || 'Box',
      icon: undefined
    }));
    localStorage.setItem('categories_v1', JSON.stringify(serializedCats));
  }, [annotations, annotationMetrics, accumulatedTimes, currentImage, showTutorial, localCategories]);

  // Ensure currentImage stays in bounds when image list changes
  useEffect(() => {
    if (totalImages > 0 && currentImage > totalImages) {
      setCurrentImage(totalImages);
    }
  }, [totalImages, currentImage]);

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleResetProgress = () => {
    setAnnotations({});
    setAnnotationMetrics({});
    setAccumulatedTimes({});
    setSessionStartTime(null);
    setCurrentImage(1);
    setSelectedCategories([]);
    setIsFinished(false);
    localStorage.removeItem('annotations_v1');
    localStorage.removeItem('metrics_v1');
    localStorage.removeItem('accumulated_v1');
    localStorage.removeItem('current_image_v1');
    setLastSaved(null);
    setIsConfirmingReset(false);
  };

  const [groundTruth, setGroundTruth] = useState<any[] | null>(null);
  const [metricsResults, setMetricsResults] = useState<{
    accuracy: number;
    meanF1: number;
    categoryMetrics: any[];
    totalSamples: number;
    userCount: number;
    distributionGT?: { name: string, count: number }[];
    distributionUser?: { name: string, count: number }[];
    coOccurrence?: { name: string, [key: string]: any }[];
    timelineData?: { index: number, duration: number, labels: number }[];
    speedStats?: {
      avgTime: number;
      totalTime: number;
      fastest: number;
      slowest: number;
    };
  } | null>(null);

  const [sessionStats, setSessionStats] = useState<{
    distribution: { name: string, count: number, color: string }[];
    speedTimeline: any[];
    annotators: string[];
    imageCount: number;
    recentActivity: { 
      id: string; 
      labels: number[]; 
      duration: number;
      userLabels?: Record<string, number[]>;
      gtLabels?: number[];
    }[];
    efficiency: {
      avgTime: number;
      totalTime: number;
      labelsPerMinute: number;
    };
  } | null>(null);

  const [importedAnnotations, setImportedAnnotations] = useState<Record<string, Record<string, { labels: number[], metrics: any }>>>({});
  const [selectedAnnotator, setSelectedAnnotator] = useState<string>('overall');

  // Calculate basic session stats whenever annotations or metrics change
  useEffect(() => {
    let targetAnnotations: Record<string, number[]> = {};
    let targetMetrics: Record<string, any> = {};

    if (selectedAnnotator === 'overall') {
      // Add local user
      const localUserName = userName || 'User';
      Object.entries(annotations).forEach(([id, labels]) => {
        targetAnnotations[`${localUserName}::${id}`] = labels as number[];
        targetMetrics[`${localUserName}::${id}`] = (annotationMetrics as Record<string, any>)[id];
      });

      // Combine all imported sessions
      Object.entries(importedAnnotations).forEach(([uName, set]) => {
        Object.entries(set as Record<string, any>).forEach(([id, entry]) => {
          const e = entry as { labels: number[], metrics: any };
          targetAnnotations[`${uName}::${id}`] = e.labels;
          targetMetrics[`${uName}::${id}`] = e.metrics;
        });
      });
    } else if (selectedAnnotator === 'current' || selectedAnnotator === (userName || 'User')) {
      targetAnnotations = annotations;
      targetMetrics = annotationMetrics;
    } else if (importedAnnotations[selectedAnnotator]) {
      const set = importedAnnotations[selectedAnnotator] as Record<string, any>;
      Object.entries(set).forEach(([id, entry]) => {
        const e = entry as { labels: number[], metrics: any };
        targetAnnotations[id] = e.labels;
        targetMetrics[id] = e.metrics;
      });
    }

    if (Object.keys(targetAnnotations).length === 0) {
      setSessionStats(null);
      return;
    }

    // 1. Label Distribution
    const counts: Record<number, number> = {};
    const breakdowns: Record<number, Record<string, number>> = {};
    
    Object.entries(targetAnnotations).forEach(([key, labels]) => {
      let annotator = selectedAnnotator === 'current' ? 'Current' : selectedAnnotator;
      if (key.includes('::')) {
        annotator = key.split('::')[0];
      }
      
      (labels as number[]).forEach((id: number) => {
        counts[id] = (counts[id] || 0) + 1;
        if (!breakdowns[id]) breakdowns[id] = {};
        breakdowns[id][annotator] = (breakdowns[id][annotator] || 0) + 1;
      });
    });

    // Add Ground Truth to distribution if available
    if (groundTruth) {
      groundTruth.forEach(row => {
        localCategories.forEach(cat => {
          let gtValue = row[cat.key];
          if (gtValue === undefined) {
             const keys = Object.keys(row);
             const match = keys.find(k => k.toLowerCase() === cat.key.toLowerCase() || k.toLowerCase() === cat.name.toLowerCase() || k === formatHeader(cat.name));
             if (match) gtValue = row[match];
          }
          const isPresentInGT = gtValue === '1' || gtValue === 1 || String(gtValue).toLowerCase() === 'true';
          
          if (isPresentInGT) {
            counts[cat.id] = (counts[cat.id] || 0) + 1;
            if (!breakdowns[cat.id]) breakdowns[cat.id] = {};
            breakdowns[cat.id]['Ground Truth'] = (breakdowns[cat.id]['Ground Truth'] || 0) + 1;
          }
        });
      });
    }

    const distribution = localCategories.map(cat => {
      const data: any = {
        name: cat.name,
        count: counts[cat.id] || 0,
        color: cat.accent || '#6366f1',
      };
      
      if (breakdowns[cat.id]) {
        Object.assign(data, breakdowns[cat.id]);
        
        // Match specific keys used in individual mode UI
        if (selectedAnnotator !== 'overall' && groundTruth) {
          data.gt = breakdowns[cat.id]['Ground Truth'] || 0;
          const userKey = selectedAnnotator === 'current' ? 'Current' : selectedAnnotator;
          data.user = breakdowns[cat.id][userKey] || 0;
        }
      }
      
      return data;
    }).filter(d => d.count > 0);

    // 2. Speed Timeline
    let speedTimeline: any[] = [];
    let annotatorList: string[] = [];

    if (selectedAnnotator === 'overall') {
      const byId: Record<string, any> = {};
      const allUsers = new Set<string>();
      
      // Get users from annotations primarily
      Object.keys(targetAnnotations).forEach(key => {
        if (key.includes('::')) {
          allUsers.add(key.split('::')[0]);
        }
      });

      Object.entries(targetMetrics).forEach(([key, m]) => {
        const [user, id] = key.split('::');
        allUsers.add(user);
        if (!byId[id]) byId[id] = { name: id.startsWith('__file_') ? id.replace('__file_', '') : `#${id}`, rawId: id };
        byId[id][user] = m.duration || 0;
      });

      annotatorList = Array.from(allUsers);
      speedTimeline = Object.values(byId).sort((a, b) => {
        const matchA = a.rawId.match(/\d+/);
        const matchB = b.rawId.match(/\d+/);
        const numA = matchA ? parseInt(matchA[0]) : 0;
        const numB = matchB ? parseInt(matchB[0]) : 0;
        return numA - numB;
      });
    } else {
      annotatorList = [selectedAnnotator];
      speedTimeline = Object.entries(targetMetrics)
        .sort((a, b) => {
          const matchA = a[0].match(/\d+/);
          const matchB = b[0].match(/\d+/);
          const numA = matchA ? parseInt(matchA[0]) : 0;
          const numB = matchB ? parseInt(matchB[0]) : 0;
          return numA - numB;
        })
        .map(([idx, m]: [string, any]) => ({
          name: idx.startsWith('__file_') ? idx.replace('__file_', '') : `Img ${idx}`,
          duration: m.duration || 0
        }));
    }

    // 3. Efficiency
    const durations = Object.values(targetMetrics).map((m: any) => m.duration || 0);
    const totalTime = durations.reduce((a, b) => a + b, 0);
    const avgTime = durations.length > 0 ? totalTime / durations.length : 0;
    const totalLabels = Object.values(targetAnnotations).flat().length;
    const labelsPerMinute = totalTime > 0 ? (totalLabels / totalTime) * 60 : 0;

    // 3.1 Unique Images
    const uniqueImages = new Set<string>();
    Object.keys(targetAnnotations).forEach(key => {
      if (key.includes('::')) {
        uniqueImages.add(key.split('::')[1]);
      } else {
        uniqueImages.add(key);
      }
    });

    // 4. Recent Activity
    let recentActivity: any[] = [];
    if (selectedAnnotator === 'overall') {
      const byId: Record<string, any> = {};
      
      Object.entries(targetAnnotations).forEach(([key, labels]) => {
        const [user, id] = key.split('::');
        if (!byId[id]) {
          byId[id] = { 
            id, 
            labels: [], 
            duration: 0, 
            userLabels: {},
            userDurations: {},
            gtLabels: [],
            allDurations: [],
            isMatch: true // Assume match until proven otherwise
          };
        }
        byId[id].userLabels[user] = labels;
        const dur = targetMetrics[key]?.duration || 0;
        byId[id].userDurations[user] = dur;
        byId[id].allDurations.push(dur);
        
        // For fallback
        byId[id].labels = labels; 
      });

      Object.values(byId).forEach((item: any) => {
        if (item.allDurations && item.allDurations.length > 0) {
          item.duration = item.allDurations.reduce((a: number, b: number) => a + b, 0) / item.allDurations.length;
        }
      });

      // Add Ground Truth to each image in overall view
      if (groundTruth) {
        groundTruth.forEach(row => {
          const filename = String(row.filename || '').trim();
          if (!filename) return;
          const baseName = filename.split(/[/\\]/).pop() || filename;
          const id = `__file_${baseName}`;
          
          const gtLabels: number[] = [];
          localCategories.forEach(cat => {
            let gtValue = row[cat.key];
            if (gtValue === undefined) {
               const keys = Object.keys(row);
               const match = keys.find(k => k.toLowerCase() === cat.key.toLowerCase() || k.toLowerCase() === cat.name.toLowerCase() || k === formatHeader(cat.name));
               if (match) gtValue = row[match];
            }
            const isPresentInGT = gtValue === '1' || gtValue === 1 || String(gtValue).toLowerCase() === 'true';
            if (isPresentInGT) gtLabels.push(cat.id);
          });

          if (byId[id]) {
            byId[id].gtLabels = gtLabels;
            
            // Check matches for overall view: ALL users must match GT
            const users = Object.keys(byId[id].userLabels);
            const sortedGT = [...gtLabels].sort((a,b) => a-b).join(',');
            let allMatch = users.length > 0;
            users.forEach(u => {
              const sortedUser = [...(byId[id].userLabels[u] || [])].sort((a,b) => a-b).join(',');
              if (sortedUser !== sortedGT) allMatch = false;
            });
            byId[id].isMatch = allMatch;
          }
        });
      }

      recentActivity = Object.values(byId)
        .sort((a, b) => {
          const getSortVal = (id: string) => {
            const match = id.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getSortVal(b.id) - getSortVal(a.id);
        })
        .slice(0, 100);
    } else {
      recentActivity = Object.entries(targetAnnotations)
        .sort((a, b) => {
          const getSortVal = (s: string) => {
            const match = s.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getSortVal(b[0]) - getSortVal(a[0]);
        })
        .slice(0, 50)
        .map(([id, labels]) => {
          const result: any = {
            id,
            labels: labels as number[],
            duration: targetMetrics[id]?.duration || 0,
            gtLabels: [],
            isMatch: false
          };

          // Find GT for this specific user's view
          if (groundTruth) {
            const baseName = id.startsWith('__file_') ? id.replace('__file_', '') : id;
            const row = groundTruth.find(r => {
              const fname = String(r.filename || '').trim();
              const rBase = fname.split(/[/\\]/).pop() || fname;
              return rBase === baseName;
            });

            if (row) {
              const gtLabels: number[] = [];
              localCategories.forEach(cat => {
                let val = row[cat.key];
                if (val === undefined) {
                  const keys = Object.keys(row);
                  const match = keys.find(k => k.toLowerCase() === cat.key.toLowerCase() || k.toLowerCase() === cat.name.toLowerCase() || k === formatHeader(cat.name));
                  if (match) val = row[match];
                }
                if (val === '1' || val === 1 || String(val).toLowerCase() === 'true') gtLabels.push(cat.id);
              });
              result.gtLabels = gtLabels;
              const sortedUser = [...(labels as number[])].sort((a,b) => a-b).join(',');
              const sortedGT = [...gtLabels].sort((a,b) => a-b).join(',');
              result.isMatch = sortedUser === sortedGT;
            }
          }

          return result;
        });
    }

    setSessionStats({
      distribution,
      speedTimeline,
      recentActivity,
      annotators: groundTruth ? ['Ground Truth', ...annotatorList] : annotatorList,
      imageCount: uniqueImages.size,
      totalLabels,
      efficiency: {
        avgTime,
        totalTime,
        labelsPerMinute
      }
    });
  }, [annotations, annotationMetrics, importedAnnotations, selectedAnnotator, localCategories, groundTruth]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setGroundTruth(results.data);
        calculateStats(results.data);
      }
    });
  };

  const handleImportAnnotations = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImportedAnnots: Record<string, Record<string, { labels: number[], metrics: any }>> = { ...importedAnnotations };

    for (const file of Array.from(files) as File[]) {
      const text = await file.text();
      
      // Try to extract category mapping metadata if it exists
      let csvMetadata: any = null;
      const metadataLine = text.split('\n').find(l => l.trim().startsWith('#categories:'));
      if (metadataLine) {
        try {
          csvMetadata = JSON.parse(metadataLine.replace('#categories:', '').trim());
        } catch (err) {
          console.warn("Failed to parse CSV metadata", err);
        }
      }

      await new Promise<void>((resolve) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          comments: '#',
          complete: (results) => {
            const annotationMap: Record<string, { labels: number[], metrics: any }> = {};
            const headers = results.meta.fields || [];
            
            // Create a mapping from CSV column name to local category ID
            const csvToLocalIdMap: Record<string, number> = {};
            const timeHeaders = {
              start: headers.find(h => ['StartTime', 'start_time', 'start'].includes(h)),
              end: headers.find(h => ['EndTime', 'end_time', 'end'].includes(h)),
              duration: headers.find(h => ['DurationSeconds', 'duration_seconds', 'duration', 'time_taken'].includes(h))
            };
            
            localCategories.forEach(cat => {
              // Priority 1: Match by ID/Key from metadata if available
              if (csvMetadata) {
                const metaCat = csvMetadata.find((m: any) => m.id === cat.id);
                if (metaCat && headers.includes(metaCat.key)) {
                  csvToLocalIdMap[metaCat.key] = cat.id;
                  return;
                }
              }

              // Priority 2: Direct key match
              if (headers.includes(cat.key)) {
                csvToLocalIdMap[cat.key] = cat.id;
              } 
              // Priority 3: Case-insensitive key match
              else {
                const foundKey = headers.find(h => h.toLowerCase() === cat.key.toLowerCase());
                if (foundKey) {
                  csvToLocalIdMap[foundKey] = cat.id;
                }
                // Priority 4: Display name match
                else {
                  const foundLabel = headers.find(h => h.toLowerCase() === cat.name.toLowerCase() || h === formatHeader(cat.name));
                  if (foundLabel) {
                    csvToLocalIdMap[foundLabel] = cat.id;
                  }
                }
              }
            });

            results.data.forEach((row: any, idx: number) => {
              const labels: number[] = [];
              
              // Use our robust mapping to gather labels
              Object.entries(csvToLocalIdMap).forEach(([csvHeader, catId]) => {
                const val = row[csvHeader];
                if (val === '1' || val === 1 || String(val).toLowerCase() === 'true') {
                  labels.push(catId);
                }
              });
              
              const metrics = {
                start: timeHeaders.start ? row[timeHeaders.start] : '',
                end: timeHeaders.end ? row[timeHeaders.end] : '',
                duration: timeHeaders.duration ? parseFloat(row[timeHeaders.duration]) || 0 : 0
              };

              let key: string;
              if (row.filename) {
                const baseName = String(row.filename).split(/[/\\]/).pop() || String(row.filename);
                key = `__file_${baseName}`;
              } else {
                key = String(idx + 1);
              }

              annotationMap[key] = { labels, metrics };
            });

            // Try to find the annotator name from the CSV itself
            const annotatorHeader = headers.find(h => 
              ['Annotator', 'annotator', 'User', 'user', 'Name', 'name', 'UserName', 'username', 'AnnotatorName'].includes(h)
            );
            
            let finalAnnotatorName = file.name;
            if (annotatorHeader && results.data.length > 0) {
              const firstRow = results.data[0] as any;
              if (firstRow[annotatorHeader] && String(firstRow[annotatorHeader]).trim()) {
                finalAnnotatorName = String(firstRow[annotatorHeader]).trim();
              }
            }

            newImportedAnnots[finalAnnotatorName] = annotationMap;
            resolve();
          }
        });
      });
    }

    setImportedAnnotations(newImportedAnnots);
    setSelectedAnnotator('overall');
  };

  const handleRemoveAnnotator = (name: string) => {
    const next = { ...importedAnnotations };
    delete next[name];
    setImportedAnnotations(next);
    if (selectedAnnotator === name) {
      setSelectedAnnotator('overall');
    }
  };

  const exportAnalyticsResults = () => {
    if (!sessionStats && !metricsResults) return;

    // Build a complete mapping of all annotations for the export
    const allAnnotations: Record<string, Record<string, { labels: number[], metrics: any }>> = {};
    
    // Add local user
    const localUser = userName || 'User';
    allAnnotations[localUser] = {};
    Object.entries(annotations).forEach(([id, labels]) => {
      allAnnotations[localUser][id] = { labels: labels as number[], metrics: (annotationMetrics as Record<string, any>)[id] };
    });

    // Add imported users
    Object.entries(importedAnnotations).forEach(([name, data]) => {
      allAnnotations[name] = data as Record<string, { labels: number[], metrics: any }>;
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      dataset: datasetPath,
      sessionStats,
      metricsResults,
      rawAnnotations: allAnnotations,
      categories: localCategories.map(c => ({ id: c.id, name: c.name, key: c.key }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    calculateStats(groundTruth);
  }, [annotations, groundTruth, importedAnnotations]);

  const calculateStats = (gtData: any[] | null) => {
    const setsToEvaluate: { name: string, data: Record<string, { labels: number[], metrics: any }> }[] = [];
    
    // Add local user
    const localAnnotations: Record<string, { labels: number[], metrics: any }> = {};
    Object.entries(annotations).forEach(([id, labels]) => {
      localAnnotations[id] = { labels: labels as number[], metrics: (annotationMetrics as Record<string, any>)[id] };
    });
    
    if (Object.keys(localAnnotations).length > 0) {
      setsToEvaluate.push({ name: userName || 'User', data: localAnnotations });
    }

    // Add all imported sessions
    Object.entries(importedAnnotations).forEach(([name, set]) => {
      setsToEvaluate.push({ name, data: set as any });
    });

    if (setsToEvaluate.length === 0) {
      setMetricsResults(null);
      setSessionStats(null);
      return;
    }

    let aggregateAccuracy = 0;
    let totalValidatedSamples = 0;
    const userSpeeds: { name: string, avgTime: number, totalTime: number }[] = [];

    const aggregateClassStats = localCategories.reduce((acc: any, cat: any) => {
      acc[cat.key] = { tp: 0, fp: 0, fn: 0, tn: 0 };
      return acc;
    }, {});

    // For distribution charts
    const gtCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    
    // For co-occurrence (simplified: pairs of user labels)
    const coOccur: Record<string, Record<string, number>> = {};
    localCategories.forEach(c1 => {
      coOccur[c1.name] = {};
      localCategories.forEach(c2 => {
        coOccur[c1.name][c2.name] = 0;
      });
    });

    setsToEvaluate.forEach(setInfo => {
      const targetAnnotations = setInfo.data;
      let totalCorrect = 0;
      let totalSamples = 0;
      let userTotalTime = 0;
      let userTimedImages = 0;

      const annotationMap: Record<string, number[]> = {};
      Object.entries(targetAnnotations).forEach(([idx, entry]) => {
        const labels = entry.labels;
        const metrics = entry.metrics;
        
        if (metrics?.duration) {
          userTotalTime += metrics.duration;
          userTimedImages++;
        }

        if (idx.startsWith('__file_')) {
          annotationMap[idx.replace('__file_', '')] = labels;
        } else {
          const file = imageFiles[parseInt(idx) - 1] as File | undefined;
          if (file) {
            const baseName = file.name.split(/[/\\]/).pop() || file.name;
            annotationMap[baseName] = labels;
          }
        }
      });
      
      if (userTimedImages > 0) {
        userSpeeds.push({
          name: setInfo.name,
          avgTime: userTotalTime / userTimedImages,
          totalTime: userTotalTime
        });
      }

      if (gtData) {
        gtData.forEach(row => {
          const filename = String(row.filename || '').trim();
          if (!filename) return;

          const baseFilename = filename.split(/[/\\]/).pop() || filename;
          const userLabels = annotationMap[baseFilename] || annotationMap[filename] || [];
          totalSamples++;
          totalValidatedSamples++;

          // Track user distribution
          userLabels.forEach(id => {
            const cat = localCategories.find(c => c.id === id);
            if (cat) userCounts[cat.name] = (userCounts[cat.name] || 0) + 1;
          });

          // Track co-occurrence
          userLabels.forEach(id1 => {
            const c1 = localCategories.find(c => c.id === id1);
            if (!c1) return;
            userLabels.forEach(id2 => {
              const c2 = localCategories.find(c => c.id === id2);
              if (!c2) return;
              coOccur[c1.name][c2.name]++;
            });
          });

          let isImageCorrect = true;
          localCategories.forEach(cat => {
            const isSelectedByUser = userLabels.includes(cat.id);
            
            let gtValue = row[cat.key];
            if (gtValue === undefined) {
               const keys = Object.keys(row);
               const match = keys.find(k => k.toLowerCase() === cat.key.toLowerCase() || k.toLowerCase() === cat.name.toLowerCase() || k === formatHeader(cat.name));
               if (match) gtValue = row[match];
            }
            
            const isPresentInGT = gtValue === '1' || gtValue === 1 || String(gtValue).toLowerCase() === 'true';

            if (isPresentInGT) {
              gtCounts[cat.name] = (gtCounts[cat.name] || 0) + 1;
            }

            if (isSelectedByUser && isPresentInGT) {
              aggregateClassStats[cat.key].tp++;
            } else if (isSelectedByUser && !isPresentInGT) {
              aggregateClassStats[cat.key].fp++;
              isImageCorrect = false;
            } else if (!isSelectedByUser && isPresentInGT) {
              aggregateClassStats[cat.key].fn++;
              isImageCorrect = false;
            } else {
              aggregateClassStats[cat.key].tn++;
            }
          });

          if (isImageCorrect) totalCorrect++;
        });

        aggregateAccuracy += (totalSamples === 0 ? 0 : totalCorrect / totalSamples);
      }
    });

    const categoryMetrics = localCategories.map((cat: any) => {
      const { tp, fp, fn } = aggregateClassStats[cat.key];
      const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
      const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
      const f1 = precision + recall === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
      return {
        ...cat,
        precision,
        recall,
        f1,
        tp, fp, fn
      };
    });

    const meanAccuracy = (gtData && setsToEvaluate.length > 0) ? aggregateAccuracy / setsToEvaluate.length : 0;
    const meanF1 = (gtData && categoryMetrics.length > 0) ? categoryMetrics.reduce((acc, curr) => acc + curr.f1, 0) / categoryMetrics.length : 0;

    // Prepare chart data
    const distributionUser = localCategories.map(cat => ({
      name: cat.name,
      count: userCounts[cat.name] || 0
    }));

    const distributionGT = localCategories.map(cat => ({
      name: cat.name,
      count: gtCounts[cat.name] || 0
    }));

    const coOccurrence = Object.entries(coOccur).map(([name, peers]) => ({
      name,
      ...peers
    }));

    setMetricsResults({
      accuracy: meanAccuracy,
      meanF1,
      categoryMetrics,
      totalSamples: gtData ? totalValidatedSamples / setsToEvaluate.length : 0,
      userCount: setsToEvaluate.length,
      distributionGT,
      distributionUser,
      coOccurrence,
      userSpeeds
    });
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode(prev => !prev);
  };

  const handleSelectDirectory = async () => {
    // Attempt modern File System Access API first for better experience
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker();
        const files: File[] = [];
        
        // Recursively or flatly get files? Let's do flat for now as it's safer for performance
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (/\.(jpe?g|png|webp|tiff|bmp|svg)$/i.test(file.name)) {
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          // Sort files naturally by name
          files.sort((a, b) => (a as File).name.localeCompare((b as File).name, undefined, { numeric: true, sensitivity: 'base' }));
          
          setImageFiles(files);
          setTotalImages(files.length);
          
          const newPath = `/${handle.name}`;
          setDatasetPath(newPath);
          localStorage.setItem('dataset_path', newPath);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Directory picker error:", err);
          // Fallback to legacy
          directoryInputRef.current?.click();
        }
      }
    } else if (directoryInputRef.current) {
      directoryInputRef.current.click();
    }
  };

  const handleDirectoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImageFiles = Array.from(files).filter((file: File) => 
        /\.(jpe?g|png|webp|tiff|bmp|svg)$/i.test(file.name)
      );
      
      if (newImageFiles.length > 0) {
        // Sort files naturally by name
        newImageFiles.sort((a, b) => (a as File).name.localeCompare((b as File).name, undefined, { numeric: true, sensitivity: 'base' }));
        
        setImageFiles(newImageFiles);
        setTotalImages(newImageFiles.length);
        
        const relativePath = files[0].webkitRelativePath;
        const rootFolder = relativePath.split('/')[0];
        const newPath = `/${rootFolder}`;
        setDatasetPath(newPath);
        localStorage.setItem('dataset_path', newPath);
      }
    }
  };

  const handleTutorialScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = scrollHeight - scrollTop - clientHeight < 20;
    if (isBottom !== isAtTutorialBottom) {
      setIsAtTutorialBottom(isBottom);
    }
  };

  const currentImageUrl = (imageFiles.length > 0 && currentImage <= imageFiles.length) 
    ? URL.createObjectURL(imageFiles[currentImage - 1]) 
    : null;

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    };
  }, [currentImageUrl]);

  const toggleFullScreen = () => {
    if (!canvasRef.current) return;
    
    if (!document.fullscreenElement) {
      canvasRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const handleCategoriesScroll = () => {
    if (!categoriesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = categoriesRef.current;
    setShowScrollUp(scrollTop > 10);
    setShowScrollDown(scrollTop + clientHeight < scrollHeight - 10);
  };

  useEffect(() => {
    handleCategoriesScroll();
    const categoriesElement = categoriesRef.current;
    if (categoriesElement) {
      categoriesElement.addEventListener('scroll', handleCategoriesScroll);
      // Re-check on window resize in case list height changes
      window.addEventListener('resize', handleCategoriesScroll);
    }
    return () => {
      categoriesElement?.removeEventListener('scroll', handleCategoriesScroll);
      window.removeEventListener('resize', handleCategoriesScroll);
    };
  }, []);

  // Update scroll indicators whenever annotations or other state might change list size
  useEffect(() => {
    handleCategoriesScroll();
  }, [annotations]);

  const toggleCategory = (id: number) => {
    if (isFinished) return;
    
    // Safety check: Don't allow selecting categories if timer is not running (unless in tutorial)
    if (!sessionStartTime && !showTutorial) {
      handleTimerToggle();
    }

    setSelectedCategories(prev => {
      // If we had "No Label" (-1), remove it when selecting a real category
      const withoutNoLabel = prev.filter(c => c !== -1);
      if (withoutNoLabel.includes(id)) {
        return withoutNoLabel.filter(c => c !== id);
      } else {
        return [...withoutNoLabel, id];
      }
    });
  };

  const handleTimerToggle = () => {
    if (imageFiles.length === 0) {
      handleSelectDirectory();
      return;
    }
    
    if (sessionStartTime) {
      // Pause
      const elapsed = Date.now() - sessionStartTime;
      setAccumulatedTimes(prev => ({
        ...prev,
        [currentImage]: (prev[currentImage] || 0) + elapsed
      }));
      setSessionStartTime(null);
    } else {
      // Start/Resume
      setSessionStartTime(Date.now());
    }
  };

  const recordMetrics = (index: number) => {
    const currentAccumulated = accumulatedTimes[index] || 0;
    const finalDuration = currentAccumulated + (sessionStartTime ? (Date.now() - sessionStartTime) : 0);
    const sessionDurationSec = parseFloat((finalDuration / 1000).toFixed(3));
    
    const nowStr = new Date().toISOString();
    setAnnotationMetrics(prev => ({
      ...prev,
      [index]: {
        start: prev[index]?.start || nowStr,
        end: nowStr,
        duration: parseFloat(((prev[index]?.duration || 0) + sessionDurationSec).toFixed(3))
      }
    }));

    // Reset accumulated for this image bucket since it has been committed to metrics
    setAccumulatedTimes(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });

    if (sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  };

  // Handle image changes: transfer elapsed time to previous image bucket and continue
  useEffect(() => {
    if (sessionStartTime) {
      const elapsed = Date.now() - sessionStartTime;
      const prevImg = prevImageRef.current;
      setAccumulatedTimes(prev => ({
        ...prev,
        [prevImg]: (prev[prevImg] || 0) + elapsed
      }));
      // Continue session for NEW image immediately
      setSessionStartTime(Date.now());
    }
    prevImageRef.current = currentImage;
    setSelectedCategories(annotations[currentImage] || []);
  }, [currentImage]);

  const handleApply = () => {
    if (selectedCategories.length === 0 || (!sessionStartTime && !showTutorial)) return;
    
    // Store annotation
    setAnnotations(prev => ({ ...prev, [currentImage]: selectedCategories }));
    recordMetrics(currentImage);
    
    if (currentImage < totalImages) {
      setCurrentImage(prev => prev + 1);
      setSelectedCategories([]);
    } else {
      setIsFinished(true);
    }
    
    triggerSave();
  };

  const handleNoLabel = () => {
    if (!sessionStartTime && !showTutorial) return;
    // Store -1 for No Label
    setAnnotations(prev => ({ ...prev, [currentImage]: [-1] }));
    recordMetrics(currentImage);
    
    if (currentImage < totalImages) {
      setCurrentImage(prev => prev + 1);
      setSelectedCategories([]);
    } else {
      setIsFinished(true);
    }
    
    triggerSave();
  };

  const triggerSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 800);
  };

  const downloadCSV = () => {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_').slice(0, 16);
    const safeUserName = (userName || 'anonymous').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `annotations_${safeUserName}_${timestamp}.csv`;
    
      // Add a hidden metadata row for robust importing if categories change
      // Header matches Truth: filename,projected_slides,computer_screen,printed_papers,whiteboard,map,wargaming
      // We add StartTime, EndTime, DurationSeconds and Annotator for analysis
      const headers = ['filename', ...localCategories.map(c => formatHeader(c.name)), 'StartTime', 'EndTime', 'DurationSeconds', 'Annotator'];
      let csvContent = headers.join(',') + '\n';
  
      Object.entries(annotations).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([id, ids]) => {
        const index = Number(id);
        const file = imageFiles[index - 1];
        const fileName = file ? file.name : `image_${id}`;
        
        const metrics = annotationMetrics[index];
        const startTime = metrics?.start || '';
        
        // Calculate real-time duration: recorded + accumulated + current session if it's the active image
        let totalDuration = metrics?.duration || 0;
        let finalEndTime = metrics?.end || '';
        
        // Add any accumulated time that hasn't been committed to annotationMetrics yet
        const accumulated = (accumulatedTimes[index] || 0) / 1000;
        totalDuration += accumulated;
        
        // If this is the current image and timer is running, add the live elapsed time
        if (index === currentImage && sessionStartTime) {
          const liveElapsed = (Date.now() - sessionStartTime) / 1000;
          totalDuration += liveElapsed;
          finalEndTime = new Date().toISOString();
        }
  
        const rowData = [
          `"${fileName.replace(/"/g, '""')}"`
        ];
        localCategories.forEach(cat => {
          rowData.push((ids as number[]).includes(cat.id) ? '1' : '0');
        });

      // Append metrics
      rowData.push(startTime);
      rowData.push(finalEndTime);
      rowData.push(totalDuration.toFixed(3));
      rowData.push(`"${(userName || 'Anonymous').replace(/"/g, '""')}"`);

      csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleApply();
      } else if (e.key === 'A' && e.shiftKey) {
        // Simple shortcut for analytics
        e.preventDefault();
        setActiveView(prev => prev === 'labeling' ? 'metrics' : 'labeling');
      } else if (e.key === 'ArrowLeft' && currentImage > 1) {
        // Back
        e.preventDefault();
        setCurrentImage(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentImage < totalImages) {
        setCurrentImage(prev => prev + 1);
      } else if (e.key === '0') {
        e.preventDefault();
        if (sessionStartTime) {
          handleNoLabel();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTimerToggle();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheaterMode();
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        transformComponentRef.current?.zoomIn(0.5);
      } else if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        transformComponentRef.current?.zoomOut(0.5);
      } else {
        // Number keys 1-9 for categories
        const num = parseInt(e.key);
        if (!isNaN(num) && num > 0 && num <= localCategories.length) {
          const category = localCategories[num - 1];
          toggleCategory(category.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategories, currentImage, totalImages, annotations, sessionStartTime, isTheaterMode]);

  // Auto-save logic every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      triggerSave();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/10">
      <input 
        type="file" 
        ref={directoryInputRef} 
        onChange={handleDirectoryChange} 
        // @ts-ignore
        webkitdirectory="" 
        directory="" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={csvInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Global overlays removed, now localized to image section */}
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            {activeView === 'metrics' ? (
              <motion.div
                key="metrics-view"
                initial={{ opacity: 0, y: 20, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.99 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 overflow-y-auto p-4 md:p-12"
              >
                <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <button 
                      onClick={() => setActiveView('labeling')}
                      className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest w-fit"
                    >
                      <ChevronLeft size={16} />
                      Back to Labeling
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-end sm:items-center">
                      <button 
                        onClick={exportAnalyticsResults}
                        className="bg-emerald-50 p-3 md:p-4 pl-4 md:pl-6 rounded-2xl md:rounded-3xl border border-emerald-200 flex items-center justify-between md:justify-start gap-4 hover:bg-emerald-100 transition-all active:scale-95 group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">Export Results</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant opacity-60">DOWNLOAD JSON</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Save className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                        </div>
                      </button>

                      <button 
                        onClick={() => csvInputRef.current?.click()}
                        className="bg-primary/5 p-3 md:p-4 pl-4 md:pl-6 rounded-2xl md:rounded-3xl border border-primary/10 flex items-center justify-between md:justify-start gap-4 hover:bg-primary/10 transition-all active:scale-95 group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary">Ground Truth</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant opacity-60">SELECT CSV</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Upload className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                        </div>
                      </button>

                      <button 
                        onClick={() => document.getElementById('import-annots')?.click()}
                        className="bg-purple-50 p-3 md:p-4 pl-4 md:pl-6 rounded-2xl md:rounded-3xl border border-purple-200 flex items-center justify-between md:justify-start gap-4 hover:bg-purple-100 transition-all active:scale-95 group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-purple-600">User Data</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant opacity-60">SELECT CSV(S)</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <FileText className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                        </div>
                        <input 
                          id="import-annots"
                          type="file" 
                          accept=".csv"
                          multiple
                          onChange={handleImportAnnotations}
                          className="hidden"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <h2 className="text-xl md:text-3xl font-black tracking-tight text-on-surface uppercase leading-none">Insights & Analytics</h2>
                      <p className="text-on-surface-variant text-xs md:text-sm opacity-60">
                        {metricsResults ? 'Validation results against ground truth dataset' : 'Live labeling velocity and distribution'}
                      </p>
                    </div>

                    {Object.keys(importedAnnotations).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => setSelectedAnnotator('overall')}
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedAnnotator === 'overall' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/30'}`}
                        >
                          Overall View
                        </button>
                        {Object.keys(importedAnnotations).map(name => (
                          <div key={name} className="flex items-center">
                            <button
                              onClick={() => setSelectedAnnotator(name)}
                              className={`pl-4 pr-2 py-2 rounded-l-full text-[10px] font-black uppercase tracking-widest transition-all border border-r-0 ${selectedAnnotator === name ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/30'}`}
                            >
                              {name}
                            </button>
                            <button
                              onClick={() => handleRemoveAnnotator(name)}
                              className={`pr-3 pl-1 py-2 rounded-r-full text-[10px] transition-all border border-l-0 ${selectedAnnotator === name ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:border-red-500 hover:text-red-500'}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comparative Performance Section */}
                  {metricsResults?.userSpeeds && metricsResults.userSpeeds.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                          <Users size={14} className="text-primary" />
                          Comparative Performance
                        </h3>
                        <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">
                          {metricsResults.userSpeeds.length} Users Loaded
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {metricsResults.userSpeeds.map((u, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black border border-slate-200">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-on-surface truncate">{u.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-on-surface-variant opacity-40">Avg Time</span>
                                <span className="text-lg font-black text-primary">{u.avgTime.toFixed(1)}s</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-on-surface-variant opacity-40">Total Time</span>
                                <span className="text-lg font-black text-on-surface">{(u.totalTime / 60).toFixed(1)}m</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Session Overview (Visible even without metricsResults) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <Activity size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Labels / Min</span>
                      </div>
                      <span className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">
                        {sessionStats?.efficiency.labelsPerMinute.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    
                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                          <Clock size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Avg Time / Img</span>
                      </div>
                      <span className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">
                        {sessionStats?.efficiency.avgTime.toFixed(1) || '0.0'}s
                      </span>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                          <TrendingUp size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Total Duration</span>
                      </div>
                      <span className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">
                        {sessionStats ? (sessionStats.efficiency.totalTime / 60).toFixed(1) : '0.0'}m
                      </span>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Layers size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Images Labeled</span>
                      </div>
                      <span className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">
                        {sessionStats?.imageCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Time Efficiency Chart */}
                    <div className="bg-white p-6 md:p-8 rounded-[40px] border border-outline-variant shadow-sm flex flex-col">
                      <h3 className="font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                        <Timer size={14} className="text-primary" />
                        Labeling Velocity
                      </h3>
                      <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sessionStats?.speedTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                              hide
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                              cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                            />
                            {selectedAnnotator === 'overall' && sessionStats?.annotators ? (
                              <>
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                {sessionStats.annotators.filter(u => u !== 'Ground Truth').map((user, idx) => (
                                  <Line 
                                    key={user}
                                    type="monotone"
                                    dataKey={user}
                                    stroke={THEME_COLORS[idx % THEME_COLORS.length].accent}
                                    strokeWidth={3}
                                    dot={false}
                                    animationDuration={1500}
                                    name={user}
                                  />
                                ))}
                              </>
                            ) : (
                              <Line 
                                type="monotone" 
                                dataKey="duration" 
                                stroke="#6366f1" 
                                strokeWidth={3}
                                dot={false}
                                animationDuration={1500}
                                name="Seconds"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="bg-white p-6 md:p-8 rounded-[40px] border border-outline-variant shadow-sm flex flex-col">
                      <h3 className="font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                        <BarChart2 size={14} className="text-primary" />
                        Label Distribution
                      </h3>
                      <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={sessionStats?.distribution}
                            layout="vertical"
                            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              width={120}
                              tick={{ fontSize: 9, fontWeight: 800, fill: '#1e293b' }}
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                            />
                            {selectedAnnotator !== 'overall' && (metricsResults || groundTruth) ? (
                              <>
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Bar dataKey="gt" name="Ground Truth" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="user" name={selectedAnnotator === 'current' ? 'Current User' : selectedAnnotator} fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                              </>
                            ) : selectedAnnotator === 'overall' && sessionStats?.annotators ? (
                              <>
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', paddingBottom: '20px' }} />
                                {sessionStats.annotators.map((user, idx) => (
                                  <Bar 
                                    key={user} 
                                    dataKey={user} 
                                    name={user} 
                                    fill={user === 'Ground Truth' ? '#94a3b8' : THEME_COLORS[idx % THEME_COLORS.length].accent} 
                                    radius={idx === sessionStats.annotators.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]} 
                                    barSize={20} 
                                  />
                                ))}
                              </>
                            ) : (
                              <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24}>
                                {sessionStats?.distribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {!metricsResults ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px bg-outline-variant flex-1" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">Validation Mode</span>
                        <div className="h-px bg-outline-variant flex-1" />
                      </div>
                    <div className="grid grid-cols-2 gap-8 items-stretch">
                      {/* Ground Truth Drop Zone */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingGT(true); }}
                        onDragLeave={() => setIsDraggingGT(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDraggingGT(false);
                          const files = await getAllFiles(e.dataTransfer);
                          const csvFile = files.find(f => f.name.endsWith('.csv'));
                          if (csvFile) {
                            Papa.parse(csvFile, {
                              header: true,
                              skipEmptyLines: true,
                              complete: (results) => {
                                setGroundTruth(results.data);
                                calculateStats(results.data);
                              }
                            });
                          }
                        }}
                        className={`border-2 border-dashed rounded-[40px] p-12 text-center flex flex-col items-center justify-center gap-6 transition-all group ${isDraggingGT ? 'bg-primary/5 border-primary scale-[1.02] border-solid' : 'border-outline-variant hover:border-primary/50'}`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDraggingGT ? 'bg-primary text-white' : 'bg-background text-primary opacity-60 group-hover:opacity-100'}`}>
                          <Upload size={32} />
                        </div>
                        <div className="space-y-2">
                          <h3 className={`font-black uppercase tracking-widest text-xs ${isDraggingGT ? 'text-primary' : 'text-on-surface-variant'}`}>Ground Truth</h3>
                          <p className="text-[11px] font-bold text-on-surface-variant/60 max-w-[200px] mx-auto leading-relaxed">
                            Drop the <b>Official Labels CSV</b> here to set the baseline
                          </p>
                        </div>
                        <label className="mt-2 px-6 py-3 bg-white text-on-surface border border-outline-variant rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:border-primary hover:text-primary transition-all">
                          Browse GT
                          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>

                      {/* User Data Drop Zone */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingUser(true); }}
                        onDragLeave={() => setIsDraggingUser(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDraggingUser(false);
                          const files = await getAllFiles(e.dataTransfer);
                          const csvFiles = files.filter(f => f.name.endsWith('.csv'));
                          if (csvFiles.length > 0) {
                            const dummyEvent = { target: { files: csvFiles } } as any;
                            handleImportAnnotations(dummyEvent);
                          }
                        }}
                        className={`border-2 border-dashed rounded-[40px] p-12 text-center flex flex-col items-center justify-center gap-6 transition-all group ${isDraggingUser ? 'bg-purple-50 border-purple-500 scale-[1.02] border-solid' : 'border-outline-variant hover:border-purple-300'}`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDraggingUser ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 opacity-60 group-hover:opacity-100'}`}>
                          <FileText size={32} />
                        </div>
                        <div className="space-y-2">
                          <h3 className={`font-black uppercase tracking-widest text-xs ${isDraggingUser ? 'text-purple-600' : 'text-on-surface-variant'}`}>User Annotations</h3>
                          <p className="text-[11px] font-bold text-on-surface-variant/60 max-w-[200px] mx-auto leading-relaxed">
                            Drop one or more <b>Annotator CSVs</b> to compare performance
                          </p>
                        </div>
                        <label className="mt-2 px-6 py-3 bg-white text-on-surface border border-outline-variant rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:border-purple-600 hover:text-purple-600 transition-all">
                          Browse User(s)
                          <input type="file" accept=".csv" multiple onChange={handleImportAnnotations} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                    <div className="space-y-10">
                      {/* High Level Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Overall Accuracy</span>
                          <span className="text-4xl font-black tracking-tighter text-on-surface">{(metricsResults.accuracy * 100).toFixed(1)}%</span>
                          <div className="mt-4 h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${metricsResults.accuracy * 100}%` }} className="h-full bg-emerald-500" />
                          </div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Mean F1 Score</span>
                          <span className="text-4xl font-black tracking-tighter text-primary">{(metricsResults.meanF1).toFixed(3)}</span>
                          <div className="mt-4 h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${metricsResults.meanF1 * 100}%` }} className="h-full bg-primary" />
                          </div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Unique Samples Validated</span>
                          <span className="text-4xl font-black tracking-tighter text-on-surface">{sessionStats?.imageCount || metricsResults.totalSamples}</span>
                          <div className="mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            Baseline set for tracking
                          </div>
                        </div>
                      </div>

                      {/* Co-occurrence Heatmap-like chart */}
                      <div className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm flex flex-col">
                        <h3 className="font-bold uppercase tracking-widest text-xs mb-8 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-primary" />
                            Category Correlation
                          </div>
                          <span className="text-[9px] text-on-surface-variant opacity-60">Frequency of co-occurrence across labels</span>
                        </h3>
                        <div className="flex-1 min-h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={metricsResults.coOccurrence}
                              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                              <XAxis 
                                dataKey="name" 
                                angle={-45} 
                                textAnchor="end" 
                                interval={0} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 9, fontWeight: 800 }}
                              />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                              <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                              <Legend wrapperStyle={{ paddingTop: '40px', fontSize: '9px', fontWeight: 700 }} />
                              {localCategories.map((cat, i) => (
                                <Bar 
                                  key={cat.id} 
                                  dataKey={cat.name} 
                                  stackId="a" 
                                  fill={cat.accent || THEME_COLORS[i % THEME_COLORS.length].accent} 
                                  opacity={0.8}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Class Level Stats */}
                      <div className="bg-white rounded-[40px] border border-outline-variant shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-outline-variant flex items-center justify-between bg-surface/30">
                          <h3 className="font-bold uppercase tracking-widest text-xs">Error Analysis per Category</h3>
                          <div className="flex gap-12 text-[10px] font-black text-on-surface-variant uppercase">
                            <span className="w-12 text-center">Precision</span>
                            <span className="w-12 text-center">Recall</span>
                            <span className="w-12 text-center">F1 Score</span>
                          </div>
                        </div>
                        <div className="divide-y divide-outline-variant">
                          {metricsResults.categoryMetrics.map((cat: any) => (
                            <div key={cat.id} className="px-8 py-6 flex items-center justify-between hover:bg-background transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl ${cat.bg} ${cat.color} border ${cat.border} flex items-center justify-center`}>
                                  <cat.icon size={18} />
                                </div>
                                <div>
                                  <div className="font-bold text-sm tracking-tight">{cat.name}</div>
                                  <div className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">
                                    TP: {cat.tp} / FP: {cat.fp} / FN: {cat.fn}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-8 items-center tabular-nums">
                                <div className="text-right flex flex-col w-12">
                                  <span className="text-xs font-bold">{(cat.precision * 100).toFixed(0)}%</span>
                                </div>
                                <div className="text-right flex flex-col w-12">
                                  <span className="text-xs font-bold">{(cat.recall * 100).toFixed(0)}%</span>
                                </div>
                                <div className="text-right flex flex-col w-12">
                                  <span className="text-sm font-black text-primary">{(cat.f1).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity Spot Check */}
                  <div className="bg-white rounded-[40px] border border-outline-variant shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                    <div className="px-8 py-6 border-b border-outline-variant bg-surface/30">
                      <h3 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Tags size={14} className="text-primary" />
                        Live Activity Spot Check
                      </h3>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[500px]">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white shadow-sm z-10 border-b border-outline-variant">
                          <tr>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant min-w-[400px]">Image Index</th>
                            {selectedAnnotator === 'overall' && sessionStats?.annotators ? (
                              sessionStats.annotators.map(user => (
                                <th key={user} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant min-w-[150px]">{user}</th>
                              ))
                            ) : (
                              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant min-w-[150px]">Applied Labels</th>
                            )}
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant min-w-[350px]">Processing Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {sessionStats?.recentActivity && sessionStats.recentActivity.length > 0 ? (
                            sessionStats.recentActivity.map((entry) => {
                              const labels = entry.labels;
                              const duration = entry.duration;
                              
                              let displayId = '';
                              if (entry.id.includes('::')) {
                                const [user, rawId] = entry.id.split('::');
                                const idPart = rawId.startsWith('__file_') ? rawId.replace('__file_', '') : `#${rawId}`;
                                displayId = `${user}: ${idPart}`;
                              } else {
                                displayId = entry.id.startsWith('__file_') ? entry.id.replace('__file_', '') : `#${entry.id}`;
                              }

                              const renderLabels = (l: number[]) => (
                                <div className="flex flex-wrap gap-1.5">
                                  {l.length > 0 && l[0] !== -1 ? l.map(catId => {
                                    const cat = localCategories.find(c => c.id === catId);
                                    return (
                                      <span key={catId} className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all ${cat?.bg} ${cat?.color} ${cat?.border}`}>
                                        {cat?.name}
                                      </span>
                                    );
                                  }) : (
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                                      {-1 === l[0] ? 'No Label' : 'N/A'}
                                    </span>
                                  )}
                                </div>
                              );
                              
                              return (
                                <tr key={entry.id} className="hover:bg-background transition-colors">
                                  <td className="px-4 py-4 text-xs font-black text-on-surface opacity-80 tabular-nums break-all min-w-[400px]">
                                    <div className="flex items-center gap-3">
                                      {entry.isMatch && groundTruth && (
                                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                      )}
                                      {displayId}
                                    </div>
                                  </td>
                                  {selectedAnnotator === 'overall' && sessionStats?.annotators ? (
                                    sessionStats.annotators.map(user => (
                                      <td key={user} className="px-4 py-4">
                                        {user === 'Ground Truth' ? renderLabels(entry.gtLabels || []) : renderLabels(entry.userLabels?.[user] || [])}
                                      </td>
                                    ))
                                  ) : (
                                    <td className="px-8 py-4">
                                      {renderLabels(labels)}
                                    </td>
                                  )}
                                  <td className="px-8 py-4 min-w-[350px]">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-primary/60" 
                                            style={{ width: `${Math.min(100, (duration || 0) * 10)}%` }} 
                                          />
                                        </div>
                                        <span className="text-[10px] font-bold tabular-nums text-on-surface-variant">
                                          {(duration || 0).toFixed(1)}s
                                          {selectedAnnotator === 'overall' && <span className="ml-1 opacity-40 font-normal">avg</span>}
                                        </span>
                                      </div>
                                      {selectedAnnotator === 'overall' && entry.userDurations && (
                                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 opacity-60">
                                          {Object.entries(entry.userDurations).map(([u, d]: [any, any]) => (
                                            <span key={u} className="text-[8px] font-medium tabular-nums">
                                              {u}: {d.toFixed(1)}s
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-8 py-20 text-center text-on-surface-variant/40 text-xs font-bold uppercase tracking-widest">
                                No activity recorded in this view
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (activeView === 'settings' && settingsDraft) ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 20, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.99 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 overflow-y-auto p-12"
              >
                <div className="max-w-4xl mx-auto space-y-12">
                  <header className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter text-on-surface uppercase mb-3">Workspace Configuration</h2>
                      <p className="text-on-surface-variant font-medium text-sm">Customize categories, labels, and visual tokens</p>
                      
                      {(() => {
                        const headers = settingsDraft.map(c => formatHeader(c.name));
                        const duplicates = headers.filter((item, index) => headers.indexOf(item) !== index);
                        const hasDuplicateHeaders = duplicates.length > 0;
                        
                        if (hasDuplicateHeaders) {
                          return (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 text-orange-700"
                            >
                              <AlertCircle size={20} className="shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest leading-none mb-1">Export Conflict Detected</span>
                                <span className="text-[11px] font-medium opacity-80 leading-relaxed">
                                  Duplicate CSV headers: <strong className="font-black">{[...new Set(duplicates)].join(', ')}</strong>. 
                                  Rename your labels to ensure unique outputs.
                                </span>
                              </div>
                            </motion.div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setSettingsDraft(null);
                          setActiveView('labeling');
                        }}
                        className="px-6 py-3 bg-white text-on-surface-variant border border-outline-variant rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all"
                      >
                        Cancel Changes
                      </button>
                      <button 
                        onClick={() => {
                          setLocalCategories(settingsDraft);
                          setSettingsDraft(null);
                          setActiveView('labeling');
                        }}
                        className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all"
                      >
                        Save & Return
                      </button>
                    </div>
                  </header>

                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">Labeling Categories</h3>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setSettingsDraft(DEFAULT_CATEGORIES.map(cat => ({ ...cat })));
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-[10px] font-black uppercase"
                        >
                          <RotateCcw size={14} />
                          Reset to Defaults
                        </button>
                        <button 
                          onClick={() => {
                            // Shuffle THEME_COLORS to ensure uniqueness where possible
                            const shuffled = [...THEME_COLORS].sort(() => Math.random() - 0.5);
                            const next = settingsDraft.map((cat: any, i: number) => {
                              const theme = shuffled[i % shuffled.length];
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              const { name: _themeName, ...themeStyles } = theme; 
                              return { ...cat, ...themeStyles };
                            });
                            setSettingsDraft(next);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all text-[10px] font-black uppercase"
                        >
                          <Zap size={14} className="fill-current" />
                          Randomize Colors
                        </button>
                        <button 
                          onClick={() => {
                            const newId = Math.max(0, ...settingsDraft.map((c: any) => c.id)) + 1;
                            const theme = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
                            const { name: _themeName, ...themeStyles } = theme;
                            setSettingsDraft([
                              ...settingsDraft,
                              {
                                id: newId,
                                key: `custom_${newId}`,
                                name: 'New Category',
                                desc: 'Brief description',
                                ...themeStyles,
                                icon: AVAILABLE_ICONS[0].icon
                              }
                            ]);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl hover:bg-primary/10 transition-all text-[10px] font-black uppercase"
                        >
                          <Plus size={14} />
                          Add Category
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={settingsDraft.map((c: any) => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {settingsDraft.map((cat: any, index: number) => (
                            <SortableCategoryItem 
                              key={cat.id}
                              cat={cat}
                              index={index}
                              localCategories={settingsDraft}
                              setLocalCategories={setSettingsDraft}
                            />
                          ))}
                        </SortableContext>
                        <DragOverlay dropAnimation={{
                          sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                              active: {
                                opacity: '0.5',
                              },
                            },
                          }),
                        }}>
                          {activeDragId ? (
                            <SortableCategoryItem 
                              cat={settingsDraft.find((c: any) => c.id === activeDragId)}
                              index={settingsDraft.findIndex((c: any) => c.id === activeDragId)}
                              localCategories={settingsDraft}
                              setLocalCategories={setSettingsDraft}
                              isOverlay
                            />
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : !isFinished ? (
              <motion.div 
                key="workspace"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.015 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 flex flex-row overflow-hidden h-full"
              >
                <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Header Dashboard Area */}
                <div className={`transition-all duration-500 ease-in-out border-b border-outline-variant bg-white/70 backdrop-blur-xl overflow-hidden ${isTheaterMode ? 'max-h-0 opacity-0 border-b-0' : 'max-h-[300px] py-3 md:py-8'}`}>
                  <div className="px-4 md:px-margin-edge flex items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-12 flex-1 min-w-0">
                      <div className="hidden sm:flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 text-on-surface-variant mb-1 md:mb-2 group">
                          <FolderOpen size={14} className="group-hover:text-primary transition-colors shrink-0" />
                          <div className="flex items-center group/path overflow-hidden">
                            <span className="text-[10px] font-black tracking-widest uppercase mr-2 opacity-50 whitespace-nowrap hidden lg:inline">Dataset Path:</span>
                            <span className={`text-[10px] font-black tracking-widest uppercase truncate max-w-[120px] sm:max-w-[240px] ${imageFiles.length === 0 && datasetPath !== 'Blip-C Empty' ? 'text-orange-500' : 'text-on-surface'}`}>
                              {datasetPath || 'NOT SELECTED'}
                              {imageFiles.length === 0 && datasetPath && datasetPath !== 'Blip-C Empty' && ' (RECONNECT)'}
                            </span>
                            <button 
                              onClick={handleSelectDirectory}
                              className="ml-2 md:ml-4 px-2 md:px-3 py-1 rounded-full border border-outline-variant/50 hover:border-primary hover:text-primary transition-colors text-[8px] md:text-[9px] font-black tracking-tight whitespace-nowrap shrink-0"
                            >
                              {imageFiles.length === 0 && datasetPath && datasetPath !== 'Blip-C Empty' ? (
                                <span className="flex items-center gap-1"><RotateCcw size={10} /> RECONNECT</span>
                              ) : 'BROWSE'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <AnimatePresence mode="wait">
                            {isSaving ? (
                              <div className="flex items-center gap-1.5 text-primary">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Backing up</span>
                              </div>
                            ) : lastSaved && (
                              <div className="flex items-center gap-1.5 text-on-surface-variant/40">
                                <Save size={10} />
                                <span className="text-[8px] font-bold uppercase tracking-tight">Sync {lastSaved}</span>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:border-l border-outline-variant/20 md:pl-12 min-w-0">
                        <span className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-[0.1em] md:tracking-[0.2em] mb-1 md:mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          {totalImages === 0 ? 0 : currentImage} / {totalImages} COMPLETE
                        </span>
                        <div className="w-32 sm:w-56 h-1 md:h-1.5 bg-outline-variant/20 rounded-full overflow-hidden shadow-inner shrink-0">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${totalImages === 0 ? 0 : Math.min(100, (currentImage / totalImages) * 100)}%` }}
                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6 shrink-0">
                      <button 
                        onClick={() => {
                          if (activeView !== 'settings') {
                            setSettingsBackup([...localCategories]);
                            setSettingsDraft([...localCategories.map(c => ({...c}))]);
                            setActiveView('settings');
                          } else {
                            setActiveView('labeling');
                          }
                        }}
                        className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all border ${activeView === 'settings' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary shadow-sm hover:shadow-md'}`}
                        title="Configuration Settings"
                      >
                        <Settings className={`w-[18px] h-[18px] md:w-[20px] md:h-[20px] transition-all ${activeView === 'settings' ? 'animate-spin-slow' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 min-h-0 flex items-center justify-center transition-all duration-500 ease-in-out ${isTheaterMode ? 'p-0' : 'p-margin-edge'}`}>
                  <div 
                    ref={canvasRef}
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                    className={`relative w-full h-full bg-white border shadow-sm rounded-[32px] overflow-hidden flex items-center justify-center group transition-all duration-500 ${isFullScreen || isTheaterMode ? 'rounded-none border-none' : ''} ${isDraggingFiles ? 'border-primary ring-8 ring-primary/5' : 'border-outline-variant'}`}
                  >
                    {/* Mobile Labeling Trigger */}
                    <div className="md:hidden absolute bottom-8 right-8 z-[60] flex flex-col gap-3">
                      <button 
                        onClick={() => setIsMobileLabelingOpen(true)}
                        className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Tags size={28} />
                      </button>
                      {sessionStartTime && (
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 shadow-lg flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active</span>
                        </div>
                      )}
                    </div>

                    {/* Local Image Drop Overlay */}
                    <AnimatePresence>
                      {isDraggingFiles && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
                        >
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-6"
                          >
                            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 transform rotate-6 scale-110">
                              <Upload size={40} strokeWidth={2.5} />
                            </div>
                            <div className="text-center space-y-1">
                              <h2 className="text-xl font-black tracking-tighter text-on-surface uppercase">Import Gallery</h2>
                              <p className="text-on-surface-variant font-bold text-[10px] tracking-[0.3em] opacity-40 uppercase">Release to Upload</p>
                            </div>
                          </motion.div>
                          
                          {/* Minimalist Corner Accents */}
                          <div className="absolute top-12 left-12 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                          <div className="absolute top-12 right-12 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                          <div className="absolute bottom-12 left-12 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                          <div className="absolute bottom-12 right-12 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* View Guard (Image Blocking) */}
                    <AnimatePresence>
                      {!sessionStartTime && !isFinished && totalImages > 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 backdrop-blur-3xl bg-surface/80 flex items-center justify-center p-12 text-center"
                        >
                          <div className="max-w-md">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary animate-pulse">
                              <EyeOff size={32} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-on-surface mb-3 uppercase">Timer Paused</h2>
                            <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                              The image is hidden while the timer is not running to ensure accurate performance metrics.
                            </p>
                            <button 
                              onClick={handleTimerToggle}
                              className="px-8 py-4 bg-primary text-white rounded-full font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:translate-y-0"
                            >
                              START / RESUME SESSION
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`relative w-full h-full p-2 md:p-4 flex items-center justify-center overflow-hidden transition-all duration-700 ${!sessionStartTime && totalImages > 0 ? 'scale-90 opacity-0 blur-xl' : 'scale-100 opacity-100 blur-0'}`}>
                      <TransformWrapper
                      ref={transformComponentRef}
                      initialScale={1}
                      minScale={0.1}
                      maxScale={8}
                      centerOnInit={true}
                      centerOnMount={true}
                      limitToBounds={false} // Allow panning outside slightly if zoomed in
                      key={currentImage} // Reset zoom/pan when image changes
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          < TransformComponent
                            wrapperClassName="!w-full !h-full flex items-center justify-center p-4"
                            contentClassName="flex items-center justify-center"
                          >
                            {currentImageUrl ? (
                              <img 
                                src={currentImageUrl} 
                                alt="Workspace" 
                                className="max-w-full max-h-[calc(100vh-250px)] w-auto h-auto object-contain cursor-move pointer-events-none select-none rounded-lg shadow-2xl"
                                style={{ display: 'block' }}
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-6 text-on-surface-variant/40 text-center px-12">
                                <div className="w-24 h-24 rounded-full bg-outline-variant/5 flex items-center justify-center">
                                  <FolderOpen size={48} className="opacity-20 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-xl font-bold tracking-tight text-on-surface/60">
                                    {datasetPath && datasetPath !== 'Blip-C Empty' ? 'Session Disconnected' : 'Waiting for Dataset'}
                                  </h3>
                                  <p className="text-sm font-medium max-w-xs mx-auto">
                                    {datasetPath && datasetPath !== 'Blip-C Empty' 
                                      ? `Browser security requires you to re-select "${datasetPath}" after a refresh.` 
                                      : 'Browse image directory or drag and drop files here to start labelling'}
                                  </p>
                                </div>
                                <button 
                                  onClick={handleSelectDirectory}
                                  className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                  {isAutoLoading ? <RotateCcw size={14} className="animate-spin" /> : <FolderOpen size={14} />}
                                  {datasetPath && datasetPath !== 'Blip-C Empty' ? 'Reconnect Directory' : 'Select Images Folder'}
                                </button>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 mt-1">
                                  Drag & Drop Also Supported
                                </p>
                                {window.location.hostname === 'localhost' && !datasetPath && (
                                  <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
                                    Tip: Place images in <code className="bg-outline-variant/10 px-1">public/dataset</code> for auto-load
                                  </p>
                                )}
                              </div>
                            )}
                          </TransformComponent>
                          
                          {/* Canvas Controls Overlay */}
                          <div className="absolute top-8 right-8 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                            <div className="bg-white/90 backdrop-blur-md border border-outline-variant rounded-2xl p-2 flex gap-1 shadow-xl">
                              <CanvasControlButton 
                                icon={<ZoomIn size={20} />} 
                                onClick={() => zoomIn(0.2)}
                                title="Zoom In"
                              />
                              <CanvasControlButton 
                                icon={<ZoomOut size={20} />} 
                                onClick={() => zoomOut(0.2)}
                                title="Zoom Out"
                              />
                              <div className="w-px bg-outline-variant mx-1 self-stretch" />
                              <CanvasControlButton 
                                icon={<RotateCcw size={20} />} 
                                onClick={() => resetTransform()}
                                title="Reset View"
                              />
                              <CanvasControlButton 
                                icon={<Maximize size={20} className={isTheaterMode ? 'text-primary' : ''} />} 
                                onClick={toggleTheaterMode}
                                title={isTheaterMode ? "Exit Theater Mode" : "Expand Image View"}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </TransformWrapper>
                  </div>
                </div>
              </div>

              {/* Footer Navigation (Simplified) */}
                <footer className={`bg-white/30 backdrop-blur-sm border-t border-outline-variant px-margin-edge flex items-center justify-between shrink-0 transition-all duration-500 overflow-hidden ${isTheaterMode ? 'h-0 opacity-0 border-none' : 'h-16'}`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentImage(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant bg-white/50 hover:bg-white transition-all active:scale-90"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={() => setCurrentImage(prev => Math.min(totalImages, prev + 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant bg-white/50 hover:bg-white transition-all active:scale-90"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 opacity-60">
                    <div className="text-[10px] font-bold text-on-surface-variant tracking-widest flex items-center gap-2">
                      <span className="bg-white/50 px-1 py-0.5 rounded border border-outline-variant uppercase">Enter</span>
                      <span>QUICK APPLY</span>
                    </div>
                  </div>
                </footer>
              </div>
              <aside className={`transition-all duration-500 ease-in-out bg-white border-outline-variant flex-col shrink-0 overflow-hidden ${
                  isTheaterMode 
                    ? 'w-0 p-0 opacity-0 border-l-0' 
                    : 'hidden md:flex md:w-80 lg:w-96 xl:w-[480px] p-6 border-l opacity-100'
                }`} 
                  style={{ 
                    opacity: isFinished ? 0.3 : (isTheaterMode ? 0 : 1), 
                    pointerEvents: isFinished || isTheaterMode ? 'none' : 'auto' 
                  }}
                >
                  <div className="mb-4 md:mb-6 flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-bold tracking-tight text-on-surface truncate">Categories</h3>
                      <p className="text-xs md:text-sm text-on-surface-variant mt-1 italic truncate opacity-60">Assign label to image</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (sessionStartTime) {
                          handleTimerToggle();
                        }
                        setShowTutorial(true);
                      }}
                      className="p-2 text-on-surface-variant hover:bg-surface-variant/5 hover:text-primary rounded-xl transition-all border border-transparent"
                      title="Show Onboarding Tutorial"
                    >
                      <Info size={20} />
                    </button>
                  </div>

                  <div className="mb-6 flex items-center justify-between gap-3">
                    <button 
                      onClick={handleTimerToggle}
                      disabled={imageFiles.length === 0}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border shadow-sm ${
                        imageFiles.length === 0 
                          ? 'bg-outline-variant/10 text-outline border-transparent cursor-not-allowed opacity-50' 
                          : sessionStartTime 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 ring-2 ring-amber-100 ring-offset-2'
                      }`}
                      title={imageFiles.length === 0 ? "Connect dataset to start timer" : sessionStartTime ? "Pause Timer" : "Start Session Timer"}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${imageFiles.length === 0 ? 'bg-outline-variant' : sessionStartTime ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {sessionStartTime ? 'Recording' : (imageFiles.length === 0 ? 'No Data' : 'Session Start')}
                    </button>
                    
                    <div className="flex gap-1 border-l border-outline-variant/30 pl-2 items-center">
                      <button 
                        onClick={() => setSelectedCategories([])}
                        disabled={selectedCategories.length === 0 || isFinished}
                        className="p-2 text-on-surface-variant hover:bg-surface-variant/5 rounded-xl transition-all border border-transparent hover:border-outline-variant disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Reset current image labels"
                      >
                        <RotateCcw size={18} />
                      </button>
                      { (Object.keys(annotations).length > 0 || Object.keys(accumulatedTimes).length > 0 || sessionStartTime || currentImage > 1) && (
                        <>
                          <button 
                            onClick={downloadCSV}
                            className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20"
                            title="Download Progress (CSV)"
                          >
                            <Save size={20} />
                          </button>
                          
                          {isConfirmingReset ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200 animate-in fade-in slide-in-from-right-2">
                              <button 
                                onClick={handleResetProgress}
                                className="px-2 py-1 text-[9px] font-black uppercase text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setIsConfirmingReset(false)}
                                className="p-1 px-2 text-[9px] font-black uppercase text-on-surface-variant hover:bg-surface-variant/10 rounded-lg transition-colors"
                              >
                                Esc
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setIsConfirmingReset(true)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                              title="Clear all progress, labels, and timers"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                <div className="flex-1 relative flex flex-col overflow-hidden">
                  {/* Scroll Up Indicator */}
                  <AnimatePresence>
                    {showScrollUp && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-0 left-0 right-0 z-10 flex justify-center py-2 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none"
                      >
                        <ChevronUp size={16} className="text-primary animate-bounce" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                    <div 
                      ref={categoriesRef}
                      className="flex-1 space-y-3 md:space-y-4 overflow-y-auto px-2 py-2 md:py-4 no-scrollbar"
                    >
                      {localCategories.map((cat, index) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`w-[calc(100%-0.5rem)] mx-auto text-left py-4 md:py-6 lg:py-7 px-4 md:px-6 rounded-[24px] md:rounded-[28px] border transition-all relative group flex justify-between items-center ${
                            selectedCategories.includes(cat.id) 
                              ? `${cat.bg} ${cat.border} shadow-xl scale-[1.02] ring-4 ${cat.ring}` 
                              : `bg-background border-transparent hover:bg-white hover:border-outline-variant/30 transition-all duration-300`
                          }`}
                          style={selectedCategories.includes(cat.id) ? { boxShadow: `0 20px 25px -5px ${cat.accent}20, 0 8px 10px -6px ${cat.accent}20` } : {}}
                        >
                          <div className="flex items-center gap-3 md:gap-5">
                            <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all ${selectedCategories.includes(cat.id) ? `${cat.bg} ${cat.color} border ${cat.border} shadow-inner` : 'bg-outline-variant/10 text-on-surface-variant/40'}`}>
                              <cat.icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <div className="flex flex-col gap-1 md:gap-1.5 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[9px] md:text-[10px] font-black w-4 h-4 rounded-md flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id) ? `${cat.bg} ${cat.color} border ${cat.border}` : 'bg-outline-variant/10 text-on-surface-variant'}`}>
                                  {index + 1}
                                </span>
                                <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-widest truncate ${selectedCategories.includes(cat.id) ? cat.color : 'text-on-surface-variant'}`}>
                                  {cat.name}
                                </span>
                              </div>
                              <span className={`text-sm md:text-base font-medium transition-colors leading-tight line-clamp-2 ${selectedCategories.includes(cat.id) ? 'text-on-surface' : 'text-on-surface/60 group-hover:text-on-surface'}`}>
                                {cat.desc}
                              </span>
                            </div>
                          </div>
                          {selectedCategories.includes(cat.id) && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full shadow-lg"
                              style={{ backgroundColor: cat.accent, boxShadow: `0 0 8px ${cat.accent}80` }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                  {/* Scroll Down Indicator */}
                  <AnimatePresence>
                    {showScrollDown && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-0 left-0 right-0 z-10 flex justify-center py-2 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"
                      >
                        <ChevronDown size={16} className="text-primary animate-bounce" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-outline-variant space-y-4 md:space-y-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] md:text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Active Classes ({selectedCategories.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCategories.length > 0 ? (
                        selectedCategories.map(id => {
                          const cat = localCategories.find(c => c.id === id);
                          if (id === -1) {
                            return (
                              <span key={id} className="text-[9px] md:text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-200">
                                No Label
                              </span>
                            );
                          }
                          return (
                            <span key={id} className={`text-[9px] md:text-[10px] font-bold ${cat?.bg} ${cat?.color} px-2 py-0.5 rounded-full border ${cat?.border} opacity-80`}>
                              {cat?.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs md:text-sm font-bold text-outline opacity-40 uppercase tracking-widest">None</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex gap-2 md:gap-3">
                      <button 
                        onClick={() => currentImage > 1 && setCurrentImage(prev => prev - 1)}
                        disabled={currentImage <= 1}
                        className="px-4 py-3 md:py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[10px] md:text-[11px] border border-outline-variant text-on-surface-variant hover:bg-background transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        title="Go back to previous image"
                      >
                        <ChevronLeft className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                      </button>
                      <button 
                        onClick={handleNoLabel}
                        disabled={!sessionStartTime}
                        className="flex-1 py-3 md:py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[10px] md:text-[11px] border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all active:scale-95 whitespace-nowrap disabled:opacity-30 disabled:pointer-events-none"
                      >
                        No Label
                      </button>
                    </div>
                    <button 
                      onClick={handleApply}
                      disabled={!sessionStartTime || selectedCategories.length === 0}
                      className={`w-full py-3 md:py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[10px] md:text-[11px] transition-all ${
                        (selectedCategories.length > 0 && sessionStartTime)
                          ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0.5' 
                          : 'bg-outline-variant/30 text-outline cursor-not-allowed opacity-50'
                      }`}
                    >
                      Apply Extraction
                    </button>
                  </div>
                </div>
              </aside>
              </motion.div>
            ) : (
              <motion.div 
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 bg-white"
              >
                <div className="max-w-md w-full text-center space-y-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-on-surface">Extraction Complete</h2>
                    <p className="text-on-surface-variant mt-2">All {totalImages} assets have been successfully processed.</p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-2">
                      <label htmlFor="user-name" className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Annotator Identity</label>
                      <input 
                        id="user-name"
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-background border border-outline-variant rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium"
                      />
                    </div>

                    <button 
                      onClick={downloadCSV}
                      className="w-full bg-primary text-white py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                      <span>Finalize & Download CSV</span>
                      <Save size={18} />
                    </button>

                    <button 
                      onClick={handleResetProgress}
                      className="w-full py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] text-on-surface-variant hover:bg-background transition-all"
                    >
                      Start New Session
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-surface/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-2xl border border-outline-variant max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div 
                className="flex-1 overflow-y-auto p-12 no-scrollbar"
                onScroll={handleTutorialScroll}
              >
                <div className="w-16 h-1 bg-primary/20 rounded-full mx-auto mb-8" />
                <h2 className="text-3xl font-black tracking-tight text-on-surface text-center mb-4 uppercase">AnnotatePro Workspace</h2>
                <p className="text-on-surface-variant text-center mb-10 max-w-md mx-auto">
                  Welcome to your extraction workflow. Here are some quick tips to get you started efficiently.
                </p>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="bg-background/50 p-6 rounded-3xl border border-outline-variant/30">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Interactions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-6 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">1-6</div>
                      Assign category
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-6 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">0</div>
                      No Label available
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-12 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">Space</div>
                      Pause / Resume Timer
                    </li>
                  </ul>
                </div>
                <div className="bg-background/50 p-6 rounded-3xl border border-outline-variant/30">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Navigation</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-12 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-xs shadow-sm">← / →</div>
                      Previous / Next Image
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-12 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">Z / X</div>
                      Zoom In / Out
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-12 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">T</div>
                      Theater Mode
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 text-center">Practice Arena</h4>
                <div className="grid grid-cols-3 gap-3">
                  {localCategories.map((cat, idx) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`group relative p-4 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? `${cat.bg} ${cat.border} ring-4 ${cat.ring} shadow-lg -translate-y-0.5` 
                            : 'bg-white border-outline-variant hover:border-primary/50 text-on-surface'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center ${isSelected ? `${cat.bg} ${cat.color} border ${cat.border}` : 'bg-primary/5 text-primary'}`}>
                          <cat.icon size={16} />
                        </div>
                        <div className={`text-[10px] font-black uppercase tracking-wider mb-1 line-clamp-1 ${isSelected ? cat.color : 'text-on-surface'}`}>{cat.name}</div>
                        <div className={`absolute top-2 right-2 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border ${isSelected ? `${cat.border} ${cat.color}` : 'border-outline-variant text-on-surface-variant'}`}>
                          {idx + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-[24px] mb-6 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                  <FolderOpen size={20} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-sm uppercase tracking-wider mb-1">Dataset Source</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Current path: <code className="bg-primary/10 px-1 rounded">{datasetPath}</code>
                  </p>
                  <button 
                    onClick={() => directoryInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-outline-variant rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-surface transition-all flex items-center gap-2"
                  >
                    <FolderOpen size={14} />
                    Change Directory
                  </button>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-[24px] mb-10 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                  <Timer size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-sm uppercase tracking-wider mb-1">Time Tracking Enabled</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Image visibility is synced with the timer. Start the timer to view and extract labels.
                  </p>
                </div>
              </div>

                <button 
                  onClick={() => setShowTutorial(false)}
                  className="w-full py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                  disabled={imageFiles.length === 0 && datasetPath === 'Blip-C Empty'}
                >
                  {(imageFiles.length > 0 || datasetPath !== 'Blip-C Empty') ? "GOT IT, LET'S BEGIN" : "PLEASE SELECT A DIRECTORY"}
                </button>
              </div>

              {/* Scroll Indicator */}
              <AnimatePresence>
                {!isAtTutorialBottom && (
                  <motion.div 
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 0.3, y: [0, 8, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      opacity: { duration: 0.3 },
                      y: { duration: 1.5, repeat: Infinity }
                    }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1"
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest">Scroll</span>
                    <ChevronDown size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileLabelingSheet 
        isOpen={isMobileLabelingOpen}
        onClose={() => setIsMobileLabelingOpen(false)}
        localCategories={localCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        currentImage={currentImage}
        setCurrentImage={setCurrentImage}
        handleNoLabel={handleNoLabel}
        handleApply={handleApply}
        sessionStartTime={sessionStartTime}
        handleTimerToggle={handleTimerToggle}
        imageFiles={imageFiles}
      />
    </div>
  );
}

function MobileLabelingSheet({ 
  isOpen, 
  onClose, 
  localCategories, 
  selectedCategories, 
  toggleCategory,
  currentImage,
  setCurrentImage,
  handleNoLabel,
  handleApply,
  sessionStartTime,
  handleTimerToggle,
  imageFiles
}: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] md:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[1001] md:hidden flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto my-4 shrink-0" />
            
            <div className="px-6 pb-4 flex justify-between items-center border-b border-outline-variant/10 shrink-0">
              <div>
                <h3 className="text-xl font-black tracking-tight text-on-surface">Categories</h3>
                <p className="text-xs text-on-surface-variant opacity-60">Image {currentImage}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTimerToggle}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    sessionStartTime ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                  }`}
                >
                  {sessionStartTime ? 'Active' : 'Paused'}
                </button>
                <button onClick={onClose} className="p-2 text-on-surface-variant"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {localCategories.map((cat: any, index: number) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full text-left p-4 rounded-3xl border transition-all flex items-center gap-4 ${
                    selectedCategories.includes(cat.id) 
                      ? `${cat.bg} ${cat.border} ring-2 ${cat.ring} scale-[0.98]` 
                      : 'bg-background border-transparent'
                  }`}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedCategories.includes(cat.id) ? `${cat.bg} ${cat.color} border ${cat.border}` : 'bg-white border border-outline-variant/10 text-on-surface-variant/30'}`}>
                    <cat.icon size={24} />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black w-4 h-4 rounded flex items-center justify-center ${selectedCategories.includes(cat.id) ? cat.color : 'text-on-surface-variant opacity-40'}`}>
                        {index + 1}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest truncate ${selectedCategories.includes(cat.id) ? cat.color : 'text-on-surface-variant'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium line-clamp-1">{cat.desc}</span>
                  </div>
                  {selectedCategories.includes(cat.id) && (
                    <CheckCircle2 size={24} className={cat.color} />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 pt-2 bg-white border-t border-outline-variant/10 space-y-4 shrink-0">
              <div className="flex gap-3">
                <button 
                  onClick={() => { currentImage > 1 && setCurrentImage(currentImage - 1); }}
                  disabled={currentImage <= 1}
                  className="p-4 rounded-3xl border border-outline-variant text-on-surface-variant disabled:opacity-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => {
                    handleNoLabel();
                    onClose();
                  }}
                  className="flex-1 p-4 rounded-3xl border border-red-200 text-red-500 font-bold uppercase tracking-widest text-xs"
                >
                  No Label
                </button>
                <button 
                  onClick={() => {
                    handleApply();
                    onClose();
                  }}
                  disabled={selectedCategories.length === 0 || !sessionStartTime}
                  className={`flex-[2] p-4 rounded-3xl font-bold uppercase tracking-widest text-xs transition-all ${
                    selectedCategories.length > 0 && sessionStartTime ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-outline-variant opacity-40 text-on-surface-variant'
                  }`}
                >
                  Apply Label
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CanvasControlButton({ icon, onClick, title }: { icon: ReactNode, onClick?: () => void, title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all rounded active:scale-90"
    >
      {icon}
    </button>
  );
}
