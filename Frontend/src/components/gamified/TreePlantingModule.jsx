import React, { useEffect, useMemo, useState, Suspense } from 'react'
import { aiAPI, gamifyAPI } from '../../api/api'
import QuizChallenge from './QuizChallenge'
import { motion } from 'framer-motion'
import { TreePine, Droplets, Sun, Leaf, Zap, Award } from 'lucide-react'
import { useProfile } from '../../context/ProfileContext'

const TreeAR = React.lazy(() => import('./TreeAR.jsx'))

const TreePlantingModule = ({ currentModel, onAward }) => {
  const [message, setMessage] = useState('')
  const [showAR, setShowAR] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { profileData } = useProfile?.() || { profileData: { name: '' } }
  const [certificates, setCertificates] = useState([])

  const CERT_STORAGE_KEY = 'tree_planting_certificates'
  const QUIZ_TITLE = 'Tree Planting Awareness Quiz'
  const SIMPLECART_ENDPOINT = 'https://api.simplecart.dev/certificates' // fallback if unreachable handled below
  const SIMPLECART_API_KEY = 'QVDQv25OZ0Y2acg0rXkHPyVdQzFzJV6tcwE3YosgBtw8Me8FattztJlOo65a'

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CERT_STORAGE_KEY)
      if (raw) setCertificates(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certificates))
    } catch {}
  }, [certificates])

  // Listen for AR task completion
  useEffect(() => {
    const handleARTaskCompleted = async (event) => {
      try {
        const { type, points } = event.detail || {}
        if (type === 'tree_planting' && points) {
          setMessage(`🌱 Tree planted successfully in AR! +${points} Eco Points`)
          // Award eco-points in backend
          try {
            await gamifyAPI.completeTask({ taskType: 'ar_tree_planting', ecoPoints: points })
          } catch (e) {
            console.warn('Failed to record AR task completion:', e)
          }
          // Award points via callback
          if (onAward) {
            onAward({ type: 'ar_task', points })
          }
        }
      } catch (e) {
        console.error('Error handling AR task completion:', e)
      }
    }

    window.addEventListener('ar-task-completed', handleARTaskCompleted)
    return () => {
      window.removeEventListener('ar-task-completed', handleARTaskCompleted)
    }
  }, [onAward])

  const studentName = useMemo(() => {
    if (profileData?.name) return profileData.name
    try {
      const saved = JSON.parse(localStorage.getItem('profileData') || '{}')
      if (saved?.name) return saved.name
    } catch {}
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user?.name) return user.name
      if (user?.username) return user.username
    } catch {}
    return 'Student'
  }, [profileData])

  const createFallbackPdfBlob = (data) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Certificate</title></head><body style="font-family:Arial,Helvetica,sans-serif;padding:40px;background:#0b1220;color:#e6edf3;">
      <div style="border:2px solid #1f2a44;border-radius:16px;padding:32px;max-width:800px;margin:0 auto;background:linear-gradient(180deg,#0d1628,#0a0f1f)">
        <h1 style="text-align:center;margin:0 0 8px 0;color:#d2a8ff">Certificate of Achievement</h1>
        <p style="text-align:center;margin:0 0 24px 0;color:#8b949e">Gamified Environmental Learning</p>
        <hr style="border:0;border-top:1px solid #1f2a44;margin:24px 0"/>
        <h2 style="text-align:center;margin:16px 0;color:#7ee787">${data.quizTitle}</h2>
        <p style="text-align:center;font-size:18px;margin:12px 0 24px 0;">Awarded to <strong>${data.studentName}</strong></p>
        <p style="text-align:center;font-size:16px;margin:6px 0;">Score: <strong>${data.correct}/${data.total}</strong> (${data.scorePercent}%)</p>
        <p style="text-align:center;font-size:14px;margin:6px 0;color:#8b949e">Date: ${new Date(data.completedAt).toLocaleDateString()}</p>
        <p style="text-align:center;font-size:16px;margin:24px 0;color:#79c0ff">${data.tagline}</p>
        <div style="margin-top:32px;display:flex;justify-content:center;color:#8b949e">EduLearn • Gamified Tree Planting</div>
      </div>
    </body></html>`
    return new Blob([html], { type: 'text/html' })
  }

  const generateCertificate = async (result) => {
    const payload = {
      studentName,
      quizTitle: QUIZ_TITLE,
      scorePercent: result.scorePercent,
      correct: result.correct,
      total: result.total,
      completedAt: new Date().toISOString(),
      tagline: "You’ve contributed to a greener planet!"
    }

    let certUrl = ''
    let certId = `local-${Date.now()}`

    try {
      const res = await fetch(SIMPLECART_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SIMPLECART_API_KEY
        },
        body: JSON.stringify({ template: 'eco-quiz', data: payload })
      })
      if (!res.ok) throw new Error('Certificate API error')
      const data = await res.json()
      certUrl = data?.url || data?.certificateUrl || ''
      certId = data?.id || certId
    } catch (e) {
      try {
        const blob = createFallbackPdfBlob(payload)
        certUrl = URL.createObjectURL(blob)
      } catch {}
    }

    const entry = { id: certId, url: certUrl, ...payload }
    setCertificates(prev => [entry, ...prev])
  }

  const doArTask = async () => {
    try {
      // Always open AR, even without a 3D model
      setShowAR(true)
      setMessage('🌱 Opening AR experience...')
      
      // If model is available, record interaction
      if (currentModel?.id) {
        try {
          await aiAPI.interactWithModel(currentModel.id, 'tree_planting')
        } catch (e) {
          console.warn('Failed to record model interaction:', e)
        }
      }
    } catch (e) {
      console.error('AR task error:', e)
      setMessage('⚠️ Could not open AR. Please try again.')
    }
  }

  const plantingSteps = [
    { icon: Sun, title: "Choose Location", desc: "Select a spot with 6+ hours of sunlight daily" },
    { icon: TreePine, title: "Dig Hole", desc: "Make hole 2-3x wider than root ball, same depth" },
    { icon: Leaf, title: "Plant Sapling", desc: "Place tree, backfill with native soil" },
    { icon: Droplets, title: "Water & Mulch", desc: "Water deeply, add 2-3 inch mulch ring" },
    { icon: Zap, title: "Monitor Growth", desc: "Check weekly for first 2 years" }
  ]

  const quizQs = [
    {
      question: 'What is the best season to plant most trees?',
      options: ['Peak summer (June-August)', 'Monsoon/early fall (July-September)', 'Peak winter (December-February)', 'Any time of year'],
      correctIndex: 1,
      ecoPoints: 5,
      explanation: 'Monsoon and early fall provide optimal conditions with adequate moisture and moderate temperatures for root establishment.'
    },
    {
      question: 'What is the most important step after planting a sapling?',
      options: ['No watering needed', 'Remove surrounding soil', 'Mulching and regular watering', 'Break the roots'],
      correctIndex: 2,
      ecoPoints: 5,
      explanation: 'Mulching conserves moisture and watering ensures proper hydration during the critical establishment period.'
    },
    {
      question: 'How deep should you dig the planting hole?',
      options: ['Same depth as root ball', 'Twice as deep as root ball', 'Half the depth of root ball', 'As deep as possible'],
      correctIndex: 0,
      ecoPoints: 5,
      explanation: 'The hole should be the same depth as the root ball to prevent the tree from settling too deep.'
    },
    {
      question: 'What type of mulch is best for newly planted trees?',
      options: ['Plastic sheets', 'Wood chips or bark', 'Rocks and stones', 'Fresh grass clippings'],
      correctIndex: 1,
      ecoPoints: 5,
      explanation: 'Wood chips or bark mulch decompose slowly, retain moisture, and regulate soil temperature.'
    },
    {
      question: 'How often should you water a newly planted tree?',
      options: ['Daily for 1 month', '2-3 times per week for first year', 'Only when it rains', 'Once every 2 weeks'],
      correctIndex: 1,
      ecoPoints: 5,
      explanation: 'Newly planted trees need consistent moisture 2-3 times per week during the first growing season.'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced Lesson Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <TreePine className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-green-800">Tree Planting Fundamentals</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Why Trees Matter</h4>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Absorb CO₂ and produce oxygen</li>
              <li>• Prevent soil erosion and flooding</li>
              <li>• Provide habitat for wildlife</li>
              <li>• Cool urban areas by 2-8°C</li>
              <li>• Reduce air pollution by 60%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Tree Selection Tips</h4>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Choose native species</li>
              <li>• Consider mature size</li>
              <li>• Check soil compatibility</li>
              <li>• Plan for root space</li>
              <li>• Select disease-resistant varieties</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Step-by-Step Planting Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Step-by-Step Planting Guide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {plantingSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentStep === index 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                  currentStep === index ? 'text-green-600' : 'text-gray-400'
                }`} />
                <h4 className={`font-semibold text-sm text-center ${
                  currentStep === index ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs text-center mt-1 ${
                  currentStep === index ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
        
        {currentStep < plantingSteps.length && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Step {currentStep + 1}: {plantingSteps[currentStep].title}
            </h4>
            <p className="text-blue-700">{plantingSteps[currentStep].desc}</p>
          </div>
        )}
      </motion.div>

      {/* AR/3D Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
      >
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TreePine className="w-5 h-5 text-purple-600" />
          AR/3D Interactive Activity
        </h3>
        <p className="text-gray-700 mb-4">
          Experience tree planting in augmented reality! Place a virtual sapling and follow the interactive planting steps.
        </p>
        <div className="flex gap-3 flex-wrap items-center">
          <button 
            onClick={doArTask} 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <TreePine className="w-4 h-4" />
            Plant Tree (AR)
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4 text-yellow-500" />
            Earn 20 Eco Points
          </div>
        </div>
        {message && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm mt-3 p-2 rounded ${
              message.includes('successfully') || message.includes('+20') 
                ? 'text-green-600 bg-green-100' 
                : 'text-blue-600 bg-blue-100'
            }`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>

      {showAR && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', zIndex: 40 }}>Loading AR...</div>}>
          <TreeAR onClose={() => setShowAR(false)} />
        </Suspense>
      )}

      {/* Enhanced Quiz */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600" />
          Knowledge Check Quiz
        </h3>
        <p className="text-gray-600 mb-4">
          Test your tree planting knowledge! Answer all questions correctly to earn bonus eco points.
        </p>
        <QuizChallenge
          questions={quizQs}
          onComplete={async (res) => {
            // Per-question points are already awarded instantly in QuizChallenge
            console.log('🌱 Tree Planting Quiz completed:', { score: res.scorePercent });
            try {
              await generateCertificate(res)
              
              // Dispatch event for verified achievement
              window.dispatchEvent(new CustomEvent('quiz-completed', {
                detail: {
                  quizTitle: QUIZ_TITLE,
                  completedAt: new Date().toISOString(),
                  scorePercent: res.scorePercent,
                  correct: res.correct,
                  total: res.total,
                  moduleType: 'tree-planting'
                }
              }))
            } catch {}
          }}
        />
      </motion.div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl p-6 border bg-slate-950/90 border-slate-800 mt-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-100">
            <Award className="w-5 h-5 text-yellow-400" />
            Your Certificates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4"
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(600px circle at 0 0, rgba(56,189,248,0.15), transparent 40%)' }} />
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-200 font-semibold truncate">{c.quizTitle}</div>
                  <span className="text-xs text-slate-400">{new Date(c.completedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-slate-300 text-sm mb-1">{c.studentName}</div>
                <div className="text-slate-400 text-xs mb-3">Score: {c.correct}/{c.total} ({c.scorePercent}%)</div>
                <div className="text-cyan-300 text-xs mb-4">{c.tagline}</div>
                <div className="flex gap-2">
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm transition-colors"
                      title="Download Certificate"
                    >
                      🎓 Download Certificate
                    </a>
                  ) : (
                    <button disabled className="px-3 py-2 rounded-md bg-slate-800 text-slate-500 text-sm">Generating...</button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TreePlantingModule


