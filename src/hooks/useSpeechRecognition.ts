import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  hasPermission: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  requestPermissions: () => Promise<void>;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [shouldBeListening, setShouldBeListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // Auto-restart if we should still be listening
        if (shouldBeListening) {
          setTimeout(() => {
            if (shouldBeListening && recognitionRef.current) {
              try {
                console.log('Auto-restarting speech recognition...');
                recognitionRef.current.start();
              } catch (error) {
                console.log('Could not restart recognition:', error);
              }
            }
          }, 500);
        }
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
          if (finalTranscript) {
            return prev + finalTranscript;
          }
          return prev;
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle "no-speech" error gracefully
        if (event.error === 'no-speech') {
          console.log('No speech detected, will retry...');
          return; // Let onend handle restart
        }
        
        // Handle other errors
        let errorMessage = 'Speech recognition error occurred.';
        switch (event.error) {
          case 'audio-capture':
            errorMessage = 'Microphone access denied or not available.';
            setShouldBeListening(false);
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            setHasPermission(false);
            setShouldBeListening(false);
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          case 'aborted':
            return; // Don't show error for manual stops
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
  }, [toast, shouldBeListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      console.log('Microphone permission granted');
      
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
  }, [toast]);

  const startListening = useCallback(async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    setShouldBeListening(true);
    
    if (recognitionRef.current && !isListening) {
      try {
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: 'Error', 
          description: 'Failed to start speech recognition. Please check your microphone.',
          variant: 'destructive',
        });
      }
    }
  }, [isListening, hasPermission, toast, requestPermissions]);

  const stopListening = useCallback(() => {
    setShouldBeListening(false);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

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
    startListening,
    stopListening,
    resetTranscript,
    requestPermissions,
  };
};