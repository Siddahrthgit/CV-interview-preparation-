export interface CandidateProfile {
  name: string;
  title: string;
  summary: string;
  yearsExperience: string;
  topSkills: string[];
  domains: string[];
  education?: string;
  notableAchievements: string[];
}

export interface InterviewQuestion {
  id: string;
  category: 'Behavioral' | 'Technical' | 'Architecture & Design' | 'Situational' | 'CV Deep-Dive';
  question: string;
  whyAsked: string;
  idealAnswer: string;
  keyPoints: string[];
  pitfallsToAvoid: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface MatchedJob {
  id: string;
  title: string;
  department: string;
  matchScore: number;
  matchReason: string;
  alignedSkills: string[];
  missingOrGrowthSkills: string[];
  marketDemand: 'High' | 'Very High' | 'Moderate';
  typicalLevel: string;
  overview: string;
  interviewQuestions: InterviewQuestion[];
}

export interface CVAnalysisResult {
  candidate: CandidateProfile;
  matchedJobs: MatchedJob[];
  generalAdvice: string[];
}

export interface AnswerEvaluation {
  score: number; // 0 - 100
  verdict: 'Exceptional' | 'Strong' | 'Satisfactory' | 'Needs Improvement';
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  actionableTips: string[];
  starFrameworkScore?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface PracticeSessionState {
  job: MatchedJob;
  currentQuestionIndex: number;
  answers: {
    questionId: string;
    userAnswer: string;
    evaluation?: AnswerEvaluation;
    audioRecorded?: boolean;
    durationSeconds?: number;
  }[];
  isComplete: boolean;
}
