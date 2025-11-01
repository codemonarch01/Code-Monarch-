import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, TrendingUp, BookOpen, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { authAPI, userAPI, progressAPI, skillPathAPI } from '../api/api';

// Advanced AI analyzer - comprehensively analyzes profile data
const analyzeCareerPath = (profileData) => {
  const { skills, achievements, completedCourses, certificates } = profileData;
  
  // DEBUG: Check if data is accessible
  const hasSkills = skills && skills.length > 0;
  const hasAchievements = achievements && achievements.length > 0;
  const hasCourses = completedCourses && completedCourses.length > 0;
  const hasCertificates = certificates && certificates.length > 0;
  
  // Diagnostic check
  if (!hasSkills && !hasAchievements && !hasCourses && !hasCertificates) {
    return {
      diagnostic: true,
      message: "⚠️ Unable to generate AI career path — profile data not accessible or event binding missing.",
      careerPaths: []
    };
  }
  
  // Extract and normalize skills
  const allSkills = skills || [];
  const skillNames = allSkills.map(s => {
    if (typeof s === 'string') {
      const match = s.match(/^(.+?)\s*\((.+?)\)$/);
      return match ? { name: match[1].trim(), level: match[2].trim() } : { name: s.trim(), level: 'Intermediate' };
    }
    return { name: s.skill || s.name || String(s), level: s.level || 'Intermediate' };
  });
  
  // Extract skill names (normalized for matching)
  const skillNamesLower = skillNames.map(s => s.name.toLowerCase());
  const allSkillText = skillNamesLower.join(' ');
  
  // Count skill levels
  const advancedSkills = skillNames.filter(s => s.level?.toLowerCase() === 'advanced').length;
  const intermediateSkills = skillNames.filter(s => s.level?.toLowerCase() === 'intermediate').length;
  const beginnerSkills = skillNames.filter(s => s.level?.toLowerCase() === 'beginner').length;
  
  // Analyze skill categories with weighted scoring
  const skillPatterns = {
    deepLearning: {
      keywords: ['deep learning', 'neural network', 'tensorflow', 'pytorch', 'keras', 'cnn', 'rnn', 'lstm', 'transformer'],
      weight: 3,
      count: 0
    },
    dataScience: {
      keywords: ['python', 'data science', 'pandas', 'numpy', 'statistics', 'machine learning', 'ml', 'scikit-learn', 'data analysis'],
      weight: 2,
      count: 0
    },
    computerVision: {
      keywords: ['computer vision', 'opencv', 'image processing', 'cv', 'yolo', 'object detection', 'image recognition'],
      weight: 3,
      count: 0
    },
    nlp: {
      keywords: ['nlp', 'natural language processing', 'bert', 'gpt', 'transformer', 'text mining', 'sentiment analysis', 'chatgpt', 'llm'],
      weight: 3,
      count: 0
    },
    arvr: {
      keywords: ['unity', 'ar', 'vr', '3d', 'three.js', 'webxr', 'augmented reality', 'virtual reality', 'unreal'],
      weight: 2,
      count: 0
    },
    webDev: {
      keywords: ['javascript', 'react', 'html', 'css', 'web development', 'frontend', 'backend', 'node.js'],
      weight: 1,
      count: 0
    }
  };
  
  // Count skill pattern matches
  Object.keys(skillPatterns).forEach(pattern => {
    skillPatterns[pattern].count = skillPatterns[pattern].keywords.filter(keyword => 
      allSkillText.includes(keyword)
    ).length;
  });
  
  // Analyze achievements and certificates
  const achievementsText = (achievements || []).map(a => {
    const title = (a.title || a.quizTitle || String(a)).toLowerCase();
    const desc = (a.description || '').toLowerCase();
    return `${title} ${desc}`;
  }).join(' ');
  
  const hasMLAchievement = /machine learning|ml|deep learning|ai|artificial intelligence|neural/.test(achievementsText);
  const hasDataAchievement = /data|statistics|python|analytics|analysis/.test(achievementsText);
  
  // Analyze completed courses
  const coursesText = (completedCourses || []).map(c => String(c).toLowerCase()).join(' ');
  const hasMLCourses = /machine learning|deep learning|ai|neural|tensorflow|pytorch/.test(coursesText);
  const hasDataCourses = /data science|python|statistics|analysis|pandas/.test(coursesText);
  const hasProgrammingCourses = /python|javascript|programming|coding|computer science/.test(coursesText);
  
  // Calculate career path match scores
  const careerPaths = [];
  
  // 1. AI Engineer
  const aiEngineerScore = 
    (skillPatterns.deepLearning.count * skillPatterns.deepLearning.weight * 10) +
    (skillPatterns.dataScience.count * skillPatterns.dataScience.weight * 8) +
    (hasMLAchievement ? 15 : 0) +
    (hasMLCourses ? 10 : 0) +
    (advancedSkills * 5) +
    (intermediateSkills * 3) +
    (hasCertificates ? 5 : 0);
  
  if (aiEngineerScore >= 20 || skillPatterns.deepLearning.count > 0) {
    let reasoning = '';
    if (skillPatterns.deepLearning.count > 0) {
      reasoning = `Your expertise in Deep Learning (${skillPatterns.deepLearning.count} related skills) and neural networks positions you excellently for AI engineering roles.`;
    } else if (skillPatterns.dataScience.count > 0 && advancedSkills >= 2) {
      reasoning = `Your strong Data Science foundation (${skillPatterns.dataScience.count} skills) combined with ${advancedSkills} advanced skills shows strong AI engineering potential.`;
    } else if (hasMLAchievement || hasMLCourses) {
      reasoning = `Your ML achievements and course completions demonstrate AI interest. Build on Python fundamentals and explore TensorFlow/PyTorch.`;
    } else {
      reasoning = 'Start with Python and Deep Learning fundamentals. Your current skills provide a good foundation.';
    }
    
    careerPaths.push({
      title: 'AI Engineer',
      focus: 'Deep Learning & Model Optimization',
      matchScore: Math.min(95, Math.max(60, aiEngineerScore)),
      reasoning
    });
  }
  
  // 2. Data Scientist
  const dataScientistScore = 
    (skillPatterns.dataScience.count * skillPatterns.dataScience.weight * 10) +
    (hasDataAchievement ? 15 : 0) +
    (hasDataCourses ? 10 : 0) +
    (intermediateSkills * 4) +
    (hasCertificates ? 5 : 0);
  
  if (dataScientistScore >= 15 || skillPatterns.dataScience.count > 0) {
    let reasoning = '';
    if (skillPatterns.dataScience.count > 0) {
      reasoning = `Your ${skillPatterns.dataScience.count} Data Science skills (Python, Pandas, Statistics) align perfectly with data science roles. Strengthen ML and statistical foundations.`;
    } else if (hasDataAchievement) {
      reasoning = 'Your achievements show data interest. Develop Python, statistics, and data visualization skills.';
    } else {
      reasoning = 'Focus on Python, statistics, and machine learning fundamentals. Build data analysis and visualization expertise.';
    }
    
    careerPaths.push({
      title: 'Data Scientist',
      focus: 'Strengthen Statistics & ML Foundations',
      matchScore: Math.min(92, Math.max(60, dataScientistScore)),
      reasoning
    });
  }
  
  // 3. ML Developer
  const mlDeveloperScore = 
    (skillPatterns.dataScience.count * skillPatterns.dataScience.weight * 8) +
    (skillPatterns.deepLearning.count * skillPatterns.deepLearning.weight * 6) +
    (hasMLAchievement ? 12 : 0) +
    (hasMLCourses ? 8 : 0) +
    (intermediateSkills * 3) +
    (advancedSkills * 2);
  
  if (mlDeveloperScore >= 15 || (skillPatterns.dataScience.count > 0 && skillPatterns.deepLearning.count > 0)) {
    careerPaths.push({
      title: 'ML Developer',
      focus: 'Machine Learning Model Development & Deployment',
      matchScore: Math.min(90, Math.max(65, mlDeveloperScore)),
      reasoning: skillPatterns.deepLearning.count > 0
        ? `Your ML and Deep Learning skills (${skillPatterns.dataScience.count + skillPatterns.deepLearning.count} combined) show strong ML development potential. Focus on model deployment and production.`
        : 'Build on your data science skills. Learn model training, evaluation, and deployment pipelines.'
    });
  }
  
  // 4. AR/VR Developer
  const arvrScore = 
    (skillPatterns.arvr.count * skillPatterns.arvr.weight * 12) +
    (skillPatterns.webDev.count * skillPatterns.webDev.weight * 5) +
    (hasCertificates ? 8 : 0);
  
  if (arvrScore >= 10 || skillPatterns.arvr.count > 0) {
    careerPaths.push({
      title: 'AR/VR Developer',
      focus: 'Learn Unity + AI Object Recognition Integration',
      matchScore: Math.min(92, Math.max(70, arvrScore)),
      reasoning: skillPatterns.arvr.count > 0
        ? `Your ${skillPatterns.arvr.count} AR/VR skills are excellent. Integrate AI object recognition and computer vision for next-level immersive applications.`
        : 'Learn Unity/Unreal fundamentals and 3D development, then add AI-powered features like object recognition.'
    });
  }
  
  // 5. NLP Engineer
  const nlpScore = 
    (skillPatterns.nlp.count * skillPatterns.nlp.weight * 12) +
    (skillPatterns.dataScience.count * skillPatterns.dataScience.weight * 5) +
    (/nlp|text|language|chatgpt|gpt|bert/.test(achievementsText) ? 15 : 0);
  
  if (nlpScore >= 12 || skillPatterns.nlp.count > 0) {
    careerPaths.push({
      title: 'NLP Engineer',
      focus: 'Natural Language Processing & LLM Development',
      matchScore: Math.min(88, Math.max(65, nlpScore)),
      reasoning: skillPatterns.nlp.count > 0
        ? `Your ${skillPatterns.nlp.count} NLP skills show excellent potential. Deepen knowledge in transformers, LLMs, and text processing systems.`
        : 'Start with Python and text processing fundamentals. Explore NLP libraries like NLTK, spaCy, and Hugging Face transformers.'
    });
  }
  
  // 6. Computer Vision Specialist
  const cvScore = 
    (skillPatterns.computerVision.count * skillPatterns.computerVision.weight * 12) +
    (skillPatterns.deepLearning.count * skillPatterns.deepLearning.weight * 6) +
    (/vision|image|detection|recognition/.test(achievementsText) ? 10 : 0);
  
  if (cvScore >= 12 || skillPatterns.computerVision.count > 0) {
    careerPaths.push({
      title: 'Computer Vision Specialist',
      focus: 'Image Processing & AI Object Detection',
      matchScore: Math.min(90, Math.max(70, cvScore)),
      reasoning: skillPatterns.computerVision.count > 0
        ? `Your ${skillPatterns.computerVision.count} Computer Vision skills are promising. Focus on advanced techniques like YOLO, object tracking, and real-time recognition.`
        : 'Learn OpenCV, image processing fundamentals, and CNN architectures. Build projects with object detection and classification.'
    });
  }
  
  // If no specific matches, provide learning recommendations
  if (careerPaths.length === 0) {
    if (skillNames.length > 0) {
      careerPaths.push({
        title: 'AI Engineer',
        focus: 'Focus on Deep Learning & Model Optimization',
        matchScore: 65,
        reasoning: `Based on your ${skillNames.length} skills, start with Python fundamentals and gradually build towards Deep Learning. Add skills like TensorFlow, PyTorch, and Neural Networks.`
      });
    } else {
      careerPaths.push({
        title: 'AI Engineer',
        focus: 'Start with Python & AI Foundations',
        matchScore: 60,
        reasoning: 'Begin with Python programming fundamentals, then learn machine learning basics. Add skills to your profile for better recommendations!'
      });
      careerPaths.push({
        title: 'Data Scientist',
        focus: 'Strengthen Statistics & ML Foundations',
        matchScore: 60,
        reasoning: 'Start by learning Python, statistics, and data analysis. Complete courses and track your progress for personalized suggestions!'
      });
    }
  }
  
  // Sort by match score and return top 3
  return {
    diagnostic: false,
    careerPaths: careerPaths
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map((path, idx) => ({
        ...path,
        rank: idx + 1
      }))
  };
};

const AICareerPathModal = ({ isOpen, onClose, user }) => {
  const { profileData } = useProfile();
  const [loading, setLoading] = useState(true);
  const [careerPaths, setCareerPaths] = useState([]);
  const [profileSummary, setProfileSummary] = useState({
    skillsCount: 0,
    achievementsCount: 0,
    coursesCount: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadProfileDataAndAnalyze();
    }
  }, [isOpen, user]);

  const loadProfileDataAndAnalyze = async () => {
    setLoading(true);
    
    try {
      // Load current user if not provided
      let currentUser = user;
      if (!currentUser?._id) {
        try {
          const me = await authAPI.getCurrentUser();
          currentUser = me?.data?.data?.user;
        } catch (e) {
          // Try localStorage
          const savedUser = localStorage.getItem('edusmartUser');
          if (savedUser) {
            currentUser = JSON.parse(savedUser);
          }
        }
      }

      const userId = currentUser?._id;
      let skills = [];
      let achievements = [];
      let completedCourses = [];
      let certificates = [];

      // Load skills from localStorage or API
      if (userId) {
        try {
          const storedSkills = localStorage.getItem(`userSkills_${userId}`);
          if (storedSkills) {
            const parsed = JSON.parse(storedSkills);
            skills = Array.isArray(parsed) ? parsed : [];
          }
          
          // Try backend as well
          try {
            const sk = await userAPI.getSkills(userId);
            const list = sk?.data?.data?.skills || [];
            if (list.length > 0) {
              skills = list.map(skill => {
                const match = String(skill).match(/^(.+?)\s*\((.+?)\)$/);
                if (match) {
                  return { skill: match[1].trim(), level: match[2].trim() };
                }
                return { skill: String(skill).trim(), level: 'Intermediate' };
              });
            }
          } catch (e) {
            console.warn('Backend skills fetch failed, using localStorage');
          }
        } catch (e) {
          console.warn('Failed to load skills:', e);
        }

        // Load achievements and extract certificates
        try {
          const storedAchievements = localStorage.getItem(`userAchievements_${userId}`);
          if (storedAchievements) {
            const parsed = JSON.parse(storedAchievements);
            achievements = Array.isArray(parsed) ? parsed : [];
            
            // Extract certificates from achievements
            const certsFromAchievements = achievements
              .filter(a => a.certificate || a.certificateFileName)
              .map(a => ({
                title: a.title || 'Certificate',
                fileName: a.certificateFileName || 'certificate',
                hasImage: !!a.certificate
              }));
            certificates = [...certificates, ...certsFromAchievements];
          }
          
          // Try backend
          try {
            const achievementsRes = await userAPI.getAchievements(userId);
            const achievementsList = achievementsRes?.data?.data?.achievements || [];
            if (achievementsList.length > 0) {
              achievements = achievementsList;
              
              // Extract certificates from backend achievements
              const certsFromBackend = achievements
                .filter(a => a.certificate || a.certificateFileName)
                .map(a => ({
                  title: a.title || 'Certificate',
                  fileName: a.certificateFileName || 'certificate',
                  hasImage: !!a.certificate
                }));
              certificates = [...certificates, ...certsFromBackend];
            }
          } catch (e) {
            console.warn('Backend achievements fetch failed, using localStorage');
          }
          
          // Load verified achievements
          try {
            const verified = localStorage.getItem('verifiedQuizAchievements');
            if (verified) {
              const parsed = JSON.parse(verified);
              if (Array.isArray(parsed)) {
                achievements = [...achievements, ...parsed];
              }
            }
          } catch (e) {}
        } catch (e) {
          console.warn('Failed to load achievements:', e);
        }

        // Load learning progress/completed courses with full details
        try {
          const progressRes = await progressAPI.getMyProgress();
          if (progressRes?.data?.status === 'success') {
            const courseProgress = progressRes.data.data.courseProgress || [];
            completedCourses = courseProgress
              .filter(c => c.completedTopics > 0)
              .map(c => ({
                title: c.course?.title || 'Unknown Course',
                subject: c.course?.subject || 'General',
                completedTopics: c.completedTopics || 0,
                totalTopics: c.totalTopics || 0,
                completionRate: c.completionRate || 0
              }));
          }
        } catch (e) {
          console.warn('Failed to load learning progress:', e);
        }
      }

      // Also check ProfileContext for skills
      const contextSkills = profileData?.skills || [];
      if (contextSkills.length > 0 && skills.length === 0) {
        skills = contextSkills.map(s => {
          const match = String(s).match(/^(.+?)\s*\((.+?)\)$/);
          if (match) {
            return { skill: match[1].trim(), level: match[2].trim() };
          }
          return { skill: String(s).trim(), level: 'Intermediate' };
        });
      }

      // Extract course titles for analysis (compatibility)
      const courseTitles = completedCourses.map(c => 
        typeof c === 'string' ? c : c.title || 'Unknown Course'
      );

      // Update profile summary with actual counts
      setProfileSummary({
        skillsCount: skills.length,
        achievementsCount: achievements.length,
        coursesCount: courseTitles.length
      });

      // Prepare user data for AI analysis
      const skillNames = skills.map(s => {
        if (typeof s === 'string') {
          const match = s.match(/^(.+?)\s*\((.+?)\)$/);
          return match ? match[1].trim() : s.trim();
        }
        return s.skill || s.name || String(s);
      });

      const advancedSkills = skills.filter(s => {
        const level = typeof s === 'string' 
          ? (s.match(/\((.+?)\)$/)?.[1] || '').toLowerCase()
          : (s.level || '').toLowerCase();
        return level === 'advanced';
      }).map(s => {
        if (typeof s === 'string') {
          const match = s.match(/^(.+?)\s*\((.+?)\)$/);
          return match ? match[1].trim() : s.trim();
        }
        return s.skill || s.name || String(s);
      });

      const intermediateSkills = skills.filter(s => {
        const level = typeof s === 'string' 
          ? (s.match(/\((.+?)\)$/)?.[1] || '').toLowerCase()
          : (s.level || '').toLowerCase();
        return level === 'intermediate';
      }).map(s => {
        if (typeof s === 'string') {
          const match = s.match(/^(.+?)\s*\((.+?)\)$/);
          return match ? match[1].trim() : s.trim();
        }
        return s.skill || s.name || String(s);
      });

      const achievementTitles = achievements.map(a => a.title || a.quizTitle || String(a));

      // Calculate completion rate
      const totalCompletionRate = completedCourses.length > 0
        ? completedCourses.reduce((sum, c) => sum + (c.completionRate || 0), 0) / completedCourses.length
        : 0;

      // Call REAL AI API for career recommendations
      try {
        const userData = {
          name: currentUser?.name || 'Student',
          grade: currentUser?.grade || '',
          subject: 'AI/Technology',
          completedTopics: courseTitles,
          interests: skillNames,
          strengths: [...advancedSkills, ...intermediateSkills],
          achievements: achievementTitles,
          skillsBreakdown: {
            advanced: advancedSkills,
            intermediate: intermediateSkills,
            beginner: skills.filter(s => {
              const level = typeof s === 'string' 
                ? (s.match(/\((.+?)\)$/)?.[1] || '').toLowerCase()
                : (s.level || '').toLowerCase();
              return level === 'beginner';
            }).map(s => {
              if (typeof s === 'string') {
                const match = s.match(/^(.+?)\s*\((.+?)\)$/);
                return match ? match[1].trim() : s.trim();
              }
              return s.skill || s.name || String(s);
            }),
            total: skills.length
          },
          academicPerformance: {
            average: Math.round(totalCompletionRate) || 75,
            coursesCompleted: courseTitles.length,
            totalSkills: skills.length,
            totalAchievements: achievements.length,
            certificates: certificates.length
          },
          preferences: {
            workType: 'flexible',
            industry: 'technology'
          }
        };

        console.log('🤖 Calling AI API with profile data:', userData);
        const aiResponse = await skillPathAPI.getRecommendations(userData);
        
        if (aiResponse?.data?.status === 'success' && aiResponse?.data?.data?.careerPaths) {
          // Transform AI response to modal format
          const aiCareerPaths = aiResponse.data.data.careerPaths.slice(0, 3).map((career, idx) => {
            // Extract focus from required skills or use description
            let focusText = 'AI-Powered Career Recommendation';
            if (career.requiredSkills && career.requiredSkills.length > 0) {
              const topSkills = career.requiredSkills.slice(0, 2).map(s => s.name || s).join(' & ');
              focusText = `Focus on ${topSkills}`;
            } else if (career.description) {
              focusText = career.description.length > 70 
                ? career.description.substring(0, 70) + '...' 
                : career.description;
            }
            
            // Create reasoning from description and skills
            let reasoningText = career.description || '';
            if (career.requiredSkills && career.requiredSkills.length > 0) {
              const skillNames = career.requiredSkills.slice(0, 3).map(s => s.name || s).join(', ');
              if (reasoningText) {
                reasoningText += ` Key skills to develop: ${skillNames}.`;
              } else {
                reasoningText = `Focus on developing: ${skillNames}. This path aligns with your profile.`;
              }
            }
            
            if (!reasoningText) {
              reasoningText = `Based on your ${skills.length} skills, ${achievements.length} achievements, and ${courseTitles.length} courses, this AI-generated path is personalized for your profile.`;
            }
            
            return {
              title: career.title || 'Career Path',
              focus: focusText,
              matchScore: career.matchScore || Math.max(60, 95 - (idx * 10)),
              reasoning: reasoningText,
              isAIGenerated: true // Flag to indicate this came from AI
            };
          });

          if (aiCareerPaths.length > 0) {
            setCareerPaths(aiCareerPaths);
            return; // Success - exit early
          }
        }
      } catch (aiError) {
        console.warn('⚠️ AI API call failed, falling back to rule-based analysis:', aiError);
        // Fall through to rule-based analysis
      }

      // Fallback: Use rule-based analysis if AI fails
      const analysisResult = analyzeCareerPath({
        skills,
        achievements,
        completedCourses: courseTitles,
        certificates
      });

      // Handle diagnostic result
      if (analysisResult.diagnostic) {
        setCareerPaths([{
          title: 'Data Not Available',
          focus: 'Profile Analysis',
          matchScore: 0,
          reasoning: analysisResult.message,
          rank: 1,
          isDiagnostic: true
        }]);
      } else {
        setCareerPaths(analysisResult.careerPaths);
      }
    } catch (error) {
      console.error('Failed to analyze career path:', error);
      // Provide diagnostic fallback
      setCareerPaths([{
        title: 'Analysis Error',
        focus: 'Profile Analysis',
        matchScore: 0,
        reasoning: '⚠️ Unable to generate AI career path — profile data not accessible or event binding missing.',
        rank: 1,
        isDiagnostic: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your AI Career Path</h2>
                <p className="text-sm text-white/90">Personalized recommendations based on your profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"
                />
                <p className="text-gray-600 font-medium">Analyzing your profile...</p>
                <p className="text-sm text-gray-500 mt-2">Reviewing skills, achievements, and learning progress</p>
              </div>
            ) : (
              <>
                {/* Profile Summary */}
                <div className="mb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Profile Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{profileSummary.skillsCount}</div>
                      <div className="text-sm text-gray-600">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{profileSummary.achievementsCount}</div>
                      <div className="text-sm text-gray-600">Achievements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{profileSummary.coursesCount}</div>
                      <div className="text-sm text-gray-600">Courses</div>
                    </div>
                  </div>
                </div>

                {/* Career Paths */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Career Tracks</h3>
                  
                  {careerPaths.length === 0 ? (
                    <div className="border-2 border-yellow-200 rounded-xl p-5 bg-yellow-50">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold text-yellow-900 mb-2">No Recommendations Yet</h4>
                          <p className="text-sm text-yellow-800">
                            Add skills, achievements, and complete courses to get personalized AI career path recommendations!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    careerPaths.map((path, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                          path.isDiagnostic 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200 hover:border-emerald-400 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className={`w-5 h-5 ${path.isDiagnostic ? 'text-red-600' : 'text-emerald-600'}`} />
                              <h4 className="text-xl font-bold text-gray-900">{path.title}</h4>
                            </div>
                            {!path.isDiagnostic && (
                              <p className="text-emerald-700 font-semibold text-sm mb-2">→ {path.focus}</p>
                            )}
                          </div>
                          {!path.isDiagnostic && (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getMatchScoreColor(path.matchScore)}`}>
                              {path.matchScore}% Match
                            </div>
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 mt-3 ${path.isDiagnostic ? 'bg-red-100' : 'bg-emerald-50'}`}>
                          <div className="flex items-start gap-2">
                            {path.isDiagnostic ? (
                              <BookOpen className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            )}
                            <p className={`text-sm ${path.isDiagnostic ? 'text-red-800' : 'text-gray-700'}`}>
                              {path.reasoning}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    💡 <strong>Tip:</strong> Add more skills and complete courses to get even better recommendations!
                  </p>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AICareerPathModal;
