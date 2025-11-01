import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  Box, 
  Play, 
  User,
  Brain,
  Sparkles
} from 'lucide-react'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/ar-module', icon: Box, label: 'AR/3D' },
    { path: '/video-lessons', icon: Play, label: 'Lessons' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">EduLearn</h1>
        </div>
        
        <div className="flex items-center space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/20 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Navigation
