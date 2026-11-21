import React, { useState } from 'react';
import { Volume2, Check, User, Sparkles } from 'lucide-react';
import InterviewerScene from './InterviewerScene';

export default function CharacterSelector({
  interviewers = [],
  selectedId,
  onSelect,
  onPreviewVoice,
  soundEffects
}) {
  const [activePreviewId, setActivePreviewId] = useState(null);

  const handlePreview = (e, char) => {
    e.stopPropagation();
    soundEffects?.playClick();
    setActivePreviewId(char.id);
    if (onPreviewVoice) {
      onPreviewVoice(char);
    }
  };

  const handleSelect = (char) => {
    soundEffects?.playClick();
    if (onSelect) {
      onSelect(char);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h2 className="pixel-font text-3xl md:text-4xl text-amber-400 mb-2 tracking-wider">
          CHOOSE YOUR INTERVIEWER
        </h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
          Each interviewer brings a distinct evaluation style, personality, and questioning strategy to your mock interview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {interviewers.map((char) => {
          const isSelected = selectedId === char.id;

          return (
            <div
              key={char.id}
              onClick={() => handleSelect(char)}
              className={`mc-card relative flex flex-col justify-between p-4 cursor-pointer transition-all duration-300 transform ${
                isSelected
                  ? 'border-amber-400 -translate-y-2 ring-2 ring-amber-400/50 shadow-[0_12px_30px_rgba(245,158,11,0.25)]'
                  : 'hover:-translate-y-1 hover:border-zinc-500'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 px-3 py-0.5 rounded text-xs font-bold pixel-font tracking-wider flex items-center gap-1 shadow-md z-10">
                  <Check className="w-3.5 h-3.5" /> SELECTED
                </div>
              )}

              <div>
                {/* 3D Character Mini Viewport */}
                <div className="w-full h-48 bg-zinc-900/80 rounded border border-zinc-700/80 overflow-hidden mb-3 relative group">
                  <InterviewerScene
                    interviewer={char}
                    interviewerState={isSelected ? 'LISTENING' : 'IDLE'}
                    className="w-full h-full"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[11px] text-zinc-300 pixel-font">
                    {char.accentPreference}
                  </div>
                </div>

                {/* Character Name & Role */}
                <div className="mb-2">
                  <h3 className="pixel-font text-2xl text-zinc-100 flex items-center justify-between">
                    <span>{char.name}</span>
                    <span className="text-xs font-sans text-amber-400/90 font-medium px-2 py-0.5 bg-amber-950/40 rounded border border-amber-800/40">
                      {char.voice}
                    </span>
                  </h3>
                  <div className="text-xs font-semibold text-emerald-400 tracking-wide uppercase mb-1">
                    {char.title}
                  </div>
                </div>

                {/* Personality & Style Notes */}
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  {char.personality}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, char)}
                  className="mc-button w-full text-sm py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span>PREVIEW VOICE</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect(char)}
                  className={`mc-button w-full text-base py-2 ${
                    isSelected ? 'mc-button-gold' : 'mc-button-emerald'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'SELECT INTERVIEWER'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
