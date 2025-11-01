import React, { useEffect, useState } from 'react';
import mainAPI, { gamifyAPI, authAPI, userAPI } from '../api/api';
import { useProfile } from '../context/ProfileContext.jsx';
import { motion } from 'framer-motion';
import { 
  User, Award, BookOpen, Edit, Settings, Shield, Trophy, Star, Zap, Brain, Sparkles, TrendingUp, Play, Target, X, Eye, Trash2
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
// Extend functionality: Auto-tracked Continue Learning widget
import ContinueLearningWidget from '../components/ContinueLearningWidget';
import AIAssistant from '../components/AIAssistant';

const Profile = ({ onNavigate }) => {
  const { profileData, setProfileData } = useProfile();
  const [eco, setEco] = useState({ ecoPoints: 0, badges: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate'); // Default to Intermediate
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [skillsWithLevel, setSkillsWithLevel] = useState([]); // Store skills with proficiency levels
  
  // Achievements state
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementCertificate, setAchievementCertificate] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  
  // Verified achievements from quiz completions (right-side container)
  const [verifiedAchievements, setVerifiedAchievements] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await gamifyAPI.getMe();
        if (mounted && res?.status === 'success') setEco({ ecoPoints: res.data.ecoPoints || 0, badges: res.data.badges || [] });
        // Load current user and skills
        try {
          const me = await authAPI.getCurrentUser();
          const u = me?.data?.data?.user;
          if (mounted && u?._id) {
            setCurrentUser(u);
              try {
                // Try to load skills from backend first
                let parsedSkills = [];
                let skillsList = [];
                try {
                  const sk = await userAPI.getSkills(u._id);
                  const list = sk?.data?.data?.skills || [];
                  skillsList = list;
                  
                  // Parse skills with proficiency levels from format "Skill (Level)" or just "Skill"
                  parsedSkills = list.map(skill => {
                    const match = skill.match(/^(.+?)\s*\((.+?)\)$/);
                    if (match) {
                      return { skill: match[1].trim(), level: match[2].trim() };
                    }
                    return { skill: skill.trim(), level: 'Intermediate' }; // Default level
                  });
                } catch (backendError) {
                  console.warn('Failed to load skills from backend, trying localStorage:', backendError);
                }
                
                // Fallback to localStorage if backend is empty or failed
                if (parsedSkills.length === 0 || skillsList.length === 0) {
                  try {
                    const stored = localStorage.getItem(`userSkills_${u._id}`);
                    if (stored) {
                      parsedSkills = JSON.parse(stored);
                      skillsList = parsedSkills.map(s => `${s.skill} (${s.level})`);
                    }
                  } catch (storageError) {
                    console.warn('Failed to load from localStorage:', storageError);
                  }
                }
                
                if (parsedSkills.length > 0 && mounted) {
                  setSkills(skillsList);
                  setSkillsWithLevel(parsedSkills);
                }
                
                // Load achievements
                try {
                  const achievementsRes = await userAPI.getAchievements(u._id);
                  const achievementsList = achievementsRes?.data?.data?.achievements || [];
                  
                  // Fallback to localStorage if backend is empty
                  if (achievementsList.length === 0) {
                    try {
                      const storedAchievements = localStorage.getItem(`userAchievements_${u._id}`);
                      if (storedAchievements) {
                        const parsed = JSON.parse(storedAchievements);
                        if (Array.isArray(parsed) && mounted) {
                          setUserAchievements(parsed);
                        }
                      }
                    } catch {}
                  } else {
                    setUserAchievements(achievementsList);
                    // Also save to localStorage as backup
                    localStorage.setItem(`userAchievements_${u._id}`, JSON.stringify(achievementsList));
                  }
                } catch (achievementError) {
                  // Try localStorage fallback for achievements
                  try {
                    const storedAchievements = localStorage.getItem(`userAchievements_${u._id}`);
                    if (storedAchievements) {
                      const parsed = JSON.parse(storedAchievements);
                      if (Array.isArray(parsed) && mounted) {
                        setUserAchievements(parsed);
                      }
                    }
                  } catch {}
                }
              } catch {}
          }
        } catch {}
        // Try to get user from localStorage as fallback
        if (!mounted || !currentUser) {
          try {
            const savedUser = localStorage.getItem('edusmartUser');
            if (savedUser) {
              const parsedUser = JSON.parse(savedUser);
              setCurrentUser(parsedUser);
              
              // Also load skills and achievements from localStorage for this user
              if (parsedUser?._id && mounted) {
                try {
                  const storedSkills = localStorage.getItem(`userSkills_${parsedUser._id}`);
                  if (storedSkills) {
                    const parsedSkills = JSON.parse(storedSkills);
                    setSkillsWithLevel(parsedSkills);
                    setSkills(parsedSkills.map(s => `${s.skill} (${s.level})`));
                  }
                  
                  const storedAchievements = localStorage.getItem(`userAchievements_${parsedUser._id}`);
                  if (storedAchievements) {
                    const parsedAchievements = JSON.parse(storedAchievements);
                    if (Array.isArray(parsedAchievements)) {
                      setUserAchievements(parsedAchievements);
                    }
                  }
                } catch (storageError) {
                  console.warn('Failed to load skills/achievements from localStorage:', storageError);
                }
              }
            }
          } catch (userError) {
            console.warn('Failed to load user from localStorage:', userError);
          }
        }
      } catch {}
    };
    load();
    
    // Load verified achievements from localStorage
    try {
      const stored = localStorage.getItem('verifiedQuizAchievements');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && mounted) {
          setVerifiedAchievements(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load verified achievements:', e);
    }
    
    return () => { mounted = false };
  }, []);

  // Get user from localStorage on mount and reload skills when currentUser is set
  useEffect(() => {
    const savedUser = localStorage.getItem('edusmartUser');
    if (savedUser && !currentUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch {}
    }
  }, []);

  // Reload skills and achievements when currentUser is available (handles navigation back to profile)
  useEffect(() => {
    if (!currentUser?._id) return;
    
    const reloadSkillsAndAchievements = async () => {
      try {
        // First try localStorage (fastest, always available)
        const storedSkills = localStorage.getItem(`userSkills_${currentUser._id}`);
        if (storedSkills) {
          try {
            const parsedSkills = JSON.parse(storedSkills);
            if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
              setSkillsWithLevel(parsedSkills);
              setSkills(parsedSkills.map(s => `${s.skill} (${s.level})`));
            }
          } catch (e) {
            console.warn('Failed to parse stored skills:', e);
          }
        }
        
        const storedAchievements = localStorage.getItem(`userAchievements_${currentUser._id}`);
        if (storedAchievements) {
          try {
            const parsed = JSON.parse(storedAchievements);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUserAchievements(parsed);
            }
          } catch (e) {
            console.warn('Failed to parse stored achievements:', e);
          }
        }
        
        // Then try backend (sync in background)
        try {
          const sk = await userAPI.getSkills(currentUser._id);
          const list = sk?.data?.data?.skills || [];
          if (list.length > 0) {
            const parsedSkills = list.map(skill => {
              const match = skill.match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                return { skill: match[1].trim(), level: match[2].trim() };
              }
              return { skill: skill.trim(), level: 'Intermediate' };
            });
            setSkills(list);
            setSkillsWithLevel(parsedSkills);
            localStorage.setItem(`userSkills_${currentUser._id}`, JSON.stringify(parsedSkills));
          }
        } catch (backendError) {
          // Backend failed, localStorage already loaded above
        }
        
        try {
          const achievementsRes = await userAPI.getAchievements(currentUser._id);
          const achievementsList = achievementsRes?.data?.data?.achievements || [];
          if (achievementsList.length > 0) {
            setUserAchievements(achievementsList);
            localStorage.setItem(`userAchievements_${currentUser._id}`, JSON.stringify(achievementsList));
          }
        } catch (backendError) {
          // Backend failed, localStorage already loaded above
        }
      } catch (error) {
        console.warn('Failed to reload skills/achievements:', error);
      }
    };
    
    reloadSkillsAndAchievements();
  }, [currentUser?._id]);

  // Listen for quiz completion events (Tree Planting and other gamified quizzes)
  useEffect(() => {
    const handleQuizCompletion = (event) => {
      const { quizTitle, completedAt, moduleType } = event.detail;
      
      // Only process Tree Planting quizzes or if moduleType is tree-planting
      if (moduleType === 'tree-planting' || quizTitle?.includes('Tree Planting')) {
        const newAchievement = {
          id: `verified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          quizTitle: quizTitle || 'Tree Planting Awareness Quiz',
          completedAt: completedAt || new Date().toISOString(),
          verified: true,
          moduleType: moduleType || 'tree-planting'
        };
        
        // Add to verified achievements
        setVerifiedAchievements(prev => {
          // Check if already exists (avoid duplicates)
          const exists = prev.some(a => a.quizTitle === newAchievement.quizTitle && 
            new Date(a.completedAt).toDateString() === new Date(newAchievement.completedAt).toDateString());
          
          if (exists) return prev;
          
          const updated = [newAchievement, ...prev];
          
          // Save to localStorage
          try {
            localStorage.setItem('verifiedQuizAchievements', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed to save verified achievements:', e);
          }
          
          return updated;
        });
      }
    };

    window.addEventListener('quiz-completed', handleQuizCompletion);
    
    return () => {
      window.removeEventListener('quiz-completed', handleQuizCompletion);
    };
  }, []);

  

  const handleRemoveSkill = async (index) => {
    if (!currentUser?._id) return;
    
    try {
      const skillToRemove = skillsWithLevel[index];
      const skillString = `${skillToRemove.skill} (${skillToRemove.level})`;
      
      // Remove from local state
      const updatedSkills = skillsWithLevel.filter((_, i) => i !== index);
      const updatedSkillsList = skills.filter((_, i) => i !== index);
      
      setSkillsWithLevel(updatedSkills);
      setSkills(updatedSkillsList);
      
      // Update localStorage
      localStorage.setItem(`userSkills_${currentUser._id}`, JSON.stringify(updatedSkills));
      
      // Try to update backend
      try {
        // Get all remaining skills as strings
        const remainingSkillsStrings = updatedSkills.map(s => `${s.skill} (${s.level})`);
        // Backend might need individual remove or full update
        // For now, we'll update profile data
        setProfileData({
          ...profileData,
          skills: remainingSkillsStrings
        });
        
        // Update profile with remaining skills
        try {
          await userAPI.updateProfile(currentUser._id, {
            skills: remainingSkillsStrings
          });
        } catch (updateError) {
          // If updateProfile doesn't support skills, just keep localStorage updated
          console.warn('Could not update skills via updateProfile:', updateError);
        }
      } catch (backendError) {
        console.warn('Backend remove failed, but local storage updated:', backendError);
      }
    } catch (error) {
      console.error('Failed to remove skill:', error);
      alert('Failed to remove skill. Please try again.');
    }
  };

  const handleAddSkill = async () => {
    const value = (newSkill || '').trim();
    if (!value || !currentUser?._id) return;
    if (!newSkillProficiency) {
      alert('Please select a proficiency level');
      return;
    }
    try {
      // Format: "JavaScript (Intermediate)" or just "JavaScript" if backend doesn't support level
      const skillWithLevel = `${value} (${newSkillProficiency})`;
      
      // Try to save to backend first
      try {
        const res = await userAPI.addSkill(currentUser._id, skillWithLevel);
        const list = res?.data?.data?.skills || [];
        setSkills(list);
        
        // Parse and update skills with level
        const parsedSkills = list.map(skill => {
          const match = skill.match(/^(.+?)\s*\((.+?)\)$/);
          if (match) {
            return { skill: match[1].trim(), level: match[2].trim() };
          }
          return { skill: skill.trim(), level: 'Intermediate' };
        });
        setSkillsWithLevel(parsedSkills);
        
        // Save to localStorage as backup
        localStorage.setItem(`userSkills_${currentUser._id}`, JSON.stringify(parsedSkills));
      } catch (backendError) {
        console.warn('Backend save failed, using localStorage:', backendError);
        // Fallback: save to localStorage if backend fails
        const newSkillObj = { skill: value, level: newSkillProficiency };
        const updatedSkills = [...skillsWithLevel, newSkillObj];
        setSkillsWithLevel(updatedSkills);
        setSkills([...skills, skillWithLevel]);
        localStorage.setItem(`userSkills_${currentUser._id}`, JSON.stringify(updatedSkills));
      }
      
      // also keep context/localStorage up to date
      setProfileData({
        name: profileData?.name || currentUser?.name || '',
        education: profileData?.education || '',
        skills: Array.from(new Set([...(profileData?.skills || []), skillWithLevel]))
      });
      setNewSkill('');
      setNewSkillProficiency('Intermediate'); // Reset to default after adding
    } catch (e) {
      console.error('Failed to add skill:', e);
      alert('Failed to add skill. Please try again.');
    }
  };

  // Achievement handlers
  const handleCertificateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setAchievementCertificate(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificatePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const handleAddAchievement = () => {
    // If there's already content, just show the save/cancel buttons
    // Otherwise, this button just enables the form (Save/Cancel will appear when user types or uploads)
    if (!isAddingAchievement && !achievementTitle.trim() && !certificatePreview) {
      setIsAddingAchievement(true);
    }
  };

  const handleSaveAchievement = async () => {
    if (!achievementTitle.trim() || !currentUser?._id) {
      alert('Please enter an achievement title');
      return;
    }

    try {
      const achievementData = {
        id: `custom_${Date.now()}`,
        title: achievementTitle.trim(),
        description: certificatePreview ? `Certificate uploaded: ${achievementCertificate?.name || 'Certificate'}` : 'Custom achievement added by user',
        icon: certificatePreview ? '📜' : '🏆',
        certificate: certificatePreview || null, // Store certificate preview (base64)
        certificateFileName: achievementCertificate?.name || null
      };

      // Try to save to backend first
      try {
        const res = await userAPI.addAchievement(currentUser._id, achievementData);
        const updatedAchievements = res?.data?.data?.achievements || [];
        setUserAchievements(updatedAchievements);
        // Save to localStorage as backup
        localStorage.setItem(`userAchievements_${currentUser._id}`, JSON.stringify(updatedAchievements));
      } catch (backendError) {
        console.warn('Backend save failed, using localStorage:', backendError);
        // Fallback: save to localStorage if backend fails
        const updatedAchievements = [...userAchievements, achievementData];
        setUserAchievements(updatedAchievements);
        localStorage.setItem(`userAchievements_${currentUser._id}`, JSON.stringify(updatedAchievements));
      }
      
      // Reset form
      setAchievementTitle('');
      setAchievementCertificate(null);
      setCertificatePreview(null);
      setIsAddingAchievement(false);
      
      alert('Achievement added successfully!');
    } catch (error) {
      console.error('Failed to add achievement:', error);
      alert('Failed to add achievement. Please try again.');
    }
  };

  const handleCancelAchievement = () => {
    setAchievementTitle('');
    setAchievementCertificate(null);
    setCertificatePreview(null);
    setIsAddingAchievement(false);
  };

  const handleViewCertificate = (certificateUrl) => {
    if (certificateUrl) {
      // Open certificate in new tab/window
      window.open(certificateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDeleteAchievement = async (index) => {
    if (!currentUser?._id) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this achievement?')) {
      return;
    }
    
    try {
      const achievementToRemove = userAchievements[index];
      
      // Remove from local state
      const updatedAchievements = userAchievements.filter((_, i) => i !== index);
      setUserAchievements(updatedAchievements);
      
      // Update localStorage
      localStorage.setItem(`userAchievements_${currentUser._id}`, JSON.stringify(updatedAchievements));
      
      // Try to update backend
      try {
        await userAPI.updateProfile(currentUser._id, {
          achievements: updatedAchievements
        });
      } catch (updateError) {
        console.warn('Could not update achievements via updateProfile:', updateError);
      }
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      alert('Failed to delete achievement. Please try again.');
    }
  };

  const user = currentUser || { name: 'User' };
  const handleNavigate = (page) => {
    // Use the navigation function passed from App.jsx if available
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(page);
    } else if (typeof window !== 'undefined') {
      // Fallback: try to trigger navigation via events
      window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
    }
  };

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
                Welcome back, {user?.name || 'User'}! 👋
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

        {/* Resume Learning CTA */}
        {(() => {
          try {
            const saved = localStorage.getItem('edusmartLastSelection');
            if (saved) {
              const resumeData = JSON.parse(saved);
              if (resumeData?.classId && resumeData?.subjectId) {
                return (
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
                        onClick={() => handleNavigate('topics')}
                        className="inline-flex items-center space-x-3 bg-white text-emerald-700 px-5 md:px-6 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Play className="w-5 h-5" />
                        <span>Resume Learning</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              }
            }
          } catch (e) {}
          return null;
        })()}

        {/* Get Started Section */}
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
              onClick={() => handleNavigate('classes')}
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
          {/* Left Column - Continue Learning */}
          <div className="lg:col-span-2">
            {/* Continue Learning - Auto-tracked from video pause events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'block', visibility: 'visible' }}
              className="mb-6 md:mb-8"
            >
              <ContinueLearningWidget 
                onNavigate={(path) => {
                  handleNavigate(path || 'classes');
                }}
              />
            </motion.div>

            {/* My Skills & Achievements Section */}
            <motion.div 
              initial={{ opacity: 1, y: 0 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0 }} 
              className="mt-6 md:mt-8"
              style={{ display: 'block', visibility: 'visible', width: '100%' }}
            >
              <div className="bg-white rounded-2xl p-6 border shadow-sm w-full" style={{ display: 'block', minHeight: '300px' }}>
                {/* Skills Section */}
                <div className="mb-8 pb-8 border-b border-slate-200" style={{ display: 'block' }}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">My Skills</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., JavaScript, Algebra)"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newSkill.trim() && newSkillProficiency) {
                            handleAddSkill();
                          }
                        }}
                      />
                      <button 
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim() || !newSkillProficiency}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        + Add Skill
                      </button>
                    </div>
                    
                    {/* Proficiency Level Selector - Always visible for better UX */}
                    <div className="flex flex-col gap-2 mt-3">
                      <span className="text-sm font-semibold text-slate-700">Select Proficiency Level:</span>
                      <div className="flex gap-2 flex-wrap">
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setNewSkillProficiency(level)}
                            type="button"
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              newSkillProficiency === level
                                ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105 border border-slate-300'
                            }`}
                          >
                            {level === 'Beginner' && '🌱 '}
                            {level === 'Intermediate' && '⭐ '}
                            {level === 'Advanced' && '🚀 '}
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Display Added Skills */}
                    {skillsWithLevel.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-slate-700 mb-2">Your Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {skillsWithLevel.map((skillObj, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors group"
                            >
                              <span className="text-sm font-medium text-blue-900">{skillObj.skill}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                skillObj.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                                skillObj.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {skillObj.level}
                              </span>
                              <button
                                onClick={() => handleRemoveSkill(index)}
                                className="ml-1 p-0.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove skill"
                                type="button"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {skillsWithLevel.length === 0 && (
                      <p className="text-sm text-slate-500">No skills yet. Add a few to improve AI career suggestions.</p>
                    )}
                  </div>
                </div>

                {/* Achievements Section */}
                <div style={{ display: 'block', visibility: 'visible' }}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Achievements</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        value={achievementTitle}
                        onChange={(e) => setAchievementTitle(e.target.value)}
                        placeholder="Achievement title (e.g., Completed Python Course)"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && achievementTitle.trim()) {
                            handleAddAchievement();
                          }
                        }}
                      />
                      <div className="flex gap-3">
                        <label className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium whitespace-nowrap cursor-pointer flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCertificateUpload}
                            className="hidden"
                          />
                          <span>📄 Upload Certificate</span>
                        </label>
                        <button
                          onClick={handleAddAchievement}
                          className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium whitespace-nowrap"
                        >
                          + Add Achievement
                        </button>
                      </div>
                    </div>

                    {/* Certificate Preview */}
                    {certificatePreview && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-orange-900">Certificate Preview:</span>
                          <button
                            onClick={() => {
                              setCertificatePreview(null);
                              setAchievementCertificate(null);
                            }}
                            className="text-xs text-orange-600 hover:text-orange-800"
                          >
                            Remove
                          </button>
                        </div>
                        <img
                          src={certificatePreview}
                          alt="Certificate preview"
                          className="max-w-full h-auto rounded-lg border border-orange-300"
                          style={{ maxHeight: '150px' }}
                        />
                      </div>
                    )}

                    {/* Save/Cancel Buttons - Show when user starts adding (enters title or uploads certificate) */}
                    {(achievementTitle.trim() || certificatePreview || isAddingAchievement) && (
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-200 mt-3">
                        <button
                          onClick={handleSaveAchievement}
                          disabled={!achievementTitle.trim()}
                          className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                          💾 Save Achievement
                        </button>
                        <button
                          onClick={handleCancelAchievement}
                          className="px-6 py-2.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {/* Helper message when no achievements */}
                    {userAchievements.length === 0 && !achievementTitle.trim() && !certificatePreview && !isAddingAchievement && (
                      <p className="text-sm text-slate-500 mt-2">Enter an achievement title and optionally upload a certificate to add your achievement.</p>
                    )}

                    {/* Display Added Achievements */}
                    {userAchievements.length > 0 && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-3">Your Achievements:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userAchievements.map((achievement, index) => (
                            <div
                              key={achievement.id || index}
                              className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{achievement.icon || '🏆'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-orange-900 truncate">
                                    {achievement.title}
                                  </p>
                                  {achievement.description && (
                                    <p className="text-xs text-orange-600 truncate mt-1">
                                      {achievement.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {/* Show certificate if available */}
                              {achievement.certificate && (
                                <div className="mt-2 space-y-2">
                                  <img
                                    src={achievement.certificate}
                                    alt={`Certificate for ${achievement.title}`}
                                    className="max-w-full h-auto rounded-lg border border-orange-300"
                                    style={{ maxHeight: '100px' }}
                                  />
                                  {/* View and Delete Certificate Buttons */}
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        if (achievement.certificate) {
                                          window.open(achievement.certificate, '_blank', 'noopener,noreferrer');
                                        }
                                      }}
                                      className="flex-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                                      title="View certificate in new tab"
                                    >
                                      👁️ View Certificate
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAchievement(index)}
                                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                                      title="Delete achievement"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* If no certificate, show delete button */}
                              {!achievement.certificate && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => handleDeleteAchievement(index)}
                                    className="w-full px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                                    title="Delete achievement"
                                  >
                                    🗑️ Delete Achievement
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Achievements & Quick Actions */}
          <div>
            {/* Achievements - Right Side Container with Verified Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-6 md:p-8 shadow-strong"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent mb-6 md:mb-8">Achievements</h2>
              
              {/* Verified Achievements List */}
              {verifiedAchievements.length > 0 ? (
                <div className="space-y-3">
                  <ul className="space-y-3">
                    {verifiedAchievements.map((achievement) => (
                      <motion.li
                        key={achievement.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 4 }}
                        className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
                      >
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg mt-0.5">✓</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                              {achievement.quizTitle}
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              – Verified ✅
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Date: {new Date(achievement.completedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-10 md:py-12">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  </motion.div>
                  <p className="text-lg">Complete Tree Planting quizzes to earn verified achievements!</p>
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
                  onClick={() => handleNavigate('classes')}
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
                  onClick={() => handleNavigate('ar')}
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
            {/* Right column ends here - No duplicate My Skills section */}
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        user={user}
        currentContext={{
          page: 'profile',
          skills: skills,
          ecoPoints: eco.ecoPoints
        }}
      />
    </div>
  );
};

export default Profile;
