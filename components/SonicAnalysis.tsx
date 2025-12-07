import React, { useEffect, useRef } from 'react';
import { Activity, Zap, Radio } from 'lucide-react';

interface SonicAnalysisProps {
  trackId: string; // Used to seed the random visualization
}

const SonicAnalysis: React.FC<SonicAnalysisProps> = ({ trackId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock "AI" metrics based on string hash
  const pseudoRandom = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = pseudoRandom(trackId);
  const bpm = 80 + (seed % 60);
  const energy = 40 + (seed % 60);
  const danceability = 30 + (seed % 70);
  const keys = ['C Maj', 'Am', 'G Maj', 'Em', 'D Maj', 'Bm', 'F Maj', 'Dm'];
  const key = keys[seed % keys.length];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const drawRadar = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 50;

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * (i/3), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Data Shape
      ctx.beginPath();
      const points = [
        energy, 
        danceability, 
        (bpm / 140) * 100, 
        (seed % 100), 
        100 - energy
      ];
      
      const angleStep = (Math.PI * 2) / points.length;
      
      points.forEach((val, i) => {
        // Add subtle animation pulse
        const pulse = Math.sin(angle + i) * 5;
        const r = (val + pulse) / 100 * radius;
        const x = centerX + Math.cos(i * angleStep - Math.PI / 2) * r;
        const y = centerY + Math.sin(i * angleStep - Math.PI / 2) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.closePath();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // Primary color transparent
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      angle += 0.02;
      animationFrameId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => cancelAnimationFrame(animationFrameId);
  }, [seed, energy, danceability, bpm]);

  return (
    <div className="bg-dark-light/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-3 opacity-30">
            <Radio className="w-12 h-12 text-primary animate-pulse-slow" />
        </div>
        
        <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">AI Sonic Analysis</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Radar Chart */}
            <div className="relative w-32 h-32 flex-shrink-0">
                <canvas ref={canvasRef} width={128} height={128} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1 w-full">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-mono">BPM</p>
                    <p className="text-xl font-black text-white font-mono">{bpm}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-mono">Key</p>
                    <p className="text-xl font-black text-white font-mono">{key}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-mono">Energy</p>
                    <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-primary" style={{width: `${energy}%`}}></div>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-mono">Mood</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-white">Electric</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SonicAnalysis;