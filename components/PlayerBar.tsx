
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, ListMusic, Maximize2 } from 'lucide-react';
import { PlayerStatus } from '../types';
import AudioVisualizer from './AudioVisualizer';

const PlayerBar: React.FC = () => {
  const { currentTrack, status, togglePlayPause, playNext, playPrev, volume, setVolume, progress, duration, seek, audioRef } = usePlayer();

  if (!currentTrack) return null;

  const isPlaying = status === PlayerStatus.PLAYING;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Use dynamic duration from audio element (via context), fallback to track data, then default
  const totalDuration = duration || currentTrack.duration || 180;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        {/* Floating Island Container */}
        <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-2xl flex items-center justify-between pointer-events-auto transition-all hover:scale-[1.01] hover:bg-slate-900/90 relative overflow-hidden group">
            
            {/* Background Gradient Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

            {/* Track Info */}
            <div className="flex items-center w-1/4 min-w-[180px] gap-3 pl-2">
                <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-800 shadow-md ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    <img 
                        src={currentTrack.coverImageURL || "https://picsum.photos/150"} 
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-[35%] bg-slate-900 rounded-full border border-slate-700"></div>
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-white font-bold text-sm truncate">{currentTrack.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{currentTrack.artistName}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center flex-1 max-w-lg px-2">
                <div className="flex items-center gap-6">
                    <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
                        <SkipBack size={20} />
                    </button>
                    <button 
                        onClick={togglePlayPause}
                        className="w-10 h-10 bg-white text-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/20"
                    >
                        {isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                        ) : (
                        <Play size={18} fill="currentColor" className="ml-1" />
                        )}
                    </button>
                    <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                        <SkipForward size={20} />
                    </button>
                </div>
                
                {/* Slim Progress Bar */}
                <div className="w-full flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{formatTime(progress)}</span>
                    <div className="group relative flex-1 h-1 flex items-center cursor-pointer">
                        <input
                            type="range"
                            min="0"
                            max={totalDuration}
                            value={progress}
                            onChange={(e) => seek(Number(e.target.value))}
                            className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary" 
                                style={{ width: `${(progress / totalDuration) * 100}%` }}
                            />
                        </div>
                        <div 
                            className="w-2.5 h-2.5 bg-white rounded-full absolute shadow ml-[-5px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `${(progress / totalDuration) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono w-8">{formatTime(totalDuration)}</span>
                </div>
            </div>

            {/* Visualizer & Tools */}
            <div className="flex items-center justify-end w-1/4 min-w-[140px] gap-3 pr-2">
                 {/* Visualizer (Hidden on mobile) */}
                <div className="hidden md:block w-20 h-8 opacity-60">
                    <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                </div>
                
                <div className="h-6 w-[1px] bg-slate-700 hidden md:block"></div>

                <button className="text-gray-400 hover:text-pink-500 transition-colors">
                    <Heart size={18} />
                </button>
                
                <div className="relative group hidden sm:flex items-center">
                    <Volume2 size={18} className="text-gray-400 hover:text-white" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="h-24 -rotate-90 w-6 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlayerBar;
