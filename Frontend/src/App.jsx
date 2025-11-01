import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cursor from './components/Cursor'
import Login from './components/Login'
import Register from './components/Register'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import ClassSelect from './components/ClassSelect'
import SubjectSelect from './components/SubjectSelect'
import TopicView from './components/TopicView'
import SimpleTopicView from './components/SimpleTopicView'
import Home from './pages/Home'
import CourseCatalog from './pages/CourseCatalog'
import Profile from './pages/Profile'
import ARModule from './pages/ARModule'
import VideoLessons from './pages/VideoLessons'
import GamifiedLearning from './pages/GamifiedLearning'
import About from './pages/About'
import Contact from './pages/Contact'
import Leaderboard from './pages/Leaderboard'
import SkillPathRecommenderPage from './pages/SkillPathRecommenderPage'
import { classes as classDataList, subjects as subjectMap } from './data/mockData'
import mainAPI from './api/api'
// Initialize Continue Learning service (auto-tracks video progress)
import './services/continueLearningService'

function App() {
  console.log('🚀 App component rendering...')
  
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('login') // Start with login page
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resumeSelection, setResumeSelection] = useState(null)

  console.log('📊 App state:', { user: !!user, currentPage, authMode, isLoading })

 
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('edulearn_token')
        if (token) {
          // Set token in API service
          mainAPI.setToken(token)
          
          // Try to get current user from API
          try {
            const response = await mainAPI.auth.getCurrentUser()
            if (isMounted && response.data.status === 'success') {
              setUser(response.data.data.user)
              setCurrentPage('dashboard')
            } else if (isMounted) {
              // Token is invalid, clear it
              mainAPI.setToken(null)
              localStorage.removeItem('edusmartUser')
            }
          } catch (apiError) {
            console.warn('Backend not available, using fallback mode:', apiError.message)
            
            if (isMounted) {
              const savedUser = localStorage.getItem('edusmartUser')
              if (savedUser) {
                setUser(JSON.parse(savedUser))
                setCurrentPage('dashboard')
              } else {
                // No saved user, stay on login page
                setCurrentPage('login')
              }
            }
          }
        } else if (isMounted) {
          // Check for localStorage user as fallback
          const savedUser = localStorage.getItem('edusmartUser')
          if (savedUser) {
            setUser(JSON.parse(savedUser))
            setCurrentPage('dashboard')
          }
        }
        
        // Load resume selection
        if (isMounted) {
          const savedSel = localStorage.getItem('edusmartLastSelection')
          if (savedSel) {
            try {
              const parsed = JSON.parse(savedSel)
              setResumeSelection(parsed)
            } catch {}
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        
        if (isMounted) {
          mainAPI.setToken(null)
          localStorage.removeItem('edusmartUser')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
    
    return () => {
      isMounted = false; // Cleanup function
    }
  }, [])

  
  useEffect(() => {
    if (user) {
      localStorage.setItem('edusmartUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('edusmartUser')
    }
  }, [user])

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }

  const handleRegister = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
   
    mainAPI.setToken(null)
    
  
    setUser(null)
    setCurrentPage('login')
    setSelectedClass(null)
    setSelectedSubject(null)
    setResumeSelection(null)
    
    
    localStorage.removeItem('edusmartUser')
    localStorage.removeItem('edulearn_token')
  }

  const handleNavigation = (page) => {
    setCurrentPage(page)
    if (page === 'classes') {
      setSelectedClass(null)
      setSelectedSubject(null)
    } else if (page === 'topics') {
      // If navigating to topics, try to restore selection from localStorage
      // This allows Continue Learning to work properly
      try {
        const saved = JSON.parse(localStorage.getItem('edusmartLastSelection') || '{}')
        if (saved.classId && saved.subjectId) {
          const cls = classDataList.find(c => c.id === saved.classId)
          const subj = (subjectMap[saved.classId] || []).find(s => s.id === saved.subjectId)
          if (cls && subj) {
            setSelectedClass(cls)
            setSelectedSubject(subj)
            setResumeSelection(saved)
          }
        }
      } catch (e) {
        // Ignore errors, just continue without restoring
      }
    }
  }

  const handleClassSelect = (classData) => {
    setSelectedClass(classData)
    setCurrentPage('subjects')
    
    const current = JSON.parse(localStorage.getItem('edusmartLastSelection') || '{}')
    const updated = { ...current, classId: classData.id, subjectId: null, topicId: null }
    localStorage.setItem('edusmartLastSelection', JSON.stringify(updated))
    setResumeSelection(updated)
  }

  const handleSubjectSelect = (subjectData) => {
    setSelectedSubject(subjectData)
    setCurrentPage('topics')
    
    const current = JSON.parse(localStorage.getItem('edusmartLastSelection') || '{}')
    const updated = { ...current, subjectId: subjectData.id }
    localStorage.setItem('edusmartLastSelection', JSON.stringify(updated))
    setResumeSelection(updated)
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
    setSelectedSubject(null)
    setCurrentPage('classes')
  }

  const handleBackToSubjects = () => {
    setSelectedSubject(null)
    setCurrentPage('subjects')
  }

  // Resume learning handler
  const handleResume = () => {
    if (!resumeSelection) return
    // Find class and subject objects from mock data ids
    const cls = classDataList.find(c => c.id === resumeSelection.classId)
    const subj = (subjectMap[resumeSelection.classId] || []).find(s => s.id === resumeSelection.subjectId)
    if (cls && subj) {
      setSelectedClass(cls)
      setSelectedSubject(subj)
      setCurrentPage('topics')
    } else {
      setCurrentPage('classes')
    }
  }

  const renderCurrentPage = () => {
    console.log('🎨 renderCurrentPage called, user:', !!user, 'authMode:', authMode)
    
    if (!user) {
      console.log('👤 No user, showing auth page:', authMode)
      if (authMode === 'login') {
        return (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        )
      } else {
        return (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )
      }
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onNavigate={handleNavigation}
            onResume={resumeSelection?.classId && resumeSelection?.subjectId ? handleResume : null}
          />
        )
      case 'home':
        return (
          <Home 
            user={user} 
            onNavigate={handleNavigation}
          />
        )
      case 'about':
        return <About />
      case 'contact':
        return <Contact />
      case 'leaderboard':
        return <Leaderboard />
      case 'profile':
        return <Profile onNavigate={handleNavigation} />
      case 'gamified':
        return <GamifiedLearning user={user} />
      case 'ar':
        return <ARModule user={user} onNavigate={handleNavigation} />
      case 'classes':
        return (
          <ClassSelect
            onClassSelect={handleClassSelect}
            onBack={() => setCurrentPage('dashboard')}
          />
        )
      case 'subjects':
        return (
          <SubjectSelect
            selectedClass={selectedClass}
            onSubjectSelect={handleSubjectSelect}
            onBack={handleBackToClasses}
          />
        )
      case 'topics':
        return (
          <SimpleTopicView
            selectedSubject={selectedSubject}
            selectedClass={selectedClass}
            onBack={handleBackToSubjects}
            user={user}
          />
        )
      case 'skill-path':
        return <SkillPathRecommenderPage user={user} />
      default:
        return (
          <Dashboard 
            user={user} 
            onNavigate={handleNavigation}
            onResume={resumeSelection?.classId && resumeSelection?.subjectId ? handleResume : null}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EduSmart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Cursor />
      
      {user && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage + authMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.2, 
            ease: "easeOut",
            type: "tween"
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App


