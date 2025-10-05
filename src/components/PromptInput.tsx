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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Apply theme on change
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

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleImageFile(files[0]);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) handleImageFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleImageFile(files[0]);
  };

  const removeSourceImage = () => {
    setSourceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Image removed" });
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-border bg-background overflow-hidden flex flex-col`}>
        {/* Sidebar Header with Menu Button */}
        <div className="p-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="h-10 w-10 p-0 hover:bg-muted rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-base font-semibold">Async</h2>
            <p className="text-xs text-muted-foreground">2.5 Flash</p>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 rounded-full hover:bg-muted"
            onClick={() => {
              setCustomPrompt("");
              setSourceImage(null);
              setCustomJsonPrompt("{}");
              setJsonError(null);
              toast({ title: "New chat", description: "Ready for a new generation" });
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
              <Edit2 className="w-4 h-4" />
            </div>
            <span className="text-sm">New chat</span>
          </Button>
        </div>

        {/* Recent Prompts List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-2 px-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">Recent</h3>
              {recentPrompts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllPrompts}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            {recentPrompts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Clock className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No recent chats</p>
              </div>
            ) : (
              recentPrompts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadRecentPrompt(item.prompt)}
                  className="group px-3 py-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors relative"
                >
                  <p className="text-sm line-clamp-1 pr-6 mb-0.5">{item.prompt}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteRecentPrompt(item.id, e)}
                    className="absolute top-1.5 right-1.5 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings at Bottom */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="w-full justify-start gap-3 h-10 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center justify-center w-8 h-8">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Menu Bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9 p-0"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">Image Generator</h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{currentTime.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <Card className="p-6 space-y-4 shadow-card">
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Source Image (Optional)
              </Label>
              
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg transition-all ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
                }`}
              >
                {sourceImage ? (
                  <div className="relative p-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img src={sourceImage} alt="Source" className="w-full h-48 object-contain" />
                      {/* Watermark in bottom right corner */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-white/80 text-[10px] font-medium">
                        <span>Watermark "Async"</span>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="opacity-80">
                          <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="1.5" fill="none"/>
                          <path d="M10 22 L22 10 M22 10 L22 18 M22 10 L14 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" className="absolute top-6 right-6" onClick={removeSourceImage}>
                      <X className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      This image will be used as reference
                    </p>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-2">Drag & drop an image here</p>
                    <p className="text-xs text-muted-foreground mb-4">Or paste (Ctrl+V / Cmd+V)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} type="button">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {sourceImage ? "AI will modify this image based on prompt" : "Upload for image-to-image generation"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  id="prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ask Async"
                  rows={1}
                  className="resize-none min-h-[56px] rounded-3xl border-2 border-border bg-muted/30 px-6 py-4 pr-32 text-base focus:border-primary transition-colors"
                  style={{ paddingBottom: '3rem' }}
                />
                {/* Bottom Toolbar - Gemini Style */}
                {/*  */}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !customPrompt.trim() || !!jsonError}
              className="w-full gradient-primary text-white font-medium py-6 text-lg hover:shadow-glow transition-smooth"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {sourceImage ? "Transform Image" : "Generate With Async"}
                </>
              )}
            </Button>
          </Card>

          <Collapsible open={showJson} onOpenChange={setShowJson}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <Code2 className="w-4 h-4 mr-2" />
                {showJson ? "Hide" : "View"} JSON Prompt Data
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card className="p-6 bg-muted/50">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Structured Prompt JSON
                  </h3>
                  <Textarea
                    value={customJsonPrompt}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="font-mono text-xs min-h-[200px] resize-y"
                    placeholder="Edit JSON prompt..."
                  />
                  {jsonError && (
                    <p className="text-xs text-destructive font-medium">{jsonError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Edit the structured JSON data used to generate the AI prompt.
                  </p>
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
            <DialogDescription>
              Customize your experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Appearance</h3>
              
              <RadioGroup value={theme} onValueChange={(value) => handleThemeChange(value as Theme)}>
                <div className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-200">
                      <Sun className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">Light Mode</p>
                      <p className="text-sm text-muted-foreground">Bright and clear interface</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600">
                      <Moon className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Easy on the eyes</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Theme preference saved automatically</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};