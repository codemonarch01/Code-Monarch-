import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  BookOpen,
  Star,
  Loader2,
  Brain,
  Target
} from 'lucide-react';
import { contentAPI, progressAPI, gamifyAPI } from '../api/api';
import LessonViewer from './LessonViewer';
import AI3DVideoPlayer from './AI3DVideoPlayer';
import QuizComponent from './QuizComponent';
import AINotesGenerator from './AINotesGenerator';
import AITeacherWithSound from './AITeacherWithSound';
import ErrorBoundary from './ErrorBoundary';

const SimpleTopicView = ({ selectedSubject, selectedClass, onBack, user }) => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [quizRequested, setQuizRequested] = useState(false);


  // Reset video completion when topic changes
  useEffect(() => {
    setVideoCompleted(false);
    setQuizRequested(false);
    setShowQuiz(false);
  }, [selectedTopic]);

  // Lightweight pause tracker: when user hides/leaves modal, mark as paused for Continue Learning
  useEffect(() => {
    if (!selectedTopic) return;
    const KEY = 'paused_modules';
    const TSKEY = 'paused_modules_updated_at';
    const details = () => ({
      id: selectedTopic?.id || selectedTopic?._id || selectedTopic?.slug || `topic-${Date.now()}`,
      title: selectedTopic?.title || selectedTopic?.name || 'Learning Module',
      subject: selectedSubject?.name || selectedTopic?.subject || '',
      className: selectedClass?.name || selectedTopic?.className || '',
      progress: videoCompleted ? 50 : 10, // heuristic if actual % unavailable
      thumbnail: selectedTopic?.thumbnail || '',
      updatedAt: new Date().toISOString()
    });

    const savePause = () => {
      try {
        const raw = localStorage.getItem(KEY) || '[]';
        const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const d = details();
        const next = [d, ...arr.filter(x => x.id !== d.id)].slice(0, 12);
        localStorage.setItem(KEY, JSON.stringify(next));
        localStorage.setItem(TSKEY, String(Date.now()));
        window.dispatchEvent(new Event('continue-learning-updated'));
      } catch {}
    };

    const onVisibility = () => {
      if (document.hidden) savePause();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      // When closing modal/backing out, treat as pause
      savePause();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [selectedTopic, selectedSubject, selectedClass, videoCompleted]);

  // Load topics from backend
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedSubject || !selectedClass) return;
      
      try {
        setIsLoading(true);
        
        // Subject name mapping
        let backendSubjectName = selectedSubject.name;
        const subjectMapping = {
          'Computer Networks': 'Computer Science',
          'Data Structures & Algorithms': 'Computer Science',
          'Database Management': 'Computer Science', 
          'Operating Systems': 'Computer Science'
        };
        if (subjectMapping[selectedSubject.name]) {
          backendSubjectName = subjectMapping[selectedSubject.name];
        }
        
        // Grade name mapping
        let backendGradeName = selectedClass.name;
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
        
        console.log('🔍 Loading topics for:', backendSubjectName, backendGradeName);
        
        // Use fallback topics since API structure is different
        const fallbackTopics = getFallbackTopics(selectedSubject.name);
        setTopics(fallbackTopics);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('❌ Error loading topics:', error);
        const fallbackTopics = getFallbackTopics(selectedSubject.name);
        setTopics(fallbackTopics);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, [selectedSubject, selectedClass]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading 3D Topics...</h2>
          <p className="text-gray-600">Please wait while we fetch your learning content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedSubject?.name} Topics
              </h1>
              <p className="text-gray-600">{selectedClass?.name} • {topics.length} Topics Available</p>
            </div>
          </div>
        </motion.div>

        {/* Topics Grid */}
        {topics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Topics Found</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find any topics for {selectedSubject?.name} in {selectedClass?.name}.
              </p>
              <p className="text-sm text-gray-500">
                Available subjects: Mathematics, Physics, Chemistry, Computer Science
              </p>
              <button
                onClick={onBack}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Subjects
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedTopic(topic)}
              >
                {/* Topic Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Topic Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{topic.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{topic.difficulty}</span>
                    </div>
                  </div>

                  {/* AI 3D Video Indicator */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">AI-Generated 3D Video</p>
                        <p className="text-xs text-gray-600">Real-time AI visualization with interactive content</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTopic(topic); }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all group-hover:scale-105"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Start AI Learning</span>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedTopic(topic);
                        setShowQuiz(true);
                        setVideoCompleted(true); // Allow quiz without video
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all text-sm"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Take Quiz</span>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Selected Topic Modal */}
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTopic.title}</h2>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">{selectedTopic.description}</p>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI 3D Video Player */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-600" />
                      AI-Generated 3D Visualization
                    </h3>
                    {selectedTopic ? (
                      <ErrorBoundary>
                        <AI3DVideoPlayer 
                          topic={selectedTopic} 
                          isVisible={true} 
                          onVideoComplete={() => {
                            setVideoCompleted(true);
                            console.log('🎬 AI 3D Video completed for topic:', selectedTopic.title);
                          }}
                        />
                      </ErrorBoundary>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg">
                        <div className="text-center">
                          <Brain className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>Select a topic to view 3D content</p>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Teacher with Sound */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-blue-600" />
                        AI Teacher with Sound
                      </h3>
                      {selectedTopic ? (
                        <ErrorBoundary>
                          <AITeacherWithSound topic={selectedTopic} isVisible={true} />
                        </ErrorBoundary>
                      ) : (
                        <div className="bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg p-8">
                          <div className="text-center">
                            <Brain className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>Select a topic to start AI teacher session</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Topic Quiz Section - Right below video */}
                    {selectedTopic && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Target className="w-5 h-5 mr-2 text-green-600" />
                            Topic Quiz
                          </h3>
                          {!showQuiz && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowQuiz(true);
                                console.log('🎯 Opening quiz for topic:', selectedTopic.title || selectedTopic.name);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium flex items-center space-x-2"
                            >
                              <Target className="w-4 h-4" />
                              <span>Start Quiz</span>
                            </button>
                          )}
                        </div>
                        
                        {showQuiz && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <QuizComponent 
                              topic={selectedTopic.title || selectedTopic.name || 'General'} 
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
                                
                                // Close quiz after completion
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
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => setShowQuiz(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                              >
                                Close Quiz
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Topic Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Study Notes</h3>
                    <ErrorBoundary>
                      <AINotesGenerator
                        topic={selectedTopic}
                        onNotesGenerated={(notes) => {
                          console.log('📝 AI Notes generated:', notes);
                        }}
                      />
                    </ErrorBoundary>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Topic Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{selectedTopic.duration}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Difficulty</span>
                        <span className="font-medium">{selectedTopic.difficulty}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Subject</span>
                        <span className="font-medium">{selectedTopic.subject}</span>
                      </div>
                      {/* Video Completion Status */}
                      {videoCompleted && (
                        <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-700">
                            <span className="text-sm">✅</span>
                            <span className="text-sm font-medium">Video Completed!</span>
                          </div>
                        </div>
                      )}

                      {/* Quiz Button - Always Available */}
                      <div className="space-y-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuizRequested(true);
                            setShowQuiz(true);
                            console.log('🎯 Opening quiz for topic:', selectedTopic.title || selectedTopic.name);
                          }}
                          className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          📝 Take Topic Quiz & Earn Points
                        </button>
                      </div>
                      
                      {/* Completion & Eco Points */}
                      {user && (
                        <div className="space-y-2 mt-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                console.log('🌱 Marking topic as completed:', selectedTopic.title);
                                
                                // Check if user is authenticated
                                const token = localStorage.getItem('token');
                                if (!token) {
                                  window.alert('Please login to earn eco points!');
                                  return;
                                }
                                
                                // Award eco-points directly via gamification endpoint
                                const taskData = { 
                                  taskType: 'topic_completed', 
                                  topicId: selectedTopic.id || selectedTopic._id,
                                  courseId: selectedTopic.courseId || 'default-course'
                                };
                                console.log('🌱 Sending task data:', taskData);
                                const res = await gamifyAPI.completeTask(taskData);
                                console.log('🌱 Gamify API response:', res);
                                console.log('🌱 Response data:', res?.data);
                                
                                if (res && (res.status === 'success' || res.data?.status === 'success')) {
                                  // Bubble an event so Navbar and others can refresh live
                                  const newPoints = res?.data?.data?.ecoPoints || res?.data?.ecoPoints;
                                  const pointsAwarded = res?.data?.data?.points || res?.data?.points || 5;
                                  
                                  // Update localStorage for persistence
                                  const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
                                  const totalPoints = currentPoints + pointsAwarded;
                                  localStorage.setItem('ecoPoints', totalPoints.toString());
                                  
                                  window.dispatchEvent(new CustomEvent('eco-points-updated', { 
                                    detail: { ecoPoints: pointsAwarded, totalPoints: totalPoints } 
                                  }));
                                  
                                  // Show success notification
                                  const notification = document.createElement('div');
                                  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                                  notification.innerHTML = `
                                    <div class="flex items-center space-x-2">
                                      <span class="font-bold">+${pointsAwarded} Eco Points!</span>
                                      <span class="text-sm">Topic completed!</span>
                                    </div>
                                  `;
                                  document.body.appendChild(notification);
                                  
                                  setTimeout(() => {
                                    notification.remove();
                                  }, 3000);
                                  
                                  console.log('🌱 Eco points updated:', { pointsAwarded, totalPoints });
                                } else {
                                  console.error('❌ API returned error:', res);
                                  // Fallback: award points locally if API fails
                                  const fallbackPoints = 5;
                                  const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
                                  const totalPoints = currentPoints + fallbackPoints;
                                  localStorage.setItem('ecoPoints', totalPoints.toString());
                                  
                                  window.dispatchEvent(new CustomEvent('eco-points-updated', { 
                                    detail: { ecoPoints: fallbackPoints, totalPoints: totalPoints } 
                                  }));
                                  
                                  // Show fallback notification
                                  const notification = document.createElement('div');
                                  notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                                  notification.innerHTML = `
                                    <div class="flex items-center space-x-2">
                                      <span class="font-bold">+${fallbackPoints} Eco Points!</span>
                                      <span class="text-sm">Topic completed! (Offline)</span>
                                    </div>
                                  `;
                                  document.body.appendChild(notification);
                                  
                                  setTimeout(() => {
                                    notification.remove();
                                  }, 3000);
                                  
                                  console.log('🌱 Fallback eco points awarded:', { fallbackPoints, totalPoints });
                                }
                              } catch (err) {
                                console.error('❌ Completion/Eco award failed:', err);
                                
                                // Fallback: award points locally if API completely fails
                                const fallbackPoints = 5;
                                const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
                                const totalPoints = currentPoints + fallbackPoints;
                                localStorage.setItem('ecoPoints', totalPoints.toString());
                                
                                window.dispatchEvent(new CustomEvent('eco-points-updated', { 
                                  detail: { ecoPoints: fallbackPoints, totalPoints: totalPoints } 
                                }));
                                
                                // Show fallback notification
                                const notification = document.createElement('div');
                                notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                                notification.innerHTML = `
                                  <div class="flex items-center space-x-2">
                                    <span class="font-bold">+${fallbackPoints} Eco Points!</span>
                                    <span class="text-sm">Topic completed! (Local)</span>
                                  </div>
                                `;
                                document.body.appendChild(notification);
                                
                                setTimeout(() => {
                                  notification.remove();
                                }, 3000);
                                
                                console.log('🌱 Fallback eco points awarded due to error:', { fallbackPoints, totalPoints });
                                
                                // Show more detailed error message
                                const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
                                console.log('❌ Error details:', errorMsg);
                              }
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                          >
                            Mark Completed & Earn Eco Points
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

// Helper function to get fallback topics
const getFallbackTopics = (subjectName) => {
  const fallbackTopics = {
    'Physics': [
      { id: 'electromagnetism', title: 'Electromagnetism', description: 'Learn about electric and magnetic fields, electromagnetic induction, and Maxwell\'s equations.', duration: '45 min', difficulty: 'Intermediate' },
      { id: 'optics', title: 'Optics', description: 'Study light behavior, reflection, refraction, lenses, and optical instruments.', duration: '40 min', difficulty: 'Beginner' },
      { id: 'modern-physics', title: 'Modern Physics', description: 'Explore quantum mechanics, relativity, and atomic structure.', duration: '50 min', difficulty: 'Advanced' },
      { id: 'mechanics', title: 'Mechanics', description: 'Understand motion, forces, energy, and momentum in classical physics.', duration: '60 min', difficulty: 'Intermediate' }
    ],
    'Chemistry': [
      { id: 'organic-chemistry', title: 'Organic Chemistry', description: 'Study carbon compounds, functional groups, and organic reactions.', duration: '55 min', difficulty: 'Advanced' },
      { id: 'physical-chemistry', title: 'Physical Chemistry', description: 'Learn thermodynamics, kinetics, and quantum chemistry principles.', duration: '50 min', difficulty: 'Advanced' },
      { id: 'inorganic-chemistry', title: 'Inorganic Chemistry', description: 'Explore elements, compounds, and chemical bonding.', duration: '45 min', difficulty: 'Intermediate' },
      { id: 'analytical-chemistry', title: 'Analytical Chemistry', description: 'Understand chemical analysis methods and techniques.', duration: '40 min', difficulty: 'Intermediate' }
    ],
    'Mathematics': [
      { id: 'calculus', title: 'Calculus', description: 'Master differentiation, integration, and their applications.', duration: '60 min', difficulty: 'Advanced' },
      { id: 'algebra', title: 'Algebra', description: 'Study equations, functions, and algebraic structures.', duration: '45 min', difficulty: 'Intermediate' },
      { id: 'geometry', title: 'Geometry', description: 'Learn about shapes, angles, and spatial relationships.', duration: '50 min', difficulty: 'Intermediate' },
      { id: 'statistics', title: 'Statistics', description: 'Understand data analysis, probability, and statistical methods.', duration: '40 min', difficulty: 'Beginner' }
    ],
    'Computer Science': [
      { id: 'data-structures', title: 'Data Structures', description: 'Learn arrays, linked lists, stacks, queues, and trees.', duration: '50 min', difficulty: 'Intermediate' },
      { id: 'algorithms', title: 'Algorithms', description: 'Study sorting, searching, and algorithmic problem solving.', duration: '55 min', difficulty: 'Advanced' },
      { id: 'programming', title: 'Programming', description: 'Master programming concepts and coding practices.', duration: '45 min', difficulty: 'Beginner' },
      { id: 'databases', title: 'Database Management', description: 'Understand database design, SQL, and data management.', duration: '40 min', difficulty: 'Intermediate' }
    ],
    'Database Management': [
      { id: 'database-design', title: 'Database Design', description: 'Learn entity-relationship modeling, normalization, and database architecture.', duration: '45 min', difficulty: 'Intermediate' },
      { id: 'sql-queries', title: 'SQL Queries', description: 'Master SELECT, INSERT, UPDATE, DELETE operations and complex queries.', duration: '50 min', difficulty: 'Intermediate' },
      { id: 'database-security', title: 'Database Security', description: 'Understand access control, encryption, and security best practices.', duration: '40 min', difficulty: 'Advanced' },
      { id: 'database-optimization', title: 'Database Optimization', description: 'Learn indexing, query optimization, and performance tuning.', duration: '55 min', difficulty: 'Advanced' }
    ],
    'Biology': [
      { id: 'cell-biology', title: 'Cell Biology', description: 'Study cell structure, function, and cellular processes.', duration: '45 min', difficulty: 'Intermediate' },
      { id: 'genetics', title: 'Genetics', description: 'Learn about heredity, DNA, and genetic engineering.', duration: '50 min', difficulty: 'Advanced' },
      { id: 'ecology', title: 'Ecology', description: 'Understand ecosystems, biodiversity, and environmental science.', duration: '40 min', difficulty: 'Beginner' }
    ]
  };

  return fallbackTopics[subjectName] || [
    { id: 'general-topic', title: 'General Topic', description: 'A comprehensive overview of the subject matter.', duration: '30 min', difficulty: 'Beginner' }
  ];
};

export default SimpleTopicView;


