import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordingButtonProps {
  isRecording: boolean;
  isListening: boolean;
  onToggleRecording: () => void;
  disabled?: boolean;
}

export const RecordingButton = ({ 
  isRecording, 
  isListening, 
  onToggleRecording, 
  disabled 
}: RecordingButtonProps) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <Button
        variant="ghost"
        size="lg"
        onClick={onToggleRecording}
        disabled={disabled}
        className={cn(
          "relative h-24 w-24 rounded-full border-2 transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "focus-visible:ring-4 focus-visible:ring-primary/20",
          isRecording 
            ? "border-destructive bg-destructive text-destructive-foreground animate-recording-pulse shadow-lg" 
            : "border-primary bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg"
        )}
      >
        {isRecording ? (
          <Square className="h-8 w-8" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center animate-pulse-gentle">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        )}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          {isRecording ? "Recording in progress" : "Ready to start"}
        </p>
        <p className="text-xs text-foreground-secondary">
          {isRecording 
            ? "Click to stop recording" 
            : "Click to start recording"
          }
        </p>
      </div>
    </div>
  );
};