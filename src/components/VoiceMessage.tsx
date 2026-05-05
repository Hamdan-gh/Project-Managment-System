import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  voiceUrl: string;
  duration?: number;
  isOwn?: boolean;
  className?: string;
}

export function VoiceMessage({ voiceUrl, duration, isOwn, className }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log('VoiceMessage mounted:', { voiceUrl, duration, isOwn });
    
    // Construct full URL if needed
    let fullUrl = voiceUrl;
    if (!voiceUrl.startsWith('http')) {
      // Get the base URL from environment variable or use relative path
      const apiBaseUrl = import.meta.env.VITE_API_URL;
      if (apiBaseUrl) {
        // Remove /api from the end if present
        const baseUrl = apiBaseUrl.replace(/\/api$/, '');
        fullUrl = `${baseUrl}${voiceUrl}`;
      } else {
        // Fallback to relative path for development
        fullUrl = voiceUrl;
      }
    }
    console.log('Full audio URL:', fullUrl);
    
    const audio = new Audio(fullUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      console.log('Audio metadata loaded:', audio.duration);
      setAudioDuration(audio.duration);
      setError(null);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      console.log('Audio playback ended');
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = (e) => {
      console.error('Audio error:', e);
      setError('Could not load audio');
      setIsPlaying(false);
    };

    audio.oncanplay = () => {
      console.log('Audio can play');
      setError(null);
    };

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [voiceUrl, duration, isOwn]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Playing audio');
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError('Playback failed');
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  if (error) {
    return (
      <div className={cn("flex items-center gap-3 min-w-[200px] p-2 bg-red-50 rounded", className)}>
        <Volume2 className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 min-w-[200px]", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayback}
        className={cn(
          "h-8 w-8 rounded-full flex-shrink-0",
          isOwn 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
        )}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Voice message</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-100",
                isOwn ? "bg-green-600" : "bg-blue-600"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}