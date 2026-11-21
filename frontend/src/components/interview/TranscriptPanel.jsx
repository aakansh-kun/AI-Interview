import React from 'react';
import { X, User, Bot, Clock } from 'lucide-react';

export default function TranscriptPanel({
  isOpen = false,
  onClose,
  conversationHistory = [],
  interviewerName = 'Interviewer',
  soundEffects
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-zinc-950/95 border-l-2 border-zinc-700 shadow-2xl backdrop-blur-md flex flex-col transition-all duration-300 animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <span className="pixel-font text-xl text-amber-400">INTERVIEW TRANSCRIPT</span>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEffects?.playClick();
            onClose();
          }}
          className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Transcript Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm py-12">
            No dialogue recorded yet.
          </div>
        ) : (
          conversationHistory.map((turn, idx) => {
            const isInterviewer = turn.role === 'interviewer';
            return (
              <div
                key={idx}
                className={`p-3 rounded border text-sm leading-relaxed ${
                  isInterviewer
                    ? 'bg-zinc-900/80 border-zinc-700 text-zinc-200'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100 ml-4'
                }`}
              >
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-zinc-800/80">
                  <div className="flex items-center gap-1.5 font-bold pixel-font text-sm">
                    {isInterviewer ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400">{interviewerName}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">You (Candidate)</span>
                      </>
                    )}
                  </div>
                  {turn.isFollowUp && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-900/60 text-purple-300 rounded">
                      Follow-up
                    </span>
                  )}
                </div>
                <p className="font-normal text-xs sm:text-sm">{turn.content}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 text-center text-xs text-zinc-500">
        Panel operates independently without pausing your live interview.
      </div>
    </div>
  );
}
