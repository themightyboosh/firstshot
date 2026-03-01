import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { dataApi, cmsApi, CMSItem } from "@/lib/api";
import { getStoredAnswers } from "@/lib/archetypeStorage";

interface Situation {
  id: string;
  name: string;
  shortDescription: string;
  squarePngUrl?: string;
}

export function SituationSelectorScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  // Use stored answers as fallback if not passed via state (for returning users)
  const answers = location.state?.answers || getStoredAnswers();
  
  const [situations, setSituations] = useState<Situation[]>([]);
  const [header, setHeader] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dataApi.getSituations(),
      cmsApi.getItem('select_situation')
    ]).then(([sits, head]) => {
      // Shuffle situations for each session
      const shuffled = [...(sits as Situation[])].sort(() => Math.random() - 0.5);
      setSituations(shuffled);
      setHeader(head);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleContinue = (situationId: string) => {
    console.log("Situation Selected:", situationId, "Answers:", answers);
    navigate("/emotions", { state: { situationId, answers } });
  };

  const handleFrontCardClick = (situationId: string) => {
    // First click flips the card
    setFlippedCard(situationId);
  };

  const handleBackCardClick = (situationId: string) => {
    // Second click (on flipped card) proceeds to next screen
    handleContinue(situationId);
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
          className="w-full max-w-5xl mx-auto"
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

          {/* Situations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {situations.map((situation, index) => {
              const isFlipped = flippedCard === situation.id;

              return (
                <motion.div
                  key={situation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative aspect-[4/3]"
                  style={{ perspective: "1000px" }}
                >
                  {/* Card Container with 3D flip */}
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front of Card - Image + Name */}
                    <button
                      onClick={() => handleFrontCardClick(situation.id)}
                      className="absolute inset-0 bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 border-slate-800 hover:border-slate-700 overflow-hidden transition-all duration-300 group text-left"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Image */}
                      <div className="absolute inset-0 bg-slate-800">
                        {situation.squarePngUrl ? (
                          <img 
                            src={situation.squarePngUrl} 
                            alt={situation.name}
                            className="w-full h-full object-cover brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-12 h-12" />
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-60 group-hover:opacity-50 transition-opacity" />
                      </div>

                      {/* Text Content - Overlaid on bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                          {situation.name}
                        </h3>
                      </div>
                    </button>

                    {/* Back of Card - Name + Description (no image) */}
                    <button
                      onClick={() => handleBackCardClick(situation.id)}
                      className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-xl rounded-2xl border-2 border-purple-500 shadow-lg shadow-purple-500/30 p-5 md:p-6 flex flex-col items-center justify-center text-center"
                      style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                      }}
                    >
                      {/* Situation Name */}
                      <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                        {situation.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {situation.shortDescription}
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
        </motion.div>
      </div>
    </div>
  );
}
