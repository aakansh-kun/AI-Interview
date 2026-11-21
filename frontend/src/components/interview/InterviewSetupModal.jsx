import React, { useState } from 'react';
import { Check, FileUp, Sparkles, X } from 'lucide-react';
import { uploadResume } from '../../services/api';

const PRESET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Product Manager'
];

const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid-Level', 'Senior'];
const LENGTHS = [
  { count: 5, label: 'Quick (5 Qs)' },
  { count: 10, label: 'Standard (10 Qs)' },
  { count: 15, label: 'Deep (15 Qs)' }
];
const INTERVIEW_TYPES = [
  'Technical Interview',
  'HR & Behavioral',
  'System Design',
  'Mixed Interview'
];

export default function InterviewSetupModal({
  selectedInterviewer,
  onProceed,
  onCancel,
  soundEffects
}) {
  const [role, setRole] = useState('Software Engineer');
  const [customRole, setCustomRole] = useState('');
  const [experience, setExperience] = useState('Mid-Level');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [questionCount, setQuestionCount] = useState(10);
  const [resumeText, setResumeText] = useState('');
  const [resumeFilename, setResumeFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundEffects?.playClick();
    setIsUploading(true);
    try {
      const res = await uploadResume(file);
      setResumeText(res.fullText);
      setResumeFilename(res.filename);
      soundEffects?.playPop();
    } catch (err) {
      alert('Resume parse error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    soundEffects?.playLevelUp();
    onProceed({
      role: customRole.trim() || role,
      experience,
      interviewType,
      questionCount,
      resumeText,
      resumeFilename
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="w-full max-w-2xl mc-hud-panel p-6 border-2 border-zinc-700 bg-zinc-950/95 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="pixel-font text-2xl text-zinc-100 flex items-center gap-2">
              <span>INTERVIEW CONFIGURATION</span>
              <span className="text-xs font-sans text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                WITH {selectedInterviewer.name}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure role, seniority, and optional resume context for Gemini.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Role */}
          <div>
            <label className="pixel-font text-sm text-zinc-300 block mb-1.5">
              1. TARGET ROLE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_ROLES.map((r) => (
                <div
                  key={r}
                  onClick={() => {
                    soundEffects?.playClick();
                    setRole(r);
                    setCustomRole('');
                  }}
                  className={`mc-slot p-2 text-center cursor-pointer transition-colors ${
                    role === r && !customRole ? 'active text-cyan-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r}
                </div>
              ))}
            </div>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Or enter custom role..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          {/* Experience Level & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="pixel-font text-sm text-zinc-300 block mb-1.5">
                2. SENIORITY LEVEL
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <div
                    key={exp}
                    onClick={() => {
                      soundEffects?.playClick();
                      setExperience(exp);
                    }}
                    className={`mc-slot p-2 text-center cursor-pointer ${
                      experience === exp ? 'active text-cyan-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {exp}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="pixel-font text-sm text-zinc-300 block mb-1.5">
                3. INTERVIEW TYPE
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {INTERVIEW_TYPES.map((t) => (
                  <div
                    key={t}
                    onClick={() => {
                      soundEffects?.playClick();
                      setInterviewType(t);
                    }}
                    className={`mc-slot p-2 text-center cursor-pointer truncate ${
                      interviewType === t ? 'active text-cyan-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Count & Resume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="pixel-font text-sm text-zinc-300 block mb-1.5">
                4. INTERVIEW LENGTH
              </label>
              <div className="flex gap-2">
                {LENGTHS.map((len) => (
                  <div
                    key={len.count}
                    onClick={() => {
                      soundEffects?.playClick();
                      setQuestionCount(len.count);
                    }}
                    className={`flex-1 mc-slot p-2 text-center cursor-pointer ${
                      questionCount === len.count ? 'active text-cyan-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {len.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Resume Upload */}
            <div>
              <label className="pixel-font text-sm text-zinc-300 block mb-1.5">
                5. OPTIONAL RESUME (PDF)
              </label>
              <label className="mc-slot p-2 flex items-center justify-between cursor-pointer text-zinc-300 hover:border-zinc-500">
                <span className="truncate pr-2">
                  {isUploading ? 'Parsing...' : resumeFilename || 'Attach PDF for personalized questions'}
                </span>
                <FileUp className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="mc-btn bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 px-4"
            >
              BACK
            </button>
            <button
              type="submit"
              className="mc-btn mc-btn-cyan text-sm py-2 px-6 flex items-center gap-2"
            >
              <span>ENTER THE ROOM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
