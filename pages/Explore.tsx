import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import { Flame, Music2, Search, X } from 'lucide-react';

const Explore: React.FC = () => {
  const { t } = useTranslation();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const genres = [
    { name: 'Hip Hop', color: 'from-orange-400 to-red-500' },
    { name: 'Pop', color: 'from-pink-400 to-rose-500' },
    { name: 'Electronic', color: 'from-blue-400 to-indigo-500' },
    { name: 'Rock', color: 'from-red-600 to-red-800' },
    { name: 'Jazz', color: 'from-amber-400 to-orange-600' },
    { name: 'Lo-Fi', color: 'from-purple-400 to-indigo-400' },
    { name: 'R&B', color: 'from-pink-500 to-purple-600' },
    { name: 'Indie', color: 'from-emerald-400 to-teal-500' },
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const q = query(
          collection(db, "tracks"),
          orderBy("likesCount", "desc"),
          limit(20) // Fetch more to allow for client-side search
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedTracks: Track[] = [];
        querySnapshot.forEach((doc) => {
          fetchedTracks.push({ id: doc.id, ...doc.data() } as Track);
        });
        
        setTrendingTracks(fetchedTracks);
        setFilteredTracks(fetchedTracks);
      } catch (error) {
        console.error("Error fetching trending tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Real-time search filtering (Client-side for this MVP)
  useEffect(() => {
    if (searchQuery.trim() === '') {
        setFilteredTracks(trendingTracks);
    } else {
        const lowerQ = searchQuery.toLowerCase();
        const filtered = trendingTracks.filter(track => 
            track.title.toLowerCase().includes(lowerQ) ||
            track.artistName.toLowerCase().includes(lowerQ) ||
            track.genre?.toLowerCase().includes(lowerQ)
        );
        setFilteredTracks(filtered);
    }
  }, [searchQuery, trendingTracks]);

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-4xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            {t('nav.explore')}
        </h2>
        <div className="relative w-full md:w-96">
            <input 
                type="text" 
                placeholder="Search songs, artists, genres..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-light border border-slate-700 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    <X size={16} />
                </button>
            )}
        </div>
      </div>
      
      {/* Genres Grid (Hide if searching) */}
      {!searchQuery && (
        <section className="animate-in slide-in-from-bottom duration-500">
            <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Music2 size={20} className="text-secondary" />
            {t('explore.genres')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {genres.map((genre) => (
                <div 
                key={genre.name}
                onClick={() => setSearchQuery(genre.name)} // Quick genre filter
                className={`h-28 rounded-xl bg-gradient-to-br ${genre.color} p-4 relative overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform shadow-lg group`}
                >
                <h4 className="text-xl font-bold text-white absolute bottom-3 left-4 z-10">{genre.name}</h4>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-0" />
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/30 rounded-full blur-xl group-hover:bg-white/40 transition-colors"></div>
                </div>
            ))}
            </div>
        </section>
      )}

      {/* Trending / Results Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
          {searchQuery ? <Search size={20} className="text-primary"/> : <Flame size={20} className="text-orange-500" />}
          {searchQuery ? `Results for "${searchQuery}"` : t('explore.trending')}
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          filteredTracks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-700">
              {filteredTracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="bg-dark-light/50 rounded-xl p-12 border border-dashed border-slate-800 text-center">
               <Music2 size={48} className="mx-auto text-slate-700 mb-4" />
               <p className="text-gray-400 text-lg">No tracks found matching your search.</p>
               <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-primary font-bold hover:underline"
               >
                   Clear Search
               </button>
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default Explore;