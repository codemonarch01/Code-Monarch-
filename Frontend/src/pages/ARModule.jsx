import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Eye, 
  EyeOff,
  Play,
  Pause,
  RotateCw,
  Maximize,
  Minimize,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Download,
  Share,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Box,
  Sparkles,
  Brain,
  Lightbulb,
  Loader2
} from 'lucide-react'
import { aiAPI } from '../api/api'
import AIAssistant from '../components/AIAssistant'

const ARModule = ({ user, onNavigate }) => {
  const [isARMode, setIsARMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [zoom, setZoom] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [showAITooltips, setShowAITooltips] = useState(true)
  const [currentModel, setCurrentModel] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [models, setModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')

  const canvasRef = useRef(null)

  // Load 3D models from backend
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true)
        const response = await aiAPI.get3DModels({
          subject: selectedSubject,
          grade: selectedGrade,
          limit: 20
        })
        
        if (response.status === 'success') {
          const backendModels = response.data.models.map(model => ({
            id: model._id,
            name: model.title,
            subject: model.subject,
            description: model.description,
            color: getColorForSubject(model.subject),
            features: model.features || ["AR View", "3D Rotation"],
            modelUrl: model.modelUrl,
            thumbnail: model.thumbnail,
            type: model.type,
            difficulty: model.difficulty,
            tags: model.tags || []
          }))
          setModels(backendModels)
        }
      } catch (error) {
        console.error('Error loading 3D models:', error)
        // Fallback to mock data
        setModels([
          {
            id: 1,
            name: "Human Heart",
            subject: "Biology",
            description: "Interactive 3D model of the human heart with detailed anatomy",
            color: "from-red-500 to-pink-600",
            features: ["AR View", "3D Rotation", "Anatomy Labels", "Blood Flow Animation"]
          },
          {
            id: 2,
            name: "DNA Helix",
            subject: "Biology",
            description: "Double helix structure with base pair interactions",
            color: "from-blue-500 to-purple-600",
            features: ["AR View", "3D Rotation", "Base Pairs", "Replication Animation"]
          },
          {
            id: 3,
            name: "Solar System",
            subject: "Physics",
            description: "Complete solar system with planetary orbits and moons",
            color: "from-yellow-500 to-orange-600",
            features: ["AR View", "Orbital Animation", "Scale Comparison", "Planet Details"]
          },
          {
            id: 4,
            name: "Molecule Structure",
            subject: "Chemistry",
            description: "3D molecular structure with atomic bonds and electron clouds",
            color: "from-green-500 to-teal-600",
            features: ["AR View", "3D Rotation", "Bond Visualization", "Electron Animation"]
          }
        ])
      } finally {
        setIsLoadingModels(false)
      }
    }

    loadModels()
  }, [selectedSubject, selectedGrade])

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
  }

  const aiTooltips = [
    {
      id: 1,
      position: { x: 20, y: 30 },
      title: "Cardiac Chambers",
      content: "The heart has four chambers: two atria and two ventricles",
      isVisible: true
    },
    {
      id: 2,
      position: { x: 60, y: 50 },
      title: "Blood Vessels",
      content: "Arteries carry blood away from the heart, veins carry blood to the heart",
      isVisible: true
    },
    {
      id: 3,
      position: { x: 40, y: 70 },
      title: "Valves",
      content: "Valves prevent backflow of blood between chambers",
      isVisible: true
    }
  ]

  const handleRotation = (axis, direction) => {
    setRotation(prev => ({
      ...prev,
      [axis]: prev[axis] + (direction === 'positive' ? 15 : -15)
    }))
  }

  const handleZoom = (direction) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + (direction === 'in' ? 0.2 : -0.2))))
  }

  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 })
    setZoom(1)
  }

  const toggleARMode = () => {
    setIsARMode(!isARMode)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const nextModel = () => {
    setCurrentModel((prev) => (prev + 1) % models.length)
    resetView()
  }

  const prevModel = () => {
    setCurrentModel((prev) => (prev - 1 + models.length) % models.length)
    resetView()
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              AR/3D Learning Module
            </h1>
            <p className="text-slate-600 text-lg">
              Interactive 3D models with AR capabilities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAIAssistant(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              <Brain className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => setShowAITooltips(!showAITooltips)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                showAITooltips 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
              <span>AI Tips</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            <option value="Biology">Biology</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Computer Science">Computer Science</option>
          </select>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Model Selection Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">3D Models</h3>
            {isLoadingModels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading models...</span>
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No 3D models found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {models.map((model, index) => (
                  <button
                    key={model.id}
                    onClick={() => setCurrentModel(index)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      currentModel === index
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${model.color} rounded-lg flex items-center justify-center`}>
                        <Box className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{model.name}</h4>
                        <p className="text-sm opacity-80">{model.subject}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-80 line-clamp-2">{model.description}</p>
                    {model.difficulty && (
                      <div className="mt-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {model.difficulty}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 3D Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="glass-effect rounded-2xl overflow-hidden">
            {/* Viewer Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {models[currentModel].name}
                </h3>
                <div className="flex space-x-2">
                  {models[currentModel].features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevModel}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextModel}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Canvas Area */}
            <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200">
              {/* Placeholder for 3D Model */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-32 h-32 bg-gradient-to-r ${models[currentModel].color} rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-transform duration-500`}
                       style={{ 
                         transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${zoom})` 
                       }}>
                    <Box className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-slate-600 font-medium">3D Model Placeholder</p>
                  <p className="text-sm text-slate-500">Interactive 3D content will load here</p>
                </div>
              </div>

              {/* AR Mode Overlay */}
              {isARMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AR Mode Active</h3>
                    <p className="text-sm opacity-80">Point your camera at a flat surface</p>
                  </div>
                </motion.div>
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/80 flex items-center justify-center"
                >
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                    <p className="text-slate-600">Loading AR experience...</p>
                  </div>
                </motion.div>
              )}

              {/* AI Tooltips */}
              <AnimatePresence>
                {showAITooltips && aiTooltips.map((tooltip) => (
                  <motion.div
                    key={tooltip.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute"
                    style={{ 
                      left: `${tooltip.position.x}%`, 
                      top: `${tooltip.position.y}%` 
                    }}
                  >
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-3 max-w-xs shadow-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Brain className="w-4 h-4 text-primary-500" />
                        <h4 className="font-semibold text-slate-900 text-sm">{tooltip.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600">{tooltip.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Control Panel */}
            <div className="p-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                {/* Rotation Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-600">Rotation:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleRotation('x', 'negative')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRotation('y', 'negative')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetView}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-600">Zoom:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleZoom('out')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-slate-600">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => handleZoom('in')}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AR Toggle */}
                <button
                  onClick={toggleARMode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    isARMode
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isARMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{isARMode ? 'Exit AR' : 'AR View'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect rounded-2xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">View Controls</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  <Move3D className="w-4 h-4" />
                  <span className="text-sm">Free Rotate</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  <Maximize className="w-4 h-4" />
                  <span className="text-sm">Fullscreen</span>
                </button>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Animation</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Reset Animation</span>
                </button>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Audio</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download Model</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        user={user}
        currentContext={{
          page: 'ar_module',
          currentModel: models[currentModel],
          selectedSubject: selectedSubject,
          selectedGrade: selectedGrade
        }}
      />
    </div>
  )
}

export default ARModule
