import React from 'react';
import { Plus } from 'lucide-react';

const stories = [
  { id: 'you', name: 'You', img: null, isUser: true },
  { id: '1', name: 'sarah_synth', img: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '2', name: 'lucas_beats', img: 'https://i.pravatar.cc/150?u=lucas' },
  { id: '3', name: 'ai_maestro', img: 'https://i.pravatar.cc/150?u=ai' },
  { id: '4', name: 'melody_j', img: 'https://i.pravatar.cc/150?u=melody' },
  { id: '5', name: 'rock_dave', img: 'https://i.pravatar.cc/150?u=dave' },
];

const StoryTray: React.FC = () => {
  return (
    <div className="w-full">
      <h3 className="text-xs font-bold text-gray-500 tracking-widest mb-3 px-1 uppercase">Stories</h3>
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide px-1">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[72px] cursor-pointer group">
            <div className={`w-[72px] h-[72px] rounded-full p-[2px] ${story.isUser ? 'border-2 border-dashed border-slate-600' : 'bg-gradient-to-tr from-primary to-secondary'}`}>
              <div className="w-full h-full rounded-full bg-dark border-2 border-dark overflow-hidden relative flex items-center justify-center">
                {story.isUser ? (
                   <div className="w-full h-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                     <Plus className="text-primary w-6 h-6" />
                   </div>
                ) : (
                  <img src={story.img || ''} alt={story.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                )}
              </div>
            </div>
            <span className="text-xs text-gray-300 truncate w-full text-center font-medium">
              {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StoryTray;