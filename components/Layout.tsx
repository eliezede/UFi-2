import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import RightSidebar from './RightSidebar';
import ParticleBackground from './ParticleBackground';
import { usePlayer } from '../context/PlayerContext';
import { Home, Compass, Upload, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTrack } = usePlayer();
  const { currentUser } = useAuth();
  
  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-gray-400'
    }`;

  return (
    <div className="min-h-screen bg-dark flex text-white font-sans relative">
      <ParticleBackground />

      {/* Mobile Top Header (Sticky) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-dark/95 backdrop-blur-md border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <h1 className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          U-Fi.
        </h1>
        <div className="relative">
          <Bell size={24} className="text-gray-300" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark"></div>
        </div>
      </div>

      {/* Desktop Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      {/* Added Right Sidebar space for LG screens */}
      <main className={`flex-1 w-full md:ml-64 lg:mr-80 p-4 md:p-8 transition-all duration-300 ${currentTrack ? 'mb-32 md:mb-24' : 'mb-20 md:mb-0'} mt-16 md:mt-0 relative z-10`}>
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* Desktop Right Sidebar (Only lg+) */}
      <RightSidebar />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-light/95 backdrop-blur-lg border-t border-slate-800 z-40 flex justify-around pb-safe pt-2 px-2 h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <NavLink to="/" className={mobileNavClass}>
          <Home size={22} className="mb-0.5" />
        </NavLink>
        <NavLink to="/explore" className={mobileNavClass}>
          <Compass size={22} className="mb-0.5" />
        </NavLink>
        <NavLink to="/upload" className={mobileNavClass}>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center -mt-4 shadow-lg shadow-primary/40 border-4 border-dark">
             <Upload size={20} className="text-white" />
          </div>
        </NavLink>
        <NavLink to={currentUser ? `/profile/${currentUser.uid}` : '/login'} className={mobileNavClass}>
          <User size={22} className="mb-0.5" />
        </NavLink>
      </div>

      <PlayerBar />
    </div>
  );
};

export default Layout;