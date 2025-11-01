import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  BookOpen, 
  Clock, 
  CheckCircle,
  Circle,
  Box,
  Brain,
  Loader2,
  Trophy
} from 'lucide-react';
import { topics, topicContent } from '../data/mockData';
import { contentAPI, aiAPI } from '../api/api';
import AIAssistant from './AIAssistant';
import VideoPlayer3D from './3DVideoPlayer';
import QuizComponent from './QuizComponent';

const TopicView = ({ selectedSubject, selectedClass, onBack, onTopicSelect, user }) => {
  const [currentTopic, setCurrentTopic] = useState(null);
  const [subjectTopics, setSubjectTopics] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [related3DModels, setRelated3DModels] = useState([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState('');
  const [currentTopicData, setCurrentTopicData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Load topics from backend
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setIsLoading(true);
        
        // DEBUG: Log the selected subject and class
        console.log('🔍 Loading topics for:', {
          subject: selectedSubject.name,
          grade: selectedClass.name,
          selectedSubject,
          selectedClass
        });
        
        // FIXED: Map frontend subject names to backend subject names
        let backendSubjectName = selectedSubject.name;
        
        // Subject name mapping for database compatibility
        const subjectMapping = {
          'Computer Networks': 'Computer Science',
          'Data Structures & Algorithms': 'Computer Science',
          'Database Management': 'Computer Science', 
          'Operating Systems': 'Computer Science'
        };
        
        if (subjectMapping[selectedSubject.name]) {
          backendSubjectName = subjectMapping[selectedSubject.name];
        }
        
        console.log('🔧 Subject mapping:', selectedSubject.name, '→', backendSubjectName);
        
        // FIXED: Map frontend grade names to backend grade names
        let backendGradeName = selectedClass.name;
        
        // Grade name mapping for database compatibility
        const gradeMapping = {
          '12th': 'Grade 12',
          '11th': 'Grade 11', 
          '10th': 'Grade 10',
          '9th': 'Grade 9',
          'btech': 'B.Tech'
        };
        
        if (gradeMapping[selectedClass.id]) {
          backendGradeName = gradeMapping[selectedClass.id];
        }
        
        console.log('🔧 Grade mapping:', selectedClass.name, '→', backendGradeName);
        
        // Prefer flexible query endpoint so names/grades work without strict ID mapping
        const response = await contentAPI.getTopics({
          subject: backendSubjectName,
          grade: backendGradeName,
          limit: 12
        });
        
        // DEBUG: Log the API response
        console.log('📡 API Response:', response);
        console.log('📡 API URL called:', `/topics?subject=${encodeURIComponent(backendSubjectName)}&grade=${encodeURIComponent(backendGradeName)}&limit=12`);
        
        if (response.status === 'success') {
          // DEBUG: Log the topics data
          console.log('📚 Topics received:', response.data.topics);
          
          // Normalize to unified shape for UI
          const normalized = (response.data.topics || []).map(t => ({
            id: t._id || t.id,
            name: t.title || t.name,
            title: t.title || t.name,
            duration: t.duration,
            difficulty: t.difficulty,
            description: t.description,
            course: t.course,
          }));
          
          // DEBUG: Log normalized topics
          console.log('🔧 Normalized topics:', normalized);
          
          if (normalized.length === 0) {
            console.log('⚠️ No topics found for:', backendSubjectName, backendGradeName);
          }
          
          setSubjectTopics(normalized);
        } else {
          console.log('⚠️ API response not successful, using fallback');
          // Fallback to mock data
          const fallbackTopics = getFallbackTopics(selectedSubject.name);
          setSubjectTopics(fallbackTopics);
        }
      } catch (error) {
        console.error('❌ Error loading topics:', error);
        // Fallback to mock data
        const fallbackTopics = getFallbackTopics(selectedSubject.name);
        setSubjectTopics(fallbackTopics);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedSubject && selectedClass) {
      loadTopics();
    }
  }, [selectedSubject, selectedClass]);

  useEffect(() => {
    if (subjectTopics.length > 0 && !currentTopic) {
      setCurrentTopic(subjectTopics[0]);
    }
  }, [subjectTopics]);

  // Load related 3D models when topic changes
  useEffect(() => {
    const loadRelatedModels = async () => {
      if (!currentTopic) return;
      
      try {
        setIsLoadingModels(true);
        const response = await aiAPI.get3DModels({
          subject: selectedSubject.name,
          search: currentTopic.name || currentTopic.title,
          limit: 3
        });
        
        if (response.status === 'success') {
          setRelated3DModels(response.data.models);
        }
      } catch (error) {
        console.error('Error loading related 3D models:', error);
        setRelated3DModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadRelatedModels();
  }, [currentTopic, selectedSubject.name]);

  // Load topic details (including video) when selection changes
  useEffect(() => {
    const loadTopicDetails = async () => {
      if (!currentTopic?.id) return;
      try {
        setIsVideoLoading(true);
        setVideoError('');
        
        // Generate mock content for the topic
        const mockContent = generateMockContent(currentTopic);
        setCurrentTopicData({ content: mockContent });
        
        // Try to get content from backend (optional)
        try {
          const response = await contentAPI.getTopicById(currentTopic.id);
          if (response.status === 'success') {
            setCurrentTopicData(response.data.topic);
          }
        } catch (backendError) {
          console.log('Using mock content for topic:', currentTopic.name);
        }
      } catch (err) {
        console.error('Error loading topic details:', err);
        const mockContent = generateMockContent(currentTopic);
        setCurrentTopicData({ content: mockContent });
      } finally {
        setIsVideoLoading(false);
      }
    };
    loadTopicDetails();
  }, [currentTopic]);

  // Preload video endpoint or preconnect for YouTube when URL changes
  useEffect(() => {
    const url = currentTopicData?.content?.videoUrl;
    if (!url) return;
    // Preconnect hints for common video CDNs
    const preconnects = [];
    const addPreconnect = (href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
      preconnects.push(link);
    };
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        addPreconnect('https://www.youtube.com');
        addPreconnect('https://i.ytimg.com');
        addPreconnect('https://googlevideo.com');
      } else {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = url;
        document.head.appendChild(link);
        preconnects.push(link);
      }
    } catch {}
    return () => {
      preconnects.forEach(l => document.head.removeChild(l));
    };
  }, [currentTopicData?.content?.videoUrl]);

  const handleTopicSelect = (topic) => {
    setCurrentTopic(topic);
    setIsPlaying(false);
  };

  const handleNextTopic = () => {
    const currentIndex = subjectTopics.findIndex(t => t.id === currentTopic.id);
    if (currentIndex < subjectTopics.length - 1) {
      setCurrentTopic(subjectTopics[currentIndex + 1]);
      setIsPlaying(false);
    }
  };

  const handlePreviousTopic = () => {
    const currentIndex = subjectTopics.findIndex(t => t.id === currentTopic.id);
    if (currentIndex > 0) {
      setCurrentTopic(subjectTopics[currentIndex - 1]);
      setIsPlaying(false);
    }
  };

  const toggleTopicCompletion = (topicId) => {
    const newCompleted = new Set(completedTopics);
    if (newCompleted.has(topicId)) {
      newCompleted.delete(topicId);
    } else {
      newCompleted.add(topicId);
    }
    setCompletedTopics(newCompleted);
  };

  const getCurrentTopicContent = () => {
    return topicContent[currentTopic?.id] || {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: '# Topic Content\n\nContent for this topic is being prepared. Please check back later for detailed notes and explanations.'
    };
  };

  const formatNotes = (notes) => {
    return notes.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-5">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium text-gray-700 mb-2 mt-4">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-800 mb-2">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-700 mb-1 ml-4">{line.substring(2)}</li>;
      } else if (line.startsWith('```')) {
        return null;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-gray-700 mb-3 leading-relaxed">{line}</p>;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && subjectTopics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No topics found</h2>
          <p className="text-gray-600 mb-4">We couldn't find topics for {selectedSubject?.name}. Try another subject.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  if (!currentTopic && subjectTopics.length > 0) {
    // Safety: ensure we don't show infinite spinner if state desync happens
    setCurrentTopic(subjectTopics[0]);
  }

  const currentContent = currentTopicData?.content?.videoUrl
    ? { videoUrl: currentTopicData.content.videoUrl, notes: currentTopicData.content?.notes || '' }
    : getCurrentTopicContent();
  const currentIndex = subjectTopics.findIndex(t => t.id === currentTopic.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                data-magnetic
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Subjects</span>
              </motion.button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${selectedSubject.color} rounded-lg flex items-center justify-center text-sm`}>
                  {selectedSubject.icon}
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{selectedSubject.name}</h1>
                  <p className="text-sm text-gray-500">{selectedClass.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                <Brain className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentTopic.duration}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentTopic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                currentTopic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentTopic.difficulty}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topic List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Topics</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subjectTopics.map((topic) => (
                  <motion.button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentTopic.id === topic.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    data-magnetic
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTopicCompletion(topic.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {completedTopics.has(topic.id) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{topic.name}</p>
                        <p className="text-xs text-gray-500">{topic.duration}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Topic Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{currentTopic.name}</h1>
                  <button
                    onClick={() => toggleTopicCompletion(currentTopic.id)}
                    className="flex items-center space-x-2 text-sm"
                  >
                    {completedTopics.has(currentTopic.id) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-700">Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Mark Complete</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{currentTopic.description}</p>
                
                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={handlePreviousTopic}
                    disabled={currentIndex === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                    data-magnetic
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>
                  
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {subjectTopics.length}
                  </span>
                  
                  <motion.button
                    onClick={handleNextTopic}
                    disabled={currentIndex === subjectTopics.length - 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                    data-magnetic
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Content Row: Video and Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ENHANCED: 3D Video Player */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* DEBUG: Show loading state */}
                  {isVideoLoading ? (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading 3D content...</p>
                      </div>
                    </div>
                  ) : videoError ? (
                    <div className="aspect-video bg-red-50 flex items-center justify-center text-center p-6">
                      <div>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">!</div>
                        <p className="text-red-600 font-medium mb-1">{videoError}</p>
                        <p className="text-sm text-red-400">Please try again or pick another topic.</p>
                      </div>
                    </div>
                  ) : currentTopic ? (
                    <VideoPlayer3D
                      topic={{
                        ...currentTopic,
                        subject: selectedSubject?.name || currentTopic.subject
                      }}
                      videoUrl={currentContent?.videoUrl || currentTopicData?.content?.videoUrl}
                      isVisible={true}
                    />
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-500">
                      Select a topic to view 3D content
                  </div>
                  )}
                </motion.div>

                {/* Notes Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Study Notes</h2>
                      </div>
                      <motion.button
                        onClick={() => setShowNotes(!showNotes)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        data-magnetic
                      >
                        {showNotes ? 'Hide Notes' : 'Show Notes'}
                      </motion.button>
                    </div>
                  </div>
                  
                  {showNotes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 text-gray-800 leading-relaxed"
                    >
                      <div className="space-y-4">
                        {currentContent?.notes ? formatNotes(currentContent.notes) : (
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-900 mb-2">📝 Key Concepts</h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Fundamental principles and theories</li>
                                <li>• Important formulas and equations</li>
                                <li>• Real-world applications</li>
                                <li>• Common misconceptions to avoid</li>
                              </ul>
                            </div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-semibold text-green-900 mb-2">💡 Study Tips</h4>
                              <ul className="text-sm text-green-800 space-y-1">
                                <li>• Practice with interactive 3D models</li>
                                <li>• Take notes while watching videos</li>
                                <li>• Test your understanding with quizzes</li>
                                <li>• Review concepts regularly</li>
                              </ul>
                            </div>
                            
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h4 className="font-semibold text-purple-900 mb-2">🎯 Learning Objectives</h4>
                              <ul className="text-sm text-purple-800 space-y-1">
                                <li>• Understand core concepts</li>
                                <li>• Apply knowledge to solve problems</li>
                                <li>• Connect theory with practice</li>
                                <li>• Prepare for assessments</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Quiz Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Test Your Knowledge</h2>
                    </div>
                    <motion.button
                      onClick={() => setShowQuiz(!showQuiz)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {showQuiz ? 'Hide Quiz' : 'Start Quiz'}
                    </motion.button>
                  </div>
                </div>
                
                {showQuiz && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6"
                  >
                    <QuizComponent
                      topic={currentTopic?.name || 'General'}
                      onComplete={(score, total, ecoPoints, percentage) => {
                        console.log('🎯 Quiz completed:', { score, total, ecoPoints, percentage });
                        
                        // Update eco points in navbar
                        if (ecoPoints > 0) {
                          console.log('🌱 Dispatching eco points update:', ecoPoints);
                          window.dispatchEvent(new CustomEvent('eco-points-updated', { 
                            detail: { ecoPoints: ecoPoints } 
                          }));
                          
                          // Also update localStorage for persistence
                          const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
                          const newPoints = currentPoints + ecoPoints;
                          localStorage.setItem('ecoPoints', newPoints.toString());
                          console.log('🌱 Updated localStorage eco points:', newPoints);
                        }
                        
                        setQuizScore({ score, total, percentage });
                        setShowQuiz(false);
                      }}
                      onEcoPointsEarned={(ecoPoints, percentage) => {
                        console.log('🌱 Eco points earned:', ecoPoints, 'Percentage:', percentage);
                        
                        // Show notification
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                        notification.innerHTML = `
                          <div class="flex items-center space-x-2">
                            <span class="font-bold">+${ecoPoints} Eco Points!</span>
                            <span class="text-sm">Great job!</span>
                          </div>
                        `;
                        document.body.appendChild(notification);
                        
                        setTimeout(() => {
                          notification.remove();
                        }, 3000);
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Quiz Results */}
              {quizScore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Completed!</h3>
                    <p className="text-gray-600 mb-4">
                      You scored {quizScore.score} out of {quizScore.total} ({quizScore.percentage}%)
                    </p>
                    <div className="flex justify-center space-x-3">
                      <motion.button
                        onClick={() => {
                          setShowQuiz(true);
                          setQuizScore(null);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Retake Quiz
                      </motion.button>
                      <motion.button
                        onClick={() => setQuizScore(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Related 3D Models */}
              {related3DModels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Box className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Related 3D Models</h2>
                    {isLoadingModels && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {related3DModels.map((model, index) => (
                      <motion.div
                        key={model._id || model.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          // Navigate to AR module with this model
                          window.location.href = '/ar';
                        }}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getColorForSubject(model.subject)} rounded-lg flex items-center justify-center`}>
                            <Box className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{model.title}</h3>
                            <p className="text-sm text-gray-600">{model.subject}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{model.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {model.type === '3d_model' ? '3D Model' : 'AR Content'}
                          </span>
                          <span className="text-xs text-gray-500">{model.difficulty}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        user={user}
        currentContext={{
          page: 'topic_view',
          currentTopic: currentTopic,
          selectedSubject: selectedSubject,
          selectedClass: selectedClass,
          related3DModels: related3DModels
        }}
      />
    </div>
  );
};

// Helper function to generate mock content for topics
const generateMockContent = (topic) => {
  const mockContents = {
    'electromagnetism': {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: `# Electromagnetism

## Key Concepts
- **Electric Fields**: Forces around charged particles
- **Magnetic Fields**: Forces around moving charges
- **Electromagnetic Induction**: How changing magnetic fields create electric currents
- **Maxwell's Equations**: The four fundamental laws of electromagnetism

## Important Formulas
- Coulomb's Law: F = k(q₁q₂)/r²
- Electric Field: E = F/q
- Magnetic Force: F = qvB sin θ
- Faraday's Law: ε = -dΦ/dt

## Real-World Applications
- Electric motors and generators
- Transformers in power systems
- Electromagnetic waves (radio, light, X-rays)
- MRI machines in medical imaging

## Study Tips
- Practice with field line diagrams
- Understand the relationship between electricity and magnetism
- Work through numerical problems step by step
- Use 3D visualizations to understand field interactions`,
      duration: '45 min'
    },
    'optics': {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: `# Optics

## Key Concepts
- **Light as Wave**: Interference, diffraction, and polarization
- **Light as Ray**: Reflection, refraction, and geometric optics
- **Lenses**: Converging and diverging lens systems
- **Optical Instruments**: Microscopes, telescopes, cameras

## Important Laws
- Law of Reflection: θᵢ = θᵣ
- Snell's Law: n₁sinθ₁ = n₂sinθ₂
- Lens Equation: 1/f = 1/dₒ + 1/dᵢ
- Magnification: M = -dᵢ/dₒ

## Applications
- Vision correction (glasses, contact lenses)
- Photography and imaging
- Fiber optic communications
- Laser technology

## Study Tips
- Draw ray diagrams for lens problems
- Understand the difference between real and virtual images
- Practice with different lens combinations
- Use the 3D models to visualize light paths`,
      duration: '40 min'
    },
    'data-structures': {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: `# Data Structures

## Key Concepts
- **Arrays**: Fixed-size sequential storage
- **Linked Lists**: Dynamic nodes with pointers
- **Stacks**: LIFO (Last In, First Out) structure
- **Queues**: FIFO (First In, First Out) structure
- **Trees**: Hierarchical data organization
- **Hash Tables**: Key-value pair storage

## Time Complexities
- Array Access: O(1)
- Linked List Search: O(n)
- Stack Operations: O(1)
- Tree Traversal: O(n)
- Hash Table Lookup: O(1) average

## Applications
- Database indexing
- Operating system scheduling
- Compiler design
- Network routing algorithms

## Study Tips
- Practice implementing each structure
- Understand when to use which structure
- Analyze time and space complexity
- Use visualizations to understand operations`,
      duration: '50 min'
    }
  };

  return mockContents[topic.id] || {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    notes: `# ${topic.name}

## Overview
This topic covers the fundamental concepts and principles of ${topic.name}.

## Key Learning Points
- Understanding core concepts
- Practical applications
- Problem-solving techniques
- Real-world examples

## Study Approach
- Watch the 3D video content
- Take notes on important points
- Practice with the interactive quiz
- Review and reinforce learning

## Next Steps
- Complete the quiz to test understanding
- Explore related 3D models
- Ask questions in the AI assistant`,
    duration: topic.duration || '30 min'
  };
};

// Helper function to get fallback topics
const getFallbackTopics = (subjectName) => {
  const fallbackTopics = {
    'Physics': [
      { id: 'electromagnetism', name: 'Electromagnetism', duration: '45 min', difficulty: 'Intermediate', description: 'Learn about electric and magnetic fields, electromagnetic induction, and Maxwell\'s equations.' },
      { id: 'optics', name: 'Optics', duration: '40 min', difficulty: 'Beginner', description: 'Study light behavior, reflection, refraction, lenses, and optical instruments.' },
      { id: 'modern-physics', name: 'Modern Physics', duration: '50 min', difficulty: 'Advanced', description: 'Explore quantum mechanics, relativity, and atomic structure.' },
      { id: 'mechanics', name: 'Mechanics', duration: '60 min', difficulty: 'Intermediate', description: 'Understand motion, forces, energy, and momentum in classical physics.' }
    ],
    'Chemistry': [
      { id: 'organic-chemistry', name: 'Organic Chemistry', duration: '55 min', difficulty: 'Advanced', description: 'Study carbon compounds, functional groups, and organic reactions.' },
      { id: 'physical-chemistry', name: 'Physical Chemistry', duration: '50 min', difficulty: 'Advanced', description: 'Learn thermodynamics, kinetics, and quantum chemistry principles.' },
      { id: 'inorganic-chemistry', name: 'Inorganic Chemistry', duration: '45 min', difficulty: 'Intermediate', description: 'Explore elements, compounds, and chemical bonding.' },
      { id: 'analytical-chemistry', name: 'Analytical Chemistry', duration: '40 min', difficulty: 'Intermediate', description: 'Understand chemical analysis methods and techniques.' }
    ],
    'Mathematics': [
      { id: 'calculus', name: 'Calculus', duration: '60 min', difficulty: 'Advanced', description: 'Master differentiation, integration, and their applications.' },
      { id: 'algebra', name: 'Algebra', duration: '45 min', difficulty: 'Intermediate', description: 'Study equations, functions, and algebraic structures.' },
      { id: 'geometry', name: 'Geometry', duration: '50 min', difficulty: 'Intermediate', description: 'Learn about shapes, angles, and spatial relationships.' },
      { id: 'statistics', name: 'Statistics', duration: '40 min', difficulty: 'Beginner', description: 'Understand data analysis, probability, and statistical methods.' }
    ],
    'Computer Science': [
      { id: 'data-structures', name: 'Data Structures', duration: '50 min', difficulty: 'Intermediate', description: 'Learn arrays, linked lists, stacks, queues, and trees.' },
      { id: 'algorithms', name: 'Algorithms', duration: '55 min', difficulty: 'Advanced', description: 'Study sorting, searching, and algorithmic problem solving.' },
      { id: 'programming', name: 'Programming', duration: '45 min', difficulty: 'Beginner', description: 'Master programming concepts and coding practices.' },
      { id: 'databases', name: 'Databases', duration: '40 min', difficulty: 'Intermediate', description: 'Understand database design, SQL, and data management.' }
    ],
    'Biology': [
      { id: 'cell-biology', name: 'Cell Biology', duration: '45 min', difficulty: 'Intermediate', description: 'Study cell structure, function, and cellular processes.' },
      { id: 'genetics', name: 'Genetics', duration: '50 min', difficulty: 'Advanced', description: 'Learn about heredity, DNA, and genetic engineering.' },
      { id: 'ecology', name: 'Ecology', duration: '40 min', difficulty: 'Beginner', description: 'Understand ecosystems, biodiversity, and environmental science.' }
    ]
  };

  return fallbackTopics[subjectName] || [
    { id: 'general-topic', name: 'General Topic', duration: '30 min', difficulty: 'Beginner', description: 'A comprehensive overview of the subject matter.' }
  ];
};

// Helper function to format notes
const formatNotes = (notes) => {
  if (typeof notes === 'string') {
    return (
      <div className="prose prose-sm max-w-none">
        {notes.split('\n').map((line, index) => (
          <p key={index} className="mb-2">{line}</p>
        ))}
      </div>
    );
  }
  return <p className="text-gray-500">Notes will appear here once available.</p>;
};

// Helper function to get color for subject
const getColorForSubject = (subject) => {
  const colors = {
    'Biology': 'from-red-500 to-pink-600',
    'Physics': 'from-yellow-500 to-orange-600',
    'Chemistry': 'from-green-500 to-teal-600',
    'Mathematics': 'from-blue-500 to-purple-600',
    'Computer Science': 'from-indigo-500 to-blue-600',
    'English': 'from-yellow-500 to-amber-600',
    'History': 'from-amber-500 to-orange-600',
    'Geography': 'from-teal-500 to-green-600'
  }
  return colors[subject] || 'from-gray-500 to-gray-600'
};

export default TopicView;
