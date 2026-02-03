import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "@/app/components/logo";
import { Menu, X, User, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navigation() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="small" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/questions"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Questions
            </Link>
            <Link
              to="/content"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Content
            </Link>
            <Link
              to="/results"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Results
            </Link>

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
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-white font-semibold">John Doe</p>
                        <p className="text-sm text-slate-400">john@example.com</p>
                      </div>
                      
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3">
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3">
                          <Bell className="w-4 h-4" />
                          Notifications
                        </button>
                        <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-3">
                          <HelpCircle className="w-4 h-4" />
                          Help
                        </button>
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
                {/* User Info */}
                <div className="px-4 py-3 bg-slate-800/50 rounded-lg mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">John Doe</p>
                      <p className="text-xs text-slate-400">john@example.com</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link
                  to="/questions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg"
                >
                  Questions
                </Link>
                <Link
                  to="/content"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg"
                >
                  Content
                </Link>
                <Link
                  to="/results"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg"
                >
                  Results
                </Link>

                {/* Account Options */}
                <div className="border-t border-slate-800 mt-3 pt-3 space-y-1">
                  <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </button>
                  <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg flex items-center gap-3">
                    <HelpCircle className="w-4 h-4" />
                    Help
                  </button>
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
    </nav>
  );
}
