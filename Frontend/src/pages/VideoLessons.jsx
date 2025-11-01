// import React, { useState, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { 
//   Play, 
//   Pause, 
//   Volume2, 
//   VolumeX, 
//   Maximize, 
//   Minimize,
//   Settings,
//   BookOpen,
//   MessageCircle,
//   ThumbsUp,
//   ThumbsDown,
//   Share,
//   Download,
//   Clock,
//   Users,
//   Star,
//   ChevronLeft,
//   ChevronRight,
//   Lightbulb,
//   Brain,
//   HelpCircle,
//   Flag,
//   Bookmark,
//   RotateCcw
// } from 'lucide-react'

// const VideoLessons = () => {
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [isMuted, setIsMuted] = useState(false)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const [playbackRate, setPlaybackRate] = useState(1)
//   const [showOverlay, setShowOverlay] = useState(true)
//   const [showNotes, setShowNotes] = useState(false)
//   const [showComments, setShowComments] = useState(false)
//   const [currentLesson, setCurrentLesson] = useState(0)
//   const [showAITips, setShowAITips] = useState(true)

//   const videoRef = useRef(null)

//   const lessons = [
//     {
//       id: 1,
//       title: "Introduction to Calculus",
//       duration: "15:30",
//       description: "Basic concepts and fundamental principles",
//       thumbnail: "https://images.unsplash.com/photo-1635070041078-e43c8c4b0a1a?w=300&h=200&fit=crop",
//       isCompleted: true,
//       isCurrent: true
//     },
//     {
//       id: 2,
//       title: "Derivatives and Limits",
//       duration: "22:15",
//       description: "Understanding derivatives and their applications",
//       thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=300&h=200&fit=crop",
//       isCompleted: false,
//       isCurrent: false
//     },
//     {
//       id: 3,
//       title: "Integration Techniques",
//       duration: "28:45",
//       description: "Various methods of integration",
//       thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=300&h=200&fit=crop",
//       isCompleted: false,
//       isCurrent: false
//     },
//     {
//       id: 4,
//       title: "Applications in Physics",
//       duration: "19:20",
//       description: "Real-world applications of calculus",
//       thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=300&h=200&fit=crop",
//       isCompleted: false,
//       isCurrent: false
//     }
//   ]

//   const aiTips = [
//     {
//       id: 1,
//       time: "2:30",
//       title: "Key Concept",
//       content: "Remember that derivatives represent the rate of change",
//       type: "concept"
//     },
//     {
//       id: 2,
//       time: "8:15",
//       title: "Important Formula",
//       content: "The power rule: d/dx[x^n] = nx^(n-1)",
//       type: "formula"
//     },
//     {
//       id: 3,
//       time: "12:45",
//       title: "Common Mistake",
//       content: "Don't forget the chain rule when dealing with composite functions",
//       type: "warning"
//     }
//   ]

//   const comments = [
//     {
//       id: 1,
//       author: "Sarah M.",
//       time: "3:20",
//       content: "This explanation is so clear! Thank you professor.",
//       likes: 12,
//       replies: 2
//     },
//     {
//       id: 2,
//       author: "Mike Chen",
//       time: "7:45",
//       content: "Could you explain the chain rule with more examples?",
//       likes: 8,
//       replies: 1
//     },
//     {
//       id: 3,
//       author: "Emma Wilson",
//       time: "11:30",
//       content: "The visual representation really helps understand the concept",
//       likes: 15,
//       replies: 0
//     }
//   ]

//   const handlePlayPause = () => {
//     setIsPlaying(!isPlaying)
//   }

//   const handleSeek = (time) => {
//     setCurrentTime(time)
//   }

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = Math.floor(seconds % 60)
//     return `${mins}:${secs.toString().padStart(2, '0')}`
//   }

//   const nextLesson = () => {
//     if (currentLesson < lessons.length - 1) {
//       setCurrentLesson(currentLesson + 1)
//     }
//   }

//   const prevLesson = () => {
//     if (currentLesson > 0) {
//       setCurrentLesson(currentLesson - 1)
//     }
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="mb-6"
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
//               Video Lessons
//             </h1>
//             <p className="text-slate-600 text-lg">
//               Interactive learning with AI-powered insights
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setShowAITips(!showAITips)}
//               className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
//                 showAITips 
//                   ? 'bg-primary-500 text-white' 
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               <Brain className="w-5 h-5" />
//               <span>AI Tips</span>
//             </button>
//             <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
//               <Settings className="w-5 h-5" />
//               <span>Settings</span>
//             </button>
//           </div>
//         </div>
//       </motion.div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Video Player */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="lg:col-span-3"
//         >
//           <div className="glass-effect rounded-2xl overflow-hidden">
//             {/* Video Container */}
//             <div className="relative bg-black rounded-t-2xl">
//               <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
//                 {/* Video Placeholder */}
//                 <div className="text-center text-white">
//                   <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Play className="w-8 h-8" />
//                   </div>
//                   <h3 className="text-xl font-bold mb-2">{lessons[currentLesson].title}</h3>
//                   <p className="text-sm opacity-80">Video player will load here</p>
//                 </div>

//                 {/* Video Overlay */}
//                 <AnimatePresence>
//                   {showOverlay && (
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       className="absolute inset-0 bg-black/50 flex items-center justify-center"
//                     >
//                       <button
//                         onClick={handlePlayPause}
//                         className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
//                       >
//                         {isPlaying ? <Pause className="w-8 h-8 text-slate-900" /> : <Play className="w-8 h-8 text-slate-900" />}
//                       </button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* AI Tips Overlay */}
//                 <AnimatePresence>
//                   {showAITips && (
//                     <motion.div
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: 20 }}
//                       className="absolute top-4 right-4 max-w-xs"
//                     >
//                       {aiTips.map((tip, index) => (
//                         <motion.div
//                           key={tip.id}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.2 }}
//                           className="bg-white/90 backdrop-blur-sm rounded-xl p-3 mb-2 shadow-lg"
//                         >
//                           <div className="flex items-center space-x-2 mb-1">
//                             <div className={`w-2 h-2 rounded-full ${
//                               tip.type === 'concept' ? 'bg-blue-500' :
//                               tip.type === 'formula' ? 'bg-green-500' :
//                               'bg-red-500'
//                             }`} />
//                             <span className="text-xs font-medium text-slate-600">{tip.time}</span>
//                           </div>
//                           <h4 className="font-semibold text-slate-900 text-sm">{tip.title}</h4>
//                           <p className="text-xs text-slate-600">{tip.content}</p>
//                         </motion.div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* Video Controls */}
//               <div className="bg-slate-900 p-4">
//                 {/* Progress Bar */}
//                 <div className="mb-4">
//                   <div className="w-full bg-slate-700 rounded-full h-2 cursor-pointer">
//                     <div 
//                       className="bg-primary-500 h-2 rounded-full transition-all duration-300"
//                       style={{ width: `${(currentTime / duration) * 100}%` }}
//                     />
//                   </div>
//                   <div className="flex justify-between text-sm text-slate-400 mt-2">
//                     <span>{formatTime(currentTime)}</span>
//                     <span>{formatTime(duration)}</span>
//                   </div>
//                 </div>

//                 {/* Control Buttons */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-4">
//                     <button
//                       onClick={handlePlayPause}
//                       className="text-white hover:text-primary-400 transition-colors"
//                     >
//                       {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
//                     </button>
                    
//                     <button
//                       onClick={() => setIsMuted(!isMuted)}
//                       className="text-white hover:text-primary-400 transition-colors"
//                     >
//                       {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
//                     </button>

//                     <div className="flex items-center space-x-2">
//                       <span className="text-sm text-slate-400">Speed:</span>
//                       <select
//                         value={playbackRate}
//                         onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
//                         className="bg-slate-800 text-white text-sm rounded px-2 py-1"
//                       >
//                         <option value={0.5}>0.5x</option>
//                         <option value={0.75}>0.75x</option>
//                         <option value={1}>1x</option>
//                         <option value={1.25}>1.25x</option>
//                         <option value={1.5}>1.5x</option>
//                         <option value={2}>2x</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-4">
//                     <button className="text-white hover:text-primary-400 transition-colors">
//                       <RotateCcw className="w-5 h-5" />
//                     </button>
//                     <button className="text-white hover:text-primary-400 transition-colors">
//                       <Maximize className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Lesson Info */}
//             <div className="p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div>
//                   <h2 className="text-2xl font-bold text-slate-900 mb-2">
//                     {lessons[currentLesson].title}
//                   </h2>
//                   <p className="text-slate-600">{lessons[currentLesson].description}</p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
//                     <ThumbsUp className="w-5 h-5 text-slate-600" />
//                   </button>
//                   <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
//                     <ThumbsDown className="w-5 h-5 text-slate-600" />
//                   </button>
//                   <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
//                     <Share className="w-5 h-5 text-slate-600" />
//                   </button>
//                   <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
//                     <Bookmark className="w-5 h-5 text-slate-600" />
//                   </button>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={prevLesson}
//                   disabled={currentLesson === 0}
//                   className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                   <span>Previous</span>
//                 </button>
//                 <button
//                   onClick={nextLesson}
//                   disabled={currentLesson === lessons.length - 1}
//                   className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <span>Next Lesson</span>
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Sidebar */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//           className="lg:col-span-1"
//         >
//           {/* Lesson List */}
//           <div className="glass-effect rounded-2xl p-6 mb-6">
//             <h3 className="text-lg font-bold text-slate-900 mb-4">Course Lessons</h3>
//             <div className="space-y-3">
//               {lessons.map((lesson, index) => (
//                 <button
//                   key={lesson.id}
//                   onClick={() => setCurrentLesson(index)}
//                   className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
//                     currentLesson === index
//                       ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
//                       : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
//                   }`}
//                 >
//                   <div className="flex items-center space-x-3 mb-2">
//                     <div className="w-12 h-8 bg-slate-300 rounded flex-shrink-0">
//                       <img 
//                         src={lesson.thumbnail} 
//                         alt={lesson.title}
//                         className="w-full h-full object-cover rounded"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-sm">{lesson.title}</h4>
//                       <p className="text-xs opacity-80">{lesson.duration}</p>
//                     </div>
//                     {lesson.isCompleted && (
//                       <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
//                         <span className="text-white text-xs">✓</span>
//                       </div>
//                     )}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Interactive Features */}
//           <div className="space-y-4">
//             <div className="glass-effect rounded-2xl p-4">
//               <h4 className="font-semibold text-slate-900 mb-3">Interactive Features</h4>
//               <div className="space-y-2">
//                 <button
//                   onClick={() => setShowNotes(!showNotes)}
//                   className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
//                     showNotes ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 hover:bg-slate-200'
//                   }`}
//                 >
//                   <BookOpen className="w-4 h-4" />
//                   <span className="text-sm">Take Notes</span>
//                 </button>
//                 <button
//                   onClick={() => setShowComments(!showComments)}
//                   className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
//                     showComments ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 hover:bg-slate-200'
//                   }`}
//                 >
//                   <MessageCircle className="w-4 h-4" />
//                   <span className="text-sm">Comments</span>
//                 </button>
//                 <button className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
//                   <HelpCircle className="w-4 h-4" />
//                   <span className="text-sm">Ask AI</span>
//                 </button>
//               </div>
//             </div>

//             {/* Comments Section */}
//             {showComments && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="glass-effect rounded-2xl p-4"
//               >
//                 <h4 className="font-semibold text-slate-900 mb-3">Comments</h4>
//                 <div className="space-y-3">
//                   {comments.map((comment) => (
//                     <div key={comment.id} className="border-b border-slate-200 pb-3 last:border-b-0">
//                       <div className="flex items-center space-x-2 mb-1">
//                         <span className="font-medium text-sm text-slate-900">{comment.author}</span>
//                         <span className="text-xs text-slate-500">{comment.time}</span>
//                       </div>
//                       <p className="text-sm text-slate-600 mb-2">{comment.content}</p>
//                       <div className="flex items-center space-x-4 text-xs text-slate-500">
//                         <button className="flex items-center space-x-1 hover:text-primary-600">
//                           <ThumbsUp className="w-3 h-3" />
//                           <span>{comment.likes}</span>
//                         </button>
//                         <button className="hover:text-primary-600">
//                           Reply ({comment.replies})
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>
//             )}

//             {/* Notes Section */}
//             {showNotes && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="glass-effect rounded-2xl p-4"
//               >
//                 <h4 className="font-semibold text-slate-900 mb-3">My Notes</h4>
//                 <textarea
//                   placeholder="Add your notes here..."
//                   className="w-full h-32 p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
//                 />
//                 <button className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
//                   Save Notes
//                 </button>
//               </motion.div>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// export default VideoLessons



import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Brain, BookOpen, MessageCircle, ThumbsUp, ThumbsDown, Share, Bookmark, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';

const VideoLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [notes, setNotes] = useState('');
  const [comments, setComments] = useState([]);
  const [showAITips, setShowAITips] = useState(true);

  const videoRef = useRef(null);

  const fetchLessons = async () => {
    try {
      const res = await axios.get('/api/lessons');
      setLessons(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotes = async (lessonId) => {
    try {
      const res = await axios.get(`/api/notes/${lessonId}`);
      setNotes(res.data.notes || '');
    } catch (err) {
      console.log(err);
    }
  };

  const fetchComments = async (lessonId) => {
    try {
      const res = await axios.get(`/api/comments/${lessonId}`);
      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (lessons.length > 0) {
      fetchNotes(lessons[currentLesson].id);
      fetchComments(lessons[currentLesson].id);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [currentLesson, lessons]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const saveProgress = async () => {
    try {
      await axios.post(`/api/progress/${lessons[currentLesson].id}`, { currentTime });
    } catch (err) {
      console.log(err);
    }
  };

  const saveNotes = async () => {
    try {
      await axios.post(`/api/notes/${lessons[currentLesson].id}`, { notes });
      alert('Notes saved!');
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async (commentText) => {
    try {
      await axios.post(`/api/comments/${lessons[currentLesson].id}`, { content: commentText });
      fetchComments(lessons[currentLesson].id);
    } catch (err) {
      console.log(err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) setCurrentLesson(currentLesson + 1);
  };

  const prevLesson = () => {
    if (currentLesson > 0) setCurrentLesson(currentLesson - 1);
  };

  if (lessons.length === 0) return <p>Loading lessons...</p>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Video Lessons</h1>
          <p className="text-slate-600 text-lg">Interactive learning with AI-powered insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowAITips(!showAITips)} className={`${showAITips ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} flex items-center space-x-2 px-4 py-2 rounded-xl`}> <Brain className="w-5 h-5" /> <span>AI Tips</span> </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl"> <Settings className="w-5 h-5" /> <span>Settings</span> </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-3 glass-effect rounded-2xl overflow-hidden">
          <div className="relative bg-black rounded-t-2xl">
            <video
              ref={videoRef}
              src={lessons[currentLesson].videoUrl}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              muted={isMuted}
            />

            {/* Controls */}
            <div className="bg-slate-900 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button onClick={handlePlayPause} className="text-white"> {isPlaying ? <Pause /> : <Play />} </button>
                <button onClick={() => setIsMuted(!isMuted)} className="text-white"> {isMuted ? <VolumeX /> : <Volume2 />} </button>
                <span className="text-slate-400 text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div>
                <button onClick={saveProgress} className="px-2 py-1 bg-primary-500 text-white rounded">Save Progress</button>
              </div>
            </div>

            {/* Lesson Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-slate-900">{lessons[currentLesson].title}</h2>
              <p className="text-slate-600 mb-4">{lessons[currentLesson].description}</p>
              <div className="flex space-x-2">
                <button onClick={prevLesson} disabled={currentLesson===0} className="px-4 py-2 bg-slate-100 rounded disabled:opacity-50">Prev</button>
                <button onClick={nextLesson} disabled={currentLesson===lessons.length-1} className="px-4 py-2 bg-primary-500 text-white rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Notes */}
          <div className="glass-effect rounded-2xl p-4">
            <button onClick={() => setShowNotes(!showNotes)} className="flex items-center space-x-2 mb-2"> <BookOpen /> <span>Notes</span> </button>
            {showNotes && (
              <div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-32 p-2 border rounded mb-2"></textarea>
                <button onClick={saveNotes} className="px-4 py-2 bg-primary-500 text-white rounded">Save Notes</button>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="glass-effect rounded-2xl p-4">
            <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 mb-2"> <MessageCircle /> <span>Comments</span> </button>
            {showComments && (
              <div className="space-y-2">
                {comments.map(c => (
                  <div key={c.id} className="border-b border-slate-200 pb-1">
                    <p className="font-medium text-sm">{c.author}</p>
                    <p className="text-xs text-slate-500 mb-1">{c.content}</p>
                  </div>
                ))}
                <input type="text" placeholder="Add comment" className="w-full p-2 border rounded" onKeyDown={e => { if(e.key==='Enter'){ addComment(e.target.value); e.target.value=''; }}} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLessons;

