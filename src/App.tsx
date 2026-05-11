/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Database, 
  Monitor, 
  Map as MapIcon, 
  Sword, 
  Presentation, 
  Layout, 
  FileText,
  HelpCircle,
  History,
  CheckCircle2,
  FolderOpen,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: 1, name: 'Projected Slides', desc: 'Visual presentation media', color: 'text-primary border-primary', bg: 'bg-[#F5F5F7]', ring: 'ring-primary/10' },
  { id: 2, name: 'Computer Screen', desc: 'LCD/OLED active displays', color: 'text-[#1D1D1F] border-[#E5E5E7]', bg: 'bg-[#F5F5F7]', ring: 'ring-outline-variant/30' },
  { id: 3, name: 'Map', desc: 'Cartographic references', color: 'text-orange-500 border-orange-200', bg: 'bg-orange-50', ring: 'ring-orange-100' },
  { id: 4, name: 'Wargaming', desc: 'Tactical sandbox models', color: 'text-gray-600 border-gray-200', bg: 'bg-gray-50', ring: 'ring-gray-100' },
  { id: 5, name: 'Whiteboard', desc: 'Marker-based vertical surfaces', color: 'text-blue-400 border-blue-100', bg: 'bg-blue-50', ring: 'ring-blue-100' },
  { id: 6, name: 'Printed Paper', desc: 'Hardcopy physical documents', color: 'text-gray-400 border-gray-100', bg: 'bg-gray-50', ring: 'ring-gray-100' },
];

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [annotations, setAnnotations] = useState<Record<number, number[]>>({});
  const [currentImage, setCurrentImage] = useState(1);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userName, setUserName] = useState('');
  const totalImages = 50;

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (selectedCategories.length === 0) return;
    
    // Store annotation
    setAnnotations(prev => ({ ...prev, [currentImage]: selectedCategories }));
    
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
    
    let csvContent = 'ImageID,Labels\n';
    Object.entries(annotations).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([id, ids]) => {
      const labels = ids.map(lid => CATEGORIES.find(c => c.id === lid)?.name).join('; ');
      csvContent += `${id},"${labels}"\n`;
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

  // Auto-save logic every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      triggerSave();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/10">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Icon Rail */}
        <aside className="w-sidebar bg-white border-r border-outline-variant flex flex-col items-center py-8 gap-8 shrink-0">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Layout size={22} className="text-white" />
          </div>
          
          <nav className="flex flex-col items-center gap-6 opacity-40">
            <SidebarRailItem icon={<Presentation size={24} />} />
            <SidebarRailItem icon={<Monitor size={24} />} active />
            <SidebarRailItem icon={<MapIcon size={24} />} />
            <SidebarRailItem icon={<Sword size={24} />} />
            <SidebarRailItem icon={<FileText size={24} />} />
          </nav>

          <div className="mt-auto flex flex-col items-center gap-6 opacity-40">
            <SidebarRailItem icon={<HelpCircle size={24} />} />
            <SidebarRailItem icon={<History size={24} />} />
          </div>
        </aside>

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
                <div className="px-margin-edge pt-8 flex items-end justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-on-surface-variant mb-1 group cursor-default">
                      <FolderOpen size={14} className="group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Directory: /datasets/satellite_alpha_v4</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-on-surface">Extraction Node {currentImage.toString().padStart(2, '0')}</h1>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Progress Counter */}
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">{currentImage} / {totalImages} COMPLETE</span>
                      <div className="w-48 h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${(currentImage / totalImages) * 100}%` }} />
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

                <div className="flex-1 p-margin-edge flex items-center justify-center">
                  <div className="relative w-full h-full bg-white border border-outline-variant shadow-sm rounded-[32px] overflow-hidden flex items-center justify-center group">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq4dwfjkAVwjVo6EMRO8LNGWa9PmjxUiyp6sVD2kRAiM_LcVaDWUhTCgeUENJe8HNGW1EW04OQ90M5TaNZlAOEqxapmbHXaudjN5-1-n8rOUxfCNIbK7ZwXNNSsVFVodHWI16QOZ61QpkPDHwWdTQIyCmvl2koxyPb92ibESX9VFjJxTFIBBN13w5Iy35dGiUpsjFhMyAUdhFEf9aFnV078Fx0D78Tlc9WC4kK_rekskcyv-gIGQyI6nmnvrNFJxsT4cdkTtzL55M" 
                      alt="Workspace" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Canvas Controls Overlay */}
                    <div className="absolute top-8 right-8 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/90 backdrop-blur-md border border-outline-variant rounded-2xl p-2 flex gap-1 shadow-xl">
                        <CanvasControlButton icon={<ZoomIn size={20} />} />
                        <CanvasControlButton icon={<ZoomOut size={20} />} />
                        <div className="w-px bg-outline-variant mx-1 self-stretch" />
                        <CanvasControlButton icon={<Maximize size={20} />} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Navigation (Simplified) */}
                <footer className="h-16 bg-white/30 backdrop-blur-sm border-t border-outline-variant px-margin-edge flex items-center justify-between shrink-0">
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
        <aside className="w-[360px] bg-white border-l border-outline-variant flex flex-col shrink-0 p-8 transition-opacity duration-300" 
          style={{ opacity: isFinished ? 0.3 : 1, pointerEvents: isFinished ? 'none' : 'auto' }}
        >
          <div className="mb-8">
            <h3 className="text-lg font-bold tracking-tight text-on-surface">Categories</h3>
            <p className="text-sm text-on-surface-variant mt-1 italic">Assign label to active region</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full text-left p-5 rounded-[24px] border border-transparent transition-all relative group flex justify-between items-center ${
                  selectedCategories.includes(cat.id) 
                    ? `bg-white border-outline shadow-xl shadow-gray-200/50 scale-[1.02] ring-4 ring-primary/5` 
                    : `bg-background hover:bg-white hover:border-outline-variant/50 transition-all duration-300`
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${selectedCategories.includes(cat.id) ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {cat.name}
                  </span>
                  <span className="text-sm font-medium text-on-surface/60 group-hover:text-on-surface transition-colors leading-tight">
                    {cat.desc}
                  </span>
                </div>
                {selectedCategories.includes(cat.id) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
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
            
            <button 
              onClick={handleApply}
              className={`w-full py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[11px] transition-all ${
              selectedCategories.length > 0 
                ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0.5' 
                : 'bg-outline-variant/30 text-outline cursor-not-allowed'
            }`}>
              Apply Extraction
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidebarRailItem({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <div className={`cursor-pointer transition-all hover:scale-110 active:scale-95 ${active ? 'text-primary opacity-100' : 'text-on-surface-variant hover:text-on-surface'}`}>
      {icon}
    </div>
  );
}

function CanvasControlButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all rounded active:scale-90">
      {icon}
    </button>
  );
}
