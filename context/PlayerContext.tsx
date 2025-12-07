import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track, PlayerStatus } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  status: PlayerStatus;
  playTrack: (track: Track, contextQueue?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  volume: number;
  setVolume: (vol: number) => void;
  progress: number;
  seek: (time: number) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  queue: Track[];
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.STOPPED);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Crucial for Web Audio API Visualizer to work with Firebase Storage URLs
      audioRef.current.crossOrigin = "anonymous"; 
    }
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      // Auto-play next track
      playNext();
    };

    const handleError = (e: any) => {
      console.error("Audio playback error", e);
      setStatus(PlayerStatus.STOPPED);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [queue, currentTrack]); // Re-bind if queue changes

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Helper to find current index
  const getCurrentIndex = () => {
    if (!currentTrack || queue.length === 0) return -1;
    return queue.findIndex(t => t.id === currentTrack.id);
  };

  const playTrack = (track: Track, contextQueue?: Track[]) => {
    if (audioRef.current) {
      // If a new queue context is provided (e.g. clicking play on a feed vs a playlist), update queue
      if (contextQueue) {
        setQueue(contextQueue);
      } else if (queue.length === 0) {
        // If no queue exists, start one with this track
        setQueue([track]);
      }

      if (currentTrack?.id === track.id) {
        // Toggle if same track
        if (status === PlayerStatus.PLAYING) {
            audioRef.current.pause();
            setStatus(PlayerStatus.PAUSED);
        } else {
            audioRef.current.play();
            setStatus(PlayerStatus.PLAYING);
        }
        return;
      }

      // New track
      setCurrentTrack(track);
      audioRef.current.src = track.audioURL;
      audioRef.current.play()
        .then(() => setStatus(PlayerStatus.PLAYING))
        .catch(err => console.error("Playback failed", err));
    }
  };

  const playNext = () => {
    const idx = getCurrentIndex();
    if (idx !== -1 && idx < queue.length - 1) {
      playTrack(queue[idx + 1]);
    } else {
      // End of queue
      setStatus(PlayerStatus.STOPPED);
      setProgress(0);
    }
  };

  const playPrev = () => {
    const idx = getCurrentIndex();
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If playing for more than 3 seconds, restart track
      audioRef.current.currentTime = 0;
    } else if (idx > 0) {
      playTrack(queue[idx - 1]);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (status === PlayerStatus.PLAYING) {
      audioRef.current.pause();
      setStatus(PlayerStatus.PAUSED);
    } else {
      audioRef.current.play();
      setStatus(PlayerStatus.PLAYING);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      status,
      playTrack,
      togglePlayPause,
      playNext,
      playPrev,
      volume,
      setVolume,
      progress,
      seek,
      audioRef,
      queue
    }}>
      {children}
    </PlayerContext.Provider>
  );
};