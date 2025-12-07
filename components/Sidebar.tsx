import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, Upload, User, LogOut, LogIn, Music2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
      isActive 
        ? 'bg-primary text-white font-medium shadow-lg shadow-primary/30' 
        : 'text-gray-400 hover:text-white hover:bg-dark-light'
    }`;

  return (
    <aside className="w-64 h-screen bg-dark-light border-r border-slate-800 flex-col fixed left-0 top-0 z-20 hidden md:flex">
      <div className="p-6 flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <Music2 className="text-white w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          U-Fi
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink to="/" className={navClass}>
          <Home size={20} />
          <span>{t('nav.home')}</span>
        </NavLink>
        
        <NavLink to="/explore" className={navClass}>
          <Compass size={20} />
          <span>{t('nav.explore')}</span>
        </NavLink>

        {currentUser && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</p>
            </div>
            
            <NavLink to="/upload" className={navClass}>
              <Upload size={20} />
              <span>{t('nav.upload')}</span>
            </NavLink>

            <NavLink to={`/profile/${currentUser.uid}`} className={navClass}>
              <User size={20} />
              <span>{t('nav.profile')}</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        {currentUser ? (
          <button 
            onClick={() => logout()}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>{t('nav.logout')}</span>
          </button>
        ) : (
          <NavLink to="/login" className={navClass({ isActive: false })}>
            <LogIn size={20} />
            <span>{t('nav.login')}</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;