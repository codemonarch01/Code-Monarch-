import { useState, useEffect } from 'react';
import continueLearningService from '../services/continueLearningService';

/**
 * React hook for Continue Learning feature
 * Automatically syncs with localStorage and updates on video pause/resume
 */
export const useContinueLearning = () => {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (!continueLearningService) {
      setModules([]);
      return;
    }

    // Initial load
    setModules(continueLearningService.getModules());

    // Subscribe to changes
    const unsubscribe = continueLearningService.subscribe((updatedModules) => {
      setModules(updatedModules);
    });

    // Poll for changes (fallback for cross-tab sync)
    const interval = setInterval(() => {
      const current = continueLearningService.getModules();
      setModules(prev => {
        // Only update if changed
        if (JSON.stringify(prev) !== JSON.stringify(current)) {
          return current;
        }
        return prev;
      });
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const resumeModule = (moduleId) => {
    if (continueLearningService) {
      continueLearningService.resumeModule(moduleId);
    }
  };

  const removeModule = (moduleId) => {
    if (continueLearningService) {
      continueLearningService.removeModule(moduleId);
    }
  };

  return {
    modules,
    resumeModule,
    removeModule
  };
};

export default useContinueLearning;

