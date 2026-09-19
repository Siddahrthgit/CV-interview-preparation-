import React from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Play, TrendingUp, Layers } from 'lucide-react';
import { MatchedJob } from '../types';

interface JobMatchCardProps {
  job: MatchedJob;
  isSelected: boolean;
  onSelect: (job: MatchedJob) => void;
  onStartPractice: (job: MatchedJob) => void;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({
  job,
  isSelected,
  onSelect,
  onStartPractice,
}) => {
  // Score color formatting
  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
    if (score >= 80) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', bar: 'bg-indigo-500' };
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
  };

  const scoreStyle = getScoreColor(job.matchScore);

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="p-6">
        {/* Header: Title & Match Score Badge */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {job.department || 'Engineering'}
              </span>
              {job.typicalLevel && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                  {job.typicalLevel}
                </span>
              )}
              {job.marketDemand && (
                <span className="text-xs font-medium flex items-center gap-1 text-emerald-700">
                  <TrendingUp className="w-3 h-3" /> {job.marketDemand} Demand
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
          </div>

          {/* Match Score Indicator */}
          <div className={`text-center px-3.5 py-2 rounded-xl border ${scoreStyle.bg} ${scoreStyle.border} shrink-0`}>
            <div className={`text-xl font-extrabold ${scoreStyle.text}`}>
              {job.matchScore}%
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Match</div>
          </div>
        </div>

        {/* Match score bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scoreStyle.bar}`}
            style={{ width: `${job.matchScore}%` }}
          />
        </div>

        {/* Match Reason */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {job.matchReason}
        </p>

        {/* Aligned Skills */}
        <div className="mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Matching Skills
          </span>
          <div className="flex flex-wrap gap-1">
            {job.alignedSkills?.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Growth Skills / Gaps */}
        {job.missingOrGrowthSkills && job.missingOrGrowthSkills.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Growth Focus
            </span>
            <div className="flex flex-wrap gap-1">
              {job.missingOrGrowthSkills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100"
                >
                  <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-3">
        <button
          onClick={() => onSelect(job)}
          id={`btn-view-job-${job.id}`}
          className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{job.interviewQuestions?.length || 5} Questions & Answers</span>
        </button>

        <button
          onClick={() => onStartPractice(job)}
          id={`btn-practice-${job.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Practice Session</span>
        </button>
      </div>
    </div>
  );
};
