import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { ArrowRight, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dataApi, cmsApi, CMSItem } from "@/lib/api";

interface Affect {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
}

export function EmotionSelectionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { situationId, answers } = location.state || {};
  
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [affects, setAffects] = useState<Affect[]>([]);
  const [header, setHeader] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);

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
              
              return (
                <motion.button
                  key={affect.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => setSelectedEmotion(affect.id)}
                  className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 group ${
                    isSelected
                      ? "border-purple-500 shadow-lg shadow-purple-500/50"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Selection Indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="w-24 h-24 md:w-32 md:h-32 relative flex items-center justify-center bg-black/50 rounded-full overflow-hidden"
                    >
                      {affect.iconUrl ? (
                        <img
                          src={affect.iconUrl}
                          alt={affect.name}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            isSelected ? "brightness-110" : "brightness-90 group-hover:brightness-100"
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
                    </motion.div>
                  </div>

                  {/* Label */}
                  <p
                    className={`text-base md:text-lg font-semibold text-center transition-colors ${
                      isSelected ? "text-purple-300" : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {affect.name}
                  </p>
                  
                  {/* Optional Description Tooltip or Subtext */}
                  {/* <p className="text-xs text-slate-500 text-center mt-2 line-clamp-2">{affect.description}</p> */}
                </motion.button>
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
