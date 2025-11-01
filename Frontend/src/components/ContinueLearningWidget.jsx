import React from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen } from 'lucide-react';
import { useContinueLearning } from '../hooks/useContinueLearning';

/**
 * Continue Learning Widget Component
 * Displays paused modules with resume functionality
 * Non-invasive: can be imported and used anywhere
 */
const ContinueLearningWidget = ({ 
  onNavigate, 
  className = '',
  showHeader = true,
  maxItems = 6 
}) => {
  const { modules, resumeModule, removeModule } = useContinueLearning();

  const handleResume = (module) => {
    // First, call the resumeModule from service (handles video seeking)
    resumeModule(module.id);
    
    // Then handle navigation using App.jsx's existing pattern
    if (onNavigate && module.url) {
      try {
        // Parse URL - handle both absolute and relative paths
        let urlObj;
        if (module.url.startsWith('http://') || module.url.startsWith('https://')) {
          urlObj = new URL(module.url);
        } else {
          // Relative path - combine with current origin
          urlObj = new URL(module.url, window.location.origin);
        }
        
        // Extract query parameters (classId, subjectId, topicId)
        const classId = urlObj.searchParams.get('classId');
        const subjectId = urlObj.searchParams.get('subjectId');
        const topicId = urlObj.searchParams.get('topicId');
        
        // If we have IDs from URL, save to localStorage in the format App.jsx expects
        if (classId || subjectId || topicId) {
          const selection = {
            classId: classId || null,
            subjectId: subjectId || null,
            topicId: topicId || null
          };
          localStorage.setItem('edusmartLastSelection', JSON.stringify(selection));
        }
        
        // Navigate to topics page (App.jsx will read from localStorage)
        onNavigate('topics');
      } catch (error) {
        // Fallback: if URL parsing fails, try to extract path and navigate
        console.warn('Failed to parse module URL, using fallback navigation:', error);
        const path = module.url.split('?')[0];
        const page = path.replace(/^\//, '').replace(/\//g, '') || 'topics';
        onNavigate(page);
      }
    }
  };

  if (modules.length === 0 && showHeader) {
    return (
      <div className={`glass-card rounded-2xl p-6 md:p-8 shadow-strong ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">
              Continue Learning
            </h2>
            {onNavigate && (
              <motion.button
                onClick={() => onNavigate('classes')}
                whileHover={{ scale: 1.05 }}
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm transition-all duration-300"
              >
                View All →
              </motion.button>
            )}
          </div>
        )}
        <div className="text-center text-gray-500 py-16">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          </motion.div>
          <p className="text-lg">No recent courses yet. Start a subject to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-2xl p-6 md:p-8 shadow-strong ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent">
            Continue Learning
          </h2>
          {onNavigate && (
            <motion.button
              onClick={() => onNavigate('classes')}
              whileHover={{ scale: 1.05 }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm transition-all duration-300"
            >
              View All →
            </motion.button>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {modules.slice(0, maxItems).map((module, index) => (
          <motion.div
            key={module.id}
            className="flex items-center space-x-4 md:space-x-6 p-5 md:p-6 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300 card-hover"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                {module.title || 'Learning Module'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {module.subject || module.class || 'General'}
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-600 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${module.progress || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                  {module.progress || 0}%
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => handleResume(module)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              <span>Continue</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ContinueLearningWidget;

