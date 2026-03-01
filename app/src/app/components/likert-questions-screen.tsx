import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { dataApi, CASConfiguration, Question, QuestionOption } from "@/lib/api";

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LikertQuestionsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const situationId = location.state?.situationId;
  
  const [config, setConfig] = useState<CASConfiguration | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, QuestionOption[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { first?: string, second?: string, repulsion?: string }>>({});
  const [selectionStep, setSelectionStep] = useState<'first' | 'second' | 'repulsion'>('first');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataApi.getCASConfig().then(data => {
      const cfg = data as CASConfiguration;
      setConfig(cfg);
      
      // Shuffle question order for this session
      const randomizedQuestions = shuffle(cfg.questions);
      setShuffledQuestions(randomizedQuestions);
      
      // Shuffle options within each question (store separately to maintain consistency)
      const optionsMap: Record<string, QuestionOption[]> = {};
      randomizedQuestions.forEach(q => {
        optionsMap[q.id] = shuffle(q.options);
      });
      setShuffledOptions(optionsMap);
      
      setLoading(false);
    }).catch(console.error);
  }, []);

  // Scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  if (loading || !config || shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const questions = shuffledQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = shuffledOptions[currentQuestion.id] || currentQuestion.options;
  const currentAnswer = answers[currentQuestion.id] || {};
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isQuestionComplete = currentAnswer.first && currentAnswer.second && currentAnswer.repulsion;

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleOptionClick = (optionId: string) => {
    // Prevent selecting same option for multiple slots
    if (currentAnswer.first === optionId || currentAnswer.second === optionId || currentAnswer.repulsion === optionId) {
      return; // Deselect logic could be added here
    }

    const newAnswer = { ...currentAnswer, [selectionStep]: optionId };
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: newAnswer }));

    // Auto-advance step
    if (selectionStep === 'first') setSelectionStep('second');
    else if (selectionStep === 'second') setSelectionStep('repulsion');
    else if (selectionStep === 'repulsion') {
       // Done with this question
    }
  };

  const resetQuestion = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setSelectionStep('first');
  };

  const handleNext = () => {
    if (isLastQuestion) {
      console.log("Assessment Complete. Answers:", answers);
      // Navigate to archetype reveal screen to show their archetype
      navigate("/archetype-reveal", { state: { answers } });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectionStep('first');
    }
  };

  // Get the current direction text
  const getDirectionText = () => {
    if (isQuestionComplete) return "All set! Tap Next to continue.";
    if (selectionStep === 'first' && !currentAnswer.first) return "Which is MOST like you?";
    if (selectionStep === 'second' && currentAnswer.first && !currentAnswer.second) return "Which is NEXT most like you?";
    if (selectionStep === 'repulsion' && currentAnswer.second && !currentAnswer.repulsion) return "Which is LEAST like you?";
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      <Navigation />

      {/* Sticky Header with Progress + Direction */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        {/* Progress Bar */}
        <div className="w-full bg-slate-900/50 h-2">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Direction Banner */}
        <div className="py-3 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <p className={`font-bold text-lg md:text-xl ${isQuestionComplete ? 'text-green-400' : 'text-purple-300'}`}>
              {getDirectionText()}
            </p>
            <span className="text-sm text-slate-400">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col items-center">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-3xl"
        >
          {/* Question Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentOptions.map((option) => {
              const isFirst = currentAnswer.first === option.id;
              const isSecond = currentAnswer.second === option.id;
              const isRepulsion = currentAnswer.repulsion === option.id;
              const isSelected = isFirst || isSecond || isRepulsion;
              const isDisabled = isSelected; // Can't select again (unless we add deselect)

              return (
                <button
                  key={option.id}
                  onClick={() => !isDisabled && handleOptionClick(option.id)}
                  disabled={isDisabled}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    isFirst 
                      ? "border-green-500 bg-green-500/10"
                      : isSecond
                        ? "border-yellow-500 bg-yellow-500/10"
                        : isRepulsion
                          ? "border-red-500 bg-red-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  } ${isDisabled && !isSelected ? "opacity-50" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-white text-lg">{option.text}</span>
                    {isFirst && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">1st</span>}
                    {isSecond && <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">2nd</span>}
                    {isRepulsion && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">No</span>}
                  </div>
                </button>
              );
            })}
          </div>

        </motion.div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={resetQuestion}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700/50 text-white font-semibold hover:bg-slate-600/50 transition-all border border-slate-600"
          >
            Reset Selection
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!isQuestionComplete}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Complete Assessment
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isQuestionComplete}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next Question
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
