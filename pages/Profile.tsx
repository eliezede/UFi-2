import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../services/firebase';
import { Track, Playlist, UserProfile } from '../types';
import TrackCard from '../components/TrackCard';
import { User, Settings, Disc, ListMusic, Plus, X, Globe, Edit3, UserCheck, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFollow } from '../hooks/useFollow';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');
  const [loading, setLoading] = useState(true);
  
  // Follow Logic
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow(userId || '');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLanguage, setEditLanguage] = useState('en');

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Fetch User Profile Data from Firestore
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfile;
          setUserProfile(data);
          // Set initial language if viewing own profile
          if (currentUser?.uid === userId && data.language) {
             i18n.changeLanguage(data.language);
          }
        } else if (currentUser?.uid === userId) {
           // Create profile doc if it doesn't exist for logged in user
           const newProfile: UserProfile = {
             uid: currentUser.uid,
             displayName: currentUser.displayName,
             email: currentUser.email,
             photoURL: currentUser.photoURL,
             bio: "Music lover.",
             language: 'en',
             followersCount: 0,
             followingCount: 0
           };
           await setDoc(userDocRef, newProfile);
           setUserProfile(newProfile);
        } else {
           // Fallback for non-existent profile of other user
           setUserProfile({
             uid: userId,
             displayName: "Unknown User",
             email: null,
             photoURL: null,
             bio: ""
           });
        }

        // Fetch Tracks
        const tracksQ = query(collection(db, "tracks"), where("artistId", "==", userId));
        const tracksSnap = await getDocs(tracksQ);
        const tracks: Track[] = [];
        tracksSnap.forEach((doc) => {
          tracks.push({ id: doc.id, ...doc.data() } as Track);
        });
        setUserTracks(tracks);

        // Fetch Playlists
        const playlistsQ = query(collection(db, "playlists"), where("creatorId", "==", userId));
        const playlistsSnap = await getDocs(playlistsQ);
        const playlists: Playlist[] = [];
        playlistsSnap.forEach((doc) => {
          playlists.push({ id: doc.id, ...doc.data() } as Playlist);
        });
        setUserPlaylists(playlists);

      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser, i18n, isFollowing]); // Re-fetch when follow status changes to update counters roughly

  const handleCreatePlaylist = async () => {
    const name = prompt("Enter playlist name:");
    if (!name || !currentUser) return;

    try {
      const newPlaylist = {
        creatorId: currentUser.uid,
        name,
        description: "",
        tracks: [],
        createdAt: serverTimestamp(),
        coverImageURL: "https://picsum.photos/seed/" + name + "/300/300" 
      };
      
      const docRef = await addDoc(collection(db, "playlists"), newPlaylist);
      setUserPlaylists([...userPlaylists, { id: docRef.id, ...newPlaylist } as unknown as Playlist]);
    } catch (e) {
      console.error("Error creating playlist", e);
      alert("Could not create playlist");
    }
  };

  const openEditModal = () => {
    if (userProfile) {
      setEditName(userProfile.displayName || '');
      setEditBio(userProfile.bio || '');
      setEditLanguage(userProfile.language || 'en');
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !userProfile) return;
    
    try {
      // 1. Update Firebase Auth Profile (Display Name)
      if (editName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: editName });
      }

      // 2. Update Firestore Document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: editName,
        bio: editBio,
        language: editLanguage
      });

      // 3. Update Local State & i18n
      setUserProfile({
        ...userProfile,
        displayName: editName,
        bio: editBio,
        language: editLanguage as 'en' | 'es' | 'pt'
      });
      
      i18n.changeLanguage(editLanguage);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10 pb-10 border-b border-slate-800 relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-4 border-dark shadow-2xl overflow-hidden flex-shrink-0">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             <User size={64} className="text-slate-400" />
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          {/* <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Artist</h4> */}
          <h1 className="text-3xl md:text-5xl font-black text-white">
            {userProfile?.displayName || "User"}
          </h1>
          <p className="text-gray-300 max-w-lg mx-auto md:mx-0 text-sm md:text-base leading-relaxed">
            {userProfile?.bio || "No bio yet."}
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 text-xs md:text-sm font-medium pt-2">
             <span className="flex items-center gap-1"><span className="text-white font-bold">{userTracks.length}</span> {t('profile.tracks')}</span>
             <span>•</span>
             <span className="flex items-center gap-1"><span className="text-white font-bold">{userProfile?.followersCount || 0}</span> Followers</span>
             <span>•</span>
             <span className="flex items-center gap-1"><span className="text-white font-bold">{userProfile?.followingCount || 0}</span> {t('profile.following')}</span>
          </div>
        </div>

        {/* Action Buttons (Edit or Follow) */}
        <div className="absolute top-0 right-0 md:relative md:top-auto md:right-auto">
          {isOwnProfile ? (
            <button 
              onClick={openEditModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-full border border-slate-600 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Settings size={16} />
              <span className="hidden md:inline">{t('profile.edit')}</span>
            </button>
          ) : (
            <button 
              onClick={toggleFollow}
              disabled={followLoading}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                isFollowing 
                  ? 'bg-transparent border border-slate-600 text-white hover:border-red-500 hover:text-red-500' 
                  : 'bg-primary text-white hover:bg-indigo-600 shadow-lg shadow-primary/30'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('tracks')}
          className={`pb-4 px-2 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'tracks' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
        >
          <Disc size={20} />
          <span>{t('profile.tracks')}</span>
          {activeTab === 'tracks' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        
        <button 
           onClick={() => setActiveTab('playlists')}
           className={`pb-4 px-2 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'playlists' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
        >
          <ListMusic size={20} />
          <span>{t('profile.playlists')}</span>
          {activeTab === 'playlists' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {loading ? (
           <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <>
            {activeTab === 'tracks' && (
              userTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userTracks.map(track => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-dark-light/30 rounded-xl border border-dashed border-slate-800">
                  <p className="text-gray-400">No tracks uploaded yet.</p>
                </div>
              )
            )}

            {activeTab === 'playlists' && (
              <div>
                {isOwnProfile && (
                  <button 
                    onClick={handleCreatePlaylist}
                    className="mb-6 flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Plus size={18} />
                    <span>Create New Playlist</span>
                  </button>
                )}
                
                {userPlaylists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {userPlaylists.map(playlist => (
                      <div key={playlist.id} className="group cursor-pointer">
                        <div className="aspect-square bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                           {playlist.coverImageURL ? (
                             <img src={playlist.coverImageURL} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={playlist.name}/>
                           ) : (
                             <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                               <ListMusic size={40} />
                             </div>
                           )}
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        </div>
                        <h3 className="font-bold text-white truncate text-sm">{playlist.name}</h3>
                        <p className="text-xs text-gray-500">{playlist.tracks.length} tracks</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                     <p className="text-gray-500">No playlists found.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-light border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit3 size={20} className="text-primary" />
              {t('profile.edit')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('profile.displayName')}</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('profile.bio')}</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[100px]"
                />
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                   {t('profile.language')}
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => setEditLanguage('en')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${editLanguage === 'en' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-gray-500'}`}
                    >
                      <span className="text-2xl mb-1">🇺🇸</span>
                      <span className="text-xs font-bold">English</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditLanguage('pt')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${editLanguage === 'pt' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-gray-500'}`}
                    >
                      <span className="text-2xl mb-1">🇧🇷</span>
                      <span className="text-xs font-bold">Português</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditLanguage('es')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${editLanguage === 'es' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:border-gray-500'}`}
                    >
                      <span className="text-2xl mb-1">🇪🇸</span>
                      <span className="text-xs font-bold">Español</span>
                    </button>
                 </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                {t('profile.cancel')}
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-3 bg-primary hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all"
              >
                {t('profile.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;