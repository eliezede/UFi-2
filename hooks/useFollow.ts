import { useState, useEffect } from 'react';
import { doc, getDoc, runTransaction, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export const useFollow = (targetUserId: string) => {
  const { currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !targetUserId || currentUser.uid === targetUserId) return;

    const checkFollowStatus = async () => {
      // Check if current user is following target user
      const docRef = doc(db, "users", currentUser.uid, "following", targetUserId);
      const docSnap = await getDoc(docRef);
      setIsFollowing(docSnap.exists());
    };

    checkFollowStatus();
  }, [currentUser, targetUserId]);

  const toggleFollow = async () => {
    if (!currentUser || !targetUserId || loading) return;
    setLoading(true);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const targetRef = doc(db, "users", targetUserId);
      const followingRef = doc(db, "users", currentUser.uid, "following", targetUserId);
      const followersRef = doc(db, "users", targetUserId, "followers", currentUser.uid);

      if (isFollowing) {
        // UNFOLLOW
        await runTransaction(db, async (transaction) => {
          transaction.delete(followingRef);
          transaction.delete(followersRef);
          
          // Decrement counts (using safe increments/decrements in transactions ideally, but simplistic here)
          // Note: In real production, use Distributed Counters or Cloud Functions for reliability
          const userDoc = await transaction.get(userRef);
          const targetDoc = await transaction.get(targetRef);

          if (userDoc.exists()) {
             const currentCount = userDoc.data().followingCount || 0;
             transaction.update(userRef, { followingCount: Math.max(0, currentCount - 1) });
          }
          if (targetDoc.exists()) {
             const currentCount = targetDoc.data().followersCount || 0;
             transaction.update(targetRef, { followersCount: Math.max(0, currentCount - 1) });
          }
        });
        setIsFollowing(false);
      } else {
        // FOLLOW
        await runTransaction(db, async (transaction) => {
          transaction.set(followingRef, { since: serverTimestamp() });
          transaction.set(followersRef, { since: serverTimestamp() });
          
          const userDoc = await transaction.get(userRef);
          const targetDoc = await transaction.get(targetRef);

          if (userDoc.exists()) {
             const currentCount = userDoc.data().followingCount || 0;
             transaction.update(userRef, { followingCount: currentCount + 1 });
          }
          if (targetDoc.exists()) {
             const currentCount = targetDoc.data().followersCount || 0;
             transaction.update(targetRef, { followersCount: currentCount + 1 });
          }
        });

        // Add Activity Log
        await addDoc(collection(db, "activities"), {
            type: 'follow',
            fromUserId: currentUser.uid,
            fromUserName: currentUser.displayName || 'User',
            fromUserPhoto: currentUser.photoURL,
            toUserId: targetUserId,
            createdAt: serverTimestamp()
        });

        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, toggleFollow, loading };
};