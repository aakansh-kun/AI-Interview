import React, { useState } from 'react';
import { Mic, Square, Camera, CameraOff, RotateCcw, FileText, LogOut, Keyboard, Send } from 'lucide-react';
import CandidateCamera from './CandidateCamera';

export default function MinecraftHUD({
  characterName = 'ARJUN',
  interviewType = 'Technical Interview',
  question = '',
  questionIndex = 1,
  totalQuestions = 10,
  timer = '00:00',
  isRecording = false,
  isProcessing = false,
  isCameraOn = false,
  onToggleCamera,
  onStartRecording,
  onStopRecording,
  onSubmitTextAnswer,
  onRepeatQuestion,
  onToggleTranscript,
  onEndInterview,
  soundEffects
}) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedText, setTypedText] = useState('');

  const handleMicToggle = () => {
    soundEffects?.playClick();
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!typedText.trim() || isProcessing) return;
    soundEffects?.playPop();
    onSubmitTextAnswer(typedText.trim());
    setTypedText('');
    setShowTextInput(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20 select-none">
      {/* TOP HUD BAR */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Top Left: Character & Type */}
        <div className="mc-hud-panel px-4 py-2 border-l-4 border-l-cyan-400">
          <div className="pixel-font text-xl sm:text-2xl text-zinc-100 tracking-wider">
            {characterName}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            {interviewType}
          </div>
        </div>

        {/* Top Center: Question Progress */}
        <div className="mc-hud-panel px-6 py-2 flex flex-col items-center">
          <div className="pixel-font text-base sm:text-lg text-zinc-200 tracking-widest">
            QUESTION {String(questionIndex).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
          </div>
          <div className="w-28 sm:w-36 bg-zinc-900 border border-zinc-700 h-1.5 mt-1 rounded-xs overflow-hidden">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_8px_#00E5C3] transition-all duration-300"
              style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Top Right: Timer & Candidate Webcam */}
        <div className="flex flex-col items-end gap-3">
          <div className="mc-hud-panel px-3.5 py-1.5 font-mono text-sm text-cyan-300 tracking-wider">
            {timer}
          </div>

          {/* Candidate Webcam in Minecraft-framed call window */}
          <div className="pointer-events-auto">
            <CandidateCamera
              isEnabled={isCameraOn}
              onToggle={onToggleCamera}
              soundEffects={soundEffects}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM HUD: Question Display & Controls */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 pointer-events-auto">
        {/* Accessibility Text Input bar (if toggled) */}
        {showTextInput && (
          <form onSubmit={handleTextSubmit} className="w-full mc-hud-panel p-2 flex items-center gap-2 animate-fade-in">
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Type your answer (fallback input)..."
              disabled={isProcessing}
              className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 rounded focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!typedText.trim() || isProcessing}
              className="mc-btn mc-btn-cyan text-xs py-2 px-3 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>
        )}

        {/* Question Text Box (Clean Game Dialogue) */}
        <div className="w-full mc-hud-panel p-4 sm:p-5 shadow-2xl relative">
          <div className="pixel-font text-xs text-cyan-400 tracking-widest uppercase mb-1">
            {characterName}
          </div>
          <p className="text-zinc-100 text-sm sm:text-base leading-relaxed font-medium">
            "{question}"
          </p>
        </div>

        {/* Centered Action HUD Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 bg-zinc-950/80 p-2 rounded border border-zinc-800 shadow-xl backdrop-blur-md">
          {/* Primary Microphone CTA with Sculk Cyan Glow */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={`mc-btn px-5 py-2 text-sm flex items-center gap-2 rounded ${
              isRecording
                ? 'mc-btn-red animate-pulse'
                : isProcessing
                ? 'bg-zinc-800 text-zinc-400'
                : 'mc-btn-cyan'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 text-white fill-current" />
                <span>DONE SPEAKING</span>
              </>
            ) : isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span>THINKING...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 fill-current" />
                <span>PUSH TO TALK</span>
              </>
            )}
          </button>

          {/* Secondary HUD Tools */}
          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              onRepeatQuestion();
            }}
            title="Repeat Question"
            className="mc-btn text-xs py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">REPEAT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              setShowTextInput(!showTextInput);
            }}
            title="Type Answer"
            className={`mc-btn text-xs py-2 px-3 ${
              showTextInput ? 'mc-btn-cyan' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">TEXT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              onToggleTranscript();
            }}
            title="Transcript"
            className="mc-btn text-xs py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">LOG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              if (window.confirm('Conclude the interview and calculate your evaluation report?')) {
                onEndInterview();
              }
            }}
            title="End Interview"
            className="mc-btn mc-btn-red text-xs py-2 px-3"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">LEAVE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
