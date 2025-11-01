import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Brain, TrendingUp, BookOpen, Target, Sparkles } from 'lucide-react';
import api, { aiAPI, progressAPI, contentAPI, userAPI, authAPI } from '../api/api';
import AIAssistant from './AIAssistant';
// Extend functionality: Auto-track video progress for Continue Learning
import continueLearningService from '../services/continueLearningService';
import ContinueLearningWidget from './ContinueLearningWidget';

const Dashboard = ({ user, onNavigate, onResume }) => {

  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    currentStreak: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?._id && !user?.id) return;
      
      try {
        setIsLoading(true);
        
        const progressResponse = await progressAPI.getProgress(user._id || user.id);

        if (progressResponse.data.status === 'success') {
          const progressData = progressResponse.data.data;
          setStats({
            totalCourses: progressData.totalCourses || 0,
            completedCourses: progressData.completedCourses || 0,
            totalHours: progressData.totalStudyHours || 0,
            currentStreak: progressData.learningStreak || 0
          });
          setRecentCourses(progressData.recentCourses || []);
        }

        // Load AI recommendations
        const recommendationsResponse = await api.getRecommendations();
        if (recommendationsResponse.data.status === 'success') {
          setRecommendations(recommendationsResponse.data.data.recommendedCourses || []);
        }

        // Load AI insights
        const insightsResponse = await api.getInsights();
        if (insightsResponse.data.status === 'success') {
          setInsights(insightsResponse.data.data.insights || []);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to empty state
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 via-cyan-700 to-indigo-700 bg-clip-text text-transparent mb-2 md:mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {user?.name}! 👋
              </motion.h1>
              <motion.p 
                className="text-slate-600 text-base md:text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Continue your learning journey and achieve your goals.
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAIAssistant(true)}
              className="btn-primary flex items-center space-x-3 px-5 md:px-7 py-3 md:py-3.5 text-base md:text-lg shadow-strong hover:shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Brain className="w-6 h-6" />
              <span>AI Assistant</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {!isLoading && (stats.totalCourses > 0 || stats.totalHours > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10"
          >
            <motion.div 
              className="glass-card rounded-2xl p-5 md:p-6 card-hover"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold gradient-text-cool">{stats.totalCourses}</p>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="glass-card rounded-2xl p-6 card-hover"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold gradient-text-warm">{stats.completedCourses}</p>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="glass-card rounded-2xl p-6 card-hover"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Study Hours</p>
                  <p className="text-3xl font-bold gradient-text">{stats.totalHours}</p>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="glass-card rounded-2xl p-6 card-hover"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold gradient-text-warm">{stats.currentStreak} days</p>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 md:mb-10"
          >
            <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-600 text-white rounded-2xl p-6 md:p-8 shadow-strong">
              <div className="flex items-center space-x-4 mb-6">
                <motion.div 
                  className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Brain className="w-7 h-7" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold">AI Learning Insights</h3>
              </div>
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                  >
                    <h4 className="font-semibold mb-2 text-base md:text-lg">{insight.title}</h4>
                    <p className="text-white/90 leading-relaxed">{insight.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resume Learning CTA */}
        {onResume && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-10"
          >
            <div className="bg-gradient-to-r from-emerald-500 via-cyan-600 to-indigo-600 text-white rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-strong">
              <div>
                <h3 className="text-2xl font-bold mb-2">Resume where you left off</h3>
                <p className="text-white/90 text-base md:text-lg">Jump back into your last subject and topic instantly.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onResume}
                className="inline-flex items-center space-x-3 bg-white text-emerald-700 px-5 md:px-6 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                data-magnetic
              >
                <Play className="w-5 h-5" />
                <span>Resume Learning</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Empty State CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <div className="glass-card rounded-2xl p-6 md:p-8 shadow-strong flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent mb-2">Get started</h2>
              <p className="text-slate-600 text-base md:text-lg">Browse classes and start your first subject. Your stats will appear here after you begin.</p>
            </div>
            <motion.button
              onClick={() => onNavigate('classes')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-6 md:px-8 py-3.5 md:py-4 text-base md:text-lg"
              data-magnetic
            >
              Browse Classes
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Recent Courses & Recommendations */}
          <div className="lg:col-span-2">
            {/* Extended: Auto-tracked Continue Learning from video pause events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ContinueLearningWidget onNavigate={onNavigate} />
            </motion.div>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-2xl p-6 md:p-8 shadow-strong mt-6 md:mt-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold gradient-text">AI Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {recommendations.slice(0, 4).map((course, index) => (
                    <motion.div 
                      key={index} 
                      className="p-5 md:p-6 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300 card-hover border border-white/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">{course.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1.5 rounded-full font-semibold">
                          {course.subject}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">{course.difficulty}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Achievements & Quick Actions */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-6 md:p-8 shadow-strong"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent mb-6 md:mb-8">Achievements</h2>
              {achievements.length === 0 ? (
                <div className="text-center text-slate-500 py-10 md:py-12">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  </motion.div>
                  <p className="text-lg">Achievements will appear here once you complete topics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                      </motion.div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{achievement.title}</h4>
                        <p className="text-gray-600">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card rounded-2xl p-6 md:p-8 shadow-strong mt-6 md:mt-8"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent mb-6 md:mb-8">Quick Actions</h2>
              
              <div className="space-y-4">
                <motion.button
                  onClick={() => onNavigate('classes')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3.5 md:py-4 px-5 md:px-6 text-base md:text-lg"
                >
                  Browse Classes
                </motion.button>
                
                <motion.button
                  onClick={() => setShowAIAssistant(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary py-3.5 md:py-4 px-5 md:px-6 text-base md:text-lg"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Brain className="w-5 h-5" />
                    <span>Ask AI Assistant</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => onNavigate('ar')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white/60 hover:bg-white/80 text-slate-700 py-3.5 md:py-4 px-5 md:px-6 rounded-xl font-semibold transition-all duration-300 shadow-soft hover:shadow-medium border border-white/30"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Target className="w-5 h-5" />
                    <span>3D/AR Learning</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        user={user}
        currentContext={{
          page: 'dashboard',
          stats: stats,
          recentCourses: recentCourses
        }}
      />
    </div>
  );
};

export default Dashboard;
