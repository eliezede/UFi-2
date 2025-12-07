import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Track } from '../types';
import FeedPost from '../components/FeedPost';
import StoryTray from '../components/StoryTray';
import AnimatedPage from '../components/AnimatedPage';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const q = query(
          collection(db, "tracks"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedTracks: Track[] = [];
        querySnapshot.forEach((doc) => {
          fetchedTracks.push({ id: doc.id, ...doc.data() } as Track);
        });
        
        setTracks(fetchedTracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-20">
        {/* Stories Section */}
        <section className="mb-2">
          <StoryTray />
        </section>

        {/* Desktop Header */}
        <header className="hidden md:block mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            {t('home.feed')}
          </h2>
        </header>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {tracks.length === 0 ? (
              <div className="text-center py-20 bg-dark-light/50 rounded-2xl border border-dashed border-slate-700">
                <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Flame className="text-slate-500" size={32} />
                </div>
                <p className="text-gray-400 text-lg">No tracks yet. Be the first to upload!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {tracks.map(track => (
                  <FeedPost key={track.id} track={track} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  );
};

export default Home;