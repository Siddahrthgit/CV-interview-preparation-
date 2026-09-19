import React, { useState } from 'react';
import { ArrowLeft, Play, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, BookOpen, Target, Layers } from 'lucide-react';
import { MatchedJob, InterviewQuestion } from '../types';

interface JobDetailViewProps {
  job: MatchedJob;
  onBack: () => void;
  onStartPractice: (job: MatchedJob, initialQuestionIndex?: number) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, onBack, onStartPractice }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<string, boolean>>(() => {
    // Default expand first question
    const firstId = job.interviewQuestions?.[0]?.id;
    return firstId ? { [firstId]: true } : {};
  });

  const categories = ['All', ...Array.from(new Set(job.interviewQuestions?.map(q => q.category) || []))];

  const filteredQuestions = selectedCategory === 'All'
    ? job.interviewQuestions || []
    : (job.interviewQuestions || []).filter(q => q.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedQuestionIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    job.interviewQuestions?.forEach(q => { all[q.id] = true; });
    setExpandedQuestionIds(all);
  };

  const collapseAll = () => {
    setExpandedQuestionIds({});
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Advanced':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top navigation & action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            id="btn-back-to-jobs"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Back to all matched jobs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {job.department}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {job.matchScore}% Resume Match
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {job.title}
            </h1>
          </div>
        </div>

        <button
          onClick={() => onStartPractice(job)}
          id="btn-start-full-practice"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition-all cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Practice Session</span>
        </button>
      </div>

      {/* Role Overview & Match Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Role Overview & Why You Match
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {job.overview}
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-1">Resume Alignment Assessment:</span>
            <p className="text-xs text-slate-600 leading-relaxed">{job.matchReason}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Strongest Aligned Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {job.alignedSkills?.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {job.missingOrGrowthSkills && job.missingOrGrowthSkills.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
                Key Focus & Study Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.missingOrGrowthSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions & Answers Section Header & Category Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Tailored Interview Questions & Model Answers
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated specifically for {job.title} based on industry benchmarks and your CV.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-4 pt-2">
          {filteredQuestions.map((q, index) => {
            const isExpanded = !!expandedQuestionIds[q.id];
            const originalIndex = job.interviewQuestions?.findIndex(item => item.id === q.id) ?? index;

            return (
              <div
                key={q.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-indigo-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                        Q{originalIndex + 1}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {q.category}
                      </span>
                      {q.difficulty && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartPractice(job, originalIndex);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
                      title="Practice this question"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Practice</span>
                    </button>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Why asked, Model Answer, Key points, Pitfalls */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-1 border-t border-slate-100 space-y-4">
                    {/* Why Asked */}
                    {q.whyAsked && (
                      <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800">What interviewers look for: </span>
                          <span>{q.whyAsked}</span>
                        </div>
                      </div>
                    )}

                    {/* Ideal Model Answer */}
                    <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Ideal Model Answer
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {q.idealAnswer}
                      </p>
                    </div>

                    {/* Grid of Key points & Pitfalls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Key Points */}
                      {q.keyPoints && q.keyPoints.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                            Key Talking Points to Hit
                          </span>
                          <ul className="space-y-1.5">
                            {q.keyPoints.map((point, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Pitfalls to Avoid */}
                      {q.pitfallsToAvoid && q.pitfallsToAvoid.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-2">
                            Common Pitfalls to Avoid
                          </span>
                          <ul className="space-y-1.5">
                            {q.pitfallsToAvoid.map((pitfall, idx) => (
                              <li key={idx} className="text-xs text-rose-700 flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{pitfall}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Bottom action inside expanded card */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onStartPractice(job, originalIndex)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Practice This Question</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
