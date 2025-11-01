const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Topic = require('../models/Topic');
const { authenticateToken: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Achievement awarding function
async function awardQuizAchievements(user, topicId, percentage, passed) {
  const achievements = [];
  
  // First quiz completion
  if (user.quizCompletions.length === 1) {
    achievements.push({
      id: 'first_quiz',
      title: 'Quiz Starter',
      description: 'Completed your first quiz!',
      icon: '🎯'
    });
  }
  
  // Perfect score
  if (percentage === 100) {
    achievements.push({
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved 100% on a quiz!',
      icon: '💯'
    });
  }
  
  // High performance
  if (percentage >= 90) {
    achievements.push({
      id: 'high_performer',
      title: 'High Performer',
      description: 'Scored 90% or above on a quiz!',
      icon: '⭐'
    });
  }
  
  // Quiz master (5 quizzes passed)
  const passedQuizzes = user.quizCompletions.filter(q => q.passed).length;
  if (passedQuizzes === 5) {
    achievements.push({
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Passed 5 quizzes!',
      icon: '🏆'
    });
  }
  
  // Subject expert (3 quizzes passed in same subject)
  const Topic = require('../models/Topic');
  const topic = await Topic.findById(topicId);
  if (topic) {
    const subjectQuizzes = user.quizCompletions.filter(q => 
      q.topicId.toString() === topicId || 
      (topic.subject && q.topicId.subject === topic.subject)
    ).filter(q => q.passed).length;
    
    if (subjectQuizzes >= 3) {
      achievements.push({
        id: `expert_${topic.subject?.toLowerCase().replace(/\s+/g, '_')}`,
        title: `${topic.subject} Expert`,
        description: `Mastered ${topic.subject} through quizzes!`,
        icon: '🎓'
      });
    }
  }
  
  // Add new achievements to user
  achievements.forEach(achievement => {
    if (!user.achievements.find(a => a.id === achievement.id)) {
      user.achievements.push(achievement);
    }
  });
}

// Get quiz for a specific topic
router.get('/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    
    // Find quiz for the topic
    const quiz = await Quiz.findOne({ 
      topicId, 
      isActive: true 
    }).populate('topicId', 'title subject');
    
    if (!quiz) {
      return res.status(404).json({
        status: 'error',
        message: 'No quiz available for this topic'
      });
    }

    // Check if user already completed this quiz
    const existingAttempt = await QuizAttempt.findOne({
      userId: req.user.id,
      topicId: topicId
    });

    if (existingAttempt) {
      const correctCount = (existingAttempt.answers || []).filter(a => a.isCorrect).length;
      const wrongCount = (existingAttempt.answers || []).length > 0
        ? (existingAttempt.answers.length - correctCount)
        : (quiz.questions.length - correctCount);

      return res.json({
        status: 'success',
        data: {
          quiz: {
            id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            timeLimit: quiz.timeLimit,
            difficulty: quiz.difficulty,
            totalQuestions: quiz.questions.length,
            totalPoints: quiz.totalPoints
          },
          completed: true,
          previousScore: existingAttempt.score,
          previousPercentage: existingAttempt.percentage,
          previousAttempt: existingAttempt.completedAt,
          previousEcoPointsEarned: existingAttempt.ecoPointsEarned,
          previousCorrect: correctCount,
          previousWrong: wrongCount,
          previousPassed: existingAttempt.passed
        }
      });
    }

    // Return quiz without correct answers
    const quizData = {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      difficulty: quiz.difficulty,
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.totalPoints,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };

    res.json({
      status: 'success',
      data: {
        quiz: quizData,
        completed: false
      }
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz'
    });
  }
});

// Submit quiz answers
router.post('/submit', [
  auth,
  body('quizId').isMongoId().withMessage('Valid quiz ID required'),
  body('topicId').isMongoId().withMessage('Valid topic ID required'),
  body('answers').isArray().withMessage('Answers must be an array'),
  body('timeSpent').isNumeric().withMessage('Time spent must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quizId, topicId, answers, timeSpent } = req.body;
    const userId = req.user.id;

    // Check if user already completed this quiz
    const existingAttempt = await QuizAttempt.findOne({
      userId,
      topicId
    });

    if (existingAttempt) {
      return res.status(400).json({
        status: 'error',
        message: 'Quiz already completed'
      });
    }

    // Get quiz with correct answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found'
      });
    }

    // Validate answers format
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Number of answers does not match questions'
      });
    }

    // Calculate score
    let totalScore = 0;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedOption === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      
      totalScore += pointsEarned;
      if (isCorrect) correctAnswers++;

      detailedAnswers.push({
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect,
        pointsEarned,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      });
    });

    const percentage = Math.round((totalScore / quiz.totalPoints) * 100);
    const passed = percentage >= 60; // 60% passing grade

    // Calculate eco points based on performance
    let ecoPointsEarned = 0;
    if (passed) {
      ecoPointsEarned = Math.round(totalScore * 0.5); // 0.5 eco points per quiz point
      if (percentage >= 90) ecoPointsEarned += 10; // Bonus for excellent performance
      if (percentage === 100) ecoPointsEarned += 20; // Perfect score bonus
    }

    // Save quiz attempt
    const quizAttempt = new QuizAttempt({
      userId,
      quizId,
      topicId,
      answers: detailedAnswers,
      score: totalScore,
      totalPoints: quiz.totalPoints,
      percentage,
      timeSpent,
      ecoPointsEarned,
      passed
    });

    await quizAttempt.save();

    // Award eco points to user and track achievements
    if (ecoPointsEarned > 0) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      // Update eco points
      user.ecoPoints += ecoPointsEarned;
      
      // Track quiz completion
      user.quizCompletions.push({
        topicId,
        quizId,
        score: totalScore,
        percentage,
        passed,
        ecoPointsEarned
      });
      
      // Update topic mastery
      const existingMastery = user.topicMastery.find(m => m.topicId.toString() === topicId);
      if (existingMastery) {
        existingMastery.quizAttempts += 1;
        existingMastery.bestScore = Math.max(existingMastery.bestScore, percentage);
        existingMastery.lastAttempt = new Date();
        
        // Update mastery level based on performance
        if (percentage >= 90 && existingMastery.masteryLevel !== 'Expert') {
          existingMastery.masteryLevel = 'Expert';
        } else if (percentage >= 75 && existingMastery.masteryLevel === 'Beginner') {
          existingMastery.masteryLevel = 'Intermediate';
        } else if (percentage >= 60 && existingMastery.masteryLevel === 'Beginner') {
          existingMastery.masteryLevel = 'Advanced';
        }
      } else {
        user.topicMastery.push({
          topicId,
          masteryLevel: percentage >= 90 ? 'Expert' : percentage >= 75 ? 'Intermediate' : 'Beginner',
          quizAttempts: 1,
          bestScore: percentage,
          lastAttempt: new Date()
        });
      }
      
      // Award achievements
      await awardQuizAchievements(user, topicId, percentage, passed);
      
      await user.save();
      req.__newEcoPointsTotal = user.ecoPoints;
    }

    res.json({
      status: 'success',
      data: {
        score: totalScore,
        totalPoints: quiz.totalPoints,
        percentage,
        correctAnswers,
        wrongAnswers: quiz.questions.length - correctAnswers,
        totalQuestions: quiz.questions.length,
        passed,
        ecoPointsEarned,
        ecoPointsTotal: req.__newEcoPointsTotal || undefined,
        timeSpent,
        detailedAnswers
      }
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit quiz'
    });
  }
});

// Get user's quiz history for a topic
router.get('/history/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    const attempts = await QuizAttempt.find({
      userId,
      topicId
    }).populate('quizId', 'title difficulty')
      .sort({ completedAt: -1 });

    res.json({
      status: 'success',
      data: {
        attempts: attempts.map(attempt => ({
          id: attempt._id,
          quizTitle: attempt.quizId.title,
          difficulty: attempt.quizId.difficulty,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          percentage: attempt.percentage,
          passed: attempt.passed,
          ecoPointsEarned: attempt.ecoPointsEarned,
          timeSpent: attempt.timeSpent,
          completedAt: attempt.completedAt
        }))
      }
    });

  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz history'
    });
  }
});

module.exports = router;
