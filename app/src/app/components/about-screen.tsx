import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Navigation } from "@/app/components/navigation";
import { cmsApi, CMSItem } from "@/lib/api";
import { useGlobalSettings } from "@/lib/GlobalSettingsContext";

export function AboutScreen() {
  const navigate = useNavigate();
  const { appName } = useGlobalSettings();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<CMSItem | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const cms = await cmsApi.getItem('about');
      setContent(cms);
    } catch (err) {
      console.error("Error loading about content:", err);
    } finally {
      setLoading(false);
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

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>

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
                  alt={content.title || appName || "About"} 
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
                {content?.title || `About ${appName || 'This App'}`}
              </motion.h1>

              {/* Copy */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-300 leading-relaxed whitespace-pre-wrap"
              >
                {content?.copy || "Learn more about what makes this app special."}
              </motion.div>

              {/* Optional Button */}
              {content?.buttonText && content?.buttonAction && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <a
                    href={content.buttonAction}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    {content.buttonText}
                  </a>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
