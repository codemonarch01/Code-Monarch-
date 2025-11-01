import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, BookOpen, DollarSign, Clock, Sparkles, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import mainAPI, { skillPathAPI, authAPI, userAPI, progressAPI } from '../api/api';
import { useProfile } from '../context/ProfileContext.jsx';
import SkillVisualization3D from './SkillVisualization3D';
import AICareerPathModal from './AICareerPathModal';

const SkillPathRecommender = ({ user }) => {
  const { profileData } = useProfile();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillVisualization, setSkillVisualization] = useState(null);
  const [generatingSkill, setGeneratingSkill] = useState(false);
  const [profileAnalysis, setProfileAnalysis] = useState(null);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [showCareerPathModal, setShowCareerPathModal] = useState(false);

  const [formData, setFormData] = useState({
    grade: user?.grade || '',
    subject: user?.subject || 'STEM',
    interests: [],
    strengths: [],
    completedTopics: [],
    workType: 'flexible',
    industry: 'technology'
  });

  // Comprehensive Profile Data Loader - Skills, Achievements, Learning Progress
  useEffect(() => {
    let mounted = true;
    const loadCompleteProfile = async () => {
      try {
        // Get current user
        let u = user;
        if (!u?._id) {
          const me = await authAPI.getCurrentUser();
          u = me?.data?.data?.user;
        }
        if (!mounted || !u?._id) return;

        const profileData = {
          skills: [],
          skillsWithLevel: [],
          achievements: [],
          verifiedAchievements: [],
          learningProgress: null,
          completedTopics: []
        };

        // 1. Load Skills (from localStorage or API)
        try {
          const storedSkills = localStorage.getItem(`userSkills_${u._id}`);
          if (storedSkills) {
            const parsed = JSON.parse(storedSkills);
            if (Array.isArray(parsed) && parsed.length > 0) {
              profileData.skillsWithLevel = parsed;
              profileData.skills = parsed.map(s => `${s.skill} (${s.level})`);
            }
          }
          
          // Also try backend
          try {
            const sk = await userAPI.getSkills(u._id);
            const list = sk?.data?.data?.skills || [];
            if (list.length > 0) {
              const parsedSkills = list.map(skill => {
                const match = skill.match(/^(.+?)\s*\((.+?)\)$/);
                if (match) {
                  return { skill: match[1].trim(), level: match[2].trim() };
                }
                return { skill: skill.trim(), level: 'Intermediate' };
              });
              profileData.skills = list;
              profileData.skillsWithLevel = parsedSkills;
            }
          } catch (e) {
            console.warn('Backend skills fetch failed, using localStorage');
          }
        } catch (e) {
          console.warn('Failed to load skills:', e);
        }

        // 2. Load Achievements (from localStorage or API)
        try {
          const storedAchievements = localStorage.getItem(`userAchievements_${u._id}`);
          if (storedAchievements) {
            const parsed = JSON.parse(storedAchievements);
            if (Array.isArray(parsed) && parsed.length > 0) {
              profileData.achievements = parsed;
            }
          }
          
          // Also try backend
          try {
            const achievementsRes = await userAPI.getAchievements(u._id);
            const achievementsList = achievementsRes?.data?.data?.achievements || [];
            if (achievementsList.length > 0) {
              profileData.achievements = achievementsList;
            }
          } catch (e) {
            console.warn('Backend achievements fetch failed, using localStorage');
          }

          // Load verified quiz achievements
          const verified = localStorage.getItem(`verifiedQuizAchievements`);
          if (verified) {
            try {
              const parsed = JSON.parse(verified);
              profileData.verifiedAchievements = Array.isArray(parsed) ? parsed : [];
            } catch (e) {}
          }
        } catch (e) {
          console.warn('Failed to load achievements:', e);
        }

        // 3. Load Learning Progress
        try {
          const progressRes = await progressAPI.getMyProgress();
          if (progressRes?.data?.status === 'success') {
            profileData.learningProgress = progressRes.data.data;
            
            // Extract completed topics
            const courseProgress = progressRes.data.data.courseProgress || [];
            const completedTopicsList = [];
            courseProgress.forEach(course => {
              if (course.completedTopics > 0) {
                completedTopicsList.push({
                  course: course.course?.title || 'Unknown Course',
                  subject: course.course?.subject || 'General',
                  completedTopics: course.completedTopics,
                  totalTopics: course.totalTopics,
                  completionRate: course.completionRate || 0
                });
              }
            });
            profileData.completedTopics = completedTopicsList;
          }
        } catch (e) {
          console.warn('Failed to load learning progress:', e);
        }

        if (mounted) {
          // Update formData with loaded profile data
          const interests = profileData.skillsWithLevel.map(s => s.skill);
          const strengths = profileData.skillsWithLevel
            .filter(s => s.level === 'Advanced' || s.level === 'Intermediate')
            .map(s => s.skill);
          
          setFormData(prev => ({
            ...prev,
            interests: interests.length > 0 ? interests : prev.interests,
            strengths: strengths.length > 0 ? strengths : prev.strengths,
            completedTopics: profileData.completedTopics.map(ct => ct.course).filter(Boolean)
          }));

          setProfileAnalysis(profileData);
        }
      } catch (error) {
        console.error('Failed to load complete profile:', error);
      }
    };
    
    loadCompleteProfile();
    return () => { mounted = false };
  }, [user?._id]);

  const handleGetRecommendations = async (autoAnalyze = false) => {
    if (autoAnalyze) {
      setAutoAnalyzing(true);
    } else {
      setLoading(true);
    }
    setError('');
    setRecommendations(null);

    try {
      // Check if user is logged in
      if (!user) {
        setError('Please log in to get personalized recommendations. Use "View Sample" to see demo data.');
        if (autoAnalyze) {
          setAutoAnalyzing(false);
        } else {
          setLoading(false);
        }
        return;
      }

      // Get current user if not provided
      let u = user;
      if (!u?._id) {
        const me = await authAPI.getCurrentUser();
        u = me?.data?.data?.user;
      }

      // Build comprehensive user data from profile analysis
      const skillsList = profileAnalysis?.skillsWithLevel || [];
      const achievementsList = profileAnalysis?.achievements || [];
      const verifiedList = profileAnalysis?.verifiedAchievements || [];
      const completedTopicsList = profileAnalysis?.completedTopics || [];
      
      // Extract skill names with levels for AI
      const skillNames = skillsList.map(s => `${s.skill} (${s.level})`);
      const advancedSkills = skillsList.filter(s => s.level === 'Advanced').map(s => s.skill);
      const intermediateSkills = skillsList.filter(s => s.level === 'Intermediate').map(s => s.skill);
      const beginnerSkills = skillsList.filter(s => s.level === 'Beginner').map(s => s.skill);
      
      // Extract achievement titles
      const achievementTitles = [
        ...achievementsList.map(a => a.title || ''),
        ...verifiedList.map(a => a.quizTitle || '')
      ].filter(Boolean);
      
      // Calculate completion rate
      const completionRate = completedTopicsList.length > 0
        ? completedTopicsList.reduce((sum, ct) => sum + (ct.completionRate || 0), 0) / completedTopicsList.length
        : 0;

      const userData = {
        name: u?.name || 'Student',
        grade: formData.grade || u?.grade || profileData?.education || '',
        subject: formData.subject || u?.subject || 'General',
        completedTopics: completedTopicsList.map(ct => ct.course).filter(Boolean),
        interests: formData.interests.length > 0 ? formData.interests : skillNames,
        strengths: formData.strengths.length > 0 ? formData.strengths : [...advancedSkills, ...intermediateSkills],
        achievements: achievementTitles,
        skillsBreakdown: {
          advanced: advancedSkills,
          intermediate: intermediateSkills,
          beginner: beginnerSkills,
          total: skillsList.length
        },
        academicPerformance: {
          average: completionRate > 0 ? Math.round(completionRate) : 85,
          coursesCompleted: completedTopicsList.length,
          totalSkills: skillsList.length,
          totalAchievements: achievementsList.length + verifiedList.length
        },
        preferences: {
          workType: formData.workType,
          industry: formData.industry
        }
      };

      console.log('🚀 Requesting AI Career Path with comprehensive profile data:', userData);
      const response = await skillPathAPI.getRecommendations(userData);
      console.log('✅ AI Career recommendations received:', response.data);
      
      if (response.data && response.data.status === 'success') {
        setRecommendations(response.data.data);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      console.error('❌ Recommendation error:', err);
      console.error('❌ Error details:', err.response?.data);
      // Try sample fallback so user still sees output
      try {
        console.warn('⚠️ Falling back to sample recommendations...');
        const sample = await skillPathAPI.getSampleRecommendations();
        if (sample?.data?.status === 'success') {
          setRecommendations(sample.data.data);
          setError('');
        } else {
          setError(err.message || 'Failed to get recommendations. Please try again.');
        }
      } catch (sampleErr) {
        console.error('❌ Sample fallback also failed:', sampleErr);
        setError(err.message || 'Failed to get recommendations. Please try again.');
      }
    } finally {
      if (autoAnalyze) {
        setAutoAnalyzing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleGetSample = async () => {
    setLoading(true);
    setError('');
    setRecommendations(null);

    try {
      console.log('🚀 Getting sample recommendations...');
      const response = await skillPathAPI.getSampleRecommendations();
      console.log('✅ Sample response:', response);
      console.log('✅ Sample response.data:', response?.data);
      console.log('✅ Sample response.data.data:', response?.data?.data);
      console.log('✅ Sample status:', response?.data?.status);
      
      if (response && response.data && response.data.status === 'success') {
        console.log('✅ Setting recommendations:', response.data.data);
        setRecommendations(response.data.data);
      } else {
        console.error('❌ Unexpected response structure:', response);
        setError('Failed to get sample recommendations - unexpected response');
      }
    } catch (err) {
      console.error('❌ Sample error:', err);
      console.error('❌ Error object:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Failed to get sample recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = async (skill, career) => {
    setGeneratingSkill(true);
    setSkillVisualization(null);

    try {
      const response = await skillPathAPI.getSkillVisualization(skill.name, career.title);
      
      if (response.data.status === 'success') {
        setSkillVisualization(response.data.data);
      }
    } catch (err) {
      console.error('Visualization error:', err);
      setSkillVisualization({
        skillName: skill.name,
        visualization: {
          type: 'abstract',
          colorScheme: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#06b6d4'
          },
          geometry: { shape: 'sphere', complexity: 'medium' },
          animation: { type: 'float', speed: 'slow' },
          description: 'Visual representation of this skill'
        }
      });
    } finally {
      setGeneratingSkill(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getImportanceColor = (importance) => {
    switch (importance.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Skill Path Recommender</h1>
          <p className="text-xl text-gray-600">Discover your personalized career paths powered by AI</p>
        </div>

        {/* Profile Summary */}
        {profileAnalysis && !recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Your Profile Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Skills</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{profileAnalysis.skillsWithLevel.length}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {profileAnalysis.skillsWithLevel.filter(s => s.level === 'Advanced').length} Advanced,
                  {' '}{profileAnalysis.skillsWithLevel.filter(s => s.level === 'Intermediate').length} Intermediate
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Achievements</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {profileAnalysis.achievements.length + profileAnalysis.verifiedAchievements.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {profileAnalysis.verifiedAchievements.length} Verified
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Learning Progress</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{profileAnalysis.completedTopics.length}</p>
                <p className="text-sm text-gray-600 mt-1">Courses with progress</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Get Recommendations Button */}
        {!recommendations && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCareerPathModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
            >
                  <Sparkles className="w-5 h-5" />
                  <span>Get My AI Career Path</span>
            </motion.button>

            {profileAnalysis && (
              <p className="text-sm text-gray-600 text-center max-w-2xl">
                ✨ We'll analyze your <strong>{profileAnalysis.skillsWithLevel.length} skills</strong>,
                {' '}<strong>{profileAnalysis.achievements.length + profileAnalysis.verifiedAchievements.length} achievements</strong>, and
                {' '}<strong>{profileAnalysis.completedTopics.length} courses</strong> to provide personalized career recommendations
              </p>
            )}

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetSample}
                disabled={loading || autoAnalyzing}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-purple-400 hover:text-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Sample
              </motion.button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Recommendations */}
        <AnimatePresence mode="wait">
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Summary */}
              {recommendations.summary && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    AI Insights
                  </h2>
                  
                  {recommendations.summary.insights && recommendations.summary.insights.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Key Insights:</h3>
                      <ul className="space-y-2">
                        {recommendations.summary.insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-600 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendations.summary.recommendations && recommendations.summary.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Recommendations:</h3>
                      <ul className="space-y-2">
                        {recommendations.summary.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-purple-600 mt-1">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Career Paths */}
              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.careerPaths && recommendations.careerPaths.map((career, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{career.title}</h3>
                          <div className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${getMatchScoreColor(career.matchScore)}`}>
                            {career.matchScore}% Match
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4">{career.description}</p>

                      {/* Key Info */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">{career.startingSalaryRange}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{career.estimatedTimeline}</span>
                        </div>
                      </div>

                      {/* Growth Potential */}
                      <div className="bg-purple-50 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-purple-900 mb-1">Growth Potential</p>
                            <p className="text-sm text-purple-700">{career.growthPotential}</p>
                          </div>
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          Required Skills
                        </h4>
                        <div className="space-y-2">
                          {career.requiredSkills && career.requiredSkills.slice(0, 3).map((skill, skillIdx) => (
                            <button
                              key={skillIdx}
                              onClick={() => handleSkillClick(skill, career)}
                              disabled={generatingSkill}
                              className="w-full text-left p-3 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{skill.name}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getImportanceColor(skill.importance)}`}>
                                  {skill.importance}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{skill.currentStatus}</p>
                            </button>
                          ))}
                          {career.requiredSkills && career.requiredSkills.length > 3 && (
                            <p className="text-sm text-gray-500 text-center mt-2">
                              +{career.requiredSkills.length - 3} more skills
                            </p>
                          )}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedCareer(career)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        View Full Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Back Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setRecommendations(null);
                    setSelectedCareer(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Get New Recommendations
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Career Details Modal */}
        <AnimatePresence>
          {selectedCareer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40"
              onClick={() => setSelectedCareer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCareer.title}</h2>
                      <div className={`inline-block px-3 py-1 rounded-full font-semibold ${getMatchScoreColor(selectedCareer.matchScore)}`}>
                        {selectedCareer.matchScore}% Match
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCareer(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">{selectedCareer.description}</p>

                  {/* Education Path */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Education Path</h3>
                    <ol className="space-y-2">
                      {selectedCareer.educationPath && selectedCareer.educationPath.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* All Required Skills */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h3>
                    <div className="space-y-3">
                      {selectedCareer.requiredSkills && selectedCareer.requiredSkills.map((skill, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getImportanceColor(skill.importance)}`}>
                              {skill.importance}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{skill.currentStatus}</p>
                          <div className="flex items-start gap-2 bg-blue-50 rounded p-2">
                            <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-900">{skill.learningResources}</p>
                          </div>
                          <button
                            onClick={() => handleSkillClick(skill, selectedCareer)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-4 h-4" />
                            View in 3D/AR
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Career Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{selectedCareer.startingSalaryRange}</p>
                      <p className="text-sm text-blue-700">Starting Salary</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{selectedCareer.estimatedTimeline}</p>
                      <p className="text-sm text-purple-700">Timeline</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Growth Potential</p>
                        <p className="text-green-800">{selectedCareer.growthPotential}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Visualization Modal */}
        <AnimatePresence>
          {skillVisualization && (
            <SkillVisualization3D
              skillData={skillVisualization}
              onClose={() => setSkillVisualization(null)}
            />
          )}
        </AnimatePresence>

        {/* AI Career Path Modal */}
        <AICareerPathModal
          isOpen={showCareerPathModal}
          onClose={() => setShowCareerPathModal(false)}
          user={user}
        />
      </div>
    </div>
  );
};

export default SkillPathRecommender;
