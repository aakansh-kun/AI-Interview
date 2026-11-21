import React, { useState } from 'react';
import { Briefcase, Award, Clock, FileUp, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { uploadResume } from '../../services/api';

export default function InterviewSetup({ onComplete, soundEffects }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    interviewType: 'Technical Interview',
    role: 'Software Engineer',
    customRole: '',
    experience: 'Mid-Level',
    questionCount: 10,
    resumeText: '',
    resumeFilename: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const interviewTypes = [
    { id: 'Technical Interview', title: 'Technical Interview', desc: 'System design, coding architectures, debugging, and engineering trade-offs.' },
    { id: 'HR Interview', title: 'HR & Culture Fit', desc: 'Values, team dynamics, communication style, and career goals.' },
    { id: 'Behavioral Interview', title: 'Behavioral Interview', desc: 'STAR methodology questions evaluating situational leadership and conflict resolution.' },
    { id: 'Mixed Interview', title: 'Mixed Comprehensive', desc: 'Balanced blend of technical problem solving and behavioral scenarios.' }
  ];

  const presetRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Product Manager'
  ];

  const experienceLevels = [
    { id: 'Fresher', title: 'Fresher / Intern', desc: '0 years experience, foundational theory & academic projects' },
    { id: 'Junior', title: 'Junior Developer', desc: '1-2 years experience, hands-on coding & bug fixing' },
    { id: 'Mid-Level', title: 'Mid-Level Engineer', desc: '3-5 years experience, feature ownership & production systems' },
    { id: 'Senior', title: 'Senior / Lead', desc: '6+ years experience, system architecture & mentoring' }
  ];

  const lengths = [
    { count: 5, label: 'Quick', desc: '5 questions (~10-15 mins) • Fast check-in' },
    { count: 10, label: 'Standard', desc: '10 questions (~25 mins) • Recommended' },
    { count: 15, label: 'Deep', desc: '15 questions (~40 mins) • Comprehensive evaluation' }
  ];

  const handleNext = () => {
    soundEffects?.playClick();
    if (step < 5) {
      setStep(step + 1);
    } else {
      const finalRole = formData.customRole.trim() || formData.role;
      onComplete({
        ...formData,
        role: finalRole
      });
    }
  };

  const handleBack = () => {
    soundEffects?.playClick();
    if (step > 1) setStep(step - 1);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects?.playClick();
    setIsUploading(true);
    setUploadError('');

    try {
      const res = await uploadResume(file);
      setFormData(prev => ({
        ...prev,
        resumeText: res.fullText,
        resumeFilename: res.filename
      }));
      soundEffects?.playPop();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      {/* Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="pixel-font text-lg text-amber-400">
            STEP {step} OF 5: {
              step === 1 ? 'INTERVIEW TYPE' :
              step === 2 ? 'TARGET ROLE' :
              step === 3 ? 'EXPERIENCE LEVEL' :
              step === 4 ? 'RESUME CONTEXT' : 'INTERVIEW LENGTH'
            }
          </span>
          <span className="text-xs text-zinc-400">Setup Wizard</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
          <div
            className="bg-amber-400 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mc-card p-6 md:p-8 bg-zinc-950/90 border border-zinc-700 min-h-[380px] flex flex-col justify-between">
        <div>
          {/* STEP 1: INTERVIEW TYPE */}
          {step === 1 && (
            <div>
              <h3 className="pixel-font text-2xl text-zinc-100 mb-2">SELECT INTERVIEW TYPE</h3>
              <p className="text-zinc-400 text-sm mb-6">Choose the domain focus for your mock session.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {interviewTypes.map((type) => {
                  const isSelected = formData.interviewType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => {
                        soundEffects?.playClick();
                        setFormData({ ...formData, interviewType: type.id });
                      }}
                      className={`p-4 rounded border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400 shadow-md'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-100">{type.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-zinc-400">{type.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: TARGET ROLE */}
          {step === 2 && (
            <div>
              <h3 className="pixel-font text-2xl text-zinc-100 mb-2">CHOOSE YOUR TARGET ROLE</h3>
              <p className="text-zinc-400 text-sm mb-6">Select a standard engineering track or type a custom role.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {presetRoles.map((role) => {
                  const isSelected = formData.role === role && !formData.customRole;
                  return (
                    <div
                      key={role}
                      onClick={() => {
                        soundEffects?.playClick();
                        setFormData({ ...formData, role, customRole: '' });
                      }}
                      className={`p-3 rounded border text-center cursor-pointer text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 text-amber-300 ring-1 ring-amber-400'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {role}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Or specify a custom role:
                </label>
                <input
                  type="text"
                  value={formData.customRole}
                  onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                  placeholder="e.g. Cloud Security Architect, iOS Lead, Solutions Engineer..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE LEVEL */}
          {step === 3 && (
            <div>
              <h3 className="pixel-font text-2xl text-zinc-100 mb-2">SELECT EXPERIENCE LEVEL</h3>
              <p className="text-zinc-400 text-sm mb-6">Gemini adjusts question difficulty, system scale, and expected depth accordingly.</p>
              <div className="space-y-3">
                {experienceLevels.map((exp) => {
                  const isSelected = formData.experience === exp.id;
                  return (
                    <div
                      key={exp.id}
                      onClick={() => {
                        soundEffects?.playClick();
                        setFormData({ ...formData, experience: exp.id });
                      }}
                      className={`p-4 rounded border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-zinc-100 mb-0.5">{exp.title}</div>
                        <div className="text-xs text-zinc-400">{exp.desc}</div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: OPTIONAL RESUME */}
          {step === 4 && (
            <div>
              <h3 className="pixel-font text-2xl text-zinc-100 mb-2">UPLOAD RESUME (OPTIONAL)</h3>
              <p className="text-emerald-400 text-sm font-medium mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Optional — Gemini can use your resume to personalize interview questions.
              </p>

              <div className="border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-lg p-8 text-center transition-colors bg-zinc-900/40">
                <FileUp className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-200 font-medium mb-1">
                  Upload your resume in PDF format
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  Max file size: 10MB • Text is parsed securely on the server
                </p>

                <label className="mc-button mc-button-emerald inline-flex items-center gap-2 cursor-pointer text-sm">
                  <span>{isUploading ? 'PARSING PDF...' : 'CHOOSE PDF FILE'}</span>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {formData.resumeFilename && (
                  <div className="mt-4 p-3 bg-zinc-900 border border-emerald-600/50 rounded flex items-center justify-between max-w-md mx-auto text-left">
                    <div>
                      <div className="text-xs font-bold text-emerald-400">Resume Attached</div>
                      <div className="text-xs text-zinc-300 truncate max-w-xs">{formData.resumeFilename}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, resumeText: '', resumeFilename: '' })}
                      className="text-xs text-red-400 hover:text-red-300 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-800 p-2 rounded">
                    {uploadError}
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-zinc-500 text-center">
                If no resume is supplied, the interview will proceed normally using standard role competencies.
              </div>
            </div>
          )}

          {/* STEP 5: INTERVIEW LENGTH */}
          {step === 5 && (
            <div>
              <h3 className="pixel-font text-2xl text-zinc-100 mb-2">SELECT INTERVIEW LENGTH</h3>
              <p className="text-zinc-400 text-sm mb-6">Choose how many dynamic questions the interviewer should ask.</p>
              <div className="space-y-4">
                {lengths.map((len) => {
                  const isSelected = formData.questionCount === len.count;
                  return (
                    <div
                      key={len.count}
                      onClick={() => {
                        soundEffects?.playClick();
                        setFormData({ ...formData, questionCount: len.count });
                      }}
                      className={`p-5 rounded border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-base text-zinc-100 mb-1 flex items-center gap-2">
                          <span>{len.label}</span>
                          <span className="text-xs font-sans text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                            {len.count} Questions
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400">{len.desc}</div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="mc-button bg-zinc-800 text-zinc-300 text-sm py-2 px-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNext}
            className="mc-button mc-button-gold text-sm py-2.5 px-6 flex items-center gap-2"
          >
            <span>{step === 5 ? 'CHOOSE INTERVIEWER' : 'NEXT STEP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
