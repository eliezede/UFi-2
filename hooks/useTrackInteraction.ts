import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, increment, setDoc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Track } from '../types';

export const useTrackInteraction = (track: Track) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(track.likesCount);
  const [loading, setLoading] = useState(false);

  // Check if user has liked this track on mount
  useEffect(() => {
    if (!currentUser) return;
    
    const checkLike = async () => {
      const likeRef = doc(db, "users", currentUser.uid, "likes", track.id);
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) {
        setIsLiked(true);
      }
    };
    
    checkLike();
  }, [currentUser, track.id]);

  const toggleLike = async () => {
    if (!currentUser || loading) return;
    setLoading(true);

    const trackRef = doc(db, "tracks", track.id);
    const likeRef = doc(db, "users", currentUser.uid, "likes", track.id);

    try {
      if (isLiked) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(trackRef, { likesCount: increment(-1) });
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like
        await setDoc(likeRef, {
            trackId: track.id,
            likedAt: new Date()
        });
        await updateDoc(trackRef, { likesCount: increment(1) });
        setLikesCount(prev => prev + 1);
        setIsLiked(true);

        // Add Activity Log
        // Note: We don't wait for this to finish to update UI
        addDoc(collection(db, "activities"), {
            type: 'like',
            fromUserId: currentUser.uid,
            fromUserName: currentUser.displayName || 'User',
            fromUserPhoto: currentUser.photoURL,
            trackId: track.id,
            trackTitle: track.title,
            trackCover: track.coverImageURL,
            createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isLiked, likesCount, toggleLike, loading };
};