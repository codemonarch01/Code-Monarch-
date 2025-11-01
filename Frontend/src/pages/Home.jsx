import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Star, 
  TrendingUp, 
  Clock, 
  Users, 
  Award,
  Brain,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Shield,
  Zap,
  Target,
  Globe,
  CheckCircle,
  ChevronRight
} from 'lucide-react'

const Home = ({ user, onNavigate }) => {
  const courses = [
    {
      id: 1,
      title: "Advanced Mathematics",
      subject: "Mathematics",
      grade: "Grade 12",
      progress: 75,
      rating: 4.8,
      students: 1250,
      duration: "6 weeks",
      isAIRecommended: true,
      difficulty: "Advanced",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      title: "Physics in 3D",
      subject: "Physics",
      grade: "Grade 11",
      progress: 45,
      rating: 4.9,
      students: 980,
      duration: "8 weeks",
      isAIRecommended: true,
      difficulty: "Intermediate",
      color: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      title: "Chemistry Lab AR",
      subject: "Chemistry",
      grade: "Grade 10",
      progress: 90,
      rating: 4.7,
      students: 2100,
      duration: "4 weeks",
      isAIRecommended: false,
      difficulty: "Beginner",
      color: "from-orange-500 to-red-600"
    },
    {
      id: 4,
      title: "Biology 3D Models",
      subject: "Biology",
      grade: "Grade 10",
      progress: 10,
      rating: 4.2,
      students: 1000,
      duration: "5 weeks",
      isAIRecommended: true,
      difficulty: "Intermediate",
      color: "from-pink-500 to-rose-600"
    }
  ]

  const stats = [
    { label: "Courses Completed", value: "12", icon: Award, color: "text-accent-600" },
    { label: "Learning Streak", value: "15 days", icon: Clock, color: "text-primary-600" },
    { label: "Total Hours", value: "48h", icon: TrendingUp, color: "text-secondary-600" },
    { label: "Certificates", value: "8", icon: Star, color: "text-yellow-600" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-400/10 to-secondary-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-secondary-400/10 to-accent-400/10 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-primary-500 via-secondary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-900 to-secondary-900 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome back, {user?.name || 'Student'}! 👋
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Ready to continue your learning journey with AI-powered education?
            </motion.p>
        </div>

        {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    </motion.div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                  </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* AI Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-3 mb-8">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
            <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-900 to-cyan-900 bg-clip-text text-transparent">
              AI Recommended Courses
            </h2>
        </div>
        
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-start space-x-6">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
            <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Based on your learning pattern, we recommend:
              </h3>
                  <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                Focus on Physics and Chemistry courses to strengthen your science foundation. 
                Your progress in Mathematics shows you're ready for advanced concepts.
              </p>
                  <div className="flex flex-wrap gap-3">
                    {['Physics', 'Chemistry', 'Advanced Math'].map((subject, index) => (
                      <motion.span
                        key={subject}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200"
                      >
                        {subject}
                      </motion.span>
                    ))}
              </div>
            </div>
          </div>
        </div>
          </motion.div>
      </motion.div>

        {/* Course Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-900 to-cyan-900 bg-clip-text text-transparent">
              Your Courses
            </h2>
            <motion.button 
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-2 group"
              whileHover={{ scale: 1.05 }}
            >
            <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 h-full shadow-xl border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                {/* Course Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <motion.div 
                      className={`w-14 h-14 bg-gradient-to-r ${course.color} rounded-2xl flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <BookOpen className="w-7 h-7 text-white" />
                    </motion.div>
                  {course.isAIRecommended && (
                      <motion.div 
                        className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-3 py-1 rounded-full shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                      <Sparkles className="w-3 h-3" />
                        <span className="text-xs font-semibold">AI</span>
                      </motion.div>
                  )}
                </div>

                {/* Course Info */}
                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {course.title}
                  </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {course.subject}
                      </span>
                      <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {course.grade}
                      </span>
                  </div>
                    <div className="text-sm text-slate-500 font-medium">{course.difficulty}</div>
                </div>

                {/* Progress Bar */}
                  <div className="mb-6 relative z-10">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                      <span className="font-semibold">Progress</span>
                      <span className="font-bold text-emerald-600">{course.progress}%</span>
                  </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className={`h-3 bg-gradient-to-r ${course.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-6 relative z-10">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold">{course.students}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span className="font-semibold">{course.duration}</span>
                  </div>
                </div>

                {/* Action Button */}
                  <motion.button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <PlayCircle className="w-5 h-5" />
                  <span>Continue Learning</span>
                  </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-900 to-cyan-900 bg-clip-text text-transparent text-center mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl border border-white/30 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <BookOpen className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Browse Courses</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Discover new subjects and expand your knowledge with our comprehensive course library</p>
                <motion.button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('classes')}
                >
                  Explore Courses
                </motion.button>
          </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl border border-white/30 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Target className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AR Learning</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Experience immersive 3D and AR content that brings learning to life</p>
                <motion.button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('ar')}
                >
                  Try AR
                </motion.button>
        </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl border border-white/30 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <PlayCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Video Lessons</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Watch interactive video content with expert instructors and real-time feedback</p>
                <motion.button 
                  className="w-full bg-gradient-to-r from-secondary-500 to-accent-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('gamified')}
                >
                  Watch Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Professional Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center py-12"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-500 via-secondary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Globe className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-900 bg-clip-text text-transparent mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of students who are already experiencing the future of education with AI-powered learning, 3D visualization, and gamified experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI-Powered Learning</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>3D & AR Content</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Gamified Experience</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Expert Instructors</span>
              </div>
        </div>
          </div>
        </motion.div>
        </div>
    </div>
  )
}

export default Home
