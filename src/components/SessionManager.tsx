import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Download, Save, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SessionManagerProps {
  transcript: string;
  isRecording: boolean;
  onStartNewSession: () => void;
  onSaveSession: (title: string) => void;
}

export const SessionManager = ({ 
  transcript, 
  isRecording, 
  onStartNewSession, 
  onSaveSession 
}: SessionManagerProps) => {
  const [sessionTitle, setSessionTitle] = useState("");
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartSession = () => {
    if (!sessionTitle.trim()) {
      toast({
        title: "Session title required",
        description: "Please enter a title for your class session.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentSession(sessionTitle);
    onStartNewSession();
    toast({
      title: "Session started",
      description: `Recording session: "${sessionTitle}"`,
    });
  };

  const handleSaveSession = () => {
    if (!transcript.trim()) {
      toast({
        title: "No content to save",
        description: "Start recording to generate transcription content.",
        variant: "destructive"
      });
      return;
    }

    onSaveSession(currentSession || sessionTitle);
    toast({
      title: "Session saved",
      description: "Transcription has been saved successfully.",
    });
  };

  const handleDownload = () => {
    if (!transcript.trim()) {
      toast({
        title: "No content to download",
        description: "Start recording to generate transcription content.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession || 'transcription'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Transcription file is being downloaded.",
    });
  };

  return (
    <Card className="bg-gradient-glass backdrop-blur-sm border-glass-border shadow-md">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Class Session</h3>
            <p className="text-sm text-foreground-secondary">
              Manage your recording sessions
            </p>
          </div>
        </div>

        {!currentSession ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-title">Session Title</Label>
              <Input
                id="session-title"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g., Biology Lecture - Chapter 5"
                className="bg-background/50"
              />
            </div>
            <Button 
              onClick={handleStartSession}
              className="w-full bg-gradient-primary hover:shadow-md transition-all duration-200"
              disabled={!sessionTitle.trim()}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/50 border border-accent">
              <p className="font-medium text-accent-foreground">
                Current Session
              </p>
              <p className="text-sm text-accent-foreground/80">
                {currentSession}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!transcript.trim()}
                className="transition-all duration-200 hover:shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleSaveSession}
                disabled={!transcript.trim() || isRecording}
                className="bg-gradient-primary hover:shadow-md transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Session
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setCurrentSession(null);
                setSessionTitle("");
                onStartNewSession();
              }}
              className="w-full text-foreground-secondary hover:text-foreground"
            >
              Start New Session
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};