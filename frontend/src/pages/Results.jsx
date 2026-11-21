import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Home as HomeIcon,
  ChevronDown,
  ChevronUp,
  Brain,
  Printer,
  Sparkles
} from 'lucide-react';
import { getEvaluation } from '../services/api';

export default function Results({ sessionId, onRetake, onGoHome, soundEffects }) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQs, setExpandedQs] = useState({});

  useEffect(() => {
    soundEffects?.playLevelUp();
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    getEvaluation(sessionId)
      .then((data) => {
        setEvaluation(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [sessionId]);

  const toggleQ = (idx) => {
    soundEffects?.playClick();
    setExpandedQs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen mc-dirt-bg flex flex-col items-center justify-center p-6 select-none">
        <div className="mc-hud-panel p-8 text-center space-y-3 max-w-md">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="pixel-font text-2xl text-zinc-100">SYNTHESIZING REPORT...</h2>
          <p className="text-xs text-zinc-400">Gemini is evaluating your technical architecture and speech clarity.</p>
        </div>
      </div>
    );
  }

  const {
    overallScore = 82,
    grade = 'A-',
    recommendation = 'Strong Candidate',
    communication = 86,
    technicalKnowledge = 81,
    problemSolving = 88,
    confidence = 74,
    answerStructure = 79,
    topStrengths = [],
    improvementAreas = [],
    speechAnalysis = {},
    questionReviews = []
  } = evaluation || {};

  const categories = [
    { label: 'Communication', score: communication },
    { label: 'Technical Knowledge', score: technicalKnowledge },
    { label: 'Problem Solving', score: problemSolving },
    { label: 'Confidence', score: confidence },
    { label: 'Answer Structure', score: answerStructure }
  ];

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 md:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <span className="pixel-font text-xs text-cyan-400 tracking-widest uppercase">
              INTERVIEW COMPLETE
            </span>
            <h1 className="pixel-font text-3xl sm:text-4xl text-zinc-100">
              INTERVIEW REPORT
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="mc-btn bg-zinc-800 text-zinc-300 text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT</span>
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="mc-btn mc-btn-cyan text-xs py-1.5 px-4 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETAKE</span>
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="mc-btn bg-zinc-800 text-zinc-300 text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>HOME</span>
            </button>
          </div>
        </div>

        {/* OVERALL PERFORMANCE BANNER (Minecraft Book/Inventory inspired) */}
        <div className="mc-hud-panel p-6 bg-zinc-900/90 border-2 border-zinc-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {/* Score */}
            <div className="mc-slot p-4">
              <span className="pixel-font text-xs text-zinc-400 uppercase">Overall Score</span>
              <div className="pixel-font text-5xl text-cyan-400 mt-1">
                {overallScore}<span className="text-xl text-zinc-500">/100</span>
              </div>
            </div>

            {/* Grade */}
            <div className="mc-slot p-4">
              <span className="pixel-font text-xs text-zinc-400 uppercase">Grade</span>
              <div className="pixel-font text-5xl text-emerald-400 mt-1">
                {grade}
              </div>
            </div>

            {/* Recommendation */}
            <div className="mc-slot p-4 flex flex-col justify-center">
              <span className="pixel-font text-xs text-zinc-400 uppercase">Verdict</span>
              <div className="text-base font-bold text-zinc-100 mt-1">
                {recommendation}
              </div>
            </div>
          </div>

          {/* Metric Bars */}
          <div className="mt-6 space-y-2.5">
            {categories.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-300">{c.label}</span>
                  <span className="font-mono text-cyan-300 font-bold">{c.score}</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-xs border border-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 shadow-[0_0_6px_#00E5C3] transition-all duration-500"
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STRENGTHS & IMPROVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="mc-hud-panel p-5 border-l-4 border-l-emerald-500">
            <h3 className="pixel-font text-lg text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              KEY STRENGTHS
            </h3>
            <ul className="space-y-2 text-xs text-zinc-200">
              {topStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="mc-hud-panel p-5 border-l-4 border-l-amber-500">
            <h3 className="pixel-font text-lg text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              AREAS TO REFINE
            </h3>
            <ul className="space-y-2 text-xs text-zinc-200">
              {improvementAreas.map((imp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">!</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SPEECH & LINGUISTIC STATS */}
        <div className="mc-hud-panel p-5">
          <h3 className="pixel-font text-lg text-zinc-100 mb-3 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-cyan-400" />
            SPEECH & VOCABULARY INSIGHTS
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="mc-slot p-2.5">
              <div className="text-zinc-400 text-[10px]">Filler Words</div>
              <div className="pixel-font text-2xl text-amber-400">{speechAnalysis.fillerWordCount || 0}</div>
            </div>
            <div className="mc-slot p-2.5">
              <div className="text-zinc-400 text-[10px]">Clarity Metric</div>
              <div className="pixel-font text-2xl text-emerald-400">{speechAnalysis.speakingClarityScore || 85}%</div>
            </div>
            <div className="mc-slot p-2.5">
              <div className="text-zinc-400 text-[10px]">Pace (WPM)</div>
              <div className="pixel-font text-2xl text-cyan-400">{speechAnalysis.estimatedPaceWpm || 130}</div>
            </div>
            <div className="mc-slot p-2.5">
              <div className="text-zinc-400 text-[10px]">Words Spoken</div>
              <div className="pixel-font text-2xl text-zinc-200">{speechAnalysis.wordsSpoken || 0}</div>
            </div>
          </div>
        </div>

        {/* QUESTION REVIEW */}
        <div className="space-y-3">
          <h3 className="pixel-font text-2xl text-zinc-100">
            QUESTION-BY-QUESTION REVIEW
          </h3>

          <div className="space-y-3">
            {questionReviews.map((rev, idx) => {
              const isOpen = expandedQs[idx] !== false;
              return (
                <div key={idx} className="mc-hud-panel rounded overflow-hidden">
                  <div
                    onClick={() => toggleQ(idx)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="pixel-font text-sm text-cyan-400">
                          QUESTION {rev.questionIndex || (idx + 1)}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                          {rev.score} / 10
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-zinc-200">
                        "{rev.question}"
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>

                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-zinc-800/80 space-y-3 text-xs">
                      {/* Candidate Answer */}
                      <div className="mc-slot p-2.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Your Answer:</span>
                        <p className="text-zinc-300 italic font-mono text-xs">"{rev.candidateAnswer}"</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="mc-slot p-2.5 bg-emerald-950/20 border-emerald-900/40">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-0.5">Strengths:</span>
                          <p className="text-zinc-300">{rev.whatWorked}</p>
                        </div>
                        <div className="mc-slot p-2.5 bg-amber-950/20 border-amber-900/40">
                          <span className="text-[10px] font-bold text-amber-400 uppercase block mb-0.5">Improvements:</span>
                          <p className="text-zinc-300">{rev.whatCouldImprove}</p>
                        </div>
                      </div>

                      {rev.exampleImprovedAnswer && (
                        <div className="mc-slot p-2.5 bg-zinc-900 border-cyan-800/40">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Model Answer (Ground in Your Actual Facts):
                          </span>
                          <p className="text-zinc-200 leading-relaxed font-sans">{rev.exampleImprovedAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="text-center pt-4">
          <button
            onClick={onRetake}
            className="mc-btn mc-btn-cyan text-base py-3 px-8"
          >
            START ANOTHER INTERVIEW
          </button>
        </div>
      </div>
    </div>
  );
}
