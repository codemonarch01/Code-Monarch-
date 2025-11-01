import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Mic,
  MicOff,
  Brain,
  BookOpen,
  Lightbulb,
  Target,
  Sparkles,
  Clock
} from 'lucide-react';

const AITeacherWithSound = ({ topic, isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Generate AI teacher lessons based on topic
  const generateAILessons = (topic) => {
    const topicName = topic.title || topic || 'General';
    const subject = topic.subject || 'Physics';
    
    return [
      {
        id: 1,
        title: `Introduction to ${topicName}`,
        content: `Welcome to our lesson on ${topicName}. Today we'll explore the fundamental concepts that make this topic so important in ${subject}.`,
        duration: 30,
        keyPoints: [
          `Understanding the basics of ${topicName}`,
          'Historical development and significance',
          'Key scientists and their contributions',
          'Modern applications and relevance'
        ]
      },
      {
        id: 2,
        title: `Core Concepts of ${topicName}`,
        content: `Let's dive deeper into the core concepts. ${topicName} involves several key principles that we need to understand thoroughly.`,
        duration: 45,
        keyPoints: [
          'Fundamental principles and laws',
          'Mathematical relationships',
          'Physical phenomena explained',
          'Interconnections with other topics'
        ]
      },
      {
        id: 3,
        title: `Mathematical Formulations`,
        content: `Now let's look at the mathematical side of ${topicName}. Understanding these equations is crucial for solving problems.`,
        duration: 40,
        keyPoints: [
          'Key equations and formulas',
          'Derivation processes',
          'Problem-solving strategies',
          'Common calculation methods'
        ]
      },
      {
        id: 4,
        title: `Real-World Applications`,
        content: `Let's explore how ${topicName} is applied in the real world. These applications show why this knowledge is so valuable.`,
        duration: 35,
        keyPoints: [
          'Industrial applications',
          'Technological innovations',
          'Everyday examples',
          'Future possibilities'
        ]
      },
      {
        id: 5,
        title: `Problem-Solving Session`,
        content: `Now let's practice solving some problems related to ${topicName}. This will help reinforce your understanding.`,
        duration: 50,
        keyPoints: [
          'Step-by-step problem solving',
          'Common mistakes to avoid',
          'Tips and tricks',
          'Practice exercises'
        ]
      }
    ];
  };

  // Initialize lessons when topic changes
  useEffect(() => {
    if (topic) {
      setIsGenerating(true);
      // Simulate AI generation time
      setTimeout(() => {
        const generatedLessons = generateAILessons(topic);
        setLessons(generatedLessons);
        setIsGenerating(false);
      }, 2000);
    }
  }, [topic]);

  // Text-to-Speech functionality
  const speakText = (text) => {
    if (isMuted) return;
    
    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to use a more natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Samantha')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (lessons.length > 0) {
        const currentLessonData = lessons[currentLesson];
        speakText(currentLessonData.content);
        setIsPlaying(true);
      }
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Handle lesson navigation
  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      if (isPlaying) {
        window.speechSynthesis.cancel();
        const nextLessonData = lessons[currentLesson + 1];
        speakText(nextLessonData.content);
      }
    }
  };

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      if (isPlaying) {
        window.speechSynthesis.cancel();
        const prevLessonData = lessons[currentLesson - 1];
        speakText(prevLessonData.content);
      }
    }
  };

  // Handle speech recognition (optional)
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    setIsListening(!isListening);
    // Speech recognition implementation would go here
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-semibold">AI Teacher with Sound</h3>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <span>🤖 AI-Powered Learning</span>
                  <span className="bg-purple-500 px-2 py-1 rounded-full text-xs">
                    Interactive
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Listening'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isGenerating ? (
          <div className="text-center py-8">
            <div className="relative">
              <Brain className="w-8 h-8 text-purple-600 animate-pulse mx-auto mb-3" />
              <Sparkles className="w-4 h-4 text-purple-400 absolute top-1 left-1/2 transform -translate-x-1/2 animate-bounce" />
            </div>
            <p className="text-gray-600 font-medium">AI Teacher is preparing your lesson...</p>
            <p className="text-sm text-gray-500 mt-1">Generating personalized content for {topic?.title || 'this topic'}</p>
          </div>
        ) : lessons.length > 0 ? (
          <div className="space-y-6">
            {/* Current Lesson */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {lessons[currentLesson].title}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{lessons[currentLesson].duration} min</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                {lessons[currentLesson].content}
              </p>

              {/* Key Points */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-600" />
                  Key Learning Points:
                </h5>
                <ul className="space-y-1">
                  {lessons[currentLesson].keyPoints.map((point, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayPause}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'} Lesson</span>
                </button>

                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg transition-colors ${
                    isMuted
                      ? 'bg-gray-500 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={prevLesson}
                  disabled={currentLesson === 0}
                  className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{currentLesson + 1}</span>
                  <span>of</span>
                  <span>{lessons.length}</span>
                </div>
                
                <button
                  onClick={nextLesson}
                  disabled={currentLesson === lessons.length - 1}
                  className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentLesson + 1) / lessons.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No lessons available for this topic</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AITeacherWithSound;
