import { useState, useRef, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Code2, Sparkles, Upload, X, Image, Clock, Menu, Edit2, Trash2, Settings,
  Moon, Sun, Save, Copy, Download, UploadCloud, FolderPlus, FolderOpen,
  Undo2, Redo2, ChevronRight, ChevronLeft, MoreHorizontal, Check, Star,
  RefreshCw, Pencil, Play,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PromptInputProps {
  defaultPrompt: string;
  jsonPrompt: Record<string, unknown>;
  onGenerate: (customPrompt: string, jsonPrompt: Record<string, unknown>, sourceImage?: string) => void;
  isGenerating: boolean;
}

interface RecentPrompt {
  id: string;
  name?: string;
  prompt: string;
  json: Record<string, unknown>;
  sourceImage?: string | null;
  timestamp: number;
}

interface SavedProfile {
  id: string;
  name: string;
  json: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

interface SavedTemplate {
  id: string;
  name: string;
  prompt: string;
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

type Theme = "light" | "dark";

type HistorySnapshot = {
  id: string;
  prompt: string;
  json: Record<string, unknown>;
  sourceImage?: string | null;
};

const LS_KEYS = {
  THEME: "app.theme",
  RECENTS: "imagegen.recents.v1",
  PROFILES: "imagegen.profiles.v1",
  TEMPLATES: "imagegen.templates.v1",
  AUTO_SYNC: "imagegen.autosync.v1",
  FORMAT: "imagegen.format.v1",
};

function parseJSON<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const PromptInput = ({ defaultPrompt, jsonPrompt, onGenerate, isGenerating }: PromptInputProps) => {
  const [customPrompt, setCustomPrompt] = useState(defaultPrompt);
  const [customJsonPrompt, setCustomJsonPrompt] = useState(JSON.stringify(jsonPrompt, null, 2));
  const [showJson, setShowJson] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoSync, setAutoSync] = useState(() => {
    const stored = localStorage.getItem(LS_KEYS.AUTO_SYNC);
    return stored !== null ? stored === "true" : true;
  });
  
  useEffect(() => {
    localStorage.setItem(LS_KEYS.AUTO_SYNC, String(autoSync));
  }, [autoSync]);

  const [selectedFormat, setSelectedFormat] = useState<string>(() => {
    const stored = localStorage.getItem(LS_KEYS.FORMAT);
    return stored || "square";
  });
  
  useEffect(() => {
    localStorage.setItem(LS_KEYS.FORMAT, selectedFormat);
  }, [selectedFormat]);
  
  const formatOptions = [
    {
      id: "square",
      name: "Square (1:1)",
      ratio: "1:1",
      icon: "⬜",
      description: "Perfect for Instagram feed posts and Facebook",
      platform: "Instagram Post",
      dimensions: "1080x1080px",
      bestFor: "Product showcases, quotes, announcements - works great on all feeds"
    },
    {
      id: "landscape",
      name: "Landscape (16:9)",
      ratio: "16:9",
      icon: "▭",
      description: "Ideal for YouTube, LinkedIn articles, and presentations",
      platform: "YouTube Thumbnail",
      dimensions: "1920x1080px",
      bestFor: "Video thumbnails, blog headers, wide promotional banners"
    },
    {
      id: "portrait",
      name: "Portrait (4:5)",
      ratio: "4:5",
      icon: "▯",
      description: "Optimized for Instagram and Facebook stories",
      platform: "Instagram Story",
      dimensions: "1080x1350px",
      bestFor: "Story ads, vertical videos, mobile-first content"
    },
    {
      id: "wide",
      name: "Wide (21:9)",
      ratio: "21:9",
      icon: "▬",
      description: "Best for website headers and cover photos",
      platform: "Banner/Header",
      dimensions: "2560x1080px",
      bestFor: "Website banners, Twitter headers, LinkedIn cover images"
    }
  ];
  
  const [editingSource, setEditingSource] = useState<{ type: 'recent' | 'profile' | 'template', id: string, name: string } | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    const stored = (typeof window !== "undefined" && window.localStorage?.getItem(LS_KEYS.THEME)) as Theme | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    window.localStorage?.setItem(LS_KEYS.THEME, theme);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast({ title: "Theme updated", description: `Switched to ${newTheme} mode` });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generatePromptFromJson = (jsonData: Record<string, unknown>): string => {
    const parts: string[] = [];
    Object.entries(jsonData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        const formattedKey = key.replace(/([A-Z])/g, " $1").toLowerCase();
        if (Array.isArray(value)) {
          parts.push(`${formattedKey}: ${value.join(", ")}`);
        } else if (typeof value === "object") {
          parts.push(`${formattedKey}: ${JSON.stringify(value)}`);
        } else {
          parts.push(`${formattedKey}: ${value}`);
        }
      }
    });
    return parts.join(". ");
  };

  const handleJsonChange = (value: string) => {
    setCustomJsonPrompt(value);
    try {
      const parsedJson = JSON.parse(value);
      setJsonError(null);
      
      if (autoSync) {
        const generatedPrompt = generatePromptFromJson(parsedJson);
        setCustomPrompt(generatedPrompt);
      }
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
  };

  const parsePromptToJson = (promptText: string): Record<string, unknown> => {
    try {
      const currentJson = JSON.parse(customJsonPrompt);
      const newJson: Record<string, unknown> = { ...currentJson };
      
      const segments = promptText.split(/[.,;]/).map(s => s.trim()).filter(s => s);
      
      segments.forEach(segment => {
        const match = segment.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          
          const camelKey = key.replace(/\s+(\w)/g, (_, letter) => letter.toUpperCase()).replace(/\s+/g, '');
          
          if (value.includes(',') && !value.includes('{')) {
            newJson[camelKey] = value.split(',').map(v => v.trim());
          } else {
            newJson[camelKey] = value;
          }
        }
      });
      
      return newJson;
    } catch {
      try {
        return JSON.parse(customJsonPrompt);
      } catch {
        return {};
      }
    }
  };

  const handlePromptChange = (value: string) => {
    setCustomPrompt(value);
    
    if (autoSync) {
      try {
        const updatedJson = parsePromptToJson(value);
        const jsonString = JSON.stringify(updatedJson, null, 2);
        
        if (jsonString !== customJsonPrompt) {
          setCustomJsonPrompt(jsonString);
          setJsonError(null);
        }
      } catch (e) {
        // Silent fail
      }
    }
  };

  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>(() => 
    parseJSON<RecentPrompt[]>(localStorage.getItem(LS_KEYS.RECENTS), [])
  );

  useEffect(() => {
    localStorage.setItem(LS_KEYS.RECENTS, JSON.stringify(recentPrompts));
  }, [recentPrompts]);

  const saveToRecentPrompts = (prompt: string, jsonObj: Record<string, unknown>, source?: string | null, name?: string) => {
    if (!prompt.trim()) return;
    const newItem: RecentPrompt = {
      id: crypto.randomUUID(),
      name,
      prompt: prompt.trim(),
      json: jsonObj,
      sourceImage: source ?? null,
      timestamp: Date.now(),
    };
    setRecentPrompts((prev) => {
      const deduped = prev.filter((p) => !(p.prompt === newItem.prompt && JSON.stringify(p.json) === JSON.stringify(newItem.json)));
      return [newItem, ...deduped].slice(0, 50);
    });
  };

  const updateRecentPrompt = (id: string, patch: Partial<Pick<RecentPrompt, "name" | "prompt" | "json" | "sourceImage">>) => {
    setRecentPrompts((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteRecentPrompt = (id: string) => {
    setRecentPrompts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Deleted", description: "Prompt removed from history" });
  };

  const clearAllPrompts = () => {
    setRecentPrompts([]);
    toast({ title: "Cleared", description: "All recent prompts removed" });
  };

  const formatTimestamp = (ms: number) => {
    const date = new Date(ms);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const loadRecentForEditing = (item: RecentPrompt) => {
    setCustomPrompt(item.prompt);
    setCustomJsonPrompt(JSON.stringify(item.json, null, 2));
    setSourceImage(item.sourceImage ?? null);
    
    const savedFormat = formatOptions.find(f => f.ratio === (item.json as Record<string, unknown>).aspectRatio);
    if (savedFormat) {
      setSelectedFormat(savedFormat.id);
    }
    
    setEditingSource({ type: 'recent', id: item.id, name: item.name || 'Recent prompt' });
    setShowJson(true);
    toast({ 
      title: "Loaded for editing", 
      description: `${item.name || 'Recent prompt'} - Make changes and regenerate`,
      duration: 3000 
    });
  };

  const createVariation = (item: RecentPrompt) => {
    setCustomPrompt(item.prompt);
    setCustomJsonPrompt(JSON.stringify(item.json, null, 2));
    setSourceImage(item.sourceImage ?? null);
    
    const savedFormat = formatOptions.find(f => f.ratio === (item.json as Record<string, unknown>).aspectRatio);
    if (savedFormat) {
      setSelectedFormat(savedFormat.id);
    }
    
    setEditingSource({ type: 'recent', id: crypto.randomUUID(), name: `${item.name || 'Variation'}` });
    setShowJson(true);
    toast({ 
      title: "Variation created", 
      description: "Modify the settings and generate a new version" 
    });
  };

  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(customJsonPrompt);
      const snap: HistorySnapshot = { id: crypto.randomUUID(), prompt: customPrompt, json: parsed, sourceImage };
      setHistory((prev) => {
        const last = prev[0];
        if (last && JSON.stringify(last.json) === JSON.stringify(snap.json) && last.prompt === snap.prompt && last.sourceImage === snap.sourceImage) {
          return prev;
        }
        return [snap, ...prev].slice(0, 100);
      });
      setRedoStack([]);
    } catch {
      // Ignore invalid JSON while user is typing
    }
  }, [customJsonPrompt, customPrompt, sourceImage]);

  const canUndo = history.length > 1;
  const canRedo = redoStack.length > 0;

  const handleUndo = () => {
    if (!canUndo) return;
    const [current, ...rest] = history;
    const prev = rest[0];
    setRedoStack((r) => [current, ...r]);
    setHistory(rest);
    setCustomPrompt(prev.prompt);
    setCustomJsonPrompt(JSON.stringify(prev.json, null, 2));
    setSourceImage(prev.sourceImage ?? null);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const [next, ...restRedo] = redoStack;
    setHistory((h) => [next, ...h]);
    setRedoStack(restRedo);
    setCustomPrompt(next.prompt);
    setCustomJsonPrompt(JSON.stringify(next.json, null, 2));
    setSourceImage(next.sourceImage ?? null);
  };

  const [profiles, setProfiles] = useState<SavedProfile[]>(() => 
    parseJSON<SavedProfile[]>(localStorage.getItem(LS_KEYS.PROFILES), [])
  );
  const [templates, setTemplates] = useState<SavedTemplate[]>(() => 
    parseJSON<SavedTemplate[]>(localStorage.getItem(LS_KEYS.TEMPLATES), [])
  );

  useEffect(() => localStorage.setItem(LS_KEYS.PROFILES, JSON.stringify(profiles)), [profiles]);
  useEffect(() => localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(templates)), [templates]);

  const saveProfile = (name: string, jsonObj?: Record<string, unknown>) => {
    try {
      const jsonData = jsonObj ?? JSON.parse(customJsonPrompt);
      const now = Date.now();
      const p: SavedProfile = { 
        id: crypto.randomUUID(), 
        name: name.trim() || "Untitled Profile", 
        json: jsonData, 
        createdAt: now, 
        updatedAt: now 
      };
      setProfiles((prev) => [p, ...prev].slice(0, 200));
      toast({ title: "Profile saved", description: p.name });
    } catch {
      toast({ title: "Invalid JSON", description: "Fix JSON before saving as profile", variant: "destructive" });
    }
  };

  const renameProfile = (id: string, name: string) => 
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p)));
  
  const deleteProfile = (id: string) => 
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  
  const toggleFavoriteProfile = (id: string) => 
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));

  const applyProfile = (id: string) => {
    const prof = profiles.find((p) => p.id === id);
    if (!prof) return;
    const generated = generatePromptFromJson(prof.json);
    setCustomJsonPrompt(JSON.stringify(prof.json, null, 2));
    setCustomPrompt(generated);
    setEditingSource({ type: 'profile', id: prof.id, name: prof.name });
    setShowJson(true);
    toast({ title: "Profile loaded", description: `${prof.name} - Edit and regenerate` });
  };

  const saveTemplate = (name: string, promptText?: string) => {
    const ptxt = (promptText ?? customPrompt).trim();
    if (!ptxt) return toast({ title: "Empty prompt", description: "Write a prompt to save as template", variant: "destructive" });
    const now = Date.now();
    const t: SavedTemplate = { 
      id: crypto.randomUUID(), 
      name: name.trim() || "Untitled Template", 
      prompt: ptxt, 
      createdAt: now, 
      updatedAt: now 
    };
    setTemplates((prev) => [t, ...prev].slice(0, 200));
    toast({ title: "Template saved", description: t.name });
  };

  const renameTemplate = (id: string, name: string) => 
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, name, updatedAt: Date.now() } : t)));
  
  const deleteTemplate = (id: string) => 
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  
  const toggleFavoriteTemplate = (id: string) => 
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)));

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setCustomPrompt(t.prompt);
    setEditingSource({ type: 'template', id: t.id, name: t.name });
    toast({ title: "Template loaded", description: `${t.name} - Edit and regenerate` });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ profiles, templates }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imagegen-presets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const handleImportClick = () => hiddenFileInput.current?.click();
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const importedProfiles = Array.isArray(data?.profiles) ? (data.profiles as SavedProfile[]) : [];
        const importedTemplates = Array.isArray(data?.templates) ? (data.templates as SavedTemplate[]) : [];
        setProfiles((prev) => [...importedProfiles, ...prev].slice(0, 300));
        setTemplates((prev) => [...importedTemplates, ...prev].slice(0, 300));
        toast({ title: "Imported", description: `${importedProfiles.length} profiles, ${importedTemplates.length} templates` });
      } catch {
        toast({ title: "Import failed", description: "Invalid file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image smaller than 10MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSourceImage(result);
      toast({ title: "Image uploaded!", description: "Your image will be used as a reference" });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) handleImageFile(file);
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste as unknown as EventListener);
    return () => document.removeEventListener("paste", handlePaste as unknown as EventListener);
  }, []);

  const removeSourceImage = () => {
    setSourceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({ title: "Image removed" });
  };

  const handleGenerate = () => {
    try {
      const parsedJson = JSON.parse(customJsonPrompt);
      
      const selectedFormatData = formatOptions.find(f => f.id === selectedFormat);
      const jsonWithFormat = {
        ...parsedJson,
        aspectRatio: selectedFormatData?.ratio,
        format: selectedFormatData?.name,
        dimensions: selectedFormatData?.dimensions,
        platform: selectedFormatData?.platform
      };
      
      saveToRecentPrompts(customPrompt, jsonWithFormat, sourceImage, editingSource?.name);
      onGenerate(customPrompt, jsonWithFormat, sourceImage || undefined);
      setEditingSource(null);
    } catch (e) {
      setJsonError("Cannot generate with invalid JSON");
    }
  };

  const sidebarWidth = sidebarOpen ? "w-full md:w-96" : "w-0";

  const sortedRecents = useMemo(() => {
    const favs = recentPrompts.filter((r) => !!r.name).slice(0, 100);
    const rest = recentPrompts.filter((r) => !r.name);
    return [...favs, ...rest];
  }, [recentPrompts]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarWidth} fixed md:relative inset-y-0 left-0 z-50 transition-all duration-300 border-r border-border/50 bg-background/95 md:bg-background/80 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleImageFile(file);
        }}
      >
        <div className="p-4 flex items-center gap-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="h-10 w-10 p-0 hover:bg-primary/10 rounded-xl transition-all hover:scale-105"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Async Studio</h2>
              <p className="text-xs text-muted-foreground">2.5 Flash</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="history" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <TabsList className="grid grid-cols-3 w-full rounded-xl">
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</h3>
              {recentPrompts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={clearAllPrompts} className="h-7 px-2 text-xs rounded-lg">
                    Clear all
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExport}><Download className="w-4 h-4 mr-2"/>Export presets</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleImportClick}><UploadCloud className="w-4 h-4 mr-2"/>Import presets</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input ref={hiddenFileInput} type="file" accept="application/json" onChange={handleImport} className="hidden" />
                </div>
              )}
            </div>

            {sortedRecents.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No recent generations</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Your history will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedRecents.map((item) => (
                  <div key={item.id} className="group px-3 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all relative">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Input
                            defaultValue={item.name || ""}
                            placeholder="Add a title"
                            className="h-7 text-xs rounded-md w-44"
                            onBlur={(e) => updateRecentPrompt(item.id, { name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            }}
                          />
                          {item.sourceImage && <Badge variant="secondary" className="text-[10px]">IMG</Badge>}
                          {(item.json as Record<string, unknown>).aspectRatio && (
                            <Badge variant="outline" className="text-[10px]">
                              {(item.json as Record<string, unknown>).aspectRatio as string}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">· {formatTimestamp(item.timestamp)}</span>
                        </div>
                        <p className="text-xs line-clamp-2 text-muted-foreground mb-2">{item.prompt}</p>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 rounded-lg bg-primary hover:bg-primary/90"
                            onClick={() => loadRecentForEditing(item)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit & Remix
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 rounded-lg"
                            onClick={() => createVariation(item)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Variation
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                const clone: RecentPrompt = { ...item, id: crypto.randomUUID(), timestamp: Date.now(), name: (item.name ? item.name + " (copy)" : undefined) };
                                setRecentPrompts((prev) => [clone, ...prev]);
                              }}><Copy className="w-4 h-4 mr-2"/>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => saveProfile(item.name || "From history", item.json)}><FolderPlus className="w-4 h-4 mr-2"/>Save as profile</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => saveTemplate(item.name || "From history", item.prompt)}><Save className="w-4 h-4 mr-2"/>Save as template</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteRecentPrompt(item.id)}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profiles" className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saved Profiles</h3>
              <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => saveProfile("New Profile")}> 
                <FolderPlus className="w-4 h-4 mr-1"/> Save current 
              </Button>
            </div>
            {profiles.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <FolderPlus className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground/80">No profiles yet. Save your current JSON options to reuse later.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profiles.map((p) => (
                  <div key={p.id} className="px-3 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="flex items-start gap-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg mt-0.5" onClick={() => toggleFavoriteProfile(p.id)}>
                        <Star className={`w-4 h-4 ${p.favorite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <Input
                          defaultValue={p.name}
                          className="h-8 rounded-md text-sm font-medium mb-2"
                          onBlur={(e) => renameProfile(p.id, e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="h-7 rounded-lg" variant="default" onClick={() => applyProfile(p.id)}>
                            <Edit2 className="w-3.5 h-3.5 mr-1"/> Load & Edit
                          </Button>
                          <Button size="sm" className="h-7 rounded-lg" variant="outline" onClick={() => saveTemplate(p.name, generatePromptFromJson(p.json))}>
                            <Save className="w-3.5 h-3.5 mr-1"/> As template
                          </Button>
                          <Button size="sm" className="h-7 rounded-lg" variant="ghost" onClick={() => deleteProfile(p.id)}>
                            <Trash2 className="w-3.5 h-3.5"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saved Templates</h3>
              <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => saveTemplate("New Template")}> 
                <Save className="w-4 h-4 mr-1"/> Save current 
              </Button>
            </div>
            {templates.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Save className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground/80">No templates yet. Save your current natural-language prompt to reuse later.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <div key={t.id} className="px-3 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="flex items-start gap-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg mt-0.5" onClick={() => toggleFavoriteTemplate(t.id)}>
                        <Star className={`w-4 h-4 ${t.favorite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"}`} />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <Input
                          defaultValue={t.name}
                          className="h-8 rounded-md text-sm font-medium mb-2"
                          onBlur={(e) => renameTemplate(t.id, e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        />
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{t.prompt}</p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="h-7 rounded-lg" variant="default" onClick={() => applyTemplate(t.id)}>
                            <Edit2 className="w-3.5 h-3.5 mr-1"/> Load & Edit
                          </Button>
                          <Button size="sm" className="h-7 rounded-lg" variant="ghost" onClick={() => deleteTemplate(t.id)}>
                            <Trash2 className="w-3.5 h-3.5"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="w-full justify-start gap-3 h-11 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all group border border-transparent hover:border-primary/20"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/20 group-hover:to-primary/5 transition-all">
              <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-between gap-2 md:gap-3 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9 md:h-10 md:w-10 p-0 rounded-xl hover:bg-primary/10 transition-all hover:scale-105"
              >
                <Menu className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Image Generator</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="sm" disabled={!canUndo} onClick={handleUndo} className="h-8 md:h-9 rounded-lg px-2 md:px-3">
              <Undo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline ml-1">Undo</span>
            </Button>
            <Button variant="ghost" size="sm" disabled={!canRedo} onClick={handleRedo} className="h-8 md:h-9 rounded-lg px-2 md:px-3">
              <Redo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline ml-1">Redo</span>
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 rounded-full border border-border/50">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="font-semibold text-xs sm:text-sm">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="hidden md:inline text-muted-foreground/50">•</span>
            <span className="hidden md:inline text-xs sm:text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 md:space-y-6">
          {editingSource && (
            <Alert className="border-primary/50 bg-primary/5">
              <Edit2 className="h-4 w-4 text-primary" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  <strong>Editing:</strong> {editingSource.name} • Make your changes and click Generate
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditingSource(null)}
                  className="h-7"
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-4 md:p-8 space-y-4 md:space-y-6 shadow-2xl bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/50 hover:border-primary/30 transition-all">
            <div className="space-y-3">
              <Label className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                Custom Prompt
              </Label>
              <Textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder={autoSync 
                  ? "Describe your vision... (Use format: subject: value, style: value, colors: red, blue, green)"
                  : "Describe your vision... (Auto-sync disabled - edit freely)"
                }
                rows={5}
                className="resize-none min-h-[200px] rounded-2xl border-2 border-border/50 bg-gradient-to-br from-muted/50 to-muted/20 px-6 py-5 text-base focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all placeholder:text-muted-foreground/60"
              />

              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="rounded-lg h-8 md:h-9" onClick={() => saveTemplate(editingSource?.name || "Quick Template")}> 
                    <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline ml-1">Save as Template</span>
                    <span className="sm:hidden ml-1">Template</span>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg h-8 md:h-9" onClick={() => saveProfile(editingSource?.name || "Quick Profile")}> 
                    <FolderPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline ml-1">Save JSON as Profile</span>
                    <span className="sm:hidden ml-1">Profile</span>
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant={autoSync ? "default" : "outline"}
                  className="rounded-lg h-8 md:h-9"
                  onClick={() => {
                    setAutoSync(!autoSync);
                    toast({
                      title: autoSync ? "Auto-sync disabled" : "Auto-sync enabled",
                      description: autoSync ? "Manual editing only" : "Prompt ↔ JSON sync active"
                    });
                  }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${autoSync ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-1">{autoSync ? "Syncing" : "Sync Off"}</span>
                  <span className="sm:hidden ml-1">Sync</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
              {!sourceImage ? (
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl">
                  <Image className="w-4 h-4 mr-2" /> Attach reference image
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="rounded-xl" onClick={() => fileInputRef.current?.click()}>
                    <Image className="w-4 h-4 mr-2"/> Replace image
                  </Button>
                  <Button variant="ghost" className="rounded-xl" onClick={removeSourceImage}>
                    <X className="w-4 h-4 mr-2"/> Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3 md:space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Label className="text-base md:text-lg font-bold">Choose Your Format</Label>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Select the aspect ratio optimized for your target platform</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {formatOptions.map((format) => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`cursor-pointer p-4 md:p-5 rounded-xl border-2 transition-all hover:shadow-md active:scale-95 ${
                      selectedFormat === format.id
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={`text-2xl md:text-3xl mt-1 transition-transform ${selectedFormat === format.id ? "scale-110" : ""}`}>
                        {format.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm md:text-base">{format.name}</h3>
                          {selectedFormat === format.id && (
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-[11px] md:text-xs text-muted-foreground mb-2 md:mb-3">{format.description}</p>
                        
                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[9px] md:text-[10px]">
                              {format.platform}
                            </Badge>
                            <span className="text-[9px] md:text-[10px] text-muted-foreground">{format.dimensions}</span>
                          </div>
                          
                          <div className="pt-1 border-t border-border/30">
                            <p className="text-[9px] md:text-[10px] font-medium text-muted-foreground">Best For:</p>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground/80 mt-0.5">{format.bestFor}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !customPrompt.trim() || !!jsonError}
              className="w-full bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/70 text-white font-semibold py-5 md:py-7 text-base md:text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 animate-spin" />
                  <span className="animate-pulse text-sm md:text-base">Generating...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                  <Play className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
                  <span className="text-sm md:text-base">
                    {editingSource 
                      ? `Regenerate ${editingSource.name}` 
                      : (sourceImage ? "Transform Image" : "Generate With Async")
                    }
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-[10px] md:text-xs">
                    {formatOptions.find(f => f.id === selectedFormat)?.ratio}
                  </Badge>
                </div>
              )}
            </Button>
          </Card>

          <Collapsible open={showJson} onOpenChange={setShowJson}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all group">
                <Code2 className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
                {showJson ? "Hide" : "View"} JSON Prompt Data
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-6">
              <Card className="p-4 md:p-6 bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-border/50 shadow-lg">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Code2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      </div>
                      <h3 className="text-xs md:text-sm font-bold">Structured Prompt JSON</h3>
                      {autoSync && (
                        <Badge variant="secondary" className="text-[9px] md:text-[10px] flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          Auto-sync
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Button size="sm" variant="ghost" disabled={!canUndo} onClick={handleUndo} className="h-7 md:h-8 rounded-lg px-2">
                        <Undo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline ml-1 text-xs">Undo</span>
                      </Button>
                      <Button size="sm" variant="ghost" disabled={!canRedo} onClick={handleRedo} className="h-7 md:h-8 rounded-lg px-2">
                        <Redo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline ml-1 text-xs">Redo</span>
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={customJsonPrompt}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="font-mono text-xs min-h-[240px] resize-y bg-background/50 border-2 border-border/50 focus:border-primary rounded-xl"
                    placeholder="Edit JSON prompt..."
                  />
                  {jsonError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border-2 border-destructive/30 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <p className="text-xs text-destructive font-semibold">{jsonError}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="mt-0.5">💡</span>
                    <span>
                      {autoSync 
                        ? "Auto-sync enabled: Prompt and JSON automatically update each other. Use 'key: value' format in prompt for best results."
                        : "Auto-sync disabled: Edit prompt and JSON independently without automatic synchronization."
                      }
                    </span>
                  </p>
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/20 border-2">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              Settings
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">Customize your experience</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 md:space-y-8 py-2">
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-3 md:h-4 bg-primary rounded-full"></div>
                Appearance
              </h3>
              <RadioGroup value={theme} onValueChange={(value) => handleThemeChange(value as Theme)}>
                <div className="flex items-center space-x-3 md:space-x-4 p-4 md:p-5 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-3 md:gap-4 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200 shadow-lg">
                      <Sun className="w-6 h-6 md:w-7 md:h-7 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm md:text-base">Light Mode</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Bright and clear interface</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4 p-4 md:p-5 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-3 md:gap-4 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 shadow-lg">
                      <Moon className="w-6 h-6 md:w-7 md:h-7 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold text-sm md:text-base">Dark Mode</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Easy on the eyes</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-3 md:h-4 bg-primary rounded-full"></div>
                Presets
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={handleExport} className="rounded-xl text-xs md:text-sm h-9 md:h-10">
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"/>
                  <span className="hidden sm:inline">Export Profiles & Templates</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button variant="outline" onClick={handleImportClick} className="rounded-xl text-xs md:text-sm h-9 md:h-10">
                  <UploadCloud className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"/>Import
                </Button>
                <input ref={hiddenFileInput} type="file" accept="application/json" onChange={handleImport} className="hidden" />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-3 md:h-4 bg-primary rounded-full"></div>
                Editor Behavior
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all">
                <div className="flex-1">
                  <p className="font-medium text-xs md:text-sm">Automatic Prompt ↔ JSON Sync</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    When enabled, changes in the prompt or JSON automatically update each other bidirectionally
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={autoSync ? "default" : "outline"}
                  className="rounded-lg h-8 md:h-9 w-full sm:w-auto"
                  onClick={() => {
                    setAutoSync(!autoSync);
                    toast({
                      title: autoSync ? "Auto-sync disabled" : "Auto-sync enabled",
                      description: autoSync ? "Manual editing only" : "Prompt ↔ JSON sync active"
                    });
                  }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1 ${autoSync ? 'animate-spin' : ''}`} />
                  {autoSync ? "On" : "Off"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="px-6 py-4 rounded-2xl border-2 border-dashed border-primary bg-background shadow-xl text-sm">
            Drop an image to attach
          </div>
        </div>
      )}
    </div>
  );
};