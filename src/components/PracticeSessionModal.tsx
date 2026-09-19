import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Mic, MicOff, Send, Clock, RotateCcw, Award, CheckCircle2, 
  AlertCircle, Sparkles, ChevronRight, ChevronLeft, Volume2, 
  HelpCircle, RefreshCw, FileText, ArrowRight
} from 'lucide-react';
import { MatchedJob, InterviewQuestion, AnswerEvaluation } from '../types';

interface PracticeSessionModalProps {
  job: MatchedJob;
  initialQuestionIndex?: number;
  onClose: () => void;
  candidateContext?: any;
}

export const PracticeSessionModal: React.FC<PracticeSessionModalProps> = ({
  job,
  initialQuestionIndex = 0,
  onClose,
  candidateContext,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Store history of evaluated answers
  const [sessionScores, setSessionScores] = useState<{
    [questionId: string]: {
      answer: string;
      evaluation: AnswerEvaluation;
      durationSeconds: number;
    };
  }>({});

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const questions = job.interviewQuestions || [];
  const currentQuestion: InterviewQuestion | undefined = questions[currentIndex];

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setUserAnswer(prev => {
          // If previous ends without space, add space
          const cleanPrev = prev.trim();
          return cleanPrev ? `${cleanPrev} ${currentTranscript.trim()}` : currentTranscript.trim();
        });
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition not available:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !evaluation && !sessionCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, evaluation, sessionCompleted]);

  // Handle Voice Toggle
  const toggleRecording = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported in this browser. You can type your answer directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Insert STAR template helper
  const insertStarTemplate = () => {
    const starSnippet = `Situation: 
Task: 
Action: 
Result: `;
    setUserAnswer(prev => (prev ? `${prev}\n\n${starSnippet}` : starSnippet));
  };

  // Evaluate answer via server endpoint
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || userAnswer.trim().length < 15) {
      alert('Please provide a more detailed response before evaluating (at least a couple of sentences).');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          question: currentQuestion.question,
          idealAnswer: currentQuestion.idealAnswer,
          userAnswer: userAnswer.trim(),
          candidateContext,
        }),
      });

      const data: AnswerEvaluation = await res.json();
      setEvaluation(data);

      // Save to session scores
      if (currentQuestion) {
        setSessionScores(prev => ({
          ...prev,
          [currentQuestion.id]: {
            answer: userAnswer,
            evaluation: data,
            durationSeconds: timerSeconds,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // reset question state
      const nextQ = questions[nextIndex];
      const existing = sessionScores[nextQ.id];
      if (existing) {
        setUserAnswer(existing.answer);
        setEvaluation(existing.evaluation);
        setTimerSeconds(existing.durationSeconds);
      } else {
        setUserAnswer('');
        setEvaluation(null);
        setTimerSeconds(0);
      }
      setShowIdealAnswer(false);
      setIsTimerRunning(true);
    } else {
      // Completed all questions!
      setSessionCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevQ = questions[prevIndex];
      const existing = sessionScores[prevQ.id];
      if (existing) {
        setUserAnswer(existing.answer);
        setEvaluation(existing.evaluation);
        setTimerSeconds(existing.durationSeconds);
      } else {
        setUserAnswer('');
        setEvaluation(null);
        setTimerSeconds(0);
      }
      setShowIdealAnswer(false);
    }
  };

  const handleRetryQuestion = () => {
    setEvaluation(null);
    setShowIdealAnswer(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  // Compute overall session stats
  const evaluatedQuestionsCount = Object.keys(sessionScores).length;
  const averageScore = evaluatedQuestionsCount > 0
    ? Math.round(
        Object.values(sessionScores).reduce((acc, curr) => acc + curr.evaluation.score, 0) /
        evaluatedQuestionsCount
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Interactive Practice Room
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs font-medium text-slate-500">{job.title}</span>
              </div>
              <p className="text-xs text-slate-500">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-700 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatTime(timerSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              id="btn-close-practice"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {sessionCompleted ? (
            /* Session Completed Scorecard */
            <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                <Award className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Practice Session Finished!</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Great job completing practice for <span className="font-semibold text-slate-800">{job.title}</span>.
                </p>
              </div>

              {/* Scorecard Hero */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-around gap-6">
                <div>
                  <div className="text-4xl font-black text-indigo-600 tracking-tight">
                    {averageScore}%
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Overall Interview Score
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    {evaluatedQuestionsCount} / {questions.length}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Questions Answered
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {averageScore >= 85 ? 'Interview Ready' : averageScore >= 70 ? 'Competent' : 'Developing'}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Readiness Verdict
                  </div>
                </div>
              </div>

              {/* Questions Review List */}
              <div className="text-left space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Question Breakdown
                </h3>
                {questions.map((q, idx) => {
                  const scoreObj = sessionScores[q.id];
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setSessionCompleted(false);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs cursor-pointer flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex-1">
                        <span className="text-[11px] font-bold text-indigo-600 block mb-0.5">
                          Question {idx + 1} &bull; {q.category}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {q.question}
                        </p>
                      </div>

                      {scoreObj ? (
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-extrabold ${scoreObj.evaluation.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {scoreObj.evaluation.score}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">{scoreObj.evaluation.verdict}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Skipped</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setSessionCompleted(false);
                    setCurrentIndex(0);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Active Practice Question View */
            <div className="space-y-6">
              {/* Question Header Card */}
              {currentQuestion && (
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                      {currentQuestion.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {currentQuestion.difficulty} Difficulty
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h3>

                  {currentQuestion.whyAsked && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                      <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700">Interviewer focus: </strong>
                        {currentQuestion.whyAsked}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Answer Input Section (if not evaluated yet or editing) */}
              {!evaluation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="practice-answer-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" /> Your Response
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={insertStarTemplate}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        + Insert STAR Template
                      </button>

                      {speechSupported && (
                        <button
                          onClick={toggleRecording}
                          id="btn-toggle-mic"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isRecording
                              ? 'bg-rose-600 text-white animate-pulse shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          <span>{isRecording ? 'Listening (Click to Stop)' : 'Voice Mic'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      id="practice-answer-input"
                      rows={7}
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      placeholder="Speak or type your answer here. Provide specific situations, key decisions, metrics, and outcomes..."
                      className="w-full p-4 rounded-2xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                    />

                    {isRecording && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        Transcribing your speech...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {userAnswer.trim().split(/\s+/).filter(Boolean).length} words &bull;{' '}
                      {userAnswer.length} characters
                    </span>
                    <span className="italic">
                      Tip: Keep responses structured and cite quantifiable results.
                    </span>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{showIdealAnswer ? 'Hide Model Answer' : 'Peek Model Answer'}</span>
                    </button>

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !userAnswer.trim()}
                      id="btn-submit-answer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Gemini Grading Answer...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit for AI Evaluation</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* AI Feedback & Evaluation Card */
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          AI Performance Evaluation
                        </span>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">
                          {evaluation.verdict}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-3xl font-black ${evaluation.score >= 85 ? 'text-emerald-600' : evaluation.score >= 70 ? 'text-indigo-600' : 'text-amber-600'}`}>
                            {evaluation.score}
                            <span className="text-base font-medium text-slate-400">/100</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Interview Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> What You Did Well
                        </span>
                        <ul className="space-y-1.5">
                          {evaluation.strengths?.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                              <span className="text-emerald-500 font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Areas to Elevate
                        </span>
                        <ul className="space-y-1.5">
                          {evaluation.weaknesses?.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                              <span className="text-amber-500 font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* STAR framework review */}
                    {evaluation.starFrameworkScore && (
                      <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          STAR Framework Breakdown
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-50">
                            <span className="font-bold text-slate-700 block">Situation</span>
                            <span className="text-slate-500 text-[11px]">{evaluation.starFrameworkScore.situation}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50">
                            <span className="font-bold text-slate-700 block">Task</span>
                            <span className="text-slate-500 text-[11px]">{evaluation.starFrameworkScore.task}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50">
                            <span className="font-bold text-slate-700 block">Action</span>
                            <span className="text-slate-500 text-[11px]">{evaluation.starFrameworkScore.action}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50">
                            <span className="font-bold text-slate-700 block">Result</span>
                            <span className="text-slate-500 text-[11px]">{evaluation.starFrameworkScore.result}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Elevated Re-written Answer */}
                    {evaluation.improvedAnswer && (
                      <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
                        <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Elevated Model Version of Your Answer
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed italic">
                          "{evaluation.improvedAnswer}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      onClick={handleRetryQuestion}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Attempt Answer</span>
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      id="btn-next-question"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
                    >
                      <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Peeking Ideal Answer Collapsible */}
              {showIdealAnswer && currentQuestion && (
                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 animate-in fade-in">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1.5">
                    Recommended Model Answer
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentQuestion.idealAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        {!sessionCompleted && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => {
                const isAnswered = !!sessionScores[questions[i]?.id];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i);
                      const targetQ = questions[i];
                      const existing = sessionScores[targetQ?.id];
                      if (existing) {
                        setUserAnswer(existing.answer);
                        setEvaluation(existing.evaluation);
                      } else {
                        setUserAnswer('');
                        setEvaluation(null);
                      }
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentIndex
                        ? 'w-6 bg-indigo-600'
                        : isAnswered
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Question ${i + 1}`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>{currentIndex < questions.length - 1 ? 'Skip / Next' : 'Finish'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
