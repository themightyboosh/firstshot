import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { ArrowRight, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dataApi, cmsApi, CMSItem } from "@/lib/api";
import { getStoredAnswers } from "@/lib/archetypeStorage";

interface Affect {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
}

export function EmotionSelectionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { situationId } = location.state || {};
  // Use stored answers as fallback for returning users
  const answers = location.state?.answers || getStoredAnswers();
  
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [affects, setAffects] = useState<Affect[]>([]);
  const [header, setHeader] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredAffect, setHoveredAffect] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dataApi.getAffects(),
      cmsApi.getItem('select_affect')
    ]).then(([data, head]) => {
      setAffects(data as Affect[]);
      setHeader(head);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleContinue = () => {
    if (selectedEmotion) {
      console.log("Navigating to Results with:", { situationId, answers, affectId: selectedEmotion });
      navigate("/results", { state: { situationId, answers, affectId: selectedEmotion } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              {header?.title || "Read the Vibe"}
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
              {header?.copy || "How does the other person seem? Pick the affect that matches their energy."}
            </p>
          </div>

          {/* Emotion Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {affects.map((affect, index) => {
              const isSelected = selectedEmotion === affect.id;
              const isHovered = hoveredAffect === affect.id;
              
              return (
                <motion.div
                  key={affect.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative h-56 md:h-64"
                  style={{ perspective: "1000px" }}
                  onMouseEnter={() => setHoveredAffect(affect.id)}
                  onMouseLeave={() => setHoveredAffect(null)}
                >
                  {/* Card Container with 3D flip */}
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isHovered ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front of Card */}
                    <button
                      onClick={() => setSelectedEmotion(affect.id)}
                      className={`absolute inset-0 bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 flex flex-col items-center justify-center ${
                        isSelected
                          ? "border-purple-500 shadow-lg shadow-purple-500/50"
                          : "border-slate-800"
                      }`}
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center z-10"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <div className="mb-4 flex justify-center">
                        <div className="w-20 h-20 md:w-28 md:h-28 relative flex items-center justify-center bg-slate-800 rounded-full overflow-hidden">
                          {affect.iconUrl ? (
                            <img
                              src={affect.iconUrl}
                              alt={affect.name}
                              className={`w-full h-full object-cover transition-all duration-300 ${
                                isSelected ? "brightness-110" : "brightness-90"
                              }`}
                            />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-slate-500" />
                          )}
                          
                          {/* Animated Glow Effect */}
                          {isSelected && (
                            <motion.div
                              animate={{
                                opacity: [0.5, 0.8, 0.5],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-xl -z-10"
                            />
                          )}
                        </div>
                      </div>

                      {/* Label */}
                      <p
                        className={`text-base md:text-lg font-semibold text-center transition-colors ${
                          isSelected ? "text-purple-300" : "text-slate-300"
                        }`}
                      >
                        {affect.name}
                      </p>
                    </button>

                    {/* Back of Card - Description */}
                    <button
                      onClick={() => setSelectedEmotion(affect.id)}
                      className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-xl rounded-2xl border-2 p-5 md:p-6 flex flex-col items-center justify-center ${
                        isSelected
                          ? "border-purple-500 shadow-lg shadow-purple-500/50"
                          : "border-purple-500/50"
                      }`}
                      style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                      }}
                    >
                      {/* Selection Indicator on back */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center z-10"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Affect Name */}
                      <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                        {affect.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-xs md:text-sm text-slate-300 text-center leading-relaxed">
                        {affect.description || "No description available"}
                      </p>

                      {/* Tap to select hint */}
                      <p className="absolute bottom-3 text-xs text-purple-400/70 font-medium">
                        Tap to select
                      </p>
                    </button>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedEmotion ? 1 : 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={handleContinue}
              disabled={!selectedEmotion}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
            >
              {header?.buttonText || "Get Guidance"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
