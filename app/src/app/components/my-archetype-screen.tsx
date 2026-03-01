import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Navigation } from "@/app/components/navigation";
import { Button } from "@/app/components/ui/button";
import { getStoredArchetype, StoredArchetype } from "@/lib/archetypeStorage";

export function MyArchetypeScreen() {
  const navigate = useNavigate();
  const [archetype, setArchetype] = useState<StoredArchetype | null>(null);

  useEffect(() => {
    const stored = getStoredArchetype();
    if (!stored) {
      // No archetype stored, redirect to assessment
      navigate("/assessment-intro");
      return;
    }
    setArchetype(stored);
  }, [navigate]);

  const handleContinue = () => {
    navigate("/situation");
  };

  if (!archetype) {
    return null;
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
          {/* Header */}
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Your Archetype
            </motion.div>
          </div>

          {/* Archetype Image */}
          {archetype.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative mx-auto"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
                <img
                  src={archetype.imageUrl}
                  alt={archetype.name}
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
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {archetype.name}
            </h1>
            
            {/* Archetype Description */}
            {archetype.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-300 text-base md:text-lg leading-relaxed max-w-md mx-auto"
              >
                {archetype.description}
              </motion.p>
            )}

            {archetype.primaryTerrain && archetype.secondaryTerrain && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
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
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white font-bold py-6 rounded-xl text-lg transition-all"
            >
              <span>Get Guidance</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
