import { Download, Share2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ImageGalleryProps {
  images: string[];
  onDownload: (imageUrl: string, format: string) => void;
}

export const ImageGallery = ({ images, onDownload }: ImageGalleryProps) => {
  const handleShare = async (imageUrl: string) => {
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
        // Fallback to clipboard if share fails
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

  // const handleSave = (imageUrl: string) => {
  //   toast({
  //     title: "Saved to project",
  //     description: "Image added to your collection",
  //   });
  // };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image, index) => (
        <div 
          key={index}
          className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-glow transition-smooth border border-border/50"
        >
          <div className="bg-muted relative flex items-center justify-center">
            <img
              src={image}
              alt={`Generated image ${index + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-smooth">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gradient-primary text-white hover:shadow-glow transition-smooth"
                onClick={() => onDownload(image, "1:1")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                className="gradient-primary text-white hover:shadow-glow transition-smooth"
                onClick={() => handleShare(image)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              
              {/* <Button
                size="sm"
                className="gradient-primary text-white hover:shadow-glow transition-smooth"
                onClick={() => handleSave(image)}
              >
                <Folder className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
