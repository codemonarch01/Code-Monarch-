import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Star,
  Clock,
  Target,
  Brain
} from 'lucide-react';

const QuizComponent = ({ topic, onComplete, onEcoPointsEarned, difficulty = 'medium' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question

  // Generate quiz questions based on topic
  const generateQuizQuestions = (topic) => {
    const questions = {
      'Electromagnetism': [
        {
          question: "What is the unit of electric current?",
          options: ["Volt", "Ampere", "Ohm", "Watt"],
          correct: 1,
          explanation: "Ampere (A) is the SI unit of electric current."
        },
        {
          question: "Which law describes the relationship between voltage, current, and resistance?",
          options: ["Newton's Law", "Ohm's Law", "Faraday's Law", "Coulomb's Law"],
          correct: 1,
          explanation: "Ohm's Law states that V = IR, where V is voltage, I is current, and R is resistance."
        },
        {
          question: "What type of current flows in one direction only?",
          options: ["Alternating Current", "Direct Current", "Induced Current", "Static Current"],
          correct: 1,
          explanation: "Direct Current (DC) flows in one direction only, unlike Alternating Current (AC)."
        }
      ],
      'Optics': [
        {
          question: "What is the speed of light in vacuum?",
          options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10¹² m/s"],
          correct: 1,
          explanation: "The speed of light in vacuum is approximately 3 × 10⁸ m/s."
        },
        {
          question: "Which phenomenon causes a pencil to appear bent in water?",
          options: ["Reflection", "Refraction", "Diffraction", "Interference"],
          correct: 1,
          explanation: "Refraction causes light to bend when it passes from one medium to another."
        }
      ],
      'Modern Physics': [
        {
          question: "Who proposed the photoelectric effect?",
          options: ["Newton", "Einstein", "Maxwell", "Planck"],
          correct: 1,
          explanation: "Einstein explained the photoelectric effect, which earned him the Nobel Prize."
        },
        {
          question: "What is the dual nature of light?",
          options: ["Wave only", "Particle only", "Both wave and particle", "Neither"],
          correct: 2,
          explanation: "Light exhibits both wave and particle properties, known as wave-particle duality."
        }
      ],
      'Database Management': [
        {
          question: "What does SQL stand for?",
          options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"],
          correct: 0,
          explanation: "SQL stands for Structured Query Language, used for managing relational databases."
        },
        {
          question: "What is the primary key in a database table?",
          options: ["A key that opens the database", "A unique identifier for each row", "The first column", "A foreign key"],
          correct: 1,
          explanation: "A primary key is a unique identifier that distinguishes each row in a table."
        },
        {
          question: "What is database normalization?",
          options: ["Making databases faster", "Organizing data to reduce redundancy", "Adding more tables", "Deleting old data"],
          correct: 1,
          explanation: "Normalization is the process of organizing data to minimize redundancy and dependency."
        }
      ],
      'Database Design': [
        {
          question: "What is an Entity-Relationship Diagram (ERD)?",
          options: ["A database table", "A visual representation of database structure", "A query language", "A backup system"],
          correct: 1,
          explanation: "An ERD is a visual representation showing entities and their relationships in a database."
        },
        {
          question: "What is the purpose of foreign keys?",
          options: ["To make tables faster", "To establish relationships between tables", "To encrypt data", "To delete data"],
          correct: 1,
          explanation: "Foreign keys establish relationships between tables by referencing primary keys in other tables."
        }
      ],
      'SQL Queries': [
        {
          question: "Which SQL command is used to retrieve data?",
          options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
          correct: 2,
          explanation: "SELECT is used to retrieve data from database tables."
        },
        {
          question: "What does the WHERE clause do in SQL?",
          options: ["Sorts data", "Filters data based on conditions", "Groups data", "Joins tables"],
          correct: 1,
          explanation: "The WHERE clause filters rows based on specified conditions."
        }
      ]
    };

  // Default questions if topic not found
  const defaultQuestions = [
    {
      question: `What is the main concept in ${topic || 'this topic'}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
      explanation: "This is a fundamental concept in this topic."
    },
    {
      question: `Which principle is most important in ${topic || 'this topic'}?`,
      options: ["Principle 1", "Principle 2", "Principle 3", "Principle 4"],
      correct: 1,
      explanation: "This principle is crucial for understanding the topic."
    }
  ];

    return questions[topic] || defaultQuestions;
  };

  let questions = generateQuizQuestions(topic);
  // Ensure a minimum of 10 questions by auto-generating variations if needed
  const ensureMinQuestions = (items, minCount = 10) => {
    const out = [...items];
    let i = 0;
    while (out.length < minCount) {
      const base = items[i % items.length] || {
        question: `Which statement is true about ${topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0,
        explanation: `Key concept related to ${topic}.`
      };
      // create a slight variation
      const variant = {
        question: `${base.question} (v${out.length - items.length + 1})`,
        options: [...base.options],
        correct: base.correct,
        explanation: base.explanation
      };
      out.push(variant);
      i++;
    }
    return out;
  };

  questions = ensureMinQuestions(questions, 10);
  // Adjust number of questions by difficulty
  if (difficulty === 'low') {
    questions = questions.slice(0, 10); // still minimum 10
  } else if (difficulty === 'medium') {
    questions = questions.slice(0, Math.max(10, Math.ceil(questions.length * 1.0)));
  } // 'high' already at 10+
  const currentQ = questions[currentQuestion];

  // Timer effect
  React.useEffect(() => {
    if (!completed && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswerSubmit(null);
    }
  }, [timeLeft, completed, showResult]);

  const handleAnswerSubmit = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === currentQ.correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setCompleted(true);
      // Calculate eco points based on performance
      const percentage = Math.round((score / questions.length) * 100);
      let ecoPoints = 0;
      
      if (percentage >= 90) {
        ecoPoints = 50; // Excellent performance
      } else if (percentage >= 80) {
        ecoPoints = 40; // Very good performance
      } else if (percentage >= 70) {
        ecoPoints = 30; // Good performance
      } else if (percentage >= 60) {
        ecoPoints = 20; // Satisfactory performance
      } else {
        ecoPoints = 10; // Participation points
      }
      
      // Award eco points
      if (onEcoPointsEarned) {
        onEcoPointsEarned(ecoPoints, percentage);
      }
      
      onComplete && onComplete(score, questions.length, ecoPoints, percentage);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
    setTimeLeft(30);
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isExcellent ? 'bg-green-100' : isGood ? 'bg-yellow-100' : 'bg-red-100'
            }`}
          >
            {isExcellent ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : isGood ? (
              <Star className="w-10 h-10 text-yellow-600" />
            ) : (
              <Target className="w-10 h-10 text-red-600" />
            )}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isExcellent ? 'Excellent Work!' : isGood ? 'Good Job!' : 'Keep Learning!'}
          </h2>
          <p className="text-gray-600 mb-2">
            You scored {score} out of {questions.length} questions ({percentage}%)
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                +{Math.round((score / questions.length) * 50)} Eco Points Earned!
              </span>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-green-600">
                Your eco points have been added to your account
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            onClick={handleRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Quick Quiz ({difficulty})</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span className={timeLeft <= 10 ? 'text-red-600 font-medium' : ''}>
              {timeLeft}s
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {currentQuestion + 1} of {questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {currentQ.question}
        </h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => !showResult && handleAnswerSubmit(index)}
              disabled={showResult}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                showResult
                  ? index === currentQ.correct
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : index === selectedAnswer
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-200 bg-gray-50'
                  : selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {showResult && index === currentQ.correct && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {showResult && index === selectedAnswer && index !== currentQ.correct && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Result and Explanation */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200"
          >
            <div className="flex items-start space-x-3">
              {selectedAnswer === currentQ.correct ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`font-medium ${
                  selectedAnswer === currentQ.correct ? 'text-green-800' : 'text-red-800'
                }`}>
                  {selectedAnswer === currentQ.correct ? 'Correct!' : 'Incorrect.'}
                </p>
                <p className="text-sm text-gray-700 mt-1">{currentQ.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Button */}
      {showResult && (
        <motion.button
          onClick={handleNextQuestion}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </motion.button>
      )}
    </motion.div>
  );
};

export default QuizComponent;