import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';

export default function QuestionDisplay({
  question = '',
  interviewerName = 'Interviewer',
  isFollowUp = false,
  onRepeatQuestion,
  soundEffects
}) {
  const handleRepeat = () => {
    soundEffects?.playClick();
    if (onRepeatQuestion) onRepeatQuestion();
  };

  if (!question) return null;

  return (
    <div className="mc-dialog p-4 sm:p-5 max-w-2xl w-full mx-auto shadow-2xl relative animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="pixel-font text-lg text-amber-400 tracking-wider">
            {interviewerName}
          </span>
          {isFollowUp && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-purple-950/80 border border-purple-700/60 text-purple-300 rounded font-medium">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Follow-up
            </span>
          )}
        </div>

        {onRepeatQuestion && (
          <button
            type="button"
            onClick={handleRepeat}
            title="Repeat Question"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-700/60"
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Repeat</span>
          </button>
        )}
      </div>

      <p className="text-zinc-100 text-base sm:text-lg leading-relaxed font-medium">
        "{question}"
      </p>
    </div>
  );
}
