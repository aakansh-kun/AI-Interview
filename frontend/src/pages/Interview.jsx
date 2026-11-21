import React, { useState, useEffect, useRef } from 'react';
import MinecraftInterviewRoom3D from '../components/interview/MinecraftInterviewRoom3D';
import MinecraftHUD from '../components/interview/MinecraftHUD';
import TranscriptPanel from '../components/interview/TranscriptPanel';
import { submitAnswer, completeInterview } from '../services/api';

export default function Interview({
  session,
  interviewer,
  initialQuestion,
  initialCameraActive = false,
  onFinish,
  soundEffects
}) {
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion || '');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(session?.questionCount || 10);
  const [interviewerState, setInterviewerState] = useState('SPEAKING'); // IDLE, SPEAKING, LISTENING, THINKING, FOLLOW_UP, COMPLETED
  const [conversationHistory, setConversationHistory] = useState(session?.conversationHistory || []);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(initialCameraActive);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());

  // 1. Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 2. Text-to-Speech (Interviewer Speaks)
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (interviewer?.id === 'arjun') {
      utterance.pitch = 0.92;
      utterance.rate = 0.95;
    } else if (interviewer?.id === 'maya') {
      utterance.pitch = 1.1;
      utterance.rate = 1.05;
    } else if (interviewer?.id === 'james') {
      utterance.pitch = 0.88;
      utterance.rate = 0.98;
    } else {
      utterance.pitch = 1.05;
      utterance.rate = 0.98;
    }

    utterance.onstart = () => setInterviewerState('SPEAKING');
    utterance.onend = () => setInterviewerState('LISTENING');
    utterance.onerror = () => setInterviewerState('LISTENING');

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (initialQuestion) {
      setCurrentQuestion(initialQuestion);
      const timer = setTimeout(() => {
        speakQuestion(initialQuestion);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [initialQuestion]);

  // 3. Speech Recognition for candidate
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setLiveTranscript(text);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartRecording = () => {
    window.speechSynthesis.cancel();
    setLiveTranscript('');
    setIsRecording(true);
    setInterviewerState('LISTENING');
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const finalAnswer = liveTranscript.trim();
    if (finalAnswer) {
      processAnswer(finalAnswer);
    } else {
      setInterviewerState('IDLE');
    }
  };

  const processAnswer = async (answerText) => {
    setIsProcessing(true);
    setInterviewerState('THINKING');

    const durationSeconds = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    setConversationHistory(prev => [
      ...prev,
      {
        role: 'candidate',
        content: answerText,
        timestamp: Date.now() / 1000,
        durationSeconds
      }
    ]);

    try {
      const result = await submitAnswer(session.sessionId, answerText, durationSeconds);
      setIsProcessing(false);

      if (result.isComplete) {
        setInterviewerState('COMPLETED');
        soundEffects?.playLevelUp();
        setTimeout(() => {
          onFinish(session.sessionId);
        }, 1500);
      } else {
        questionStartTimeRef.current = Date.now();
        setCurrentQuestion(result.question);
        setQuestionIndex(result.questionIndex);
        setInterviewerState(result.isFollowUp ? 'FOLLOW_UP' : 'SPEAKING');

        setConversationHistory(prev => [
          ...prev,
          {
            role: 'interviewer',
            content: result.question,
            timestamp: Date.now() / 1000,
            isFollowUp: result.isFollowUp,
            questionIndex: result.questionIndex
          }
        ]);

        setTimeout(() => {
          speakQuestion(result.question);
        }, 350);
      }
    } catch (err) {
      setIsProcessing(false);
      setInterviewerState('IDLE');
      alert('Interviewer network error. Please repeat your answer.');
    }
  };

  const handleEndEarly = async () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsProcessing(true);
    try {
      await completeInterview(session.sessionId);
    } catch (e) {}
    onFinish(session.sessionId);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 select-none">
      {/* FULL-BROWSER 3D MINECRAFT ROOM */}
      <MinecraftInterviewRoom3D
        characterId={interviewer?.id || 'arjun'}
        interviewerState={interviewerState}
        speechActive={interviewerState === 'SPEAKING'}
      />

      {/* MINIMAL GAME HUD OVERLAY */}
      <MinecraftHUD
        characterName={interviewer?.name || 'ARJUN'}
        interviewType={session?.interviewType || 'Technical Interview'}
        question={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        timer={formatTimer(elapsedSeconds)}
        isRecording={isRecording}
        isProcessing={isProcessing}
        isCameraOn={isCameraOn}
        onToggleCamera={() => setIsCameraOn(!isCameraOn)}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onSubmitTextAnswer={processAnswer}
        onRepeatQuestion={() => speakQuestion(currentQuestion)}
        onToggleTranscript={() => setIsTranscriptOpen(true)}
        onEndInterview={handleEndEarly}
        soundEffects={soundEffects}
      />

      {/* SLIDE-OUT TRANSCRIPT DRAWER */}
      <TranscriptPanel
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        conversationHistory={conversationHistory}
        interviewerName={interviewer?.name || 'Interviewer'}
        soundEffects={soundEffects}
      />
    </div>
  );
}
