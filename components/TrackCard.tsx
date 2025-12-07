import React from 'react';
import { Link } from 'react-router-dom';
import { Track, PlayerStatus } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Heart, MessageCircle, Share2 } from 'lucide-react';

interface TrackCardProps {
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { currentTrack, status, playTrack } = usePlayer();
  const isPlaying = currentTrack?.id === track.id && status === PlayerStatus.PLAYING;

  return (
    <div className="bg-dark-light rounded-xl p-4 hover:bg-slate-800 transition-colors group">
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-slate-700">
        <Link to={`/track/${track.id}`}>
          <img 
            src={track.coverImageURL} 
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              playTrack(track);
            }}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-400 hover:scale-110 transition-all pointer-events-auto"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <Link to={`/track/${track.id}`} className="block">
          <h3 className="font-semibold text-white truncate text-lg hover:text-primary transition-colors">{track.title}</h3>
        </Link>
        <Link to={`/profile/${track.artistId}`} className="block">
           <p className="text-gray-400 text-sm truncate hover:underline">{track.artistName}</p>
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between text-gray-400">
        <button className="flex items-center space-x-1 hover:text-pink-500 transition-colors">
          <Heart size={18} />
          <span className="text-xs">{track.likesCount}</span>
        </button>
        <Link to={`/track/${track.id}`} className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
          <MessageCircle size={18} />
          <span className="text-xs">Comment</span>
        </Link>
        <button className="hover:text-white transition-colors">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TrackCard;