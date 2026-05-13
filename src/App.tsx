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
  type DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import Papa from 'papaparse';
import { THEME_COLORS, AVAILABLE_ICONS, CATEGORIES as DEFAULT_CATEGORIES } from './constants';

function ElegantSelect({ 
  value, 
  options, 
  onChange, 
  label,
  renderOption 
}: { 
  value: any, 
  options: any[], 
  onChange: (val: any) => void,
  label: string,
  renderOption: (opt: any) => ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
          {renderOption(selectedOption)}
        </div>
        <ChevronDown 
          size={14} 
          className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute z-50 top-full left-0 w-full min-w-[160px] bg-white border border-outline-variant shadow-xl rounded-2xl overflow-hidden p-1.5"
          >
            <div className="max-h-[240px] overflow-y-auto no-scrollbar py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left mb-0.5 last:mb-0 ${
                    value === opt.value 
                      ? 'bg-primary/5 text-primary' 
                      : 'hover:bg-background text-on-surface'
                  }`}
                >
                  {renderOption(opt)}
                </button>
              ))}
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
  setLocalCategories 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      layout
      key={cat.id}
      className={`bg-white border border-outline-variant p-6 rounded-[32px] flex items-center gap-6 group hover:border-primary/30 transition-all shadow-sm shadow-black/[0.02] ${isDragging ? 'opacity-50 scale-95 shadow-2xl border-primary' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-outline opacity-20 hover:opacity-100 transition-opacity p-2 -m-2"
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
                const next = [...localCategories];
                next[index] = { ...cat, ...theme };
                setLocalCategories(next);
              }
            }}
            renderOption={(opt) => (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.accent }} />
                <span>{opt.name}</span>
              </div>
            )}
          />
        </div>

        <div className="col-span-2">
          <ElegantSelect 
            label="Icon"
            value={AVAILABLE_ICONS.find(i => i.icon === cat.icon)?.name || 'Box'}
            options={AVAILABLE_ICONS.map(i => ({ value: i.name, label: i.name, icon: i.icon }))}
            onChange={(val) => {
              const found = AVAILABLE_ICONS.find(i => i.name === val);
              if (found) {
                const next = [...localCategories];
                next[index] = { ...cat, icon: found.icon };
                setLocalCategories(next);
              }
            }}
            renderOption={(opt) => {
              const Icon = opt.icon;
              return (
                <div className="flex items-center gap-2">
                  <Icon size={14} className="opacity-60" />
                  <span>{opt.label}</span>
                </div>
              );
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
    </motion.div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<'labeling' | 'metrics' | 'settings'>('labeling');
  const [settingsBackup, setSettingsBackup] = useState<any[] | null>(null);
  const [localCategories, setLocalCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('categories_v1');
      return saved ? JSON.parse(saved).map((cat: any) => ({
        ...cat,
        icon: AVAILABLE_ICONS.find(i => i.name === cat.iconName)?.icon || AVAILABLE_ICONS[0].icon
      })) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [annotations, setAnnotations] = useState<Record<number, number[]>>(() => {
    try {
      const saved = localStorage.getItem('annotations_v1');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [annotationMetrics, setAnnotationMetrics] = useState<Record<number, { start: string, end: string, duration: number }>>(() => {
    try {
      const saved = localStorage.getItem('metrics_v1');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [accumulatedTimes, setAccumulatedTimes] = useState<Record<number, number>>(() => {
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
  const [userName, setUserName] = useState('');
  const [isAtTutorialBottom, setIsAtTutorialBottom] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const prevImageRef = useRef(currentImage);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      // Check if it's CSV or Image
      const imageFiles = files.filter(f => /\.(jpe?g|png|webp|tiff|bmp|svg)$/i.test(f.name));
      const csvFiles = files.filter(f => f.name.endsWith('.csv'));

      if (imageFiles.length > 0) {
        // Sort naturally
        imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        setImageFiles(prev => {
          const combined = [...prev, ...imageFiles];
          setTotalImages(combined.length);
          if (currentImage === 0) setCurrentImage(1);
          return combined;
        });
      }

      if (csvFiles.length > 0) {
        if (activeView === 'metrics') {
          // If in metrics, determine if it's ground truth or user data (this is tricky, let's just use generic logic)
          // For now, let's assume first one is ground truth if not present, others are user data
          for (const file of csvFiles) {
            if (!groundTruth) {
              Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  setGroundTruth(results.data);
                  calculateStats(results.data);
                }
              });
            } else {
              // Import as user data
              const dummyEvent = { target: { files: [file] } } as any;
              handleImportAnnotations(dummyEvent);
            }
          }
        }
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setLocalCategories((items: any) => {
        const oldIndex = items.findIndex((item: any) => item.id === active.id);
        const newIndex = items.findIndex((item: any) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
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

  // Auto-save progress to localStorage
  useEffect(() => {
    if (Object.keys(annotations).length > 0) {
      localStorage.setItem('annotations_v1', JSON.stringify(annotations));
    }
    if (Object.keys(annotationMetrics).length > 0) {
      localStorage.setItem('metrics_v1', JSON.stringify(annotationMetrics));
    }
    if (Object.keys(accumulatedTimes).length > 0) {
      localStorage.setItem('accumulated_v1', JSON.stringify(accumulatedTimes));
    }
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

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to clear all labeling progress? This cannot be undone.')) {
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
    }
  };

  const [groundTruth, setGroundTruth] = useState<any[] | null>(null);
  const [metricsResults, setMetricsResults] = useState<any>(null);
  const [importedAnnotations, setImportedAnnotations] = useState<Record<string, Record<number, number[]>>>({});

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

    const newImportedAnnots: Record<string, Record<number, number[]>> = { ...importedAnnotations };

    for (const file of Array.from(files) as File[]) {
      await new Promise<void>((resolve) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const annotationMap: Record<number, number[]> = {};
            
            // Map CSV row to category IDs
            // The CSV format matches Truth: filename,projected_slides,computer_screen,printed_papers,whiteboard,map,wargaming
            results.data.forEach((row: any, idx: number) => {
              const fileIdx = idx + 1; // Assuming sequential for now if image files not loaded, 
              // but better to match filename if available
              const labels: number[] = [];
              localCategories.forEach(cat => {
                const val = row[cat.key];
                if (val === '1' || val === 1 || String(val).toLowerCase() === 'true') {
                  labels.push(cat.id);
                }
              });
              
              // We'll use the row index + 1 as image index if we can't find a file matching filename
              // In metrics, we'll primarily match by filename in calculateStats anyway.
              annotationMap[fileIdx] = labels;
              
              // Store filename hint if present
              if (row.filename) {
                 const baseName = String(row.filename).split(/[/\\]/).pop() || String(row.filename);
                 (annotationMap as any)[`__file_${baseName}`] = labels;
              }
            });

            newImportedAnnots[file.name] = annotationMap;
            resolve();
          }
        });
      });
    }

    setImportedAnnotations(newImportedAnnots);
  };

  useEffect(() => {
    if (groundTruth) {
      calculateStats(groundTruth);
    }
  }, [annotations, groundTruth, importedAnnotations]);

  const calculateStats = (gtData: any[]) => {
    // Determine which annotation sets to use
    // If we have imported ones, use those. Otherwise use current session.
    const setsToEvaluate: Record<number, number[]>[] = [];
    
    if (Object.keys(importedAnnotations).length > 0) {
      Object.values(importedAnnotations).forEach(set => setsToEvaluate.push(set as Record<number, number[]>));
    } else {
      setsToEvaluate.push(annotations);
    }

    if (setsToEvaluate.length === 0) return;

    let aggregateAccuracy = 0;
    let aggregateMeanF1 = 0;
    let totalValidatedSamples = 0;

    const aggregateClassStats = localCategories.reduce((acc: any, cat: any) => {
      acc[cat.key] = { tp: 0, fp: 0, fn: 0, tn: 0 };
      return acc;
    }, {});

    setsToEvaluate.forEach(targetAnnotations => {
      let totalCorrect = 0;
      let totalSamples = 0;

      // Map annotations by filename for easy lookup
      const annotationMap: Record<string, number[]> = {};
      Object.entries(targetAnnotations).forEach(([idx, ids]) => {
        // Handle the filename hint stored during import
        if (idx.startsWith('__file_')) {
          annotationMap[idx.replace('__file_', '')] = ids as number[];
        } else {
          const file = imageFiles[parseInt(idx) - 1] as File | undefined;
          if (file) {
            const baseName = file.name.split(/[/\\]/).pop() || file.name;
            annotationMap[baseName] = ids as number[];
          }
        }
      });

      gtData.forEach(row => {
        const filename = String(row.filename || '').trim();
        if (!filename) return;

        const baseFilename = filename.split(/[/\\]/).pop() || filename;
        const userLabels = annotationMap[baseFilename] || annotationMap[filename] || [];
        totalSamples++;
        totalValidatedSamples++;

        let isImageCorrect = true;
        localCategories.forEach(cat => {
          const isSelectedByUser = userLabels.includes(cat.id);
          const gtValue = row[cat.key];
          const isPresentInGT = gtValue === '1' || gtValue === 1 || String(gtValue).toLowerCase() === 'true';

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

    const meanAccuracy = aggregateAccuracy / setsToEvaluate.length;
    const meanF1 = categoryMetrics.reduce((acc, curr) => acc + curr.f1, 0) / categoryMetrics.length;

    setMetricsResults({
      accuracy: meanAccuracy,
      meanF1,
      categoryMetrics,
      totalSamples: totalValidatedSamples / setsToEvaluate.length, // Avg samples per user or total? Let's say per user.
      userCount: setsToEvaluate.length
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
    if (imageFiles.length === 0) return;
    
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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const filename = `annotations_${timestamp}.csv`;
    
      // Header matches Truth: filename,projected_slides,computer_screen,printed_papers,whiteboard,map,wargaming
      // We add StartTime, EndTime, and DurationSeconds for analysis
      const headers = ['filename', ...localCategories.map(c => c.key), 'StartTime', 'EndTime', 'DurationSeconds'];
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
  
        const rowData = [fileName];
        localCategories.forEach(cat => {
          rowData.push((ids as number[]).includes(cat.id) ? '1' : '0');
        });

      // Append metrics
      rowData.push(startTime);
      rowData.push(finalEndTime);
      rowData.push(totalDuration.toFixed(3));

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
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            {activeView === 'metrics' ? (
              <motion.div
                key="metrics-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto p-12"
              >
                <div className="max-w-6xl mx-auto space-y-10">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setActiveView('labeling')}
                      className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      <ChevronLeft size={16} />
                      Back to Labeling
                    </button>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => csvInputRef.current?.click()}
                        className="bg-primary/5 p-4 pl-6 rounded-3xl border border-primary/10 flex items-center gap-4 hover:bg-primary/10 transition-all active:scale-95 group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ground Truth</span>
                          <span className="text-[10px] font-bold text-on-surface-variant opacity-60">SELECT CSV</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Upload size={20} />
                        </div>
                      </button>

                      <button 
                        onClick={() => document.getElementById('import-annots')?.click()}
                        className="bg-purple-50 p-4 pl-6 rounded-3xl border border-purple-200 flex items-center gap-4 hover:bg-purple-100 transition-all active:scale-95 group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">User Data</span>
                          <span className="text-[10px] font-bold text-on-surface-variant opacity-60">SELECT CSV(s)</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <FileText size={20} />
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

                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-on-surface uppercase mb-2">Performance Analytics</h2>
                    <p className="text-on-surface-variant text-sm">Validate extraction accuracy against ground truth datasets</p>
                  </div>

                  {!metricsResults ? (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed border-outline-variant rounded-[40px] p-20 text-center flex flex-col items-center gap-6 transition-all ${isDraggingFiles ? 'bg-primary/5 border-primary scale-[0.99]' : ''}`}
                    >
                      <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-outline">
                        <BarChart2 size={40} />
                      </div>
                      <div className="max-w-xs transition-colors">
                        <h3 className="font-bold text-lg mb-2">Ready for Analysis</h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          1. Upload the <b>Ground Truth CSV</b><br/>
                          2. Upload <b>User CSV Export(s)</b> (Optional, defaults to current session)<br/>
                          <code className="block mt-4 p-3 bg-background rounded-xl text-[10px] font-mono break-all leading-normal text-left">
                            filename,{localCategories.map((c: any) => c.key).join(',')}
                          </code>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* High Level Stats */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Overall Accuracy</span>
                          <span className="text-4xl font-black tracking-tighter text-on-surface">{(metricsResults.accuracy * 100).toFixed(1)}%</span>
                          <div className="mt-4 h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${metricsResults.accuracy * 100}%` }} className="h-full bg-primary" />
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
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Samples Validated</span>
                          <span className="text-4xl font-black tracking-tighter text-on-surface">{metricsResults.totalSamples}</span>
                          <div className="mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Images Matched</div>
                        </div>
                      </div>

                      {/* Class Level Stats */}
                      <div className="bg-white rounded-[40px] border border-outline-variant shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-outline-variant flex items-center justify-between">
                          <h3 className="font-bold uppercase tracking-widest text-xs">Category Breakdown</h3>
                          <div className="flex gap-4 text-[10px] font-black text-on-surface-variant uppercase">
                            <span>Precision</span>
                            <span>Recall</span>
                            <span>F1 Score</span>
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
                </div>
              </motion.div>
            ) : activeView === 'settings' ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 overflow-y-auto p-12"
              >
                <div className="max-w-4xl mx-auto space-y-12">
                  <header className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter text-on-surface uppercase mb-3">Workspace Configuration</h2>
                      <p className="text-on-surface-variant font-medium">Customize categories, labels, and visual tokens</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          if (settingsBackup) {
                            setLocalCategories(settingsBackup);
                          }
                          setActiveView('labeling');
                        }}
                        className="px-6 py-3 bg-white text-on-surface-variant border border-outline-variant rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all"
                      >
                        Cancel Changes
                      </button>
                      <button 
                        onClick={() => setActiveView('labeling')}
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
                            const next = localCategories.map((cat: any) => {
                              const randomTheme = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];
                              return { ...cat, ...randomTheme };
                            });
                            setLocalCategories(next);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all text-[10px] font-black uppercase"
                        >
                          <Zap size={14} className="fill-current" />
                          Randomize Colors
                        </button>
                        <button 
                          onClick={() => {
                            const newId = Math.max(0, ...localCategories.map((c: any) => c.id)) + 1;
                            setLocalCategories([
                              ...localCategories,
                              {
                                id: newId,
                                key: `custom_${newId}`,
                                name: 'New Category',
                                desc: 'Brief description',
                                ...THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)],
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
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={localCategories.map((c: any) => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {localCategories.map((cat: any, index: number) => (
                            <SortableCategoryItem 
                              key={cat.id}
                              cat={cat}
                              index={index}
                              localCategories={localCategories}
                              setLocalCategories={setLocalCategories}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : !isFinished ? (
              <motion.div 
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Header Dashboard Area */}
                <div className={`transition-all duration-500 ease-in-out border-b border-outline-variant bg-white/70 backdrop-blur-xl ${isTheaterMode ? 'max-h-0 opacity-0' : 'max-h-[300px] py-8'}`}>
                  <div className="px-margin-edge flex items-center justify-between">
                    <div className="flex items-center gap-12">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-on-surface-variant mb-2 group">
                          <FolderOpen size={14} className="group-hover:text-primary transition-colors" />
                          <div className="flex items-center group/path">
                            <span className="text-[10px] font-black tracking-widest uppercase mr-2 opacity-50">Dataset Path:</span>
                            <span className={`text-[10px] font-black tracking-widest uppercase truncate max-w-[240px] ${imageFiles.length === 0 && datasetPath !== 'Blip-C Empty' ? 'text-orange-500' : 'text-on-surface'}`}>
                              {datasetPath || 'NOT SELECTED'}
                              {imageFiles.length === 0 && datasetPath && datasetPath !== 'Blip-C Empty' && ' (RECONNECT NEEDED)'}
                            </span>
                            <button 
                              onClick={handleSelectDirectory}
                              className="ml-4 px-3 py-1 rounded-full border border-outline-variant/50 hover:border-primary hover:text-primary transition-colors text-[9px] font-black tracking-tight"
                            >
                              {imageFiles.length === 0 && datasetPath && datasetPath !== 'Blip-C Empty' ? 'RECONNECT SOURCE' : 'CHANGE BROWSE'}
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

                      <div className="flex flex-col items-start border-l border-outline-variant/20 pl-12">
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1.5">
                          {totalImages === 0 ? 0 : currentImage} / {totalImages} COMPLETE
                        </span>
                        <div className="w-56 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${totalImages === 0 ? 0 : Math.min(100, (currentImage / totalImages) * 100)}%` }}
                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => {
                          if (activeView !== 'settings') {
                            setSettingsBackup([...localCategories]);
                            setActiveView('settings');
                          } else {
                            setActiveView('labeling');
                          }
                        }}
                        className={`p-3 rounded-2xl transition-all border ${activeView === 'settings' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary shadow-sm hover:shadow-md'}`}
                        title="Configuration Settings"
                      >
                        <Settings size={20} className={activeView === 'settings' ? 'animate-spin-slow' : ''} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 min-h-0 flex items-center justify-center transition-all duration-500 ease-in-out ${isTheaterMode ? 'p-0' : 'p-margin-edge'}`}>
                  <div 
                    ref={canvasRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative w-full h-full bg-white border border-outline-variant shadow-sm rounded-[32px] overflow-hidden flex items-center justify-center group transition-all duration-500 ${isFullScreen || isTheaterMode ? 'rounded-none border-none' : ''} ${isDraggingFiles ? 'bg-primary/5 border-primary scale-[0.99] border-dashed border-2' : ''}`}
                  >
                    {/* File Drop Indicator */}
                    <AnimatePresence>
                      {isDraggingFiles && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-30 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center gap-4 border-4 border-dashed border-primary"
                        >
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl">
                            <Upload size={40} />
                          </div>
                          <div className="text-center text-primary">
                            <p className="text-xl font-black uppercase tracking-widest">Drop to upload</p>
                            <p className="text-xs font-bold opacity-60">Images or CSV Annotations</p>
                          </div>
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

                    <div className={`relative w-full h-full p-1 flex items-center justify-center overflow-hidden transition-all duration-700 ${!sessionStartTime && totalImages > 0 ? 'scale-90 opacity-0 blur-xl' : 'scale-100 opacity-100 blur-0'}`}>
                      <TransformWrapper
                      ref={transformComponentRef}
                      initialScale={1}
                      initialPositionX={0}
                      initialPositionY={0}
                      centerOnInit
                      key={currentImage} // Reset zoom/pan when image changes
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          < TransformComponent
                            wrapperClassName="!w-full !h-full"
                            contentClassName="!w-full !h-full flex items-center justify-center"
                          >
                            {currentImageUrl ? (
                              <img 
                                src={currentImageUrl} 
                                alt="Workspace" 
                                className="max-w-full max-h-full object-contain cursor-move pointer-events-none select-none"
                                style={{ width: 'auto', height: 'auto', display: 'block' }}
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
                                      : 'Please browse to image directory for labelling'}
                                  </p>
                                </div>
                                <button 
                                  onClick={handleSelectDirectory}
                                  className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                  {isAutoLoading ? <RotateCcw size={14} className="animate-spin" /> : <FolderOpen size={14} />}
                                  {datasetPath && datasetPath !== 'Blip-C Empty' ? 'Reconnect Directory' : 'Select Images Folder'}
                                </button>
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

        {/* Right Labeling Panel */}
        {activeView === 'labeling' && (
          <aside className={`w-[480px] bg-white border-l border-outline-variant flex flex-col shrink-0 p-6 transition-all duration-500 ease-in-out ${isTheaterMode ? '-mr-[480px] opacity-0' : ''}`} 
            style={{ opacity: isFinished ? 0.3 : (isTheaterMode ? 0 : 1), pointerEvents: isFinished || isTheaterMode ? 'none' : 'auto' }}
          >
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-on-surface">Categories</h3>
              <p className="text-sm text-on-surface-variant mt-1 italic">Assign label to image</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (sessionStartTime) {
                    // Just pause the session, don't fully commit to recordMetrics yet 
                    // handleTimerToggle will do the accumulation
                    handleTimerToggle();
                  }
                  setShowTutorial(true);
                }}
                className="p-2 text-on-surface-variant hover:bg-surface-variant/5 hover:text-primary rounded-xl transition-all border border-transparent"
                title="Show Tutorial"
              >
                <Info size={20} />
              </button>

              <button 
                onClick={handleTimerToggle}
                disabled={imageFiles.length === 0}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                  imageFiles.length === 0 
                    ? 'bg-outline-variant/10 text-outline border-transparent cursor-not-allowed' 
                    : sessionStartTime 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                }`}
                title={imageFiles.length === 0 ? "Connect dataset to start timer" : sessionStartTime ? "Pause Timer" : "Resume Timer"}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${imageFiles.length === 0 ? 'bg-outline-variant' : sessionStartTime ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                {sessionStartTime ? 'Running' : (imageFiles.length === 0 ? 'Disconnected' : 'Paused / Start')}
              </button>
              {Object.keys(annotations).length > 0 && (
                <div className="flex gap-1">
                  <button 
                    onClick={downloadCSV}
                    className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20"
                    title="Download CSV of current progress"
                  >
                    <Save size={20} />
                  </button>
                  <button 
                    onClick={handleResetProgress}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                    title="Clear all labels and timer progress"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
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
                className="flex-1 space-y-4 overflow-y-auto px-2 py-4 no-scrollbar"
              >
                {localCategories.map((cat, index) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-[calc(100%-0.5rem)] mx-auto text-left py-7 px-6 rounded-[28px] border transition-all relative group flex justify-between items-center ${
                      selectedCategories.includes(cat.id) 
                        ? `${cat.bg} ${cat.border} shadow-xl scale-[1.02] ring-4 ${cat.ring}` 
                        : `bg-background border-transparent hover:bg-white hover:border-outline-variant/30 transition-all duration-300`
                    }`}
                    style={selectedCategories.includes(cat.id) ? { boxShadow: `0 20px 25px -5px ${cat.accent}20, 0 8px 10px -6px ${cat.accent}20` } : {}}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-black w-4 h-4 rounded-md flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id) ? `${cat.bg} ${cat.color} border ${cat.border}` : 'bg-outline-variant/10 text-on-surface-variant'}`}>
                          {index + 1}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${selectedCategories.includes(cat.id) ? cat.color : 'text-on-surface-variant'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className={`text-base font-medium transition-colors leading-tight ${selectedCategories.includes(cat.id) ? 'text-on-surface' : 'text-on-surface/60 group-hover:text-on-surface'}`}>
                        {cat.desc}
                      </span>
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

          <div className="mt-8 pt-8 border-t border-outline-variant space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Active Classes ({selectedCategories.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map(id => {
                    const cat = localCategories.find(c => c.id === id);
                    if (id === -1) {
                      return (
                        <span key={id} className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-200">
                          No Label
                        </span>
                      );
                    }
                    return (
                      <span key={id} className={`text-[10px] font-bold ${cat?.bg} ${cat?.color} px-2 py-0.5 rounded-full border ${cat?.border} opacity-80`}>
                        {cat?.name}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm font-bold text-outline opacity-40">NONE</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => currentImage > 1 && setCurrentImage(prev => prev - 1)}
                  disabled={currentImage <= 1}
                  className="px-4 py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] border border-outline-variant text-on-surface-variant hover:bg-background transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  title="Go back to previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleNoLabel}
                  disabled={!sessionStartTime}
                  className="flex-1 py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all active:scale-95 whitespace-nowrap disabled:opacity-30 disabled:pointer-events-none"
                >
                  No Label
                </button>
              </div>
              <button 
                onClick={handleApply}
                disabled={!sessionStartTime || selectedCategories.length === 0}
                className={`w-full py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] transition-all ${
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
        )}
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
                      <div className="w-12 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">Shift A</div>
                      Toggle Analytics
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
    </div>
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
