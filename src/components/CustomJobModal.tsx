import React, { useState } from 'react';
import { X, Sparkles, PlusCircle, RefreshCw, Briefcase, FileText } from 'lucide-react';
import { CandidateProfile, MatchedJob } from '../types';

interface CustomJobModalProps {
  candidate: CandidateProfile;
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: MatchedJob) => void;
}

export const CustomJobModal: React.FC<CustomJobModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onJobCreated,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      setError('Please enter a target job title.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/custom-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvProfile: candidate,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze custom job match');
      }

      const newJob: MatchedJob = await res.json();
      onJobCreated(newJob);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while matching the job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Match Custom Job or Opportunity</h2>
              <p className="text-xs text-slate-500">Compare your CV against a specific role you are applying to</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="custom-job-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Target Job Title *
            </label>
            <input
              id="custom-job-title"
              type="text"
              required
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Architect, Staff AI Engineer, Product Operations"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="custom-job-desc" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Job Description / Requirements (Optional)
            </label>
            <textarea
              id="custom-job-desc"
              rows={5}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements, qualifications, or company description to generate laser-targeted questions..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !jobTitle.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Matching CV & Generating Q&A...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Analyze & Add Role</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
