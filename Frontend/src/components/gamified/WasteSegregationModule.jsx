import React, { useState } from 'react'
import QuizChallenge from './QuizChallenge'
import { gamifyAPI } from '../../api/api'
import { motion } from 'framer-motion'
import { Recycle, Trash2, Leaf, AlertTriangle, Award, Zap, CheckCircle } from 'lucide-react'

const WasteSegregationModule = () => {
  const [selectedBin, setSelectedBin] = useState(null)
  const [dragItem, setDragItem] = useState(null)

  const wasteCategories = [
    { 
      id: 'wet', 
      name: 'Wet Waste', 
      color: 'green', 
      icon: Leaf, 
      items: ['Banana peel', 'Vegetable scraps', 'Tea leaves', 'Egg shells', 'Leftover food'],
      description: 'Organic waste that decomposes naturally'
    },
    { 
      id: 'dry', 
      name: 'Dry Waste', 
      color: 'blue', 
      icon: Recycle, 
      items: ['Glass bottles', 'Paper', 'Cardboard', 'Metal cans', 'Textiles'],
      description: 'Non-organic recyclable materials'
    },
    { 
      id: 'plastic', 
      name: 'Plastic', 
      color: 'red', 
      icon: Trash2, 
      items: ['Plastic bottles', 'Packaging', 'Bags', 'Containers', 'Toys'],
      description: 'Plastic materials for recycling'
    },
    { 
      id: 'hazardous', 
      name: 'Hazardous', 
      color: 'black', 
      icon: AlertTriangle, 
      items: ['Batteries', 'Medicines', 'Paints', 'Chemicals', 'E-waste'],
      description: 'Dangerous materials requiring special disposal'
    }
  ]

  const quizQs = [
    {
      question: 'Which bin should banana peel go into?',
      options: ['Dry Waste (Blue)', 'Wet Waste (Green)', 'Plastic (Red)', 'Hazardous (Black)'],
      correctIndex: 1,
      explanation: 'Banana peels are organic waste that decompose naturally, so they go in the wet waste bin.'
    },
    {
      question: 'Where should a glass bottle be disposed?',
      options: ['Wet Waste (Green)', 'Hazardous (Black)', 'Dry Waste (Blue)', 'Plastic (Red)'],
      correctIndex: 2,
      explanation: 'Glass bottles are recyclable dry waste and should go in the blue dry waste bin.'
    },
    {
      question: 'What should you do with old batteries?',
      options: ['Throw in regular trash', 'Put in wet waste', 'Take to hazardous waste collection', 'Burn them'],
      correctIndex: 2,
      explanation: 'Batteries contain toxic chemicals and must be disposed of at hazardous waste collection centers.'
    },
    {
      question: 'Which items can be composted?',
      options: ['Plastic bags', 'Fruit peels and vegetable scraps', 'Glass bottles', 'Metal cans'],
      correctIndex: 1,
      explanation: 'Fruit peels and vegetable scraps are organic materials that decompose and can be composted.'
    },
    {
      question: 'What is the 3R principle in waste management?',
      options: ['Reduce, Reuse, Recycle', 'Read, Write, Remember', 'Run, Rest, Repeat', 'Red, Blue, Green'],
      correctIndex: 0,
      explanation: 'The 3R principle stands for Reduce (less waste), Reuse (use again), and Recycle (process into new materials).'
    }
  ]

  const wasteItems = [
    { name: 'Banana Peel', category: 'wet', icon: '🍌' },
    { name: 'Glass Bottle', category: 'dry', icon: '🍾' },
    { name: 'Plastic Bag', category: 'plastic', icon: '🛍️' },
    { name: 'Old Battery', category: 'hazardous', icon: '🔋' },
    { name: 'Paper', category: 'dry', icon: '📄' },
    { name: 'Food Scraps', category: 'wet', icon: '🥕' },
    { name: 'Medicine', category: 'hazardous', icon: '💊' },
    { name: 'Cardboard', category: 'dry', icon: '📦' }
  ]

  const handleDragStart = (item) => {
    setDragItem(item)
  }

  const handleDrop = (binId) => {
    if (dragItem) {
      const correctCategory = wasteCategories.find(cat => cat.id === binId)
      const isCorrect = dragItem.category === binId
      
      if (isCorrect) {
        setSelectedBin({ ...correctCategory, correct: true })
      } else {
        setSelectedBin({ ...correctCategory, correct: false })
      }
      
      setDragItem(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Lesson Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <Recycle className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-800">Waste Segregation Mastery</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Why Segregation Matters</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Reduces landfill waste by 60%</li>
              <li>• Enables proper recycling</li>
              <li>• Prevents soil and water pollution</li>
              <li>• Creates compost for agriculture</li>
              <li>• Reduces greenhouse gas emissions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Segregation Benefits</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Cleaner environment</li>
              <li>• Resource conservation</li>
              <li>• Energy savings</li>
              <li>• Job creation in recycling</li>
              <li>• Sustainable future</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Interactive Waste Sorting Game */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Interactive Waste Sorting Challenge
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {wasteCategories.map((category) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBin?.id === category.id
                    ? selectedBin.correct 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                    : `border-${category.color}-200 hover:border-${category.color}-400`
                }`}
                onDrop={() => handleDrop(category.id)}
                onDragOver={(e) => e.preventDefault()}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 text-${category.color}-600`} />
                <h4 className={`font-semibold text-sm text-center text-${category.color}-800`}>
                  {category.name}
                </h4>
                <p className="text-xs text-center mt-1 text-gray-600">
                  {category.description}
                </p>
                {selectedBin?.id === category.id && (
                  <div className="mt-2 text-center">
                    {selectedBin.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {wasteItems.map((item, index) => (
            <motion.div
              key={index}
              draggable
              onDragStart={() => handleDragStart(item)}
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-gray-100 rounded-lg cursor-move hover:bg-gray-200 transition-colors text-center"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium">{item.name}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Instructions:</strong> Drag waste items to the correct bins. Green checkmark = correct, Red warning = wrong!
          </p>
        </div>
      </motion.div>

      {/* Waste Category Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Recycle className="w-5 h-5 text-green-600" />
          Waste Categories Guide
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {wasteCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.id} className={`p-4 rounded-lg border-l-4 border-${category.color}-500 bg-${category.color}-50`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 text-${category.color}-600`} />
                  <h4 className={`font-semibold text-${category.color}-800`}>{category.name}</h4>
                </div>
                <p className={`text-sm text-${category.color}-700 mb-2`}>{category.description}</p>
                <div className="text-xs text-gray-600">
                  <strong>Examples:</strong> {category.items.join(', ')}
                </div>
              </div>
            )
          })}
      </div>
      </motion.div>

      {/* Enhanced Quiz */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-orange-600" />
          Waste Management Quiz
        </h3>
        <p className="text-gray-600 mb-4">
          Test your waste segregation knowledge! Master the art of proper waste disposal.
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
              
              console.log('🌱 Waste Segregation Quiz completed:', { score: res.scorePercent, ecoPoints });
              
              // Award eco points via gamification API
              const response = await gamifyAPI.completeTask({ 
                taskType: 'waste_segregation_quiz_completed',
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
                    <span class="text-sm">Waste Quiz: ${res.scorePercent}%</span>
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

export default WasteSegregationModule


