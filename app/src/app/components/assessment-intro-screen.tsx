import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { cmsApi, CMSItem } from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { hasStoredArchetype, getStoredAnswers } from "@/lib/archetypeStorage";

export function AssessmentIntroScreen() {
  const navigate = useNavigate();
  const [content, setContent] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If archetype is already known, skip to situation selection
    if (hasStoredArchetype()) {
      const answers = getStoredAnswers();
      navigate("/situation", { state: { answers }, replace: true });
      return;
    }

    cmsApi.getItem('assessment_intro').then((data) => {
        setContent(data);
        setLoading(false);
    });
  }, []);

  const handleStart = () => {
    navigate("/questions");
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
      
      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden"
          >
            {/* Image */}
            {content?.imageUrl && (
              <div className="w-full h-48 md:h-64 overflow-hidden">
                <img 
                  src={content.imageUrl} 
                  alt={content?.title || "Discover Your Archetype"} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
              >
                {content?.title || 'Discover Your Archetype'}
              </motion.h1>

              {/* Copy */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-300 text-lg leading-relaxed"
              >
                {content?.copy || 'To give you the best advice, we need to understand your relationship style. This quick 8-question assessment will reveal your Archetype.'}
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  {content?.buttonText || 'Start Assessment'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
