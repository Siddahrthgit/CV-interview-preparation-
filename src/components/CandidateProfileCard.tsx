import React from 'react';
import { User, Briefcase, Award, GraduationCap, CheckCircle, Lightbulb } from 'lucide-react';
import { CandidateProfile } from '../types';

interface CandidateProfileCardProps {
  candidate: CandidateProfile;
  generalAdvice: string[];
}

export const CandidateProfileCard: React.FC<CandidateProfileCardProps> = ({ candidate, generalAdvice }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 mb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left side: Bio & Title */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {candidate.name ? candidate.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
              <div className="flex items-center gap-2 text-sm text-indigo-700 font-semibold">
                <Briefcase className="w-4 h-4" />
                <span>{candidate.title}</span>
                {candidate.yearsExperience && (
                  <>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500 text-xs font-normal">{candidate.yearsExperience} experience</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            {candidate.summary}
          </p>

          {/* Top Skills Tags */}
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Detected Core Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.topSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Key Achievements & Advice */}
        <div className="w-full md:w-80 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            <Award className="w-4 h-4 text-amber-500" /> Key CV Highlights
          </div>
          <ul className="space-y-2 mb-4">
            {candidate.notableAchievements?.slice(0, 3).map((achieve, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-snug">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{achieve}</span>
              </li>
            ))}
          </ul>

          {generalAdvice && generalAdvice.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" /> AI Resume Tip
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "{generalAdvice[0]}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
