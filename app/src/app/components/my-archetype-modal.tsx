import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { cmsApi, CMSItem, dataApi } from "@/lib/api";
import { getStoredArchetype, StoredArchetype } from "@/lib/archetypeStorage";

interface MyArchetypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyArchetypeModal({ isOpen, onClose }: MyArchetypeModalProps) {
  const [archetype, setArchetype] = useState<StoredArchetype | null>(null);
  const [archetypeConfig, setArchetypeConfig] = useState<any>(null);
  const [cmsContent, setCmsContent] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadArchetypeData();
    }
  }, [isOpen]);

  const loadArchetypeData = async () => {
    try {
      setLoading(true);
      
      // Get stored archetype
      const stored = getStoredArchetype();
      setArchetype(stored);

      if (!stored) {
        setLoading(false);
        return;
      }

      // Fetch CMS content and archetype config in parallel
      const [cms, casConfig] = await Promise.all([
        cmsApi.getItem('my_archetype'),
        dataApi.getCASConfig()
      ]);

      setCmsContent(cms);

      // The stored archetype already has imageUrl and description
      // But if not, find from CAS config by name
      if (stored.imageUrl) {
        setArchetypeConfig(stored);
      } else {
        const archetypeInfo = casConfig.archetypes?.find(
          (a: any) => a.name === stored.name
        );
        setArchetypeConfig(archetypeInfo);
      }

    } catch (error) {
      console.error("Error loading archetype data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 rounded-2xl shadow-2xl shadow-purple-500/20 border border-slate-700 z-50 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : !archetype ? (
              <div className="p-8 text-center">
                <p className="text-slate-400">You haven't completed the assessment yet.</p>
              </div>
            ) : (
              <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                {/* Header with CMS Title */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    {cmsContent?.title || "Your Archetype"}
                  </div>
                  
                  {/* CMS Copy */}
                  {cmsContent?.copy && (
                    <p className="text-slate-400 text-sm">
                      {cmsContent.copy}
                    </p>
                  )}
                </div>

                {/* Archetype Image */}
                {archetypeConfig?.imageUrl && (
                  <div className="relative mx-auto mb-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-purple-500/50 shadow-xl shadow-purple-500/30">
                      <img
                        src={archetypeConfig.imageUrl}
                        alt={archetype.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl -z-10"
                    />
                  </div>
                )}

                {/* Archetype Name */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {archetype.name}
                  </h2>
                  {archetype.primaryTerrain && archetype.secondaryTerrain && (
                    <p className="text-slate-400 text-sm mt-1">
                      <span className="text-purple-400">{archetype.primaryTerrain}</span> with <span className="text-purple-400">{archetype.secondaryTerrain}</span> influence
                    </p>
                  )}
                </div>

                {/* Archetype Description */}
                {archetypeConfig?.description && (
                  <p className="text-slate-300 text-center leading-relaxed mb-6">
                    {archetypeConfig.description}
                  </p>
                )}

                {/* Profile Details */}
                <div className="space-y-4 bg-slate-800/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Your Profile</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-400 font-medium">Core Recognition</p>
                      <p className="text-slate-300 text-sm">{archetype.profileData.coreRecognition}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-purple-400 font-medium">Protective Logic</p>
                      <p className="text-slate-300 text-sm">{archetype.profileData.protectiveLogic}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-purple-400 font-medium">Cost Under Stress</p>
                      <p className="text-slate-300 text-sm">{archetype.profileData.costUnderStress}</p>
                    </div>
                  </div>
                </div>

                {/* Calculated Date */}
                <p className="text-center text-slate-500 text-xs mt-6">
                  Calculated {new Date(archetype.calculatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
