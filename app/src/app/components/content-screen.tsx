import { useNavigate } from "react-router";
import { Navigation } from "@/app/components/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function ContentScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 md:py-12 lg:py-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 md:p-8 lg:p-12 shadow-2xl">
            {/* Square Image */}
            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1694919123854-24b74b376da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cCUyMGRlc2t8ZW58MXx8fHwxNzY5ODk5MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Gaming setup illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 text-center">
              Your Journey Begins Here
            </h1>

            {/* Paragraph */}
            <p className="text-base md:text-lg text-slate-300 leading-relaxed text-center max-w-2xl mx-auto mb-8">
              Based on your responses, we've crafted a personalized experience just for you. 
              Your unique perspective helps us understand what drives you and how you approach 
              challenges. Let's discover what your first shot reveals about your path forward.
            </p>

            {/* Continue Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/results")}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all group"
              >
                View Results
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}