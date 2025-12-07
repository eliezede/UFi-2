import React, { useEffect, useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import ActivityItem from './ActivityItem';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { UserPlus, Activity as ActivityIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RightSidebar: React.FC = () => {
  const { activities, loading: loadingActivities } = useActivity();
  const [trendingUsers, setTrendingUsers] = useState<UserProfile[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      // In a real app, optimize this to not fetch all users or use a cloud function
      const q = query(collection(db, "users"), orderBy("followersCount", "desc"), limit(3));
      const snap = await getDocs(q);
      const users: UserProfile[] = [];
      snap.forEach(doc => {
         if (doc.id !== currentUser?.uid) {
             users.push({ uid: doc.id, ...doc.data() } as UserProfile);
         }
      });
      setTrendingUsers(users);
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <aside className="w-80 h-screen fixed right-0 top-0 pt-20 pb-24 px-6 overflow-y-auto hidden lg:flex flex-col gap-8 border-l border-slate-800/50 bg-dark/30 backdrop-blur-sm z-10">
       
       {/* Trending Creators */}
       <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <span>Who to follow</span>
          </h3>
          <div className="space-y-4">
             {trendingUsers.map(user => (
                <div key={user.uid} className="flex items-center justify-between group">
                    <Link to={`/profile/${user.uid}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                             <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.displayName}</span>
                            <span className="text-xs text-gray-500">@{user.displayName?.toLowerCase().replace(/\s/g, '')}</span>
                        </div>
                    </Link>
                    <Link to={`/profile/${user.uid}`} className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                        <UserPlus size={16} />
                    </Link>
                </div>
             ))}
          </div>
       </section>

       {/* Global Activity */}
       <section className="flex-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <ActivityIcon size={14} className="text-secondary" />
             <span>Global Activity</span>
          </h3>
          
          <div className="space-y-1">
            {loadingActivities ? (
               <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-800/30 rounded-lg animate-pulse" />)}
               </div>
            ) : activities.length > 0 ? (
                activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))
            ) : (
                <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
       </section>

    </aside>
  );
};

export default RightSidebar;