import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, GraduationCap, LogOut, Menu, X, User, Info, MessageCircle, Trophy, MoreHorizontal, ChevronDown, Bell, Settings, Search, Target } from 'lucide-react';
import { gamifyAPI } from '../api/api';

const Navbar = ({ user, onLogout, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [ecoPoints, setEcoPoints] = useState(0);

  // Load eco-points for the logged-in user
  useEffect(() => {
    let isMounted = true;
    const loadEco = async () => {
      try {
        if (!user) return;
        
        // First check localStorage for immediate display
        const localPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
        if (!Number.isNaN(localPoints)) {
          setEcoPoints(localPoints);
        }
        
        // Then try to get from API
        const res = await gamifyAPI.me();
        if (isMounted && res?.status === 'success') {
          const apiPoints = res.data?.ecoPoints || 0;
          setEcoPoints(apiPoints);
          // Update localStorage with API data
          localStorage.setItem('ecoPoints', apiPoints.toString());
        }
      } catch (_) {
        // Fallback to localStorage if API fails
        const localPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
        setEcoPoints(localPoints);
      }
    };
    loadEco();

    const onEcoUpdate = (e) => {
      const val = e?.detail?.ecoPoints;
      if (typeof val === 'number') {
        const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
        const newPoints = (Number.isNaN(currentPoints) ? 0 : currentPoints) + val;
        setEcoPoints(newPoints);
        localStorage.setItem('ecoPoints', newPoints.toString());
      } else {
        loadEco();
      }
    };
    window.addEventListener('eco-points-updated', onEcoUpdate);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadEco();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      isMounted = false;
      window.removeEventListener('eco-points-updated', onEcoUpdate);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user]);

  // Primary items (always shown on desktop)
  const mainItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'gamified', label: 'Gamified', icon: BookOpen },
    { id: 'skill-path', label: 'AI Career', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  // Secondary items moved into a compact More menu
  const moreItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
  ];

  const handleNavigation = (pageId) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 cursor-pointer group -ml-3 md:-ml-6"
            onClick={() => handleNavigation('home')}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5 group-hover:shadow-xl transition-all duration-300"
              whileHover={{ rotate: 5 }}
            >
              <GraduationCap className="w-6 h-6 text-white " />
            </motion.div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight group-hover:tracking-wider group-hover:scale-105 transition-all duration-300">
              EduSmart
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.span 
                      layoutId="activeTab"
                      className="absolute left-3 right-3 -bottom-1 h-0.5 bg-primary-600 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
            {/* More dropdown */}
            <div className="relative ml-2">
              <motion.button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
              >
                <MoreHorizontal className="w-5 h-5" />
                <span className="font-medium text-sm">More</span>
                <motion.div
                  animate={{ rotate: isMoreOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {moreItems.map(mi => (
                      <motion.button
                        key={mi.id}
                        onClick={() => { handleNavigation(mi.id); setIsMoreOpen(false); }}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                          currentPage === mi.id 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <mi.icon className="w-5 h-5" />
                        <span className="font-medium">{mi.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Eco Points Badge */}
            <motion.div 
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 whitespace-nowrap flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              🌱 {ecoPoints} Points
            </motion.div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-32">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          <div className="mt-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium inline-block">
                            🌱 {ecoPoints} Eco Points
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <motion.button
                        onClick={() => { handleNavigation('profile'); setIsUserMenuOpen(false); }}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                      </motion.button>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <motion.button
                        onClick={onLogout}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Eco Points */}
            <div className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center justify-center">
              🌱 {ecoPoints}
            </div>
            
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

          {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-2">
              {[...mainItems, ...moreItems].map((item, index) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                    <span className="font-medium text-base">{item.label}</span>
                  </motion.button>
                );
              })}
              
              {/* Mobile User Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4 border-t border-gray-200 mt-4"
              >
                <div className="flex items-center space-x-4 px-4 py-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold inline-block">
                      🌱 {ecoPoints} Eco Points
                    </div>
                  </div>
                </div>
                
                <motion.button
                  onClick={onLogout}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-4 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 mt-3"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-base">Logout</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
