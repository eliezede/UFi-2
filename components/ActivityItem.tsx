import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from '../types';
import { Heart, UserPlus, MessageCircle, Music, Radio } from 'lucide-react';

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'like': return <Heart size={14} className="text-pink-500 fill-pink-500" />;
      case 'follow': return <UserPlus size={14} className="text-primary" />;
      case 'comment': return <MessageCircle size={14} className="text-blue-400" />;
      case 'upload': return <Music size={14} className="text-secondary" />;
      default: return <Radio size={14} className="text-gray-400" />;
    }
  };

  const renderContent = () => {
    switch (activity.type) {
      case 'like':
        return (
          <>
            liked <span className="text-white font-medium hover:underline">{activity.trackTitle}</span>
          </>
        );
      case 'follow':
        return (
          <>
            started following <span className="text-white font-medium">someone</span>
          </>
        );
      case 'comment':
        return (
          <>
            commented on <span className="text-white font-medium hover:underline">{activity.trackTitle}</span>
          </>
        );
      case 'upload':
        return (
            <>
              uploaded a new track <span className="text-white font-medium hover:underline">{activity.trackTitle}</span>
            </>
          );
      default:
        return <span>did something cool</span>;
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-slate-800/50 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors group">
      {/* Avatar */}
      <div className="relative">
        <Link to={`/profile/${activity.fromUserId}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
            {activity.fromUserPhoto ? (
                <img src={activity.fromUserPhoto} alt={activity.fromUserName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                {activity.fromUserName[0]}
                </div>
            )}
            </div>
        </Link>
        <div className="absolute -bottom-1 -right-1 bg-dark rounded-full p-0.5 border border-slate-800">
             {getIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 leading-tight">
          <Link to={`/profile/${activity.fromUserId}`} className="font-bold text-white hover:underline mr-1">
            {activity.fromUserName}
          </Link>
          {renderContent()}
        </div>
        <div className="text-[10px] text-gray-600 mt-1 font-medium">
           Just now
        </div>
      </div>

      {/* Optional Track Preview */}
      {(activity.type === 'like' || activity.type === 'upload') && activity.trackCover && (
          <Link to={`/track/${activity.trackId}`} className="w-8 h-8 rounded-md bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700 hover:border-white/40 transition-colors">
              <img src={activity.trackCover} alt="Track" className="w-full h-full object-cover" />
          </Link>
      )}
    </div>
  );
};

export default ActivityItem;