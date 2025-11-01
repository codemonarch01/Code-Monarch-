import React, { useEffect, useState } from 'react'
import { contentAPI } from '../api/api'
import TreePlantingModule from '../components/gamified/TreePlantingModule'
import WasteSegregationModule from '../components/gamified/WasteSegregationModule'
import ClimateChangeModule from '../components/gamified/ClimateChangeModule'

const GamifiedLearning = ({ user }) => {
  const [modules, setModules] = useState([
    { id: 'tree-planting', name: 'Tree Planting', description: 'Learn about environmental conservation' },
    { id: 'waste-segregation', name: 'Waste Segregation', description: 'Master waste management' },
    { id: 'climate-change', name: 'Climate Change', description: 'Understand climate science' }
  ])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        console.log('🔄 Loading gamified modules...')
        const res = await contentAPI.getClasses()
        console.log('📡 API response:', res)
        if (res.data && res.data.status === 'success') {
          const apiModules = res.data.data.modules || []
          if (apiModules.length > 0) {
            console.log('✅ Using API modules:', apiModules)
            setModules(apiModules)
          } else {
            console.log('⚠️ API returned empty modules, using fallback')
          }
        } else {
          console.log('⚠️ API failed, using fallback modules')
        }
      } catch (e) {
        console.log('❌ API error, using fallback modules:', e.message)
      }
    }
    load()
  }, [])

  const renderModule = (id) => {
    console.log('🎯 Rendering module:', id)
    switch (id) {
      case 'tree-planting':
        return <TreePlantingModule currentModel={null} onAward={() => {}} />
      case 'waste-segregation':
        return <WasteSegregationModule />
      case 'climate-change':
        return <ClimateChangeModule />
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <div className="text-xl font-semibold text-gray-700 mb-2">Welcome to Gamified Learning!</div>
            <div className="text-gray-600">Select a module from the list to begin your interactive environmental learning journey.</div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Gamified Environmental Learning</h1>
          <p className="text-slate-600">Choose a module to begin an interactive lesson.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {console.log('🔍 Rendering modules:', modules)}
            {modules.length > 0 ? (
              modules.map(m => (
                <button key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${selected===m.id? 'bg-green-50 border-green-200':'bg-white border-gray-200 hover:border-green-300'}`}>
                  <div className="font-semibold text-gray-800">{m.name || m.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{m.description}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg font-semibold">Loading modules...</div>
                <div className="text-sm">Please wait while we load the gamified learning modules.</div>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border">
              {renderModule(selected)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamifiedLearning


