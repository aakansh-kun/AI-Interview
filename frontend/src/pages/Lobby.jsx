import React, { useState } from 'react';
import { Mic, Camera, Play, ArrowLeft, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import InterviewerScene from '../components/interviewer/InterviewerScene';
import CandidateCamera from '../components/interview/CandidateCamera';

export default function Lobby({
  interviewer,
  setupData,
  onStartInterview,
  onBackToCharacters,
  soundEffects
}) {
  const [micTested, setMicTested] = useState(false);
  const [micTesting, setMicTesting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const testMicrophone = () => {
    soundEffects?.playClick();
    setMicTesting(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setTimeout(() => {
            stream.getTracks().forEach(t => t.stop());
            setMicTested(true);
            setMicTesting(false);
            soundEffects?.playPop();
          }, 1500);
        })
        .catch(() => {
          setMicTesting(false);
          alert('Could not access microphone. You can still use text input during the interview.');
        });
    } else {
      setMicTesting(false);
    }
  };

  const handleStart = () => {
    soundEffects?.playLevelUp();
    onStartInterview({
      cameraActive
    });
  };

  const estimatedMinutes = setupData.questionCount * 2.5;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="pixel-font text-3xl md:text-4xl text-amber-400 mb-2">
          PRE-INTERVIEW LOBBY
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          {interviewer.name} is waiting in the study. Confirm your audio and camera settings before commencing the session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* 3D Room Preview (7 cols) */}
        <div className="lg:col-span-7 mc-card p-2 bg-zinc-950 border border-zinc-700 shadow-2xl relative overflow-hidden h-[420px]">
          <InterviewerScene
            interviewer={interviewer}
            interviewerState="IDLE"
            className="w-full h-full rounded"
          />

          {/* Floating candidate camera preview if enabled */}
          {cameraActive && (
            <div className="absolute top-4 right-4 z-10 scale-90 origin-top-right">
              <CandidateCamera
                isEnabled={cameraActive}
                onToggle={setCameraActive}
                soundEffects={soundEffects}
              />
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur px-3 py-1.5 rounded border border-zinc-800 text-xs text-zinc-300">
            <span className="font-bold text-amber-400 pixel-font text-base mr-2">{interviewer.name}</span>
            <span className="text-zinc-400">{interviewer.title}</span>
          </div>
        </div>

        {/* Briefing & Device Test Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="mc-card p-5 bg-zinc-950/90 border border-zinc-700">
            <h3 className="pixel-font text-xl text-zinc-100 mb-4 pb-2 border-b border-zinc-800">
              INTERVIEW BRIEFING
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Interviewer:</span>
                <span className="text-amber-400 font-semibold">{interviewer.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Target Role:</span>
                <span className="text-zinc-200 font-semibold">{setupData.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Experience Level:</span>
                <span className="text-zinc-200">{setupData.experience}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Interview Type:</span>
                <span className="text-zinc-200">{setupData.interviewType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Questions:</span>
                <span className="text-emerald-400 font-bold">{setupData.questionCount} Questions</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Est. Duration:</span>
                <span className="text-zinc-300 font-mono">~{Math.round(estimatedMinutes)} mins</span>
              </div>
            </div>
          </div>

          {/* Device Controls */}
          <div className="mc-card p-4 bg-zinc-950/90 border border-zinc-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Microphone Check:</span>
              </div>
              <button
                type="button"
                onClick={testMicrophone}
                disabled={micTesting}
                className={`mc-button text-xs py-1.5 px-3 ${
                  micTested ? 'mc-button-emerald' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {micTesting ? 'TESTING...' : micTested ? 'MIC READY ✓' : 'TEST MIC'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Webcam (Optional):</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEffects?.playClick();
                  setCameraActive(!cameraActive);
                }}
                className={`mc-button text-xs py-1.5 px-3 ${
                  cameraActive ? 'mc-button-emerald' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {cameraActive ? 'CAMERA ON' : 'ENABLE CAMERA'}
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="mc-button mc-button-gold w-full text-lg py-3 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START INTERVIEW</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects?.playClick();
                onBackToCharacters();
              }}
              className="mc-button bg-zinc-800 text-zinc-400 hover:text-zinc-200 w-full text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>CHANGE INTERVIEWER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
