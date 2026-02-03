import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "@/app/components/logo";
import { motion } from "motion/react";
import { cmsApi, CMSItem } from "@/lib/api";
import { Button } from "@/app/components/ui/button";

export function SplashScreen() {
  const navigate = useNavigate();
  const [content, setContent] = useState<CMSItem | null>(null);

  useEffect(() => {
    cmsApi.getItem('welcome').then(setContent).catch(console.error);
  }, []);

  const handleStart = () => {
    navigate("/login");
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Logo size="large" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 text-center max-w-md w-full"
      >
        <Logo size="large" />
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            {content.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-300 text-lg leading-relaxed"
          >
            {content.copy}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full pt-4"
        >
          <Button 
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            {content.buttonText}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
