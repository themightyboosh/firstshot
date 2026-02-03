import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, MessageSquare, Palette, Heart, BarChart3, FileText, Users, Star, List, LogOut, Menu, X, ChevronDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { globalSettingsApi } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: NavItem[];
}

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [appName, setAppName] = useState('Admin Panel');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['/analytics']);

  useEffect(() => {
    globalSettingsApi.getConfig().then(config => {
      if (config.appName) setAppName(config.appName);
    }).catch(console.error);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-expand Analytics section if on a child route
  useEffect(() => {
    if (location.pathname.startsWith('/analytics')) {
      setExpandedSections(prev => prev.includes('/analytics') ? prev : [...prev, '/analytics']);
    }
  }, [location.pathname]);
  
  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/cas-config', label: 'CAS Configuration', icon: Settings },
    { path: '/situations', label: 'Situations', icon: MessageSquare },
    { path: '/affects', label: 'Affects', icon: Heart },
    { path: '/cms', label: 'Page Content', icon: FileText },
    { path: '/simulator', label: 'Simulator', icon: BarChart3 },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: TrendingUp,
      children: [
        { path: '/analytics/responses', label: 'Responses', icon: List },
        { path: '/analytics/feedback', label: 'Feedback', icon: Star },
      ]
    },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/global-settings', label: 'Global Settings', icon: Palette },
  ];

  const toggleSection = (path: string) => {
    setExpandedSections(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-800 truncate">{appName}</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile slide-out */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-md
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        pt-16 lg:pt-0
      `}>
        {/* Desktop Header */}
        <div className="hidden lg:flex p-6 border-b items-center">
          <h1 className="text-xl font-bold text-gray-800 truncate">{appName}</h1>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isExpanded = expandedSections.includes(item.path);
            const hasChildren = item.children && item.children.length > 0;
            
            if (hasChildren) {
              return (
                <div key={item.path}>
                  <button
                    onClick={() => toggleSection(item.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      active 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                              childActive 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            <ChildIcon size={18} />
                            <span className="text-sm font-medium">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  active 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t absolute bottom-0 w-full bg-white">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2 overflow-hidden flex-1 min-w-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-8 h-8 rounded-full shrink-0" alt="User" />
                ) : (
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                )}
                <div className="text-sm truncate flex-1 min-w-0">
                   <p className="font-medium text-gray-700 truncate">{user?.displayName || 'Admin'}</p>
                   <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
             </div>
             <button onClick={logout} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 shrink-0" title="Sign Out">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 pt-20 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
