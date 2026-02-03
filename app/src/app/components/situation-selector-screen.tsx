import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dataApi, cmsApi, CMSItem } from "@/lib/api";

interface Situation {
  id: string;
  name: string;
  shortDescription: string;
  squarePngUrl?: string;
}

export function SituationSelectorScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers } = location.state || {};
  
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [header, setHeader] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataApi.getSituations(),
      cmsApi.getItem('select_situation')
    ]).then(([sits, head]) => {
      setSituations(sits as Situation[]);
      setHeader(head);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleContinue = () => {
    if (selectedSituation) {
      console.log("Situation Selected:", selectedSituation, "Answers:", answers);
      navigate("/emotions", { state: { situationId: selectedSituation, answers } });
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
          className="w-full max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              {header?.title || "What's happening?"}
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
              {header?.copy || "Select the situation that best describes what you're experiencing right now"}
            </p>
          </div>

          {/* Situations List */}
          <div className="space-y-3 mb-8">
            {situations.map((situation, index) => {
              const isSelected = selectedSituation === situation.id;

              return (
                <motion.button
                  key={situation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedSituation(situation.id)}
                  className={`w-full bg-slate-900/50 backdrop-blur-xl rounded-xl border-2 p-4 md:p-5 transition-all duration-300 group text-left relative ${
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
                        className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center z-10"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-start gap-4 pr-8">
                    {/* Image */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700`}
                    >
                      {situation.squarePngUrl ? (
                        <img 
                          src={situation.squarePngUrl} 
                          alt={situation.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Img</div>
                      )}
                    </motion.div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 py-1">
                      <h3
                        className={`text-lg font-bold mb-1 transition-colors ${
                          isSelected ? "text-purple-300" : "text-white group-hover:text-purple-200"
                        }`}
                      >
                        {situation.name}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed transition-colors ${
                          isSelected
                            ? "text-slate-300"
                            : "text-slate-400 group-hover:text-slate-300"
                        }`}
                      >
                        {situation.shortDescription}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedSituation ? 1 : 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={handleContinue}
              disabled={!selectedSituation}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
            >
              {header?.buttonText || "Continue"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
