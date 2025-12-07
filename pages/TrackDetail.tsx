import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Track, Comment, PlayerStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Heart, Share2, MessageCircle, Send, Clock, Calendar, Music } from 'lucide-react';
import SonicAnalysis from '../components/SonicAnalysis';
import AnimatedPage from '../components/AnimatedPage';

const TrackDetail: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const { currentUser } = useAuth();
  const { currentTrack, status, playTrack, togglePlayPause } = usePlayer();
  
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const isPlaying = currentTrack?.id === track?.id && status === PlayerStatus.PLAYING;

  useEffect(() => {
    if (!trackId) return;

    const fetchTrack = async () => {
      try {
        const docRef = doc(db, "tracks", trackId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTrack({ id: docSnap.id, ...docSnap.data() } as Track);
        }
      } catch (err) {
        console.error("Error fetching track", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();

    // Real-time comments
    const q = query(
      collection(db, "tracks", trackId, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const c: Comment[] = [];
      snapshot.forEach((doc) => {
        c.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(c);
    });

    return () => unsubscribe();
  }, [trackId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !trackId || !newComment.trim()) return;

    try {
      await addDoc(collection(db, "tracks", trackId, "comments"), {
        trackId,
        userId: currentUser.uid,
        displayName: currentUser.displayName || "User",
        photoURL: currentUser.photoURL,
        content: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error("Error posting comment", err);
    }
  };

  const handlePlay = () => {
    if (track) {
      if (currentTrack?.id === track.id) {
        togglePlayPause();
      } else {
        playTrack(track);
      }
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div></div>;
  if (!track) return <div className="p-8 text-center">Track not found.</div>;

  return (
    <AnimatedPage>
      <div className="space-y-12 pb-20">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover Art */}
          <div className="w-full md:w-1/3 max-w-[400px] relative z-10">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative group bg-slate-800 border border-white/5">
              <img src={track.coverImageURL} alt={track.title} className="w-full h-full object-cover" />
              
              {/* Spinning Vinyl Effect Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent pointer-events-none`}></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={handlePlay}
                  className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-xl"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>
              </div>
            </div>
          </div>

          {/* Info & Tech Stats */}
          <div className="flex-1 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {track.genre || "Music"}
                </span>
                <span className="text-gray-500 text-xs font-mono flex items-center gap-1">
                    <Clock size={12} /> 128kbps / 44.1kHz
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight leading-none">{track.title}</h1>
              <Link to={`/profile/${track.artistId}`} className="text-xl text-gray-300 hover:text-white transition-colors block font-medium">
                {track.artistName}
              </Link>
            </div>

            {/* AI Analysis Component */}
            {trackId && <SonicAnalysis trackId={trackId} />}

            <div className="flex items-center space-x-6 mt-4">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-pink-500 transition-colors px-4 py-2 rounded-full bg-dark-light/50">
                <Heart size={20} />
                <span className="font-mono font-bold">{track.likesCount}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full bg-dark-light/50">
                <Share2 size={20} />
                <span className="text-sm font-bold">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description & Comments Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Description Card */}
             <div className="glass-panel rounded-2xl p-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">About the track</h3>
                <p className="text-gray-200 leading-relaxed text-lg font-light">{track.description || "No description provided."}</p>
                {track.tags && track.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {track.tags.map((tag, i) => (
                      <span key={i} className="text-xs font-mono text-primary bg-primary/5 border border-primary/20 px-3 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
             </div>

             {/* Comments */}
             <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                   <MessageCircle className="text-secondary" /> Comments <span className="text-gray-500 text-lg">({comments.length})</span>
                </h3>

                {currentUser && (
                  <form onSubmit={handlePostComment} className="flex gap-4 mb-8 bg-dark-light/30 p-4 rounded-2xl border border-dashed border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-gray-600"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                        {comment.photoURL ? (
                          <img src={comment.photoURL} alt={comment.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                            {comment.displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-bold text-white text-sm">{comment.displayName}</h4>
                          <span className="text-xs text-slate-500">Just now</span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
             <div className="bg-gradient-to-b from-dark-light to-transparent rounded-2xl p-1 border border-white/5">
                <div className="p-5">
                   <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                       <Music size={16} className="text-primary"/> More from Artist
                   </h4>
                   <div className="h-32 flex items-center justify-center text-gray-600 text-sm border border-dashed border-slate-800 rounded-xl">
                       Explore Profile
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default TrackDetail;