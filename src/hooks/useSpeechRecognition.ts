import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  hasPermission: boolean;
  availableDevices: MediaDeviceInfo[];
  selectedDeviceId: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  requestPermissions: () => Promise<void>;
  selectMicrophone: (deviceId: string) => void;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(prev => {
          // Only add final results to avoid duplicates
          if (finalTranscript) {
            return prev + finalTranscript;
          }
          return prev;
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error occurred.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone access denied or not available.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
        }
        
        toast({
          title: 'Recognition Error',
          description: errorMessage,
          variant: 'destructive',
        });
      };
    } else {
      setIsSupported(false);
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
        variant: 'destructive',
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      
      // Get available audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAvailableDevices(audioInputs);
      
      // Set default device if none selected
      if (!selectedDeviceId && audioInputs.length > 0) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
      
      // Stop the stream as we only needed it for permissions
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
      toast({
        title: 'Permission Denied',
        description: 'Microphone access is required for speech recognition.',
        variant: 'destructive',
      });
    }
  }, [selectedDeviceId, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [isListening]);

  const selectMicrophone = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    
    // If currently listening, restart with new microphone
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      // The recognition will restart automatically when onend is triggered
    }
  }, [isListening]);

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening && hasPermission) {
      try {
        // If a specific device is selected, get stream from that device
        if (selectedDeviceId) {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: selectedDeviceId }
          });
        }
        
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: 'Error',
          description: 'Failed to start speech recognition. Please check your microphone.',
          variant: 'destructive',
        });
      }
    } else if (!hasPermission) {
      await requestPermissions();
    }
  }, [isListening, hasPermission, selectedDeviceId, toast, requestPermissions]);

  useEffect(() => {
    // Request permissions on mount
    if (isSupported) {
      requestPermissions();
    }
  }, [isSupported, requestPermissions]);

  return {
    transcript,
    isListening,
    isSupported,
    hasPermission,
    availableDevices,
    selectedDeviceId,
    startListening,
    stopListening,
    resetTranscript,
    requestPermissions,
    selectMicrophone,
  };
};