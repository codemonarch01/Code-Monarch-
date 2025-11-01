import React, { useState } from 'react'
import QuizChallenge from './QuizChallenge'
import { gamifyAPI } from '../../api/api'
import { motion } from 'framer-motion'
import { Thermometer, Droplets, Wind, Sun, AlertTriangle, Award, Zap, TrendingUp, Globe } from 'lucide-react'

const ClimateChangeModule = () => {
  const [selectedImpact, setSelectedImpact] = useState(null)
  const [carbonFootprint, setCarbonFootprint] = useState(0)

  const climateImpacts = [
    { 
      id: 'temperature', 
      name: 'Rising Temperatures', 
      icon: Thermometer, 
      color: 'red',
      data: '+1.1°C since 1880',
      description: 'Global average temperature increase',
      effects: ['Heat waves', 'Droughts', 'Wildfires', 'Crop failures']
    },
    { 
      id: 'sea-level', 
      name: 'Sea Level Rise', 
      icon: Droplets, 
      color: 'blue',
      data: '+3.3mm/year',
      description: 'Ocean level increase rate',
      effects: ['Coastal flooding', 'Island submergence', 'Saltwater intrusion', 'Displacement']
    },
    { 
      id: 'weather', 
      name: 'Extreme Weather', 
      icon: Wind, 
      color: 'purple',
      data: '40% increase',
      description: 'Frequency of extreme events',
      effects: ['Hurricanes', 'Floods', 'Storms', 'Heat waves']
    },
    { 
      id: 'ecosystem', 
      name: 'Ecosystem Stress', 
      icon: Globe, 
      color: 'green',
      data: '1M species at risk',
      description: 'Biodiversity loss threat',
      effects: ['Habitat loss', 'Species extinction', 'Migration changes', 'Food chain disruption']
    }
  ]

  const carbonActions = [
    { action: 'Use LED bulbs', reduction: 5, icon: '💡' },
    { action: 'Walk/cycle instead of drive', reduction: 15, icon: '🚶' },
    { action: 'Eat less meat', reduction: 20, icon: '🥗' },
    { action: 'Use public transport', reduction: 10, icon: '🚌' },
    { action: 'Reduce air travel', reduction: 25, icon: '✈️' },
    { action: 'Use renewable energy', reduction: 30, icon: '☀️' },
    { action: 'Reduce, reuse, recycle', reduction: 8, icon: '♻️' },
    { action: 'Plant trees', reduction: 12, icon: '🌳' }
  ]

  const quizQs = [
    {
      question: 'What is the main driver of recent climate change?',
      options: ['Solar cycles', 'Volcanic activity', 'Human greenhouse gas emissions', 'Cosmic rays'],
      correctIndex: 2,
      explanation: 'Human activities, especially burning fossil fuels, have increased greenhouse gas concentrations dramatically since the Industrial Revolution.'
    },
    {
      question: 'Which is the most effective action to reduce your carbon footprint?',
      options: ['Use more single-use plastics', 'Switch to renewable energy and improve efficiency', 'Ignore home insulation', 'Drive more often'],
      correctIndex: 1,
      explanation: 'Renewable energy and energy efficiency have the highest impact on reducing carbon emissions from daily activities.'
    },
    {
      question: 'How much has global temperature risen since 1880?',
      options: ['0.5°C', '1.1°C', '2.0°C', '3.5°C'],
      correctIndex: 1,
      explanation: 'Global average temperature has risen approximately 1.1°C since pre-industrial times, with most warming occurring in recent decades.'
    },
    {
      question: 'What percentage of CO₂ emissions come from fossil fuels?',
      options: ['60%', '75%', '85%', '95%'],
      correctIndex: 2,
      explanation: 'About 85% of CO₂ emissions come from burning fossil fuels for electricity, heat, and transportation.'
    },
    {
      question: 'Which sector produces the most greenhouse gas emissions?',
      options: ['Transportation', 'Electricity generation', 'Agriculture', 'Industry'],
      correctIndex: 1,
      explanation: 'Electricity generation is the largest source of greenhouse gas emissions, primarily from coal and natural gas power plants.'
    }
  ]

  const handleActionClick = (reduction) => {
    setCarbonFootprint(prev => Math.max(0, prev + reduction))
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Lesson Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <Thermometer className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-orange-800">Climate Change Awareness</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">What is Climate Change?</h4>
            <p className="text-sm text-orange-600 mb-3">
              Long-term shifts in global temperatures and weather patterns, primarily caused by human activities since the mid-20th century.
            </p>
            <ul className="text-sm text-orange-600 space-y-1">
              <li>• Greenhouse gas concentrations at highest levels in 800,000 years</li>
              <li>• Global temperature rising 0.2°C per decade</li>
              <li>• Arctic ice melting 13% per decade</li>
              <li>• Sea levels rising 3.3mm annually</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Why It Matters</h4>
            <ul className="text-sm text-orange-600 space-y-1">
              <li>• Threatens food security</li>
              <li>• Increases natural disasters</li>
              <li>• Endangers biodiversity</li>
              <li>• Affects human health</li>
              <li>• Impacts global economy</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Climate Impact Visualizations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Climate Impact Visualizations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {climateImpacts.map((impact) => {
            const Icon = impact.icon
            return (
              <motion.div
                key={impact.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedImpact === impact.id
                    ? `border-${impact.color}-500 bg-${impact.color}-50`
                    : `border-${impact.color}-200 hover:border-${impact.color}-400`
                }`}
                onClick={() => setSelectedImpact(selectedImpact === impact.id ? null : impact.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 text-${impact.color}-600`} />
                  <div>
                    <h4 className={`font-semibold text-${impact.color}-800`}>{impact.name}</h4>
                    <p className={`text-sm text-${impact.color}-600`}>{impact.data}</p>
                  </div>
                </div>
                <p className={`text-xs text-${impact.color}-700 mb-2`}>{impact.description}</p>
                
                {selectedImpact === impact.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <h5 className="font-medium text-gray-800 mb-2">Key Effects:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {impact.effects.map((effect, index) => (
                        <li key={index}>• {effect}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Carbon Footprint Calculator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-600" />
          Carbon Footprint Reduction Challenge
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-green-700">Your Carbon Reduction:</span>
            <span className="text-lg font-bold text-green-800">{carbonFootprint}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-green-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(carbonFootprint, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {carbonActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action.reduction)}
              className="p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors text-center"
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-xs font-medium text-gray-800">{action.action}</div>
              <div className="text-xs text-green-600 font-semibold">-{action.reduction}%</div>
            </motion.button>
          ))}
        </div>

        {carbonFootprint >= 50 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-green-100 rounded-lg text-center"
          >
            <p className="text-green-800 font-semibold">
              🌟 Great job! You've reduced your carbon footprint by {carbonFootprint}%!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Climate Solutions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-600" />
          Climate Solutions & Actions
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2">Individual Actions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use energy-efficient appliances</li>
              <li>• Reduce meat consumption</li>
              <li>• Use public transport</li>
              <li>• Plant trees</li>
              <li>• Reduce waste</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">Community Actions</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Support renewable energy</li>
              <li>• Advocate for green policies</li>
              <li>• Join environmental groups</li>
              <li>• Educate others</li>
              <li>• Support sustainable businesses</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2">Global Solutions</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Carbon pricing</li>
              <li>• Renewable energy transition</li>
              <li>• Forest conservation</li>
              <li>• Climate adaptation</li>
              <li>• International cooperation</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Quiz */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600" />
          Climate Change Knowledge Quiz
        </h3>
        <p className="text-gray-600 mb-4">
          Test your understanding of climate change science and solutions!
        </p>
        <QuizChallenge
          questions={quizQs}
          onComplete={async (res) => {
            try {
              // Calculate eco points based on quiz performance
              let ecoPoints = 0;
              if (res.scorePercent >= 90) {
                ecoPoints = 50; // Excellent
              } else if (res.scorePercent >= 80) {
                ecoPoints = 40; // Very good
              } else if (res.scorePercent >= 70) {
                ecoPoints = 30; // Good
              } else if (res.scorePercent >= 60) {
                ecoPoints = 20; // Satisfactory
              } else {
                ecoPoints = 10; // Participation
              }
              
              console.log('🌱 Climate Quiz completed:', { score: res.scorePercent, ecoPoints });
              
              // Award eco points via gamification API
              const response = await gamifyAPI.completeTask({ 
                taskType: 'climate_quiz_completed',
                ecoPoints: ecoPoints,
                score: res.scorePercent
              });
              
              // Update eco points in navbar
              if (ecoPoints > 0) {
                window.dispatchEvent(new CustomEvent('eco-points-updated', { 
                  detail: { ecoPoints: ecoPoints } 
                }));
                
                // Update localStorage
                const currentPoints = parseInt(localStorage.getItem('ecoPoints') || '0');
                const newPoints = currentPoints + ecoPoints;
                localStorage.setItem('ecoPoints', newPoints.toString());
                
                // Show notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                notification.innerHTML = `
                  <div class="flex items-center space-x-2">
                    <span class="font-bold">+${ecoPoints} Eco Points!</span>
                    <span class="text-sm">Climate Quiz: ${res.scorePercent}%</span>
                  </div>
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                  notification.remove();
                }, 3000);
              }
            } catch (error) {
              console.error('Error awarding eco points:', error);
            }
          }}
        />
      </motion.div>
    </div>
  )
}

export default ClimateChangeModule


