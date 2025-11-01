import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Star, 
  Clock, 
  Users, 
  Filter,
  Search,
  Grid,
  List,
  Box,
  Sparkles,
  Award,
  PlayCircle,
  ChevronDown
} from 'lucide-react'

const CourseCatalog = () => {
  const [selectedGrade, setSelectedGrade] = useState('All')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const grades = ['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English']

  const courses = [
    {
      id: 1,
      title: "Advanced Calculus",
      subject: "Mathematics",
      grade: "Grade 12",
      rating: 4.9,
      students: 2150,
      duration: "12 weeks",
      difficulty: "Advanced",
      price: "Free",
      isAR: true,
      is3D: true,
      color: "from-blue-500 to-purple-600",
      description: "Master advanced calculus concepts with interactive 3D visualizations",
      instructor: "Dr. Sarah Johnson",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e43c8c4b0a1a?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Physics in 3D Space",
      subject: "Physics",
      grade: "Grade 11",
      rating: 4.8,
      students: 1800,
      duration: "10 weeks",
      difficulty: "Intermediate",
      price: "Free",
      isAR: true,
      is3D: true,
      color: "from-green-500 to-teal-600",
      description: "Explore physics concepts through immersive 3D simulations",
      instructor: "Prof. Michael Chen",
      thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Chemistry Lab AR",
      subject: "Chemistry",
      grade: "Grade 10",
      rating: 4.7,
      students: 3200,
      duration: "8 weeks",
      difficulty: "Beginner",
      price: "Free",
      isAR: true,
      is3D: false,
      color: "from-orange-500 to-red-600",
      description: "Virtual chemistry lab with AR experiments",
      instructor: "Dr. Emily Rodriguez",
      thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Human Anatomy 3D",
      subject: "Biology",
      grade: "Grade 9",
      rating: 4.6,
      students: 2800,
      duration: "14 weeks",
      difficulty: "Intermediate",
      price: "Free",
      isAR: false,
      is3D: true,
      color: "from-pink-500 to-rose-600",
      description: "Detailed 3D models of human anatomy",
      instructor: "Dr. James Wilson",
      thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Programming Fundamentals",
      subject: "Computer Science",
      grade: "Grade 11",
      rating: 4.8,
      students: 1950,
      duration: "16 weeks",
      difficulty: "Beginner",
      price: "Free",
      isAR: false,
      is3D: false,
      color: "from-indigo-500 to-purple-600",
      description: "Learn programming with interactive coding challenges",
      instructor: "Prof. Alex Kumar",
      thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Creative Writing",
      subject: "English",
      grade: "Grade 10",
      rating: 4.5,
      students: 1200,
      duration: "6 weeks",
      difficulty: "Intermediate",
      price: "Free",
      isAR: false,
      is3D: false,
      color: "from-yellow-500 to-orange-600",
      description: "Develop creative writing skills with AI feedback",
      instructor: "Ms. Lisa Thompson",
      thumbnail: "https://images.unsplash.com/photo-1635070041408-e43c8c4b0a1a?w=400&h=300&fit=crop"
    }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesGrade = selectedGrade === 'All' || course.grade === selectedGrade
    const matchesSubject = selectedSubject === 'All' || course.subject === selectedSubject
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGrade && matchesSubject && matchesSearch
  })

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Course Catalog
        </h1>
        <p className="text-slate-600 text-lg">
          Discover amazing courses with 3D and AR experiences
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div className="glass-effect rounded-2xl p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-slate-600">
              {filteredCourses.length} courses found
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-white/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Grade Level</label>
                    <div className="flex flex-wrap gap-2">
                      {grades.map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setSelectedGrade(grade)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedGrade === grade
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Subject</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedSubject === subject
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Course Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }`}
      >
        <AnimatePresence>
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
              className={`group ${
                viewMode === 'grid' ? 'glass-effect rounded-2xl overflow-hidden' : 'glass-effect rounded-2xl p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                <div className="h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-80`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-60" />
                    </div>
                    
                    {/* AR/3D Badges */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {course.isAR && (
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                          <Box className="w-4 h-4 text-primary-600" />
                          <span className="text-xs font-medium text-slate-700">AR</span>
                        </div>
                      )}
                      {course.is3D && (
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                          <Sparkles className="w-4 h-4 text-secondary-600" />
                          <span className="text-xs font-medium text-slate-700">3D</span>
                        </div>
                      )}
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg">{course.subject}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-lg">{course.grade}</span>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="text-sm text-slate-500 mb-4">
                      by {course.instructor}
                    </div>

                    {/* Action Button */}
                    <button className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:scale-105 transition-transform">
                      <PlayCircle className="w-5 h-5" />
                      <span>Start Course</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  {/* Course Image */}
                  <div className="relative w-32 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-80 rounded-xl`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white opacity-60" />
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex space-x-2">
                        {course.isAR && (
                          <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full flex items-center space-x-1">
                            <Box className="w-3 h-3" />
                            <span className="text-xs font-medium">AR</span>
                          </div>
                        )}
                        {course.is3D && (
                          <div className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-xs font-medium">3D</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-3">{course.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg">{course.subject}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded-lg">{course.grade}</span>
                      <span className={`px-2 py-1 rounded-lg ${
                        course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="flex flex-col items-end space-y-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="btn-primary flex items-center space-x-2 group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-5 h-5" />
                    <span>Start</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No courses found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms</p>
        </motion.div>
      )}
    </div>
  )
}

export default CourseCatalog
