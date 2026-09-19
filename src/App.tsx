import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CVUploadSection } from './components/CVUploadSection';
import { CandidateProfileCard } from './components/CandidateProfileCard';
import { JobMatchCard } from './components/JobMatchCard';
import { JobDetailView } from './components/JobDetailView';
import { PracticeSessionModal } from './components/PracticeSessionModal';
import { CustomJobModal } from './components/CustomJobModal';
import { CVAnalysisResult, MatchedJob } from './types';
import { Sparkles, Plus, Search, Filter, Briefcase, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem('prepcraft_cv_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedJob, setSelectedJob] = useState<MatchedJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isCustomJobOpen, setIsCustomJobOpen] = useState(false);
  const [practiceModal, setPracticeModal] = useState<{
    isOpen: boolean;
    job: MatchedJob | null;
    initialQuestionIndex: number;
  }>({
    isOpen: false,
    job: null,
    initialQuestionIndex: 0,
  });

  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist analysis result to local storage
  useEffect(() => {
    if (analysisResult) {
      try {
        localStorage.setItem('prepcraft_cv_analysis', JSON.stringify(analysisResult));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
    }
  }, [analysisResult]);

  // Handler for CV Analysis
  const handleAnalyzeCV = async (payload: {
    cvText?: string;
    fileData?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setIsLoading(true);
    setLoadingStep('Uploading & scanning resume...');

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Extracting skills & career milestones...');
      }, 1800);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Matching target job roles & computing fit scores...');
      }, 3600);

      const stepTimer3 = setTimeout(() => {
        setLoadingStep('Generating job-specific interview questions & model answers...');
      }, 5400);

      const res = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!res.ok) {
        throw new Error('Failed to analyze CV.');
      }

      const data: CVAnalysisResult = await res.json();
      setAnalysisResult(data);
      setSelectedJob(null);
    } catch (err: any) {
      console.error('Error analyzing CV:', err);
      alert(err.message || 'Error analyzing CV. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset current CV and matched jobs?')) {
      localStorage.removeItem('prepcraft_cv_analysis');
      setAnalysisResult(null);
      setSelectedJob(null);
    }
  };

  const handleStartPractice = (job: MatchedJob, initialQuestionIndex = 0) => {
    setPracticeModal({
      isOpen: true,
      job,
      initialQuestionIndex,
    });
  };

  const handleCustomJobCreated = (newJob: MatchedJob) => {
    if (analysisResult) {
      const updated = {
        ...analysisResult,
        matchedJobs: [newJob, ...analysisResult.matchedJobs],
      };
      setAnalysisResult(updated);
      setSelectedJob(newJob);
    }
  };

  // Filter matched jobs
  const allDepartments = [
    'All',
    ...Array.from(new Set(analysisResult?.matchedJobs?.map(j => j.department).filter(Boolean) || [])),
  ];

  const filteredJobs = analysisResult?.matchedJobs?.filter(job => {
    const matchesDept = filterDepartment === 'All' || job.department === filterDepartment;
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.alignedSkills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* App Header */}
      <Header
        hasCV={!!analysisResult}
        onReset={handleReset}
        onOpenUpload={() => {
          setSelectedJob(null);
          setAnalysisResult(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!analysisResult ? (
          /* Step 1: Upload CV / Choose Profile */
          <CVUploadSection
            onAnalyze={handleAnalyzeCV}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        ) : selectedJob ? (
          /* Step 3: Detailed Job Q&A View */
          <JobDetailView
            job={selectedJob}
            onBack={() => setSelectedJob(null)}
            onStartPractice={handleStartPractice}
          />
        ) : (
          /* Step 2: Matched Jobs Dashboard */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Candidate Profile Summary */}
            <CandidateProfileCard
              candidate={analysisResult.candidate}
              generalAdvice={analysisResult.generalAdvice}
            />

            {/* Matched Roles Header and Controls */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Job Matches & Tailored Prep
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Showing {filteredJobs.length} high-fit roles based on your verified resume skills and track record.
                  </p>
                </div>

                <button
                  onClick={() => setIsCustomJobOpen(true)}
                  id="btn-open-custom-job"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 text-slate-800 hover:text-indigo-600 text-xs font-bold shadow-2xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Match Custom Job Role</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by job title or skill..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Department filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
                    Domain:
                  </span>
                  {allDepartments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setFilterDepartment(dept)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        filterDepartment === dept
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Jobs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredJobs.map(job => (
                  <JobMatchCard
                    key={job.id}
                    job={job}
                    isSelected={false}
                    onSelect={j => setSelectedJob(j)}
                    onStartPractice={j => handleStartPractice(j)}
                  />
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">No jobs match your current filter.</p>
                  <button
                    onClick={() => {
                      setFilterDepartment('All');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Interactive Practice Session Modal */}
      {practiceModal.isOpen && practiceModal.job && (
        <PracticeSessionModal
          job={practiceModal.job}
          initialQuestionIndex={practiceModal.initialQuestionIndex}
          onClose={() => setPracticeModal({ isOpen: false, job: null, initialQuestionIndex: 0 })}
          candidateContext={analysisResult?.candidate}
        />
      )}

      {/* Custom Target Job Matching Modal */}
      {analysisResult && (
        <CustomJobModal
          candidate={analysisResult.candidate}
          isOpen={isCustomJobOpen}
          onClose={() => setIsCustomJobOpen(false)}
          onJobCreated={handleCustomJobCreated}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PrepCraft AI &bull; Intelligent CV Matcher & Interview Practice</span>
          <span className="text-slate-400">
            Equipped with Gemini 3.8 Flash &bull; Speech-to-Text & STAR Scoring
          </span>
        </div>
      </footer>
    </div>
  );
}
