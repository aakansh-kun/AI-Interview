import React, { useRef } from 'react';
import { ArrowRight, UserCheck, Home as HomeIcon, Mic, FileText, ChevronDown } from 'lucide-react';
import MinecraftLandscape from '../components/world/MinecraftLandscape';

export default function Home({ onStartInterview, soundEffects }) {
  const transitionRef = useRef(null);

  const scrollToWorkflow = () => {
    soundEffects?.playClick();
    transitionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStart = () => {
    soundEffects?.playLevelUp();
    onStartInterview();
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-x-hidden select-none">
      {/* 1. CINEMATIC FULL-VIEWPORT 3D MINECRAFT ENVIRONMENT */}
      <MinecraftLandscape />

      {/* 2. MINIMAL TRANSLUCENT NAVIGATION BAR */}
      <header className="relative z-20 h-16 px-6 sm:px-12 flex items-center justify-between bg-zinc-950/60 backdrop-blur-md border-b border-zinc-800/50">
        {/* Left: Brand Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 border-2 border-zinc-600 rounded-sm flex items-center justify-center font-bold text-cyan-400 pixel-font text-xl shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000]">
            M
          </div>
          <span className="pixel-font text-2xl text-zinc-100 tracking-wider">
            MINEINTERVIEW
          </span>
        </div>

        {/* Right: Clean Modern Nav Items */}
        <nav className="flex items-center gap-6">
          <button
            onClick={scrollToWorkflow}
            className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors font-medium tracking-wide"
          >
            HOW IT WORKS
          </button>
          <button
            onClick={handleStart}
            className="mc-btn mc-btn-cyan text-xs sm:text-sm py-1.5 px-4"
          >
            START INTERVIEW
          </button>
        </nav>
      </header>

      {/* 3. CONTROLLED HERO SECTION */}
      <section className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-16 max-w-5xl">
        {/* Translucent Backdrop Box for Crisp Readability */}
        <div className="max-w-[580px] mc-hud-panel p-8 sm:p-10 space-y-5 bg-zinc-950/85 backdrop-blur-lg border border-zinc-800 shadow-2xl rounded">
          <div className="pixel-font text-xs tracking-widest text-cyan-400 uppercase">
            IMMERSIVE AI MOCK INTERVIEWS
          </div>

          <h1 className="pixel-font text-4xl sm:text-5xl text-zinc-100 leading-tight tracking-wider">
            YOUR NEXT INTERVIEW<br />
            <span className="text-cyan-400">STARTS HERE.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            Practice realistic interviews with adaptive AI interviewers inside an immersive Minecraft-inspired world.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleStart}
              className="mc-btn mc-btn-cyan text-base py-3 px-8 flex items-center gap-2 shadow-2xl"
            >
              <span>ENTER INTERVIEW</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToWorkflow}
              className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
            >
              <span>Explore how it works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subtle Technology Attribution */}
          <div className="text-[11px] text-zinc-500 pt-1 font-mono">
            Powered by Gemini
          </div>
        </div>
      </section>

      {/* 4. COMPACT INVENTORY-SLOT TRANSITION SECTION */}
      <section
        ref={transitionRef}
        className="relative z-10 py-14 px-6 sm:px-12 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <span className="pixel-font text-xs text-cyan-400 tracking-widest uppercase">
              THE WORKFLOW
            </span>
            <h2 className="pixel-font text-2xl sm:text-3xl text-zinc-100 mt-1">
              HOW MINEINTERVIEW WORKS
            </h2>
          </div>

          {/* Subtle Minecraft Inventory-Slot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Slot 1 */}
            <div className="mc-slot p-4 text-center space-y-2 hover:border-cyan-400 transition-colors">
              <div className="w-8 h-8 mx-auto rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold pixel-font">
                1
              </div>
              <div className="pixel-font text-base text-zinc-100">CHOOSE INTERVIEWER</div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Pick from 4 distinct voxel personalities (Arjun, Maya, James, Alexa).
              </p>
            </div>

            {/* Slot 2 */}
            <div className="mc-slot p-4 text-center space-y-2 hover:border-cyan-400 transition-colors">
              <div className="w-8 h-8 mx-auto rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold pixel-font">
                2
              </div>
              <div className="pixel-font text-base text-zinc-100">ENTER THE ROOM</div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Sit across from your interviewer at a wooden desk with mountain views.
              </p>
            </div>

            {/* Slot 3 */}
            <div className="mc-slot p-4 text-center space-y-2 hover:border-cyan-400 transition-colors">
              <div className="w-8 h-8 mx-auto rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold pixel-font">
                3
              </div>
              <div className="pixel-font text-base text-zinc-100">SPEAK NATURALLY</div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Answer via voice. Gemini analyzes each response and asks deep follow-ups.
              </p>
            </div>

            {/* Slot 4 */}
            <div className="mc-slot p-4 text-center space-y-2 hover:border-cyan-400 transition-colors">
              <div className="w-8 h-8 mx-auto rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold pixel-font">
                4
              </div>
              <div className="pixel-font text-base text-zinc-100">GET YOUR REPORT</div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Receive score breakdown, STAR performance, filler counts, and model answers.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleStart}
              className="mc-btn mc-btn-cyan text-sm py-2 px-6"
            >
              ENTER INTERVIEW NOW
            </button>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="relative z-10 py-5 text-center text-[11px] text-zinc-500 bg-zinc-950 border-t border-zinc-900">
        MineInterview • An immersive Minecraft-inspired AI mock interview experience
      </footer>
    </div>
  );
}
