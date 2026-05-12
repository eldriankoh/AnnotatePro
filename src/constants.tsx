import { 
  Presentation, 
  Monitor, 
  FileText, 
  Layout, 
  Map as MapIcon, 
  Swords 
} from 'lucide-react';

export const CATEGORIES = [
  { 
    id: 1, 
    key: 'projected_slides', 
    name: 'Projected Slides', 
    desc: 'Visual presentation media', 
    color: 'text-primary', 
    border: 'border-primary', 
    bg: 'bg-primary/5', 
    ring: 'ring-primary/20', 
    accent: '#0071E3', 
    icon: Presentation 
  },
  { 
    id: 2, 
    key: 'computer_screen', 
    name: 'Computer Screen', 
    desc: 'LCD/OLED active displays', 
    color: 'text-purple-600', 
    border: 'border-purple-600', 
    bg: 'bg-purple-50', 
    ring: 'ring-purple-100', 
    accent: '#9333ea', 
    icon: Monitor 
  },
  { 
    id: 6, 
    key: 'printed_papers', 
    name: 'Printed Paper', 
    desc: 'Hardcopy physical documents', 
    color: 'text-indigo-600', 
    border: 'border-indigo-600', 
    bg: 'bg-indigo-50', 
    ring: 'ring-indigo-100', 
    accent: '#4f46e5', 
    icon: FileText 
  },
  { 
    id: 5, 
    key: 'whiteboard', 
    name: 'Whiteboard', 
    desc: 'Marker-based vertical surfaces', 
    color: 'text-pink-500', 
    border: 'border-pink-500', 
    bg: 'bg-pink-50', 
    ring: 'ring-pink-100', 
    accent: '#ec4899', 
    icon: Layout 
  },
  { 
    id: 3, 
    key: 'map', 
    name: 'Map', 
    desc: 'Cartographic references', 
    color: 'text-orange-600', 
    border: 'border-orange-600', 
    bg: 'bg-orange-50', 
    ring: 'ring-orange-100', 
    accent: '#ea580c', 
    icon: MapIcon 
  },
  { 
    id: 4, 
    key: 'wargaming', 
    name: 'Wargaming', 
    desc: 'Tactical sandbox models', 
    color: 'text-emerald-600', 
    border: 'border-emerald-600', 
    bg: 'bg-emerald-50', 
    ring: 'ring-emerald-100', 
    accent: '#059669', 
    icon: Swords 
  },
];
