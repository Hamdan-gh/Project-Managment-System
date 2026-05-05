import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Trash2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onSendVoice, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl]);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using MIME type:', type);
        return type;
      }
    }
    
    console.log('Using default MIME type');
    return 'audio/webm'; // fallback
  };

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
        
        setRecordedBlob(blob);
        setDuration(recordingTime);
        
        // Create audio URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        console.log('Audio URL created:', url);
        
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      console.log('Recording started...');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(`Could not access microphone: ${error.message}. Please check permissions.`);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  const playRecording = async () => {
    if (!audioUrl) {
      console.error('No audio URL available');
      return;
    }
    
    try {
      console.log('Playing recording from URL:', audioUrl);
      
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onloadeddata = () => {
        console.log('Audio loaded, duration:', audio.duration);
      };
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        alert('Could not play audio. The recording might be corrupted.');
      };
      
      audio.onplay = () => {
        console.log('Audio playback started');
        setIsPlaying(true);
      };
      
      audio.onpause = () => {
        console.log('Audio playback paused');
        setIsPlaying(false);
      };
      
      // Try to play
      try {
        await audio.play();
      } catch (playError) {
        console.error('Play failed:', playError);
        // Try with user interaction
        setIsPlaying(true);
        setTimeout(() => {
          audio.play().catch(e => {
            console.error('Delayed play failed:', e);
            setIsPlaying(false);
            alert('Could not play audio. Browser may be blocking autoplay.');
          });
        }, 100);
      }
      
    } catch (error) {
      console.error('Error in playRecording:', error);
      setIsPlaying(false);
    }
  };

  const pauseRecording = () => {
    console.log('Pausing recording...');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const deleteRecording = () => {
    console.log('Deleting recording...');
    
    // Clean up audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    // Clean up URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    // Reset state
    setRecordedBlob(null);
    setDuration(0);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const sendRecording = () => {
    console.log('Sending recording...', recordedBlob?.size, 'bytes');
    
    if (recordedBlob && recordedBlob.size > 0) {
      onSendVoice(recordedBlob, duration);
      deleteRecording();
    } else {
      console.error('No valid recording to send');
      alert('No valid recording to send. Please try recording again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordedBlob) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg min-w-[200px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={isPlaying ? pauseRecording : playRecording}
          className="h-8 w-8"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-1 bg-primary/20 rounded-full flex-1">
              <div className="h-full bg-primary rounded-full w-full"></div>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Voice message ({Math.round(recordedBlob.size / 1024)}KB)
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={deleteRecording}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          size="icon"
          onClick={sendRecording}
          disabled={disabled || !recordedBlob || recordedBlob.size === 0}
          className="h-8 w-8"
          title="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>{formatTime(recordingTime)}</span>
        </div>
      )}
      
      <Button
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={cn(
          "h-10 w-10",
          isRecording && "animate-pulse"
        )}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  );
}