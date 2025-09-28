import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TranscriptionDisplayProps {
  transcript: string;
  isListening: boolean;
  className?: string;
}

export const TranscriptionDisplay = ({ 
  transcript, 
  isListening, 
  className 
}: TranscriptionDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new text is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <Card className={cn(
      "relative min-h-[400px] max-h-[600px] overflow-hidden",
      "bg-gradient-glass backdrop-blur-sm border-glass-border",
      "shadow-lg transition-all duration-300",
      isListening && "ring-2 ring-primary/20",
      className
    )}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Live Transcription
          </h2>
          {isListening && (
            <div className="flex items-center gap-2 text-primary">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-gentle" />
              <span className="text-sm font-medium">Listening</span>
            </div>
          )}
        </div>

        <div 
          ref={scrollRef}
          className="prose prose-gray max-w-none overflow-y-auto max-h-[450px] scroll-smooth"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--border)) transparent'
          }}
        >
          {transcript ? (
            <div className="space-y-4">
              {transcript.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p 
                    key={index} 
                    className="text-foreground leading-relaxed animate-fade-in"
                  >
                    {paragraph}
                  </p>
                )
              ))}
              {isListening && (
                <div className="inline-block w-3 h-5 bg-primary animate-pulse-gentle ml-1" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-center">
              <div className="space-y-2">
                <p className="text-foreground-secondary">
                  {isListening 
                    ? "Listening for speech..." 
                    : "Start recording to see transcription here"
                  }
                </p>
                {isListening && (
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0ms'}} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '150ms'}} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};