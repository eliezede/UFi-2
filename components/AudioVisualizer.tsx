import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const initAudio = () => {
      // 1. Create Audio Context (Singleton-ish logic)
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // Low count for chunky bars
        
        try {
          // Connect the existing Audio Element to the Context
          // Note: If CORS is not enabled on the server, this might silently fail to provide data (all zeros)
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        } catch (e) {
          // Often fails if already connected, which is fine in React Hot Reload
          console.warn("Audio source already connected or CORS error", e);
        }
      }
    };

    // User interaction is usually required to resume AudioContext
    const handleInteract = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    document.addEventListener('click', handleInteract);
    if (isPlaying) initAudio();

    return () => {
      document.removeEventListener('click', handleInteract);
    };
  }, [audioRef, isPlaying]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        // Fade out effect when paused
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; 
      }

      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Check if we are actually receiving data (or if CORS blocked it)
      const hasRealData = dataArray.some(val => val > 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        if (hasRealData) {
            // Use real data
            barHeight = (dataArray[i] / 255) * canvas.height;
        } else {
            // FALLBACK: Simulation Mode (CORS blocked or silence)
            // Generate a wave that looks like music
            const time = Date.now() / 150;
            const indexFactor = i / 5;
            // Combine Sine waves for organic movement
            const noise = Math.sin(time + indexFactor) * Math.cos(time * 0.5 + i);
            const amplitude = Math.abs(noise) * (canvas.height * 0.8);
            barHeight = amplitude * (0.5 + Math.random() * 0.5); // Add jitter
        }

        // Gradient logic
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // Primary
        gradient.addColorStop(1, '#a855f7'); // Secondary

        ctx.fillStyle = gradient;
        
        // Rounded bars
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 2);
        ctx.fill();

        x += barWidth + 2;
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