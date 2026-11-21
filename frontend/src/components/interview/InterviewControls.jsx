import React, { useState } from 'react';
import { Mic, MicOff, Square, Send, Camera, CameraOff, RotateCcw, LogOut, FileText, Keyboard } from 'lucide-react';

export default function InterviewControls({
  isRecording = false,
  isProcessing = false,
  interviewerState = 'IDLE',
  onStartRecording,
  onStopRecording,
  onSubmitTextAnswer,
  onRepeatQuestion,
  onToggleCamera,
  isCameraOn = false,
  onToggleTranscript,
  onEndInterview,
  soundEffects
}) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  const handleMicClick = () => {
    soundEffects?.playClick();
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!typedAnswer.trim() || isProcessing) return;
    soundEffects?.playPop();
    onSubmitTextAnswer(typedAnswer.trim());
    setTypedAnswer('');
    setShowTextInput(false);
  };

  const isInterviewerBusy = interviewerState === 'SPEAKING' || interviewerState === 'THINKING';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3">
      {/* Fallback Text Input Drawer */}
      {showTextInput && (
        <form onSubmit={handleSendText} className="mc-dialog p-3 mb-3 flex items-center gap-2 animate-fade-in">
          <input
            type="text"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="Type your response here (accessibility / fallback)..."
            disabled={isProcessing}
            className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 rounded focus:outline-none focus:border-amber-400 placeholder-zinc-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!typedAnswer.trim() || isProcessing}
            className="mc-button mc-button-emerald px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>SEND</span>
          </button>
        </form>
      )}

      {/* Main HUD Control Bar */}
      <div className="mc-card p-3 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/90 border border-zinc-700">
        {/* Left Secondary Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              onToggleCamera();
            }}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            className={`mc-button text-xs py-2 px-3 ${
              isCameraOn ? 'mc-button-emerald' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            <span className="hidden md:inline">{isCameraOn ? 'CAM ON' : 'CAM OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              onRepeatQuestion();
            }}
            title="Repeat Question"
            disabled={isProcessing}
            className="mc-button bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">REPEAT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              setShowTextInput(!showTextInput);
            }}
            title="Type Answer"
            className={`mc-button text-xs py-2 px-3 ${
              showTextInput ? 'mc-button-gold' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden lg:inline">TEXT</span>
          </button>
        </div>

        {/* Center Primary Microphone CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isInterviewerBusy || isProcessing}
            className={`mc-button px-6 py-3 text-lg flex items-center gap-2.5 rounded shadow-xl transition-all duration-200 ${
              isRecording
                ? 'mc-button-redstone animate-pulse'
                : isProcessing
                ? 'bg-zinc-700 text-zinc-400'
                : 'mc-button-emerald'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5 text-white" />
                <span>FINISH ANSWER</span>
              </>
            ) : isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-white" />
                <span>SPEAK ANSWER</span>
              </>
            )}
          </button>
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              onToggleTranscript();
            }}
            title="Open Transcript"
            className="mc-button bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">TRANSCRIPT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects?.playClick();
              if (window.confirm('Are you sure you want to conclude the interview and view your evaluation?')) {
                onEndInterview();
              }
            }}
            title="End Interview"
            className="mc-button mc-button-redstone text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">END</span>
          </button>
        </div>
      </div>
    </div>
  );
}
