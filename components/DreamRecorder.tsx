
import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Removed `LiveSession` from import as it's not an exported member of the library.
// The type will be inferred later using `ReturnType`.
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { MicIcon, StopIcon } from './icons';
import { createPcmBlob } from '../utils/audio';

// FIX: Instantiated the GoogleGenAI client at the module level.
// This improves performance by avoiding re-initialization on each recording
// and allows for inferring the LiveSession type below.
if (!process.env.API_KEY) {
  throw new Error("API key is not configured.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface DreamRecorderProps {
  onRecordingStart: () => void;
  onRecordingFinish: (transcription: string) => void;
  isRecordingExternally?: boolean;
}

const DreamRecorder: React.FC<DreamRecorderProps> = ({ onRecordingStart, onRecordingFinish, isRecordingExternally = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentTranscriptionRef = useRef<string>('');
  // FIX: Used `ReturnType<typeof ai.live.connect>` to correctly infer the type of the session promise
  // without needing to import the `LiveSession` type directly.
  const sessionPromiseRef = useRef<ReturnType<typeof ai.live.connect> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    setIsRecording(false);
    
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
    }
    
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    
    onRecordingFinish(currentTranscriptionRef.current);

    // Reset refs
    sessionPromiseRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    scriptProcessorRef.current = null;
  }, [isRecording, onRecordingFinish]);

  useEffect(() => {
    // Sync internal state with external prop
    if(isRecordingExternally !== isRecording) {
      setIsRecording(isRecordingExternally);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecordingExternally]);
  
  const startRecording = async () => {
    setIsRecording(true);
    onRecordingStart();
    currentTranscriptionRef.current = '';
    setError(null);
    
    try {
      // FIX: Removed redundant API key check and AI client instantiation,
      // as the client is now created once at the module level.
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            if (!mediaStreamRef.current || !audioContextRef.current) return;
            const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setError('A connection error occurred. Please try again.');
            stopRecording();
          },
          onclose: (e: CloseEvent) => {
             // Closed by user action, no need to log
          },
        },
        config: {
          inputAudioTranscription: {},
        },
      });
      // Handle case where session promise rejects immediately
      sessionPromiseRef.current.catch(err => {
         console.error("Failed to connect to Live session:", err);
         setError("Could not start recording session. Please check your connection and API key.");
         stopRecording();
      });

    } catch (err) {
      console.error(err);
      setError("Failed to access microphone. Please grant permission and try again.");
      stopRecording();
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  return (
    <div>
        <button
          onClick={handleToggleRecording}
          className={`relative flex items-center justify-center w-24 h-12 md:w-auto md:px-4 md:h-12 rounded-full md:rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording && <div className="absolute inset-0 rounded-full md:rounded-lg bg-red-500 animate-pulse"></div>}
          {isRecording ? <StopIcon className="w-8 h-8 md:w-6 md:h-6 text-white" /> : <MicIcon className="w-8 h-8 md:w-6 md:h-6 text-white" />}
           <span className="hidden md:inline md:ml-2 font-semibold">
            {isRecording ? 'Stop' : 'Record'}
          </span>
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default DreamRecorder;
