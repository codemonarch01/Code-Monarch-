import React, { useState } from 'react'
import { gamifyAPI } from '../../api/api'

// Generic multiple-choice quiz component
// Props: { questions: [{ question, options: [..], correctIndex }], onComplete(result) }
const QuizChallenge = ({ questions = [], onComplete }) => {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [awarded, setAwarded] = useState({}) // per-question award flag

  const setAnswer = async (idx, val) => {
    setAnswers(prev => ({ ...prev, [idx]: val }))
    const q = questions[idx]
    const isCorrect = val === q.correctIndex
    const already = awarded[idx]
    if (isCorrect && !already) {
      const pts = Number(q.ecoPoints || 5)
      try {
        await gamifyAPI.completeTask({ taskType: 'tree_quiz_question_correct', ecoPoints: pts, questionIndex: idx })
      } catch {}
      try {
        // Notify navbar to perform a single, authoritative increment and persist
        window.dispatchEvent(new CustomEvent('eco-points-updated', { detail: { ecoPoints: pts } }))
      } catch {}
      setAwarded(prev => ({ ...prev, [idx]: true }))
    }
  }

  const submit = () => {
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct += 1
    })
    const result = {
      total: questions.length,
      correct,
      scorePercent: Math.round((correct / (questions.length || 1)) * 100)
    }
    setSubmitted(true)
    onComplete && onComplete(result)
  }

  if (!questions.length) {
    return <div className="text-gray-600">No quiz available.</div>
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-white rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Q{idx + 1}. {q.question}</div>
            <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">+{q.ecoPoints || 5} Eco Points</div>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q_${idx}`}
                  checked={answers[idx] === i}
                  onChange={() => setAnswer(idx, i)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {awarded[idx] && (
            <div className="text-green-600 text-sm mt-2">Awarded +{q.ecoPoints || 5} Eco Points</div>
          )}
        </div>
      ))}

      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">
        {submitted ? 'Submitted' : 'Submit'}
      </button>
    </div>
  )
}

export default QuizChallenge


