import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { dataApi, cmsApi, CMSItem } from "@/lib/api";
import { getStoredAnswers } from "@/lib/archetypeStorage";

interface Affect {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  imageUrl?: string;  // Background image (shown at 50% opacity)
}

export function EmotionSelectionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { situationId } = location.state || {};
  // Use stored answers as fallback for returning users
  const answers = location.state?.answers || getStoredAnswers();
  
  const [affects, setAffects] = useState<Affect[]>([]);
  const [header, setHeader] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dataApi.getAffects(),
      cmsApi.getItem('select_affect')
    ]).then(([data, head]) => {
      // Shuffle affects for each session
      const shuffled = [...(data as Affect[])].sort(() => Math.random() - 0.5);
      setAffects(shuffled);
      setHeader(head);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleContinue = (affectId: string) => {
    console.log("Navigating to Results with:", { situationId, answers, affectId });
    navigate("/results", { state: { situationId, answers, affectId } });
  };

  const handleFrontCardClick = (affectId: string) => {
    // First click flips the card
    setFlippedCard(affectId);
  };

  const handleBackCardClick = (affectId: string) => {
    // Second click (on flipped card) proceeds to next screen
    handleContinue(affectId);
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
              {header?.title || "Read the Vibe"}
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
              {header?.copy || "How does the other person seem? Pick the affect that matches their energy."}
            </p>
          </div>

          {/* Emotion Grid - matches situation cards sizing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {affects.map((affect, index) => {
              const isFlipped = flippedCard === affect.id;
              
              // Alternating dark brand colors for card backgrounds
              const cardBgColors = [
                'bg-slate-900/90',      // Dark slate
                'bg-indigo-950/90',     // Dark indigo
                'bg-purple-950/90',     // Dark purple
                'bg-slate-900/80',      // Slightly lighter slate
                'bg-violet-950/90',     // Dark violet
                'bg-fuchsia-950/90',    // Dark fuchsia
              ];
              const cardBg = cardBgColors[index % cardBgColors.length];
              
              return (
                <motion.div
                  key={affect.id}
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
                    {/* Front of Card - Icon + Name */}
                    <button
                      onClick={() => handleFrontCardClick(affect.id)}
                      className="absolute inset-0 bg-slate-900/50 backdrop-blur-xl rounded-2xl border-2 border-slate-700/50 hover:border-purple-500/50 overflow-hidden transition-all duration-300 group text-left"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Background Layer - Generated Image at 50% opacity */}
                      <div className={`absolute inset-0 ${cardBg}`}>
                        {affect.imageUrl && (
                          <img
                            src={affect.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                        )}
                      </div>
                      
                      {/* Icon Layer - On top of background */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {affect.iconUrl ? (
                          <img
                            src={affect.iconUrl}
                            alt={affect.name}
                            className="h-full w-auto max-w-full object-contain brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500 relative z-10"
                          />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-slate-500 relative z-10" />
                        )}
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-50 group-hover:opacity-40 transition-opacity z-20" />

                      {/* Text Content - Overlaid on bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                          {affect.name}
                        </h3>
                      </div>
                    </button>

                    {/* Back of Card - Name + Description (no image) */}
                    <button
                      onClick={() => handleBackCardClick(affect.id)}
                      className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-xl rounded-2xl border-2 border-purple-500 shadow-lg shadow-purple-500/30 p-5 md:p-6 flex flex-col items-center justify-center text-center"
                      style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                      }}
                    >
                      {/* Affect Name */}
                      <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                        {affect.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-slate-300 leading-relaxed">
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
        </motion.div>
      </div>
    </div>
  );
}
