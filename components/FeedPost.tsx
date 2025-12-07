import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Track, PlayerStatus } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useTrackInteraction } from '../hooks/useTrackInteraction';
import { Play, Pause, Heart, MessageCircle, Send, MoreHorizontal, CheckCircle, ListPlus } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';

interface FeedPostProps {
  track: Track;
  playlistContext?: Track[]; // Optional: pass the full list to enable next/prev
}

const FeedPost: React.FC<FeedPostProps> = ({ track, playlistContext }) => {
  const { currentTrack, status, playTrack, togglePlayPause } = usePlayer();
  const { isLiked, likesCount, toggleLike } = useTrackInteraction(track);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
  const isPlaying = currentTrack?.id === track.id && status === PlayerStatus.PLAYING;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      // Pass the context so the player knows what comes next
      playTrack(track, playlistContext);
    }
  };

  return (
    <div className="mb-8 border-b border-slate-800/50 pb-6 last:border-0 animate-in fade-in duration-500">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${track.artistId}`}>
            <img 
              src={track.artistPhotoURL || `https://ui-avatars.com/api/?name=${track.artistName}&background=random`} 
              alt={track.artistName}
              className="w-10 h-10 rounded-full border border-slate-700 object-cover" 
            />
          </Link>
          <div>
             <Link to={`/profile/${track.artistId}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="font-bold text-sm text-white">{track.artistName}</span>
                <CheckCircle size={12} className="text-blue-400 fill-blue-400/20" />
             </Link>
             <div className="flex items-center text-xs text-gray-400">
               <span>2h ago</span>
               <span className="mx-1">•</span>
               <span>Original</span>
             </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Media / Cover Art */}
      <div className="relative aspect-square bg-slate-800 rounded-2xl overflow-hidden shadow-xl mb-4 group">
         <img 
            src={track.coverImageURL} 
            alt={track.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
         />
         
         {/* Genre Badge Overlay */}
         {track.genre && (
           <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
             {track.genre}
           </div>
         )}

         {/* Play Button Overlay */}
         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <button 
              onClick={handlePlayClick}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
            >
              {isPlaying ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" className="ml-1" />
              )}
            </button>
         </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex space-x-6">
           <button 
             onClick={toggleLike}
             className="group flex items-center space-x-1.5 transition-colors"
           >
             <Heart 
               size={26} 
               className={`transition-colors duration-300 ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white group-hover:text-pink-500'}`} 
             />
             {likesCount > 0 && <span className="font-medium text-sm text-gray-300">{likesCount}</span>}
           </button>
           <Link to={`/track/${track.id}`} className="group flex items-center space-x-1.5 transition-colors">
             <MessageCircle size={26} className="text-white group-hover:text-blue-400 transition-colors" />
           </Link>
           <button className="group flex items-center space-x-1.5 transition-colors">
             <Send size={26} className="text-white group-hover:text-green-400 transition-colors -rotate-45 mb-1" />
           </button>
        </div>
        <button 
          onClick={() => setShowPlaylistModal(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ListPlus size={26} />
        </button>
      </div>

      {/* Caption / Description */}
      <div className="px-1">
         <div className="mb-1">
            <span className="font-bold text-white mr-2 text-sm">{track.artistName}</span>
            <span className="text-gray-300 text-sm">{track.title}</span>
         </div>
         {track.description && (
           <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
             {track.description}
           </p>
         )}
         <div className="mt-2 flex flex-wrap gap-2">
            {track.tags && track.tags.map((tag, i) => (
              <span key={i} className="text-xs text-primary cursor-pointer hover:underline">#{tag}</span>
            ))}
         </div>
      </div>

      {/* Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal 
          trackId={track.id} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}
    </div>
  );
};

export default FeedPost;