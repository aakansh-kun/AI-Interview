import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, Check } from 'lucide-react';
import MinecraftAvatar from './MinecraftAvatar';

const CHARACTERS = [
  {
    id: 'arjun',
    name: 'ARJUN',
    title: 'Technical Engineer',
    tags: 'Calm • Analytical • Challenging',
    voice: 'Fenrir',
    accent: 'Indian English',
    desc: 'Deep dives into system design, algorithmic trade-offs, and real-world failure modes.'
  },
  {
    id: 'maya',
    name: 'MAYA',
    title: 'Startup Interviewer',
    tags: 'Energetic • Curious • Fast-Moving',
    voice: 'Kore',
    accent: 'Neutral / International English',
    desc: 'Focuses on 0-to-1 prototyping, shipping velocity, pragmatism, and learning under tight constraints.'
  },
  {
    id: 'james',
    name: 'JAMES',
    title: 'Senior Engineering Manager',
    tags: 'Professional • Challenging • Concise',
    voice: 'Puck',
    accent: 'British English',
    desc: 'Assesses engineering ownership, cross-functional collaboration, technical leadership, and business ROI.'
  },
  {
    id: 'alexa',
    name: 'ALEXA',
    title: 'Recruiter',
    tags: 'Warm • Encouraging • Conversational',
    voice: 'Aoede',
    accent: 'American English',
    desc: 'Evaluates your candidate journey, communication style, cultural alignment, and career aspirations.'
  }
];

export default function CharacterCarousel({
  selectedId = 'arjun',
  onSelect,
  onPreviewVoice,
  soundEffects
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = CHARACTERS.findIndex(c => c.id === selectedId);
    return idx >= 0 ? idx : 0;
  });

  const activeChar = CHARACTERS[currentIndex];

  const handlePrev = () => {
    soundEffects?.playClick();
    setCurrentIndex(prev => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
  };

  const handleNext = () => {
    soundEffects?.playClick();
    setCurrentIndex(prev => (prev + 1) % CHARACTERS.length);
  };

  const handleSelectCharacter = () => {
    soundEffects?.playLevelUp();
    if (onSelect) {
      onSelect(activeChar);
    }
  };

  const handlePreview = () => {
    soundEffects?.playClick();
    if (onPreviewVoice) {
      onPreviewVoice(activeChar);
    }
  };

  const prevChar = CHARACTERS[(currentIndex - 1 + CHARACTERS.length) % CHARACTERS.length];
  const nextChar = CHARACTERS[(currentIndex + 1) % CHARACTERS.length];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center select-none">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="pixel-font text-3xl sm:text-4xl text-zinc-100 tracking-wider">
          CHOOSE YOUR INTERVIEWER
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Cycle through original Minecraft voxel interviewers and pick your evaluator.
        </p>
      </div>

      {/* 3D Character Carousel Stage */}
      <div className="relative w-full max-w-3xl h-[420px] sm:h-[460px] flex items-center justify-center my-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          title="Previous Interviewer"
          className="absolute left-2 sm:left-4 z-20 mc-btn p-3 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-200" />
        </button>

        {/* Flanking Left Ghost Preview (Desktop) */}
        <div
          onClick={handlePrev}
          className="hidden md:block absolute left-12 w-48 h-64 opacity-40 hover:opacity-75 transition-opacity cursor-pointer transform -scale-90 blur-[0.5px]"
        >
          <MinecraftAvatar characterId={prevChar.id} mode="full" className="w-full h-full" />
          <div className="text-center pixel-font text-sm text-zinc-400 mt-1">{prevChar.name}</div>
        </div>

        {/* Center Main Stage (Active Character) */}
        <div className="w-72 sm:w-88 h-full flex flex-col items-center justify-center z-10">
          <div className="w-full h-[340px] sm:h-[380px] relative">
            <MinecraftAvatar
              key={activeChar.id}
              characterId={activeChar.id}
              mode="full"
              interviewerState="IDLE"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Flanking Right Ghost Preview (Desktop) */}
        <div
          onClick={handleNext}
          className="hidden md:block absolute right-12 w-48 h-64 opacity-40 hover:opacity-75 transition-opacity cursor-pointer transform -scale-90 blur-[0.5px]"
        >
          <MinecraftAvatar characterId={nextChar.id} mode="full" className="w-full h-full" />
          <div className="text-center pixel-font text-sm text-zinc-400 mt-1">{nextChar.name}</div>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          title="Next Interviewer"
          className="absolute right-2 sm:right-4 z-20 mc-btn p-3 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded"
        >
          <ChevronRight className="w-6 h-6 text-zinc-200" />
        </button>
      </div>

      {/* Character Details & Selection Bar */}
      <div className="w-full max-w-md mc-hud-panel p-5 mt-2 text-center space-y-3">
        <div>
          <h3 className="pixel-font text-3xl text-zinc-100 flex items-center justify-center gap-2">
            <span>{activeChar.name}</span>
            <span className="text-xs font-sans text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
              {activeChar.title}
            </span>
          </h3>
          <p className="text-xs font-mono text-cyan-300 font-medium tracking-wide mt-1">
            {activeChar.tags}
          </p>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
          {activeChar.desc}
        </p>

        <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
          <span>Voice:</span>
          <span className="text-zinc-200 font-medium">{activeChar.accent}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePreview}
            className="mc-btn text-xs py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>PREVIEW VOICE</span>
          </button>

          <button
            type="button"
            onClick={handleSelectCharacter}
            className="mc-btn mc-btn-cyan text-sm py-2 px-6 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>SELECT {activeChar.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
