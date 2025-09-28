import { useState } from "react";
import { RecordingButton } from "@/components/RecordingButton";
import { TranscriptionDisplay } from "@/components/TranscriptionDisplay";
import { SessionManager } from "@/components/SessionManager";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { 
    transcript, 
    isListening, 
    isSupported, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  const { toast } = useToast();

  const handleToggleRecording = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      stopListening();
      toast({
        title: "Recording stopped",
        description: "Transcription session ended.",
      });
    } else {
      setIsRecording(true);
      startListening();
      toast({
        title: "Recording started",
        description: "Speak clearly for best transcription results.",
      });
    }
  };

  const handleStartNewSession = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    }
    resetTranscript();
  };

  const handleSaveSession = (title: string) => {
    // In a real app, this would save to a database or cloud storage
    console.log('Saving session:', title, transcript);
    
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Classroom Transcription
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
            Capture every word of your lectures with real-time speech-to-text transcription. 
            Perfect for students and educators.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recording Control */}
          <div className="lg:col-span-1 flex flex-col items-center justify-start">
            <div className="sticky top-8 w-full max-w-sm space-y-6">
              <div className="flex justify-center animate-scale-in">
                <RecordingButton
                  isRecording={isRecording}
                  isListening={isListening}
                  onToggleRecording={handleToggleRecording}
                  disabled={!isSupported}
                />
              </div>
              
              <SessionManager
                transcript={transcript}
                isRecording={isRecording}
                onStartNewSession={handleStartNewSession}
                onSaveSession={handleSaveSession}
              />
            </div>
          </div>

          {/* Transcription Display */}
          <div className="lg:col-span-2">
            <TranscriptionDisplay
              transcript={transcript}
              isListening={isListening}
              className="animate-slide-up"
            />
          </div>
        </div>

        {/* Support Notice */}
        {!isSupported && (
          <div className="fixed bottom-4 right-4 max-w-sm animate-slide-up">
            <div className="bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
              <p className="text-sm font-medium">
                Speech recognition not supported in this browser. 
                Please use Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
