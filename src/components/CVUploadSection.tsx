import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { SAMPLE_CVS, SampleCV } from '../data/sampleCVs';

interface CVUploadSectionProps {
  onAnalyze: (payload: { cvText?: string; fileData?: string; mimeType?: string; fileName?: string }) => Promise<void>;
  isLoading: boolean;
  loadingStep?: string;
}

export const CVUploadSection: React.FC<CVUploadSectionProps> = ({ onAnalyze, isLoading, loadingStep }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'preset'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fullstack-dev');
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit. Please upload a smaller file or paste text directly.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data URL prefix (e.g. "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    try {
      if (activeTab === 'upload') {
        if (!selectedFile) {
          setErrorMessage('Please choose or drag a resume file (PDF, TXT, DOCX) first.');
          return;
        }

        // If it's a text/markdown file, we can read as text directly
        if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
          const text = await selectedFile.text();
          await onAnalyze({ cvText: text, fileName: selectedFile.name });
        } else {
          // For PDFs and other files, encode as base64 for Gemini
          const base64 = await fileToBase64(selectedFile);
          await onAnalyze({
            fileData: base64,
            mimeType: selectedFile.type || 'application/pdf',
            fileName: selectedFile.name,
          });
        }
      } else if (activeTab === 'paste') {
        if (!pastedText.trim() || pastedText.trim().length < 30) {
          setErrorMessage('Please paste at least a few sentences describing your skills, experience, and background.');
          return;
        }
        await onAnalyze({ cvText: pastedText.trim() });
      } else if (activeTab === 'preset') {
        const preset = SAMPLE_CVS.find(p => p.id === selectedPresetId) || SAMPLE_CVS[0];
        await onAnalyze({ cvText: preset.content, fileName: `${preset.name} - ${preset.role}.txt` });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to process CV. Please try again.');
    }
  };

  const handlePresetSelect = (preset: SampleCV) => {
    setSelectedPresetId(preset.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Interview Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Upload Your CV to Unlock Matched Jobs & Interview Prep
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Gemini analyzes your resume, matches you with high-affinity target roles, generates job-specific interview questions with model answers, and runs personalized practice simulations.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('upload')}
            id="tab-upload"
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload CV / Resume
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            id="tab-paste"
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'paste'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4" /> Paste Text
          </button>
          <button
            onClick={() => setActiveTab('preset')}
            id="tab-preset"
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'preset'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Sample Profiles
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="cv-file-input"
                  accept=".pdf,.docx,.doc,.txt,.md,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{selectedFile.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Drop your resume file here</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      Supports PDF, TXT, DOCX, or text files up to 15MB.
                    </p>
                    <span className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">
                      Browse Computer
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <label htmlFor="cv-text-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Paste Resume / LinkedIn Bio / CV Text
              </label>
              <textarea
                id="cv-text-input"
                rows={9}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Paste your resume contents here including skills, work history, education, and achievements..."
                className="w-full p-4 text-sm text-slate-800 bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
              <p className="text-xs text-slate-500 mt-2">
                Include key achievements and technology stacks for higher accuracy matching.
              </p>
            </div>
          )}

          {activeTab === 'preset' && (
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Select a ready-to-test candidate profile
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_CVS.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 text-sm">{preset.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-xs font-semibold text-indigo-700 mb-2">{preset.role}</p>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {preset.headline}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Gemini 3.8 Flash model for CV extraction & job matching
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              id="btn-analyze-cv"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Analyzing CV & Matching Jobs...'}</span>
                </>
              ) : (
                <>
                  <span>Analyze CV & Generate Prep</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
