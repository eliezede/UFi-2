
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Simulation settings
    const bufferLength = 16; 

    const draw = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; 
      }

      animationRef.current = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // PURE SIMULATION MODE
        // We do not connect to audio context to avoid CORS issues which mute the audio.
        // Instead, we generate a pleasant wave visualization based on time.
        
        const time = Date.now() / 150;
        const indexFactor = i / 3;
        
        // Combine sine waves for organic movement
        // A base wave + a faster jitter wave
        const wave1 = Math.sin(time + indexFactor);
        const wave2 = Math.cos(time * 2 + i);
        
        const noise = (wave1 + wave2) / 2;
        
        // Scale to canvas height (mostly keeping it in the middle/lower range)
        const amplitude = Math.abs(noise) * (canvas.height * 0.8);
        
        // Add random jitter for "energy"
        const jitter = Math.random() * (canvas.height * 0.2);
        
        barHeight = amplitude + jitter;
        
        // Clamp height
        if (barHeight > canvas.height) barHeight = canvas.height;
        if (barHeight < 2) barHeight = 2;

        // Gradient logic
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // Primary
        gradient.addColorStop(1, '#a855f7'); // Secondary

        ctx.fillStyle = gradient;
        
        // Draw Rounded bars
        ctx.beginPath();
        // Centered vertically or bottom aligned? Let's do bottom aligned for classic look
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 2);
        ctx.fill();

        x += barWidth;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={40} 
      className="opacity-80"
    />
  );
};

export default AudioVisualizer;
