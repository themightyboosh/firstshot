import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { Loader2, AlertCircle, Star, Share2, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dataApi, generationApi, generationApi as genApi } from "@/lib/api";
import { useGlobalSettings } from "@/lib/GlobalSettingsContext";
import { getStoredArchetype, getStoredAnswers } from "@/lib/archetypeStorage";

// Dynamic advice - any key-value pairs from AI
type AdviceData = Record<string, string>;

// Color palette for cards (cycles through)
const cardColors = [
  { border: 'border-indigo-500/30', accent: 'bg-indigo-500', text: 'text-indigo-300' },
  { border: 'border-purple-500/30', accent: 'bg-purple-500', text: 'text-purple-300' },
  { border: 'border-pink-500/30', accent: 'bg-pink-500', text: 'text-pink-300' },
  { border: 'border-cyan-500/30', accent: 'bg-cyan-500', text: 'text-cyan-300' },
  { border: 'border-amber-500/30', accent: 'bg-amber-500', text: 'text-amber-300' },
  { border: 'border-emerald-500/30', accent: 'bg-emerald-500', text: 'text-emerald-300' },
];

export function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { situationId, affectId } = location.state || {};
  // Use stored answers as fallback
  const answers = location.state?.answers || getStoredAnswers();
  const { appName } = useGlobalSettings();

  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csatSubmitted, setCsatSubmitted] = useState(false);
  const [csatScore, setCsatScore] = useState<number | null>(null);
  const [csatComment, setCsatComment] = useState("");
  const [csatPrompt, setCsatPrompt] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [archetypeName, setArchetypeName] = useState<string | null>(null);
  const [situationName, setSituationName] = useState<string | null>(null);

  useEffect(() => {
    if (!situationId || !answers || !affectId) {
      // navigate("/situation"); // Redirect if missing state
      // Commented out for dev safety, show error instead
      setError("Missing context. Please restart the flow.");
      setLoading(false);
      return;
    }

    generateAdvice();
  }, []);

  const generateAdvice = async () => {
    try {
      setLoading(true);
      
      // 1. Check for stored archetype first
      const storedArchetype = getStoredArchetype();
      
      // 2. Fetch all necessary data
      const [casConfig, globalSettings, situation, affect] = await Promise.all([
        dataApi.getCASConfig(),
        generationApi.getGlobalSettings(),
        // We need to fetch specific situation/affect by ID. 
        // dataApi.getSituations() returns all. We can filter.
        dataApi.getSituations().then(s => s.find(i => i.id === situationId)),
        dataApi.getAffects().then(a => a.find(i => i.id === affectId))
      ]);

      if (!casConfig || !globalSettings || !situation || !affect) {
        throw new Error("Failed to load required data.");
      }

      // Store situation name for display
      setSituationName(situation.name);

      let archetype;
      
      // 3. Use stored archetype if available, otherwise calculate
      if (storedArchetype) {
        console.log("Using stored archetype:", storedArchetype.name);
        archetype = storedArchetype;
        setArchetypeName(storedArchetype.name);
      } else {
        // Calculate Archetype (fallback for edge cases)
        console.log("Submitting answers:", answers);
        const responseRes = await generationApi.submitResponse({
          userId: 'anonymous', 
          sessionId: 'session_' + Date.now(),
          answers: answers
        });
        
        console.log("Response Result:", responseRes);
        archetype = responseRes.response?.result?.archetype;
        
        if (archetype) {
          setArchetypeName(archetype.name);
        }
      }
      
      if (!archetype) {
        throw new Error("Failed to determine archetype.");
      }

      // 3. Assemble Prompt
      let prompt = globalSettings.masterPrompt || "";
      
      // Replace tokens
      prompt = prompt.replace(/\*core-recognition\*/g, archetype.profileData.coreRecognition);
      prompt = prompt.replace(/\*protective-logic\*/g, archetype.profileData.protectiveLogic);
      prompt = prompt.replace(/\*cost-under-stress\*/g, archetype.profileData.costUnderStress);
      prompt = prompt.replace(/\*repulsion-disavowal\*/g, archetype.profileData.repulsionDisavowal);
      prompt = prompt.replace(/\*primary\*/g, archetype.primaryTerrain);
      prompt = prompt.replace(/\*secondary\*/g, archetype.secondaryTerrain || 'None');
      
      prompt = prompt.replace(/\*prompt-fragment\*/g, situation.promptFragment || "");
      prompt = prompt.replace(/\*situation_context\*/g, situation.promptFragment || "");
      
      prompt = prompt.replace(/\*affect_name\*/g, affect.name);
      prompt = prompt.replace(/\*affect_description\*/g, affect.description);
      prompt = prompt.replace(/\*affect_guidance\*/g, affect.interactionGuidance);

      // 4. Call Gemini
      const geminiRes = await generationApi.runGemini(prompt);
      
      // 5. Parse JSON
      // Gemini might return markdown code blocks ```json ... ```
      let jsonText = geminiRes.text;
      if (jsonText.includes("```json")) {
        jsonText = jsonText.split("```json")[1].split("```")[0].trim();
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.split("```")[1].split("```")[0].trim();
      }
      
      const parsed = JSON.parse(jsonText);
      // Expect array or object - take the first item if array
      const item = Array.isArray(parsed) ? parsed[0] : parsed;
      
      // Store all key-value pairs dynamically
      const adviceData: AdviceData = {};
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string') {
          adviceData[key] = value;
        }
      }
      
      setAdvice(adviceData);

    } catch (err) {
      console.error(err);
      setError("Something went wrong generating your advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCSATScore = (score: number) => {
    setCsatScore(score);
    if (score <= 2) setCsatPrompt("What was missing or off?");
    else if (score === 3) setCsatPrompt("What could be better?");
    else setCsatPrompt("What worked well?");
  };

  const submitFeedback = async () => {
    if (!csatScore) return;
    
    // Immediately close the form and show sending indicator
    setCsatSubmitted(true);
    setFeedbackSending(true);
    
    try {
      await genApi.submitFeedback({
        score: csatScore,
        comment: csatComment,
        recommendationType: 'advice',
      });
      setFeedbackSent(true);
    } catch (e) {
      console.error(e);
      // Still mark as sent to avoid confusion - the user already moved on
      setFeedbackSent(true);
    } finally {
      setFeedbackSending(false);
      // Auto-hide the toast after 2 seconds
      setTimeout(() => setFeedbackSent(false), 2000);
    }
  };

  const formatAdviceForSharing = () => {
    if (!advice) return "";
    
    const sections = Object.entries(advice)
      .map(([key, value]) => `${key}:\n${value}`)
      .join('\n\n');
    
    return `${sections}\n\n— Generated by ${appName}`;
  };

  const handleShare = async () => {
    const text = formatAdviceForSharing();
    
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Relationship Guidance",
          text: text,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        if ((err as Error).name === "AbortError") return;
      }
    }
    
    // Fallback: copy to clipboard
    handleCopy();
  };

  const handleCopy = async () => {
    const text = formatAdviceForSharing();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setShareError(true);
      setTimeout(() => setShareError(false), 2000);
    }
  };

  const handleNewSituation = () => {
    // Navigate back to situation selection, keeping answers for archetype
    navigate("/situation", { state: { answers } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Consulting the relationship architect...</h2>
        <p className="text-slate-400 mt-2">Analyzing your archetype and the situation.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button 
            onClick={() => navigate("/situation")}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">{situationName || "Your Guidance"}</h1>
            <p className="text-slate-400">
              {archetypeName ? `As a ${archetypeName}, here's what to do` : "Here's what to do"}
            </p>
          </div>

          {advice && (
            <div className="space-y-6">
              {/* Dynamic Cards - one for each key-value pair */}
              {Object.entries(advice).map(([key, value], index) => {
                const colors = cardColors[index % cardColors.length];
                return (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-slate-900/50 backdrop-blur-xl border ${colors.border} p-6 rounded-2xl relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${colors.accent}`}></div>
                    <h3 className={`font-bold uppercase text-sm tracking-wider mb-3 ${colors.text}`}>
                      {key}
                    </h3>
                    <p className="text-slate-200 leading-relaxed">{value}</p>
                  </motion.div>
                );
              })}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-white font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-green-400"
                      >
                        <Check className="w-5 h-5" />
                        <span>Copied!</span>
                      </motion.div>
                    ) : shareError ? (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-red-400"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span>Failed to copy</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="share"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share Results</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* New Situation Button */}
                <button
                  onClick={handleNewSituation}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-purple-500/20"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>New Situation</span>
                </button>
              </motion.div>
            </div>
          )}

          {/* CSAT */}
          {!csatSubmitted && !csatScore && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-center"
            >
              <p className="text-slate-400 mb-4 text-sm">Was this helpful?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleCSATScore(score)}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {!csatSubmitted && csatScore && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800"
            >
              <p className="text-white font-medium mb-3">{csatPrompt}</p>
              <textarea
                rows={3}
                value={csatComment}
                onChange={(e) => setCsatComment(e.target.value)}
                placeholder="Type a quick note (optional)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder:text-slate-500 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={submitFeedback}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={submitFeedback}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
          
        </div>
      </div>

      {/* Feedback Toast - Fixed at bottom */}
      <AnimatePresence>
        {(feedbackSending || feedbackSent) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg">
              {feedbackSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm text-slate-300">Sending...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Thanks for your feedback!</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
