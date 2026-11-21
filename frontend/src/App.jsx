import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Home from './pages/Home';
import WorldGenTransition from './components/world/WorldGenTransition';
import CharacterCarousel from './components/interviewer/CharacterCarousel';
import InterviewSetupModal from './components/interview/InterviewSetupModal';
import Interview from './pages/Interview';
import Results from './pages/Results';
import { useSoundEffects } from './hooks/useSoundEffects';
import { createInterview, getVoicePreview } from './services/api';
import './styles/minecraft-theme.css';

export default function App() {
  const soundEffects = useSoundEffects();
  const [currentView, setCurrentView] = useState('home'); // home, world_gen, character, interview, results
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Selected character & setup
  const [selectedChar, setSelectedChar] = useState({
    id: 'arjun',
    name: 'ARJUN',
    title: 'Technical Engineer',
    voice: 'Fenrir',
    accent: 'Indian English'
  });

  const [activeSession, setActiveSession] = useState(null);
  const [initialQuestion, setInitialQuestion] = useState('');
  const [completedSessionId, setCompletedSessionId] = useState('');

  // 1. User clicks "ENTER INTERVIEW" on Landing Page -> Start World Gen Transition
  const handleStartWorldGen = () => {
    setCurrentView('world_gen');
  };

  // 2. World Gen Transition finishes -> Move to Character Selection
  const handleWorldGenComplete = () => {
    setCurrentView('character');
  };

  // 3. User selects character in Carousel -> Open Inventory Setup Modal
  const handleSelectCharacterInCarousel = (char) => {
    setSelectedChar(char);
    setShowSetupModal(true);
  };

  // 4. Voice Preview in Character Carousel
  const handlePreviewVoice = (char) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    getVoicePreview(char.id)
      .then((data) => {
        const utterance = new SpeechSynthesisUtterance(data.text || `Hello, I'm ${char.name}.`);
        if (char.id === 'alexa' || char.id === 'maya') {
          utterance.pitch = 1.05;
        } else {
          utterance.pitch = 0.92;
        }
        window.speechSynthesis.speak(utterance);
      })
      .catch(() => {
        const utterance = new SpeechSynthesisUtterance(`Hello! I'm ${char.name}, your ${char.title}.`);
        window.speechSynthesis.speak(utterance);
      });
  };

  // 5. User finishes Setup Modal -> Launch Interview Session via Backend
  const handleSetupProceed = async (setupData) => {
    setShowSetupModal(false);

    try {
      const payload = {
        role: setupData.role,
        experience: setupData.experience,
        interviewType: setupData.interviewType,
        questionCount: setupData.questionCount,
        interviewerId: selectedChar.id,
        resumeText: setupData.resumeText || null
      };

      const res = await createInterview(payload);
      setActiveSession(res.session);
      setInitialQuestion(res.openingQuestion);
      setCurrentView('interview');
    } catch (err) {
      console.warn('API error, using local fallback session:', err);
      const fallbackSession = {
        sessionId: 'local-' + Date.now().toString(36),
        role: setupData.role,
        experience: setupData.experience,
        interviewType: setupData.interviewType,
        questionCount: setupData.questionCount,
        interviewer: selectedChar,
        conversationHistory: []
      };
      setActiveSession(fallbackSession);
      setInitialQuestion(`Hello. I'm ${selectedChar.name}. Walk me through a challenging problem you solved as a ${setupData.role}.`);
      setCurrentView('interview');
    }
  };

  // 6. Interview Finished -> Go to Results
  const handleInterviewFinished = (sessionId) => {
    setCompletedSessionId(sessionId);
    setCurrentView('results');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative select-none">
      {/* Floating Audio Mute Toggle (Subtle in Corner) */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          type="button"
          onClick={soundEffects.toggleMute}
          title={soundEffects.isMuted ? 'Unmute' : 'Mute'}
          className="mc-btn p-2 bg-zinc-900/90 text-zinc-400 hover:text-white rounded border border-zinc-700"
        >
          {soundEffects.isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          )}
        </button>
      </div>

      {/* VIEW ROUTER */}
      {currentView === 'home' && (
        <Home
          onStartInterview={handleStartWorldGen}
          soundEffects={soundEffects}
        />
      )}

      {currentView === 'world_gen' && (
        <WorldGenTransition
          onComplete={handleWorldGenComplete}
          soundEffects={soundEffects}
        />
      )}

      {currentView === 'character' && (
        <div className="min-h-screen mc-dirt-bg flex flex-col justify-center py-6 relative">
          <div className="absolute top-4 left-6 z-20">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs text-zinc-400 hover:text-white pixel-font tracking-wider flex items-center gap-1"
            >
              ← RETURN TO MENU
            </button>
          </div>

          <CharacterCarousel
            selectedId={selectedChar.id}
            onSelect={handleSelectCharacterInCarousel}
            onPreviewVoice={handlePreviewVoice}
            soundEffects={soundEffects}
          />

          {/* Inventory Setup Modal */}
          {showSetupModal && (
            <InterviewSetupModal
              selectedInterviewer={selectedChar}
              onProceed={handleSetupProceed}
              onCancel={() => setShowSetupModal(false)}
              soundEffects={soundEffects}
            />
          )}
        </div>
      )}

      {currentView === 'interview' && (
        <Interview
          session={activeSession}
          interviewer={selectedChar}
          initialQuestion={initialQuestion}
          onFinish={handleInterviewFinished}
          soundEffects={soundEffects}
        />
      )}

      {currentView === 'results' && (
        <Results
          sessionId={completedSessionId || activeSession?.sessionId}
          onRetake={() => setCurrentView('character')}
          onGoHome={() => setCurrentView('home')}
          soundEffects={soundEffects}
        />
      )}
    </div>
  );
}
