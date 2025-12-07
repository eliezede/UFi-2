import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Music2, Radio, Mic2, Globe, Sparkles, PlayCircle, User } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebase';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Guest login failed", err);
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] opacity-50" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Music2 className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter">U-Fi.</span>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={handleGuestLogin}
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
                <User size={16} /> Guest Mode
            </button>
            <button 
            onClick={goToLogin}
            className="text-sm font-semibold text-white bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20 transition-colors border border-white/5"
            >
            Log In
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 md:py-24 text-center max-w-4xl relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm text-xs font-medium text-primary mb-8 animate-fade-in-up">
          <Sparkles size={12} />
          <span>The Future of Social Music is Here</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 tracking-tight">
          Share Your Sound. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
            Find Your Crowd.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          U-Fi is the place where music meets social. Upload your original tracks, 
          use AI to enhance your creativity, and connect with a global community of listeners.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={goToLogin}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-primary/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Start Listening Free
          </button>
          <button 
            onClick={handleGuestLogin}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white rounded-full font-bold text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} />
            Guest Demo
          </button>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-20 relative mx-auto w-full max-w-5xl perspective-1000">
          <div className="relative z-10 bg-dark-light border border-slate-700 rounded-2xl p-4 shadow-2xl rotate-x-12 transform transition-transform duration-700 hover:rotate-0">
             {/* Fake App Interface */}
             <div className="bg-dark rounded-xl overflow-hidden aspect-video relative flex">
                <div className="w-64 border-r border-slate-800 p-4 hidden md:block">
                   <div className="h-8 w-24 bg-slate-800 rounded mb-6"/>
                   <div className="space-y-3">
                      <div className="h-4 w-full bg-slate-800/50 rounded"/>
                      <div className="h-4 w-3/4 bg-slate-800/50 rounded"/>
                      <div className="h-4 w-5/6 bg-slate-800/50 rounded"/>
                   </div>
                </div>
                <div className="flex-1 p-6">
                   <div className="flex gap-4 mb-6">
                      <div className="w-32 h-32 bg-gradient-to-tr from-primary to-secondary rounded-lg shadow-lg"/>
                      <div className="space-y-2 mt-4">
                         <div className="h-6 w-48 bg-slate-800 rounded"/>
                         <div className="h-4 w-32 bg-slate-800/50 rounded"/>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-slate-800/30 rounded-lg"/>
                      <div className="h-24 bg-slate-800/30 rounded-lg"/>
                      <div className="h-24 bg-slate-800/30 rounded-lg"/>
                   </div>
                </div>
             </div>
          </div>
          {/* Glow behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] -z-10" />
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-dark-light/30 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">More Than Just Streaming.</h2>
            <p className="text-gray-400">Everything you need to create, share, and grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Radio size={32} className="text-primary" />}
              title="Social First"
              desc="It's like Instagram for your ears. Post tracks, gain followers, and interact with a community that cares about music."
            />
            <FeatureCard 
              icon={<Mic2 size={32} className="text-secondary" />}
              title="For Creators"
              desc="Upload your original beats, songs, or AI experiments. Get feedback instantly and build your portfolio."
            />
            <FeatureCard 
              icon={<Globe size={32} className="text-pink-500" />}
              title="Global Stage"
              desc="Built-in translation and multi-language support means your music travels further, breaking barriers."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 text-center container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to be heard?</h2>
        <button 
            onClick={goToLogin}
            className="px-10 py-5 bg-white text-dark font-black text-xl rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-white/10"
        >
            Join U-Fi Now
        </button>
        <p className="mt-8 text-gray-500 text-sm">
          © {new Date().getFullYear()} U-Fi Music Social. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({ icon, title, desc }) => (
  <div className="bg-dark border border-slate-800 p-8 rounded-3xl hover:border-slate-600 transition-all hover:translate-y-[-5px]">
    <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default Landing;