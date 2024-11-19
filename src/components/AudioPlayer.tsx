import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { useAudioContext } from './AudioContext';

interface AudioPlayerProps {
  src: string;
  title: string;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { currentlyPlaying, setCurrentlyPlaying } = useAudioContext();

  useEffect(() => {
    // Reset state when src changes
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setError(null);
  }, [src]);

  useEffect(() => {
    // Stop playing if another audio starts playing
    if (currentlyPlaying && currentlyPlaying !== src && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [currentlyPlaying, src, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setCurrentlyPlaying(src);
          }).catch(error => {
            console.error('Playback error:', error);
            setError('Failed to play audio. Please try again.');
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
      setCurrentTime(current);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setError(null);
    }
  };

  const handleError = () => {
    setError('Failed to load audio file');
    setIsPlaying(false);
    setCurrentlyPlaying(null);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentlyPlaying(null);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const time = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(percentage);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={!!error}
          className="p-2 rounded-full bg-[#94c973] hover:bg-[#7fb95e] text-white transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <span className="text-xs text-[#94c973] font-medium truncate flex-shrink-0">
          {title}
        </span>

        <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <div 
          ref={progressRef}
          className="h-2 bg-gray-100 rounded-full cursor-pointer relative overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[#94c973] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onEnded={handleEnded}
      />
    </div>
  );
}
