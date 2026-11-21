import React from 'react';
import { Volume2, Mic, Sparkles, Brain, CheckCircle2, Coffee } from 'lucide-react';

export default function InterviewerStatus({ state = 'IDLE', interviewerName = 'Interviewer' }) {
  const configs = {
    IDLE: {
      label: 'IDLE',
      color: 'bg-zinc-800 border-zinc-600 text-zinc-300',
      icon: Coffee,
      subtext: 'Ready for question'
    },
    SPEAKING: {
      label: 'SPEAKING',
      color: 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      icon: Volume2,
      subtext: `${interviewerName} is asking...`
    },
    LISTENING: {
      label: 'LISTENING',
      color: 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse',
      icon: Mic,
      subtext: 'Listening to your response...'
    },
    THINKING: {
      label: 'THINKING',
      color: 'bg-sky-950/90 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]',
      icon: Brain,
      subtext: 'Analyzing response & formulating follow-up...'
    },
    FOLLOW_UP: {
      label: 'FOLLOW-UP PROBE',
      color: 'bg-purple-950/90 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      icon: Sparkles,
      subtext: 'Diving deeper into your answer...'
    },
    COMPLETED: {
      label: 'INTERVIEW COMPLETE',
      color: 'bg-amber-900/90 border-amber-400 text-amber-200',
      icon: CheckCircle2,
      subtext: 'Final evaluation generated'
    }
  };

  const current = configs[state] || configs.IDLE;
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${current.color} transition-all duration-300`}>
        <Icon className="w-4 h-4 animate-spin-slow" />
        <span className="pixel-font text-base tracking-wider">{current.label}</span>
      </div>
      <span className="text-xs text-zinc-400 hidden sm:inline-block italic">
        {current.subtext}
      </span>
    </div>
  );
}
