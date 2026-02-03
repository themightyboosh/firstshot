import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Navigation } from "@/app/components/navigation";
import { Button } from "@/app/components/ui/button";
import { cmsApi, CMSItem, generationApi, dataApi } from "@/lib/api";
import { saveArchetype, StoredArchetype } from "@/lib/archetypeStorage";

export function ArchetypeRevealScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [archetype, setArchetype] = useState<StoredArchetype | null>(null);
  const [archetypeConfig, setArchetypeConfig] = useState<any>(null);
  const [cmsContent, setCmsContent] = useState<CMSItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!answers) {
      setError("Missing assessment data. Please retake the assessment.");
      setLoading(false);
      return;
    }

    calculateArchetype();
  }, []);

  const calculateArchetype = async () => {
    try {
      setLoading(true);

      // Fetch CMS content for archetype reveal
      const cms = await cmsApi.getItem('archetype_reveal');
      setCmsContent(cms);

      // Calculate archetype from answers
      const responseRes = await generationApi.submitResponse({
        userId: 'anonymous',
        sessionId: 'session_' + Date.now(),
        answers: answers
      });

      // The archetype object from the scoring result contains the full archetype data
      const archetypeData = responseRes.response?.result?.archetype;
      const result = responseRes.response?.result;

      if (!archetypeData) {
        throw new Error("Failed to determine archetype.");
      }

      // The archetype already has name, imageUrl, description from CAS config
      setArchetypeConfig(archetypeData);

      // Store archetype in localStorage with the friendly name
      const storedData: Omit<StoredArchetype, 'calculatedAt'> = {
        name: archetypeData.name, // "Lone Wolf", etc.
        primaryTerrain: archetypeData.primaryTerrain,
        secondaryTerrain: archetypeData.secondaryTerrain,
        imageUrl: archetypeData.imageUrl,
        description: archetypeData.description,
        profileData: archetypeData.profileData,
        scores: result?.scores
      };
      saveArchetype(storedData, answers);
      setArchetype({ ...storedData, answers, calculatedAt: new Date().toISOString() });

    } catch (err) {
      console.error(err);
      setError("Something went wrong calculating your archetype. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/situation", { state: { answers } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
              />
            </div>
            <h2 className="text-2xl font-bold text-white">Analyzing your responses...</h2>
            <p className="text-slate-400">Discovering your relationship archetype</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <Button onClick={() => navigate("/assessment-intro")} variant="outline">
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          {/* CMS Title */}
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {cmsContent?.title || "Your Archetype Revealed"}
            </motion.div>
          </div>

          {/* CMS Copy */}
          {cmsContent?.copy && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 text-lg"
            >
              {cmsContent.copy}
            </motion.p>
          )}

          {/* Archetype Image */}
          {archetypeConfig?.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative mx-auto"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
                <img
                  src={archetypeConfig.imageUrl}
                  alt={archetype?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl -z-10"
              />
            </motion.div>
          )}

          {/* Archetype Name & Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {archetype?.name}
            </h1>
            
            {/* Archetype Description */}
            {archetypeConfig?.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-300 text-base md:text-lg leading-relaxed max-w-md mx-auto"
              >
                {archetypeConfig.description}
              </motion.p>
            )}

            {archetype?.primaryTerrain && archetype?.secondaryTerrain && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-slate-500 text-sm"
              >
                <span className="text-purple-400/70">{archetype.primaryTerrain}</span> with <span className="text-purple-400/70">{archetype.secondaryTerrain}</span> influence
              </motion.p>
            )}
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white font-bold py-6 rounded-xl text-lg transition-all"
            >
              <span>{cmsContent?.buttonText || "Continue"}</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
