import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Code2, Sparkles, Upload, X, Image, Clock, Menu, Edit2, Trash2, Settings, Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

interface PromptInputProps {
  defaultPrompt: string;
  jsonPrompt: Record<string, unknown>;
  onGenerate: (customPrompt: string, jsonPrompt: Record<string, unknown>, sourceImage?: string) => void;
  isGenerating: boolean;
}

interface RecentPrompt {
  id: string;
  prompt: string;
  timestamp: Date;
}

type Theme = 'light' | 'dark';

export const PromptInput = ({ defaultPrompt, jsonPrompt, onGenerate, isGenerating }: PromptInputProps) => {
  const [customPrompt, setCustomPrompt] = useState(defaultPrompt);
  const [customJsonPrompt, setCustomJsonPrompt] = useState(JSON.stringify(jsonPrompt, null, 2));
  const [showJson, setShowJson] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRecentPrompts, setShowRecentPrompts] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = window.localStorage?.getItem('theme') as Theme;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (window.localStorage) {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const generatePromptFromJson = (jsonData: Record<string, unknown>): string => {
    const parts: string[] = [];
    Object.entries(jsonData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        if (Array.isArray(value)) {
          parts.push(`${formattedKey}: ${value.join(', ')}`);
        } else if (typeof value === 'object') {
          parts.push(`${formattedKey}: ${JSON.stringify(value)}`);
        } else {
          parts.push(`${formattedKey}: ${value}`);
        }
      }
    });
    return parts.join('. ');
  };

  const handleJsonChange = (value: string) => {
    setCustomJsonPrompt(value);
    try {
      const parsedJson = JSON.parse(value);
      setJsonError(null);
      const generatedPrompt = generatePromptFromJson(parsedJson);
      setCustomPrompt(generatedPrompt);
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
  };

  const saveToRecentPrompts = (prompt: string) => {
    if (!prompt.trim()) return;
    
    const newPrompt: RecentPrompt = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      timestamp: new Date(),
    };

    setRecentPrompts(prev => {
      const filtered = prev.filter(p => p.prompt !== prompt.trim());
      const updated = [newPrompt, ...filtered].slice(0, 10);
      return updated;
    });
  };

  const handleGenerate = () => {
    try {
      const parsedJson = JSON.parse(customJsonPrompt);
      saveToRecentPrompts(customPrompt);
      onGenerate(customPrompt, parsedJson, sourceImage || undefined);
    } catch (e) {
      setJsonError("Cannot generate with invalid JSON");
    }
  };

  const loadRecentPrompt = (prompt: string) => {
    setCustomPrompt(prompt);
    toast({
      title: "Prompt loaded",
      description: "Recent prompt has been loaded",
    });
  };

  const deleteRecentPrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentPrompts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Deleted",
      description: "Prompt removed from history",
    });
  };

  const clearAllPrompts = () => {
    setRecentPrompts([]);
    toast({
      title: "Cleared",
      description: "All recent prompts removed",
    });
  };

  const formatTimestamp = (date: Date) => {
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

  // Handles image file processing: validates type and size, then converts to base64 data URL
  const handleImageFile = (file: File) => {
    // Validate file type - only allow image files
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size - limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Convert file to base64 data URL for display and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSourceImage(result);
      toast({
        title: "Image uploaded!",
        description: "Your image will be used as a reference",
      });
    };
    reader.readAsDataURL(file);
  };

  // Removed drag and drop image file handlers as per user request
  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsDragging(true);
  // };

  // const handleDragLeave = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsDragging(false);
  // };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setIsDragging(false);
  //   const files = Array.from(e.dataTransfer.files);
  //   if (files.length > 0) handleImageFile(files[0]);
  // };

  // Handles clipboard paste event - extracts image from clipboard and processes it
  const handlePaste = (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) handleImageFile(file);
    }
  };

  // Handles file selection from input element - processes the first selected file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleImageFile(files[0]);
  };

  // Removes the currently selected source image and resets the file input
  const removeSourceImage = () => {
    setSourceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Image removed" });
  };

  // Set up global paste event listener for clipboard image support
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl`}>
        {/* Sidebar Header */}
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
              <h2 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Async</h2>
              <p className="text-xs text-muted-foreground">2.5 Flash</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-2xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all group border border-transparent hover:border-primary/20"
            onClick={() => {
              setCustomPrompt("");
              setSourceImage(null);
              setCustomJsonPrompt("{}");
              setJsonError(null);
              toast({ title: "New chat", description: "Ready for a new generation" });
            }}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all group-hover:scale-110">
              <Edit2 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">New chat</span>
          </Button>
        </div>

        {/* Recent Prompts List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-3 px-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</h3>
              {recentPrompts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllPrompts}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-lg"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {recentPrompts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No recent chats</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Your chat history will appear here</p>
              </div>
            ) : (
              recentPrompts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadRecentPrompt(item.prompt)}
                  className="group px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent cursor-pointer transition-all relative border border-transparent hover:border-primary/20 hover:shadow-sm"
                >
                  <p className="text-sm line-clamp-2 pr-8 mb-1 font-medium">{item.prompt}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteRecentPrompt(item.id, e)}
                    className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/20 hover:text-destructive rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings at Bottom */}
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
        {/* Top Menu Bar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 transition-all hover:scale-105"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Image Generator</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full border border-border/50">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{currentTime.toLocaleTimeString()}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <Card className="p-8 space-y-6 shadow-2xl bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/50 hover:border-primary/30 transition-all">
            {}

            <div className="space-y-3">
              <Label className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                Custom Prompt
              </Label>
              <div className="relative group">
                <Textarea
                  id="prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your vision..."
                  rows={5}
                  className="resize-none min-h-[200px] rounded-2xl border-2 border-border/50 bg-gradient-to-br from-muted/50 to-muted/20 px-6 py-5 pr-16 text-base focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all placeholder:text-muted-foreground/60"
                  style={{ paddingBottom: '3rem' }}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !customPrompt.trim() || !!jsonError}
              className="w-full bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/70 text-white font-semibold py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-6 h-6 mr-3 animate-spin" />
                  <span className="animate-pulse">Generating Magic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                  {sourceImage ? "Transform Image" : "Generate With Async"}
                </>
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
              <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-border/50 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold">Structured Prompt JSON</h3>
                  </div>
                  <Textarea
                    value={customJsonPrompt}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="font-mono text-xs min-h-[200px] resize-y bg-background/50 border-2 border-border/50 focus:border-primary rounded-xl"
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
                    <span>Edit the structured JSON data used to generate the AI prompt.</span>
                  </p>
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-background to-muted/20 border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              Settings
            </DialogTitle>
            <DialogDescription className="text-base">
              Customize your experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Appearance
              </h3>
              
              <RadioGroup value={theme} onValueChange={(value) => handleThemeChange(value as Theme)}>
                <div className="flex items-center space-x-4 p-5 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200 shadow-lg">
                      <Sun className="w-7 h-7 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-bold text-base">Light Mode</p>
                      <p className="text-sm text-muted-foreground">Bright and clear interface</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-4 p-5 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 shadow-lg">
                      <Moon className="w-7 h-7 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold text-base">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">Theme preference saved automatically</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};