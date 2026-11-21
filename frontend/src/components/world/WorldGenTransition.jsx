import React, { useState, useEffect } from 'react';

const MESSAGES = [
  'GENERATING INTERVIEW WORLD...',
  'BUILDING STUDY ROOM & DESK...',
  'PREPARING INTERVIEWER...',
  'LOADING ROLE CONTEXT...',
  'CONNECTING GEMINI BRAIN...'
];

export default function WorldGenTransition({ onComplete, soundEffects }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    soundEffects?.playPop();

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 22;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 200);
          return 100;
        }
        return next;
      });

      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 320);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 mc-dirt-bg flex flex-col items-center justify-center select-none p-6 animate-fade-in">
      <div className="w-full max-w-md mc-hud-panel p-6 text-center space-y-4">
        {/* Loading Message */}
        <h3 className="pixel-font text-2xl sm:text-3xl text-zinc-100 tracking-wider">
          {MESSAGES[msgIndex]}
        </h3>

        {/* Minecraft Progress Bar */}
        <div className="w-full bg-zinc-900 border-2 border-zinc-700 h-6 p-1 rounded-sm shadow-inner">
          <div
            className="h-full bg-cyan-400 transition-all duration-300 rounded-sm shadow-[0_0_12px_rgba(0,229,195,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-[11px] font-mono text-zinc-400 tracking-widest uppercase">
          World Generation • {progress}%
        </div>
      </div>
    </div>
  );
}
