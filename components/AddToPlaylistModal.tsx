import React, { useEffect, useState } from 'react';
import { X, Plus, ListMusic, Check } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Playlist } from '../types';

interface AddToPlaylistModalProps {
  trackId: string;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ trackId, onClose }) => {
  const { currentUser } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchPlaylists = async () => {
      try {
        const q = query(collection(db, "playlists"), where("creatorId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        const fetched: Playlist[] = [];
        snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() } as Playlist));
        setPlaylists(fetched);
      } catch (err) {
        console.error("Error fetching playlists", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [currentUser]);

  const handleCreatePlaylist = async () => {
    if (!currentUser || !newPlaylistName.trim()) return;
    setCreating(true);
    try {
      const newPlaylist = {
        creatorId: currentUser.uid,
        name: newPlaylistName,
        description: "",
        tracks: [trackId], // Add current track immediately
        createdAt: serverTimestamp(),
        coverImageURL: `https://picsum.photos/seed/${newPlaylistName}/300/300`
      };
      await addDoc(collection(db, "playlists"), newPlaylist);
      onClose();
      alert("Playlist created and track added!");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const playlistRef = doc(db, "playlists", playlistId);
      await updateDoc(playlistRef, {
        tracks: arrayUnion(trackId)
      });
      onClose();
      alert("Added to playlist!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-light border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ListMusic className="text-primary" size={20} />
            Add to Playlist
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {loading ? (
             <div className="text-center py-4 text-gray-400">Loading playlists...</div>
          ) : (
            playlists.map(playlist => {
              const hasTrack = playlist.tracks.includes(trackId);
              return (
                <button
                  key={playlist.id}
                  disabled={hasTrack}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden">
                       {playlist.coverImageURL && <img src={playlist.coverImageURL} className="w-full h-full object-cover"/>}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{playlist.name}</p>
                      <p className="text-xs text-gray-500">{playlist.tracks.length} tracks</p>
                    </div>
                  </div>
                  {hasTrack && <Check size={16} className="text-green-500" />}
                </button>
              );
            })
          )}
          
          {playlists.length === 0 && !loading && (
             <p className="text-center text-gray-500 text-sm py-4">No playlists yet.</p>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
           <p className="text-xs text-gray-400 uppercase font-bold mb-2">Create New</p>
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Playlist Name"
               value={newPlaylistName}
               onChange={(e) => setNewPlaylistName(e.target.value)}
               className="flex-1 bg-dark border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
             />
             <button 
               onClick={handleCreatePlaylist}
               disabled={creating || !newPlaylistName}
               className="bg-primary hover:bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
             >
               <Plus size={20} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;