import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "@/app/components/logo";
import { Menu, X, User, Settings, LogOut, RefreshCcw, Sparkles, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { MyArchetypeModal } from "@/app/components/my-archetype-modal";
import { hasStoredArchetype, clearStoredArchetype } from "@/lib/archetypeStorage";
import { useGlobalSettings } from "@/lib/GlobalSettingsContext";

export function Navigation() {
  const navigate = useNavigate();
  const { appName } = useGlobalSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);

  const handleViewArchetype = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsArchetypeModalOpen(true);
  };

  const handleRetakeProfile = () => {
    clearStoredArchetype(); // Clear stored archetype before retaking
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/assessment-intro");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/situation" className="flex-shrink-0 py-[2px]">
            <Logo size="small" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Desktop Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm">Account</span>
              </button>

              <AnimatePresence>
                {isAccountMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsAccountMenuOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {hasStoredArchetype() && (
                          <button 
                            onClick={handleViewArchetype}
                            className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
                          >
                            <Sparkles className="w-4 h-4" />
                            My Archetype
                          </button>
                        )}
                        <button 
                          onClick={handleRetakeProfile}
                          className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          Retake Profile
                        </button>
                        <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <Link
                          to="/about"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3"
                        >
                          <Info className="w-4 h-4" />
                          About {appName || 'App'}
                        </Link>
                      </div>
                      
                      <div className="border-t border-slate-700 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-slate-800"
            >
              <div className="py-4 space-y-1">
                {/* Account Options */}
                <div className="border-t border-slate-800 mt-3 pt-3 space-y-1">
                  {hasStoredArchetype() && (
                    <button 
                      onClick={handleViewArchetype}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3"
                    >
                      <Sparkles className="w-4 h-4" />
                      My Archetype
                    </button>
                  )}
                  <button 
                    onClick={handleRetakeProfile}
                    className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Retake Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <Link
                    to="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3"
                  >
                    <Info className="w-4 h-4" />
                    About {appName || 'App'}
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-800 mt-3 pt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-800 transition-colors rounded-lg flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* My Archetype Modal */}
      <MyArchetypeModal 
        isOpen={isArchetypeModalOpen} 
        onClose={() => setIsArchetypeModalOpen(false)} 
      />
    </nav>
  );
}
