/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type ReactNode, type UIEvent } from 'react';
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
  EyeOff,
  Timer,
  Tv,
  Maximize2,
  Presentation,
  Monitor,
  Map as MapIcon,
  Swords,
  Layout,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

const CATEGORIES = [
  { id: 1, name: 'Projected Slides', desc: 'Visual presentation media', color: 'text-primary', border: 'border-primary', bg: 'bg-primary/5', ring: 'ring-primary/20', accent: '#0071E3', icon: Presentation },
  { id: 2, name: 'Computer Screen', desc: 'LCD/OLED active displays', color: 'text-purple-600', border: 'border-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100', accent: '#9333ea', icon: Monitor },
  { id: 3, name: 'Map', desc: 'Cartographic references', color: 'text-orange-600', border: 'border-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100', accent: '#ea580c', icon: MapIcon },
  { id: 4, name: 'Wargaming', desc: 'Tactical sandbox models', color: 'text-emerald-600', border: 'border-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100', accent: '#059669', icon: Swords },
  { id: 5, name: 'Whiteboard', desc: 'Marker-based vertical surfaces', color: 'text-pink-500', border: 'border-pink-500', bg: 'bg-pink-50', ring: 'ring-pink-100', accent: '#ec4899', icon: Layout },
  { id: 6, name: 'Printed Paper', desc: 'Hardcopy physical documents', color: 'text-indigo-600', border: 'border-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-100', accent: '#4f46e5', icon: FileText },
];

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [annotations, setAnnotations] = useState<Record<number, number[]>>({});
  const [annotationMetrics, setAnnotationMetrics] = useState<Record<number, { start: string, end: string, duration: number }>>({});
  const [accumulatedTimes, setAccumulatedTimes] = useState<Record<number, number>>({});
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [datasetPath, setDatasetPath] = useState(() => localStorage.getItem('dataset_path') || 'Blip-C Empty');
  const [currentImage, setCurrentImage] = useState(1);
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
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  const handleSelectDirectory = () => {
    if (directoryInputRef.current) {
      directoryInputRef.current.click();
    }
  };

  const handleDirectoryChange = (e: any) => {
    const files = e.target.files as FileList | null;
    if (files && files.length > 0) {
      // Filter for image files
      const newImageFiles = Array.from(files).filter((file: File) => 
        /\.(jpe?g|png|webp|tiff|bmp|svg)$/i.test(file.name)
      );
      
      if (newImageFiles.length > 0) {
        setImageFiles(newImageFiles);
        setTotalImages(newImageFiles.length);
        setCurrentImage(1);
        setSelectedCategories([]);
        // Hint the path from first file
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

    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleTimerToggle = () => {
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
    const durationSec = Math.round(finalDuration / 1000);
    
    const nowStr = new Date().toISOString();
    setAnnotationMetrics(prev => ({
      ...prev,
      [index]: {
        start: prev[index]?.start || nowStr,
        end: nowStr,
        duration: durationSec
      }
    }));

    // Reset accumulated for this image
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
    if (selectedCategories.length === 0) return;
    
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
    const safeName = userName.trim() || 'anonymous';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const filename = `annotations_${safeName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
    
    let csvContent = 'ImageIndex,Filename,Labels,StartTime,EndTime,DurationSeconds\n';
    Object.entries(annotations).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([id, ids]) => {
      const index = Number(id);
      const file = imageFiles[index - 1];
      const fileName = file ? file.name : `image_${id}`;
      const labels = (ids as number[]).map(lid => {
        if (lid === -1) return "No Label";
        return CATEGORIES.find(c => c.id === lid)?.name;
      }).join('; ');

      const metrics = annotationMetrics[index];
      const start = metrics?.start || '';
      const end = metrics?.end || '';
      const duration = metrics?.duration || 0;

      csvContent += `${id},"${fileName}","${labels}","${start}","${end}",${duration}\n`;
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
      } else if (e.key === 'ArrowLeft' && currentImage > 1) {
        setCurrentImage(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentImage < totalImages) {
        setCurrentImage(prev => prev + 1);
      } else if (e.key === '0') {
        e.preventDefault();
        if (!sessionStartTime) handleTimerToggle();
        handleNoLabel();
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
        if (!isNaN(num) && num > 0 && num <= CATEGORIES.length) {
          const category = CATEGORIES[num - 1];
          toggleCategory(category.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategories, currentImage, totalImages, annotations, sessionStartTime]);

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
      <div className="flex flex-1 overflow-hidden">
        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div 
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Header Dashboard Area */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isTheaterMode ? 'max-h-0 opacity-0 mb-0' : 'max-h-[200px] mb-4'}`}>
                  <div className="px-margin-edge pt-8 flex items-end justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-on-surface-variant mb-1 group">
                        <FolderOpen size={14} className="group-hover:text-primary transition-colors" />
                        <div className="flex items-center group/path">
                          <span className="text-[10px] font-bold tracking-widest uppercase mr-1 opacity-50">Directory:</span>
                          <input 
                            type="text"
                            value={datasetPath}
                            onChange={(e) => setDatasetPath(e.target.value)}
                            className="bg-transparent border-none p-0 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:text-primary transition-colors w-full min-w-[200px] hover:bg-outline-variant/10 px-1 rounded cursor-text"
                            placeholder="ENTER DIRECTORY PATH MANUALLY..."
                            title="Click to edit path manually (Browse restricted in preview)"
                          />
                          <button 
                            onClick={handleSelectDirectory}
                            className="ml-2 px-2 py-0.5 rounded border border-outline-variant hover:border-primary hover:text-primary transition-colors text-[9px] font-black tracking-tighter cursor-pointer whitespace-nowrap"
                            title="Browse directory (Cross-browser supported)"
                          >
                            BROWSE
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Progress Counter */}
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                          {totalImages === 0 ? 0 : currentImage} / {totalImages} COMPLETE
                        </span>
                        <div className="w-48 h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${totalImages === 0 ? 0 : Math.min(100, (currentImage / totalImages) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/30">
                        <AnimatePresence mode="wait">
                          {isSaving ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="flex items-center gap-2 text-primary"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Syncing...</span>
                            </motion.div>
                          ) : lastSaved && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              className="flex items-center gap-2 text-on-surface-variant"
                            >
                              <Save size={12} />
                              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">Last saved at {lastSaved}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 min-h-0 flex items-center justify-center transition-all duration-500 ease-in-out ${isTheaterMode ? 'p-0' : 'p-margin-edge'}`}>
                  <div 
                    ref={canvasRef}
                    className={`relative w-full h-full bg-white border border-outline-variant shadow-sm rounded-[32px] overflow-hidden flex items-center justify-center group transition-all duration-500 ${isFullScreen || isTheaterMode ? 'rounded-none border-none' : ''}`}
                  >
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
                                  <h3 className="text-xl font-bold tracking-tight text-on-surface/60">Waiting for Dataset</h3>
                                  <p className="text-sm font-medium">Please browse to image directory for labelling</p>
                                </div>
                                <button 
                                  onClick={handleSelectDirectory}
                                  className="px-8 py-3 bg-primary/5 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-full hover:bg-primary/10 transition-all active:scale-95"
                                >
                                  Select Images Folder
                                </button>
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
                      onClick={() => window.location.reload()}
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
                onClick={handleTimerToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${sessionStartTime ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                title={sessionStartTime ? "Pause Timer" : "Resume Timer"}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${sessionStartTime ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                {sessionStartTime ? 'Running' : 'Paused / Start'}
              </button>
              {Object.keys(annotations).length > 0 && (
                <button 
                  onClick={downloadCSV}
                  className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20"
                  title="Download CSV of current progress"
                >
                  <Save size={20} />
                </button>
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
              {CATEGORIES.map((cat, index) => (
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
                  selectedCategories.map(id => (
                    <span key={id} className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {CATEGORIES.find(c => c.id === id)?.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-bold text-outline opacity-40">NONE</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleNoLabel}
                className="flex-1 py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all active:scale-95 whitespace-nowrap"
              >
                No Label
              </button>
              <button 
                onClick={handleApply}
                className={`flex-[2] py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] transition-all ${
                  selectedCategories.length > 0 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0.5' 
                    : 'bg-outline-variant/30 text-outline cursor-not-allowed'
                }`}
              >
                Apply Extraction
              </button>
            </div>
          </div>
        </aside>
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
                <h2 className="text-3xl font-black tracking-tight text-on-surface text-center mb-4 uppercase">Labeling Workspace</h2>
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
                      <div className="w-6 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">Z</div>
                      Zoom Image
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-6 h-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center text-[10px] shadow-sm">T</div>
                      Theater Mode
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 text-center">Practice Arena (Try Keys 1-6)</h4>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat, idx) => {
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
