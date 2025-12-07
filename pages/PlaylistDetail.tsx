import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Playlist, Track } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, MoreHorizontal, Shuffle } from 'lucide-react';
import TrackCard from '../components/TrackCard';
import AnimatedPage from '../components/AnimatedPage';

const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) return;

    const fetchPlaylist = async () => {
      try {
        const docRef = doc(db, "playlists", playlistId);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const playlistData = { id: snap.id, ...snap.data() } as Playlist;
          setPlaylist(playlistData);

          // Fetch all tracks in the playlist
          // Note: In a production app with huge playlists, we would paginate this or store mini-track data in the playlist
          if (playlistData.tracks && playlistData.tracks.length > 0) {
             const trackPromises = playlistData.tracks.map(trackId => getDoc(doc(db, "tracks", trackId)));
             const trackSnaps = await Promise.all(trackPromises);
             const fetchedTracks: Track[] = [];
             trackSnaps.forEach(tSnap => {
               if (tSnap.exists()) {
                 fetchedTracks.push({ id: tSnap.id, ...tSnap.data() } as Track);
               }
             });
             setTracks(fetchedTracks);
          }
        }
      } catch (err) {
        console.error("Error fetching playlist", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      // Play first track, pass the rest as queue context
      playTrack(tracks[0], tracks);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
  if (!playlist) return <div className="p-12 text-center text-gray-400">Playlist not found</div>;

  return (
    <AnimatedPage>
      <div className="pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
           <div className="w-48 h-48 md:w-60 md:h-60 shadow-2xl rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 mx-auto md:mx-0">
              <img 
                src={playlist.coverImageURL} 
                alt={playlist.name}
                className="w-full h-full object-cover" 
              />
           </div>
           <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Playlist</span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{playlist.name}</h1>
              <p className="text-gray-400 mb-6 max-w-lg">{playlist.description || `Created by a U-Fi user.`}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <button 
                   onClick={handlePlayAll}
                   className="flex items-center gap-2 bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30 transition-transform hover:scale-105"
                 >
                   <Play fill="currentColor" size={20} />
                   Play All
                 </button>
                 <button className="p-3 text-gray-400 hover:text-white border border-slate-700 rounded-full hover:bg-slate-800 transition-colors">
                   <Shuffle size={20} />
                 </button>
                 <button className="p-3 text-gray-400 hover:text-white border border-slate-700 rounded-full hover:bg-slate-800 transition-colors">
                   <MoreHorizontal size={20} />
                 </button>
              </div>
           </div>
        </div>

        {/* Tracks List */}
        <div className="bg-dark-light/30 border border-slate-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex text-xs font-bold text-gray-500 uppercase tracking-wider">
             <div className="w-8">#</div>
             <div className="flex-1">Title</div>
             <div className="hidden md:block w-40">Album/Artist</div>
             <div className="w-12 text-right"><Clock size={14} className="ml-auto"/></div>
          </div>
          
          <div>
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <div 
                  key={track.id}
                  onClick={() => playTrack(track, tracks)}
                  className="group px-6 py-3 flex items-center hover:bg-white/5 cursor-pointer transition-colors border-b border-slate-800/30 last:border-0"
                >
                   <div className="w-8 text-gray-500 text-sm font-mono group-hover:text-primary transition-colors">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play size={14} className="hidden group-hover:block" fill="currentColor"/>
                   </div>
                   <div className="flex-1 flex items-center gap-3">
                      <img src={track.coverImageURL} className="w-10 h-10 rounded bg-slate-800 object-cover" alt="" />
                      <div>
                         <div className="text-white font-medium text-sm">{track.title}</div>
                         <div className="md:hidden text-xs text-gray-500">{track.artistName}</div>
                      </div>
                   </div>
                   <div className="hidden md:block w-40 text-sm text-gray-400 hover:text-white hover:underline transition-colors">
                      {track.artistName}
                   </div>
                   <div className="w-12 text-right text-sm text-gray-500 font-mono">
                      3:42
                   </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                 No tracks added to this playlist yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default PlaylistDetail;