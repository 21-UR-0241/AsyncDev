import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Code2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PromptInputProps {
  defaultPrompt: string;
  jsonPrompt: Record<string, unknown>;
  onGenerate: (customPrompt: string) => void;
  isGenerating: boolean;
}

export const PromptInput = ({ defaultPrompt, jsonPrompt, onGenerate, isGenerating }: PromptInputProps) => {
  const [customPrompt, setCustomPrompt] = useState(defaultPrompt);
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Custom Prompt
          </Label>
          <Textarea
            id="prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe the marketing image you want to generate..."
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Customize your prompt or use the default based on your preferences
          </p>
        </div>

        <Button
          onClick={() => onGenerate(customPrompt)}
          disabled={isGenerating || !customPrompt.trim()}
          className="w-full gradient-primary text-white font-medium py-6 text-lg hover:shadow-glow transition-smooth"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Generating Image...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 " />
              Generate With Async
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
              <pre className="text-xs bg-background p-4 rounded-lg overflow-x-auto border">
                {JSON.stringify(jsonPrompt, null, 2)}
              </pre>
              <p className="text-xs text-muted-foreground">
                This JSON structure is built from your onboarding preferences and is used to generate the AI prompt.
              </p>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
