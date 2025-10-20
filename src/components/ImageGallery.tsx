import { useState } from "react";
import { Download, Share2, ExternalLink, ChevronDown, ChevronUp, Copy, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ImageData {
  url: string;
  base64?: string; // For Nano Banana base64 images
  prompt?: {
    original?: string;
    enhanced?: string;
    subject?: string;
    style?: string;
    genre?: string;
    artist?: string;
    age_range?: string;
    ratio?: string;
    clothing?: string;
    background?: string;
  };
  parameters?: {
    model?: string;
    quality?: string;
    aspectRatio?: string;
    sampler?: string;
    seed?: string;
    sampling_method?: string;
    sampling_steps?: string;
    cfg_scale?: string;
    width?: string;
    height?: string;
    vae?: string;
    denoising?: string;
    clip_skip?: string;
    ensd?: string;
    eta?: string;
    prompt_strength?: string;
    negative_prompt?: string;
  };
}

interface ImageGalleryProps {
  images: (string | ImageData)[];
  onDownload: (imageUrl: string, format: string) => void;
  onRegenerate?: (imageData: ImageData, index: number) => void; // New prop for regeneration
}

export const ImageGallery = ({ images, onDownload, onRegenerate }: ImageGalleryProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const handleShare = async (imageUrl: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: 'Check out this AI-generated marketing image!',
          url: imageUrl,
        });
        toast({
          title: "Shared successfully!",
          description: "Image shared via native share",
        });
      } catch (error) {
        navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Link copied!",
          description: "Image URL copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Link copied!",
        description: "Image URL copied to clipboard",
      });
    }
  };

  const handleCopyPrompt = (imageData: ImageData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Priority: original prompt > enhanced prompt > structured prompt
    let promptText = '';
    
    if (imageData.prompt?.original) {
      promptText = imageData.prompt.original;
    } else if (imageData.prompt?.enhanced) {
      promptText = imageData.prompt.enhanced;
    } else if (imageData.prompt) {
      promptText = Object.entries(imageData.prompt)
        .filter(([key]) => key !== 'original' && key !== 'enhanced')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    } else {
      promptText = 'No prompt data available';
    }
    
    navigator.clipboard.writeText(promptText);
    toast({
      title: "Prompt copied!",
      description: "Prompt details copied to clipboard",
    });
  };

  const handleDownloadImage = async (imageUrl: string, imageData: ImageData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      // Check if it's a base64 data URL
      if (imageUrl.startsWith('data:')) {
        // Direct download for base64 images
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `Async-Ai-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started!",
          description: "Your image is being downloaded",
        });
      } else {
        // Use the original onDownload function for URL images
        onDownload(imageUrl, "1:1");
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = (imageData: ImageData, index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onRegenerate) {
      onRegenerate(imageData, index);
      toast({
        title: "Regenerating...",
        description: "Creating a new variation",
      });
    }
  };

  const openImageInNewTab = async (imageUrl: string) => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      const bgColor = isDark ? '#000' : '#fff';
      const textColor = isDark ? '#fff' : '#000';
      const controlsBg = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      const controlsHover = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
      const controlsBorder = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Generated Image Preview</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { background: ${bgColor}; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
              #container { width: 100vw; height: 100vh; overflow: auto; display: flex; align-items: center; justify-content: center; position: relative; }
              #imageWrapper { transition: transform 0.2s ease; cursor: grab; }
              #imageWrapper.dragging { cursor: grabbing; }
              img { display: block; max-width: 100%; max-height: 100vh; user-select: none; -webkit-user-drag: none; }
              #controls { position: fixed; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 8px; background: ${controlsBg}; backdrop-filter: blur(10px); padding: 12px; border-radius: 12px; z-index: 1000; box-shadow: 0 4px 20px rgba(0,0,0,0.2); border: 1px solid ${controlsBorder}; }
              button { width: 40px; height: 40px; border: none; background: transparent; color: ${textColor}; border-radius: 8px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; font-weight: 600; }
              button:hover:not(:disabled) { background: ${controlsHover}; }
              button:disabled { opacity: 0.3; cursor: not-allowed; }
              #zoomLevel { color: ${textColor}; text-align: center; font-size: 12px; padding: 8px 0; border-top: 1px solid ${controlsBorder}; font-weight: 500; }
              .divider { height: 1px; background: ${controlsBorder}; margin: 4px 0; }
            </style>
            <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🍌</text></svg>" />
            <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🍌</text></svg>" />
          </head>
          <body>
            <div id="container"><div id="imageWrapper"><img src="${imageUrl}" alt="AI Generated Image" id="image" /></div></div>
            <div id="controls">
              <button id="fitFill" title="Toggle Fit/Fill">⛶</button>
              <div class="divider"></div>
              <button id="zoomIn" title="Zoom In">+</button>
              <button id="zoomOut" title="Zoom Out">−</button>
              <button id="reset" title="Reset">⟲</button>
              <div id="zoomLevel">100%</div>
            </div>
            <script>
              let zoom=1,posX=0,posY=0,isDragging=false,startX=0,startY=0,fitMode='contain';
              const image=document.getElementById('image'),imageWrapper=document.getElementById('imageWrapper'),container=document.getElementById('container'),zoomInBtn=document.getElementById('zoomIn'),zoomOutBtn=document.getElementById('zoomOut'),resetBtn=document.getElementById('reset'),fitFillBtn=document.getElementById('fitFill'),zoomLevel=document.getElementById('zoomLevel');
              function updateTransform(){imageWrapper.style.transform=\`translate(\${posX}px,\${posY}px) scale(\${zoom})\`;zoomLevel.textContent=Math.round(zoom*100)+'%';zoomInBtn.disabled=zoom>=5;zoomOutBtn.disabled=zoom<=1;resetBtn.disabled=zoom===1;}
              function updateFitMode(){if(fitMode==='contain'){image.style.maxWidth='100%';image.style.maxHeight='100vh';image.style.width='auto';image.style.height='auto';image.style.objectFit='contain';}else{image.style.maxWidth='none';image.style.maxHeight='none';image.style.width='100vw';image.style.height='100vh';image.style.objectFit='cover';}}
              zoomInBtn.addEventListener('click',()=>{if(zoom<5){zoom=Math.min(zoom+0.5,5);updateTransform();}});
              zoomOutBtn.addEventListener('click',()=>{if(zoom>1){zoom=Math.max(zoom-0.5,1);if(zoom===1){posX=0;posY=0;}updateTransform();}});
              resetBtn.addEventListener('click',()=>{zoom=1;posX=0;posY=0;updateTransform();});
              fitFillBtn.addEventListener('click',()=>{fitMode=fitMode==='contain'?'cover':'contain';zoom=1;posX=0;posY=0;updateFitMode();updateTransform();});
              container.addEventListener('wheel',(e)=>{e.preventDefault();if(e.deltaY<0){zoom=Math.min(zoom+0.1,5);}else{zoom=Math.max(zoom-0.1,1);if(zoom===1){posX=0;posY=0;}}updateTransform();});
              imageWrapper.addEventListener('mousedown',(e)=>{if(zoom>1){isDragging=true;startX=e.clientX-posX;startY=e.clientY-posY;imageWrapper.classList.add('dragging');}});
              document.addEventListener('mousemove',(e)=>{if(isDragging&&zoom>1){posX=e.clientX-startX;posY=e.clientY-startY;updateTransform();}});
              document.addEventListener('mouseup',()=>{isDragging=false;imageWrapper.classList.remove('dragging');});
              document.addEventListener('keydown',(e)=>{if(e.key==='+'||e.key==='='){zoomInBtn.click();}else if(e.key==='-'||e.key==='_'){zoomOutBtn.click();}else if(e.key==='0'){resetBtn.click();}else if(e.key==='f'||e.key==='F'){fitFillBtn.click();}});
              let touchDistance=0;
              imageWrapper.addEventListener('touchstart',(e)=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX;const dy=e.touches[0].clientY-e.touches[1].clientY;touchDistance=Math.sqrt(dx*dx+dy*dy);}else if(e.touches.length===1&&zoom>1){isDragging=true;startX=e.touches[0].clientX-posX;startY=e.touches[0].clientY-posY;}});
              imageWrapper.addEventListener('touchmove',(e)=>{if(e.touches.length===2){e.preventDefault();const dx=e.touches[0].clientX-e.touches[1].clientX;const dy=e.touches[0].clientY-e.touches[1].clientY;const distance=Math.sqrt(dx*dx+dy*dy);const delta=distance-touchDistance;zoom=Math.max(1,Math.min(5,zoom+delta*0.01));touchDistance=distance;updateTransform();}else if(isDragging&&zoom>1){posX=e.touches[0].clientX-startX;posY=e.touches[0].clientY-startY;updateTransform();}});
              imageWrapper.addEventListener('touchend',()=>{isDragging=false;});
              updateFitMode();updateTransform();
            </script>
          </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site",
          variant: "destructive",
        });
      }
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Error opening image:', error);
      toast({
        title: "Error opening image",
        description: "Could not open image in new tab",
        variant: "destructive",
      });
    }
  };

  const getImageUrl = (image: string | ImageData): string => {
    return typeof image === 'string' ? image : image.url;
  };

  const getImageData = (image: string | ImageData): ImageData => {
    return typeof image === 'string' ? { url: image } : image;
  };

  const isNanoBanana = (imageData: ImageData): boolean => {
    return imageData.parameters?.model?.toLowerCase().includes('nano-banana') ||
           imageData.parameters?.model?.toLowerCase().includes('gemini');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => {
        const imageUrl = getImageUrl(image);
        const imageData = getImageData(image);
        const isExpanded = expandedCards.has(index);
        const hasPromptData = imageData.prompt || imageData.parameters;
        const showNanoBananaBadge = isNanoBanana(imageData);

        return (
          <div 
            key={index}
            className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
          >
            {/* Nano Banana Badge */}
            {showNanoBananaBadge && (
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" />
                Async
              </div>
            )}

            <div 
              className="bg-muted relative flex items-center justify-center aspect-square cursor-pointer overflow-hidden"
              onClick={() => openImageInNewTab(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <ExternalLink className="w-12 h-12 text-white mx-auto mb-2 drop-shadow-lg" />
                  <p className="text-white text-sm font-semibold drop-shadow-lg">Open Full View</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                  onClick={(e) => handleDownloadImage(imageUrl, imageData, e)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shadow-lg hover:shadow-xl transition-all"
                  onClick={(e) => handleShare(imageUrl, e)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {hasPromptData && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shadow-lg hover:shadow-xl transition-all"
                    onClick={(e) => handleCopyPrompt(imageData, e)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
                {onRegenerate && hasPromptData && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shadow-lg hover:shadow-xl transition-all"
                    onClick={(e) => handleRegenerate(imageData, index, e)}
                    title="Regenerate variation"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Prompt Details Section */}
            {hasPromptData && (
              <div className="p-4 bg-card border-t border-border">
                <button
                  onClick={() => toggleCard(index)}
                  className="w-full flex items-center justify-between text-left group/button hover:bg-muted/50 -m-2 p-2 rounded-lg transition-colors"
                >
                  <h3 className="text-sm font-semibold text-foreground group-hover/button:text-primary transition-colors">
                    Prompt Details
                  </h3>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground group-hover/button:text-primary transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover/button:text-primary transition-colors" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Original Prompt */}
                    {imageData.prompt?.original && (
                      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-foreground font-semibold text-xs uppercase tracking-wide mb-2">Original Prompt</h4>
                        <p className="text-muted-foreground leading-relaxed">{imageData.prompt.original}</p>
                      </div>
                    )}

                    {/* Enhanced Prompt */}
                    {imageData.prompt?.enhanced && imageData.prompt.enhanced !== imageData.prompt.original && (
                      <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="text-primary font-semibold text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Enhanced Prompt
                        </h4>
                        <p className="text-muted-foreground leading-relaxed text-xs">{imageData.prompt.enhanced}</p>
                      </div>
                    )}

                    {/* Structured Prompt Data */}
                    {imageData.prompt && Object.keys(imageData.prompt).filter(k => k !== 'original' && k !== 'enhanced').length > 0 && (
                      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-foreground font-semibold text-xs uppercase tracking-wide mb-2">Prompt Details</h4>
                        {Object.entries(imageData.prompt)
                          .filter(([key]) => key !== 'original' && key !== 'enhanced')
                          .map(([key, value]) => (
                            <div key={key} className="flex flex-col space-y-1">
                              <span className="text-primary font-medium capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-muted-foreground pl-2 leading-relaxed">"{value}"</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Parameters */}
                    {imageData.parameters && Object.keys(imageData.parameters).length > 0 && (
                      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-foreground font-semibold text-xs uppercase tracking-wide mb-2">Generation Settings</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(imageData.parameters).map(([key, value]) => (
                            <div key={key} className="flex flex-col space-y-1">
                              <span className="text-secondary-foreground font-medium capitalize text-xs">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-muted-foreground text-xs">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};