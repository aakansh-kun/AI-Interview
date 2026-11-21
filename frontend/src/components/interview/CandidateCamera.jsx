import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

export default function CandidateCamera({ isEnabled = false, onToggle, soundEffects }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activeStream = null;

    if (isEnabled) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 }, audio: false })
          .then((mediaStream) => {
            activeStream = mediaStream;
            setStream(mediaStream);
            setError(null);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
          })
          .catch((err) => {
            console.warn('Webcam permission denied or camera unavailable:', err);
            setError('Camera unavailable');
            if (onToggle) onToggle(false);
          });
      } else {
        setError('Camera not supported');
        if (onToggle) onToggle(false);
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isEnabled]);

  const handleToggle = () => {
    soundEffects?.playClick();
    if (onToggle) onToggle(!isEnabled);
  };

  return (
    <div className="mc-card p-2 w-48 sm:w-56 bg-zinc-950/90 border border-zinc-700/80 shadow-2xl rounded overflow-hidden">
      <div className="relative aspect-video bg-zinc-900 rounded overflow-hidden flex items-center justify-center">
        {isEnabled && !error ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 p-2 text-center">
            {error ? (
              <>
                <AlertCircle className="w-6 h-6 text-amber-500 mb-1" />
                <span className="text-[11px] text-zinc-400">{error}</span>
              </>
            ) : (
              <>
                <CameraOff className="w-6 h-6 text-zinc-600 mb-1" />
                <span className="text-[11px] text-zinc-500">Camera Off</span>
              </>
            )}
          </div>
        )}

        {/* Live Indicator */}
        {isEnabled && !error && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-red-400 pixel-font tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            REC
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs font-semibold text-zinc-300">Candidate Video</span>
        <button
          type="button"
          onClick={handleToggle}
          className={`text-[11px] px-2 py-0.5 rounded pixel-font ${
            isEnabled ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}
        >
          {isEnabled ? 'DISABLE' : 'ENABLE'}
        </button>
      </div>
    </div>
  );
}
