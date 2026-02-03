import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Logo } from "@/app/components/logo";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

export function CheckEmailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setResendSuccess(false);

    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setResendSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="medium" showText={true} />
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-slate-400">
              We sent a password reset link to
            </p>
            <p className="text-purple-400 font-semibold mt-2">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              Click the link in the email to reset your password. If you don't see the email, 
              check your spam folder.
            </p>
          </div>

          {/* Resend Button */}
          <div className="space-y-4">
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center"
              >
                <p className="text-sm text-green-400">Email sent successfully!</p>
              </motion.div>
            )}

            <button
              onClick={handleResend}
              disabled={isResending || resendSuccess}
              className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 disabled:opacity-70 transition-all group"
            >
              {isResending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.div>
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Resend Email</span>
                </>
              )}
            </button>

            {/* Back to Login */}
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Login</span>
            </button>
          </div>

          {/* Demo Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Demo mode: Click{" "}
              <button
                onClick={() => navigate("/reset-password", { state: { token: "demo-token" } })}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                here
              </button>
              {" "}to simulate email link
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
