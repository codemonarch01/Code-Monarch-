import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Star, Users, Clock, Sparkles, Box } from 'lucide-react'

const CourseCard3D = ({ course, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        rotateX: 2,
        z: 50
      }}
      className="group relative perspective-1000"
    >
      <div className="glass-effect rounded-2xl p-6 h-full card-hover transform-gpu">
        {/* Course Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${course.color} rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          {course.isAIRecommended && (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">AI</span>
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            <span className="bg-slate-100 px-2 py-1 rounded-lg">{course.subject}</span>
            <span className="bg-slate-100 px-2 py-1 rounded-lg">{course.grade}</span>
          </div>
          <div className="text-sm text-slate-500">{course.difficulty}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 bg-gradient-to-r ${course.color} rounded-full transition-all duration-500`}
              style={{ width: `${course.progress}%` }}
            />
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
            <span>{course.students}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* 3D/AR Features */}
        <div className="flex items-center space-x-2 mb-4">
          {course.is3D && (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
              <Box className="w-3 h-3" />
              <span>3D</span>
            </div>
          )}
          {course.isAR && (
            <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs">
              <Sparkles className="w-3 h-3" />
              <span>AR</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full btn-primary flex items-center justify-center space-x-2 group-hover:scale-105 transition-transform">
          <BookOpen className="w-5 h-5" />
          <span>Continue Learning</span>
        </button>
      </div>
    </motion.div>
  )
}

export default CourseCard3D
