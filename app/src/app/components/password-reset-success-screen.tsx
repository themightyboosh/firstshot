import { useNavigate } from "react-router";
import { Logo } from "@/app/components/logo";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function PasswordResetSuccessScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="large" />
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Password Reset Successful!
            </h1>
            <p className="text-slate-400">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
          </div>

          {/* Success Details */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Your account is secure and ready to use</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all group"
          >
            <span>Continue to Login</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Auto-redirect note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              You'll be automatically redirected in a moment
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
