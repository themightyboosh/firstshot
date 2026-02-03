import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { Loader2, AlertCircle, MessageSquare, Zap, ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { dataApi, cmsApi, generationApi, generationApi as genApi, CMSItem, CASConfiguration } from "@/lib/api";

interface AdviceItem {
  Script: string;
  Action: string;
  Strategy: string;
}

export function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { situationId, answers, affectId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<AdviceItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csatSubmitted, setCsatSubmitted] = useState(false);

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
      
      // 1. Fetch all necessary data
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

      // 2. Calculate Archetype
      console.log("Submitting answers:", answers);
      const responseRes = await generationApi.submitResponse({
        userId: 'anonymous', 
        sessionId: 'session_' + Date.now(),
        answers: answers
      });
      
      console.log("Response Result:", responseRes);
      const archetype = responseRes.response?.result?.archetype;
      
      if (!archetype) {
        throw new Error(`Failed to determine archetype. Scores: ${JSON.stringify(responseRes.response?.result?.scores)}`);
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
      // Expect array or object. Spec says array.
      const item = Array.isArray(parsed) ? parsed[0] : parsed;
      
      setAdvice({
        Script: item.Script || item["What to Say"],
        Action: item.Action || item["What to Do"],
        Strategy: item.Strategy || item["What Next"] || item["Why"]
      });

    } catch (err) {
      console.error(err);
      setError("Something went wrong generating your advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCSAT = async (score: number) => {
    try {
        await genApi.submitFeedback({
            score,
            recommendationType: 'advice',
            // details...
        });
        setCsatSubmitted(true);
    } catch (e) {
        console.error(e);
    }
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
            <h1 className="text-3xl font-bold text-white">Here is your guidance</h1>
            <p className="text-slate-400">Tailored to your archetype and the current vibe.</p>
          </div>

          {advice && (
            <div className="space-y-6">
              {/* Script Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex items-center gap-2 mb-3 text-indigo-300">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">What to Say</h3>
                </div>
                <p className="text-white text-lg leading-relaxed font-medium">"{advice.Script}"</p>
              </motion.div>

              {/* Action Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <div className="flex items-center gap-2 mb-3 text-purple-300">
                  <Zap className="w-5 h-5" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">What to Do</h3>
                </div>
                <p className="text-slate-200 leading-relaxed">{advice.Action}</p>
              </motion.div>

              {/* Strategy Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-pink-500/30 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                <div className="flex items-center gap-2 mb-3 text-pink-300">
                  <ArrowRight className="w-5 h-5" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">Why & What Next</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{advice.Strategy}</p>
              </motion.div>
            </div>
          )}

          {/* CSAT */}
          {!csatSubmitted && (
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
                    onClick={() => handleCSAT(score)}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {csatSubmitted && (
             <div className="text-center text-green-400 text-sm mt-8">Thanks for your feedback!</div>
          )}

        </div>
      </div>
    </div>
  );
}
