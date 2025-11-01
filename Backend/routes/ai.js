const express = require('express');
const AIModel = require('../models/AIModel');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const googleAI = require('../services/googleAI');

const router = express.Router();
// Gemini integration
let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = require('@google/generative-ai'));
} catch (e) {
  // dependency may not be installed yet; route will gracefully fall back
}

// @route   GET /api/ai/models
// @desc    Get AI models (3D/AR content)
// @access  Public
router.get('/models', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      type,
      subject,
      grade,
      difficulty,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {
      isPublished: true
    };

    if (type) filters.type = type;
    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (difficulty) filters.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search models
    const models = await AIModel.searchModels(search, filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await AIModel.countDocuments({
      isPublished: true,
      ...filters,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    });

    res.json({
      status: 'success',
      data: {
        models,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch AI models',
      error: error.message
    });
  }
});

// @route   GET /api/ai/models/3d
// @desc    Get 3D models specifically
// @access  Public
router.get('/models/3d', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      difficulty,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object for 3D models
    const filters = {
      isPublished: true,
      type: '3d_model'
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (difficulty) filters.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search 3D models
    const models = await AIModel.find(filters)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await AIModel.countDocuments({
      ...filters,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    });

    res.json({
      status: 'success',
      data: {
        models,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get 3D models error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch 3D models',
      error: error.message
    });
  }
});

// @route   GET /api/ai/models/ar
// @desc    Get AR content specifically
// @access  Public
router.get('/models/ar', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      difficulty,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object for AR content
    const filters = {
      isPublished: true,
      type: 'ar_content'
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (difficulty) filters.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search AR content
    const models = await AIModel.find(filters)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await AIModel.countDocuments({
      ...filters,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    });

    res.json({
      status: 'success',
      data: {
        models,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get AR content error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch AR content',
      error: error.message
    });
  }
});

// @route   POST /api/ai/generate
// @desc    Generate AI content/prompts
// @access  Private
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, type, subject, grade, context } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }

    // Mock AI generation - in real app, integrate with OpenAI/Claude
    const generatedContent = {
      id: Date.now().toString(),
      prompt: prompt,
      type: type || 'general',
      subject: subject || 'General',
      grade: grade || 'All',
      generatedAt: new Date(),
      content: {
        text: `AI generated response for: "${prompt}"`,
        suggestions: [
          'Try exploring related concepts',
          'Consider different approaches',
          'Review the fundamentals'
        ],
        resources: [
          'Additional reading materials',
          'Video tutorials',
          'Practice exercises'
        ]
      },
      context: context || {}
    };

    res.json({
      status: 'success',
      message: 'AI content generated successfully',
      data: { content: generatedContent }
    });
  } catch (error) {
    console.error('Generate AI content error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI content',
      error: error.message
    });
  }
});

// @route   GET /api/ai/recommendations/:userId
// @desc    Get personalized AI recommendations for user
// @access  Private
router.get('/recommendations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can access this data
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view these recommendations'
      });
    }

    // Get user's learning progress and preferences
    const user = await User.findById(userId);
    const userProgress = await Progress.getUserProgress(userId);

    // Generate personalized recommendations based on user data
    const recommendations = {
      courses: await Course.find({
        isPublished: true,
        subject: { $in: user.preferences?.subjects || [] },
        grade: user.grade
      }).limit(5),
      topics: await Topic.find({
        isPublished: true,
        subject: { $in: user.preferences?.subjects || [] },
        grade: user.grade
      }).limit(5),
      models: await AIModel.find({
        isPublished: true,
        subject: { $in: user.preferences?.subjects || [] },
        grade: user.grade
      }).limit(5)
    };

    res.json({
      status: 'success',
      data: {
        recommendations,
        userPreferences: user.preferences,
        learningStreak: user.learningStreak,
        totalStudyHours: user.totalStudyHours
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
});

// @route   GET /api/ai/models/:id
// @desc    Get single AI model
// @access  Public
router.get('/models/:id', optionalAuth, async (req, res) => {
  try {
    const model = await AIModel.findById(req.params.id)
      .populate('createdBy', 'name email avatar');

    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'AI model not found'
      });
    }

    if (!model.isPublished) {
      return res.status(404).json({
        status: 'error',
        message: 'AI model not found'
      });
    }

    // Increment view count
    await model.incrementUsage('view');

    res.json({
      status: 'success',
      data: { model }
    });
  } catch (error) {
    console.error('Get AI model error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch AI model',
      error: error.message
    });
  }
});

// @route   POST /api/ai/models/:id/interact
// @desc    Record model interaction
// @access  Private
router.post('/models/:id/interact', authenticateToken, async (req, res) => {
  try {
    const { interactionType } = req.body;

    const model = await AIModel.findById(req.params.id);

    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'AI model not found'
      });
    }

    // Increment interaction count
    await model.incrementUsage('interaction');

    res.json({
      status: 'success',
      message: 'Interaction recorded successfully'
    });
  } catch (error) {
    console.error('Record interaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record interaction',
      error: error.message
    });
  }
});

// @route   POST /api/ai/models/:id/rate
// @desc    Rate AI model
// @access  Private
router.post('/models/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const model = await AIModel.findById(req.params.id);

    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'AI model not found'
      });
    }

    // Add rating
    await model.addRating(req.user._id, rating, feedback || '');

    res.json({
      status: 'success',
      message: 'Rating added successfully',
      data: { model }
    });
  } catch (error) {
    console.error('Rate model error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to rate model',
      error: error.message
    });
  }
});

// @route   GET /api/ai/recommendations
// @desc    Get AI recommendations for user
// @access  Private
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's learning history
    const userProgress = await Progress.getUserProgress(userId);
    const user = await User.findById(userId);

    // Get user's enrolled courses
    const enrolledCourseIds = user.enrolledCourses.map(ec => ec.courseId);

    // Get user's preferences
    const preferredSubjects = user.preferences.subjects || [];
    const difficulty = user.preferences.difficulty || 'beginner';

    // Build recommendation query
    const recommendationQuery = {
      isPublished: true,
      _id: { $nin: enrolledCourseIds }
    };

    // Add subject filter if user has preferences
    if (preferredSubjects.length > 0) {
      recommendationQuery.subject = { $in: preferredSubjects };
    }

    // Add difficulty filter
    const difficultyMap = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    recommendationQuery.difficulty = difficultyMap[difficulty] || 'Beginner';

    // Get recommended courses
    const recommendedCourses = await Course.find(recommendationQuery)
      .populate('instructor', 'name email avatar')
      .populate('topics', 'title duration difficulty')
      .sort({ rating: -1, students: -1 })
      .limit(10);

    // Get popular AI models
    const popularModels = await AIModel.getPopularModels(5);

    // Generate AI insights based on user progress
    const insights = generateAIInsights(userProgress, user);

    res.json({
      status: 'success',
      data: {
        recommendedCourses,
        popularModels,
        insights
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// @route   POST /api/ai/chat
// @desc    AI chat assistant
// @access  Private
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Message is required' 
      });
    }

    // Get user's learning context
    const userProgress = await Progress.getUserProgress(req.user._id);
    const user = await User.findById(req.user._id);

    // Generate AI response using Google Gemini with your API key
    const response = await googleAI.generateEducationalResponse(message, context, user);

    // Get related suggestions
    const suggestions = [
      "Would you like me to explain this concept in more detail?",
      "Should I show you a 3D visualization of this?",
      "Would you like to try a practice problem?",
      "I can recommend some additional resources for this topic."
    ];

    // Get related content based on context
    let relatedContent = [];
    if (context?.subject) {
      relatedContent = await Course.find({ 
        subject: context.subject,
        isPublished: true 
      }).limit(3);
    }

    res.json({
      status: 'success',
      data: {
        response,
        suggestions,
        relatedContent: relatedContent.map(course => ({
          id: course._id,
          title: course.title,
          subject: course.subject,
          grade: course.grade,
          thumbnail: course.thumbnail
        })),
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    
    // Enhanced fallback response based on message content
    let fallbackResponse = "";
    // Use request body safely; avoid referencing variables from try scope
    const originalMessage = (req?.body?.message || '').toString();
    const messageLower = originalMessage.toLowerCase();
    
    if (messageLower.includes('calculus') || messageLower.includes('derivative') || messageLower.includes('limit')) {
      fallbackResponse = `Great question about calculus! Derivatives measure the rate of change of a function. Think of it like the slope of a curve at any point. For example, if you have f(x) = x², the derivative f'(x) = 2x tells you how fast the function is changing at any point x. Would you like me to explain this with a specific example?`;
    } else if (messageLower.includes('physics') || messageLower.includes('force') || messageLower.includes('motion')) {
      fallbackResponse = `Physics is all about understanding how things move and interact! Forces cause changes in motion according to Newton's laws. For example, when you push an object, you're applying a force that causes acceleration. The relationship is F = ma (Force = mass × acceleration). What specific physics concept would you like to explore?`;
    } else if (messageLower.includes('chemistry') || messageLower.includes('atom') || messageLower.includes('molecule')) {
      fallbackResponse = `Chemistry is the study of matter and how it changes! Atoms are the building blocks of everything around us. They combine to form molecules through chemical bonds. For instance, water (H₂O) is made of 2 hydrogen atoms and 1 oxygen atom. What chemistry topic interests you most?`;
    } else if (messageLower.includes('math') || messageLower.includes('algebra') || messageLower.includes('equation')) {
      fallbackResponse = `Mathematics is the language of patterns and logic! Whether it's solving equations, working with functions, or exploring geometry, math helps us understand and describe the world. What specific math concept would you like help with?`;
    } else if (messageLower.includes('programming') || messageLower.includes('code') || messageLower.includes('algorithm')) {
      fallbackResponse = `Programming is like giving instructions to a computer! Algorithms are step-by-step procedures to solve problems. For example, to find the largest number in a list, you'd compare each number with the current maximum. Would you like to learn about a specific programming concept?`;
    } else {
      fallbackResponse = `That's a great question! I'm here to help you learn and understand complex concepts step by step. Based on your question about "${originalMessage}", let me provide some guidance and suggest resources that might help you explore this topic further.`;
    }
    
    res.json({
      status: 'success',
      data: {
        response: fallbackResponse,
        suggestions: [
          "Can you explain this concept in more detail?",
          "Show me a practical example of this",
          "What are the real-world applications?",
          "Help me with practice problems on this topic"
        ],
        relatedContent: [],
        timestamp: new Date()
      }
    });
  }
});

// @route   GET /api/ai/insights
// @desc    Get AI learning insights
// @access  Private
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's learning analytics
    const analytics = await Progress.getLearningAnalytics(userId, 30);
    const userProgress = await Progress.getUserProgress(userId);

    // Generate AI-powered insights using Google Gemini
    const insights = await googleAI.generateLearningInsights(userProgress, req.user);

    // Get learning recommendations
    const recommendations = await generateLearningRecommendations(userId, userProgress);

    res.json({
      status: 'success',
      data: {
        insights,
        recommendations,
        analytics
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get insights',
      error: error.message
    });
  }
});

// Helper function to generate AI insights
function generateAIInsights(userProgress, user) {
  const insights = [];

  // Calculate overall progress
  const totalCourses = userProgress.length;
  const completedCourses = userProgress.filter(cp => cp.completionRate === 100).length;
  const averageProgress = userProgress.reduce((sum, cp) => sum + cp.averageProgress, 0) / totalCourses || 0;

  // Learning streak insight
  if (user.learningStreak > 0) {
    insights.push({
      type: 'achievement',
      title: 'Learning Streak',
      content: `Great job! You've maintained a ${user.learningStreak}-day learning streak. Keep it up!`,
      priority: 'high'
    });
  }

  // Progress insight
  if (averageProgress > 80) {
    insights.push({
      type: 'positive',
      title: 'Excellent Progress',
      content: `You're doing great with an average progress of ${Math.round(averageProgress)}% across your courses.`,
      priority: 'medium'
    });
  } else if (averageProgress < 30) {
    insights.push({
      type: 'suggestion',
      title: 'Need More Focus',
      content: 'Consider spending more time on your courses to improve your learning outcomes.',
      priority: 'high'
    });
  }

  // Subject-specific insights
  const subjectProgress = userProgress.reduce((acc, cp) => {
    const subject = cp.course.subject;
    if (!acc[subject]) {
      acc[subject] = { total: 0, completed: 0, progress: 0 };
    }
    acc[subject].total += 1;
    acc[subject].completed += cp.completedTopics;
    acc[subject].progress += cp.averageProgress;
    return acc;
  }, {});

  Object.entries(subjectProgress).forEach(([subject, data]) => {
    const avgProgress = data.progress / data.total;
    if (avgProgress > 90) {
      insights.push({
        type: 'expertise',
        title: `${subject} Mastery`,
        content: `You're excelling in ${subject} with ${Math.round(avgProgress)}% average progress.`,
        priority: 'low'
      });
    }
  });

  return insights;
}

// Helper function to generate AI response
async function generateAIResponse(message, context, user, userProgress) {
  // This is a simplified AI response generator
  // In a real application, you would integrate with OpenAI or similar service

  const responses = {
    greeting: [
      `Hello ${user.name}! How can I help you with your learning today?`,
      `Hi there! I'm here to assist you with your studies. What would you like to know?`,
      `Welcome back! Ready to continue your learning journey?`
    ],
    progress: [
      `You're making great progress! You've completed ${userProgress.filter(cp => cp.completionRate === 100).length} courses.`,
      `Keep up the excellent work! Your learning streak is ${user.learningStreak} days.`,
      `You've spent ${user.totalStudyHours} hours learning. That's impressive!`
    ],
    help: [
      `I can help you with course recommendations, study tips, progress tracking, and answering questions about your subjects.`,
      `Feel free to ask me about any topic you're studying, or if you need help with your learning path.`,
      `I'm here to support your learning journey. What specific help do you need?`
    ],
    default: [
      `That's an interesting question! Based on your learning progress, I'd suggest focusing on your current courses.`,
      `I understand you're looking for help. Let me know more about what you'd like to learn about.`,
      `Great question! I'm here to help you succeed in your studies.`
    ]
  };

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
    return responses.progress[Math.floor(Math.random() * responses.progress.length)];
  } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return responses.help[Math.floor(Math.random() * responses.help.length)];
  } else {
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }
}

// Helper function to generate learning recommendations
async function generateLearningRecommendations(userId, userProgress) {
  const recommendations = [];

  // Get user's weak subjects
  const subjectProgress = userProgress.reduce((acc, cp) => {
    const subject = cp.course.subject;
    if (!acc[subject]) {
      acc[subject] = { total: 0, progress: 0 };
    }
    acc[subject].total += 1;
    acc[subject].progress += cp.averageProgress;
    return acc;
  }, {});

  Object.entries(subjectProgress).forEach(([subject, data]) => {
    const avgProgress = data.progress / data.total;
    if (avgProgress < 50) {
      recommendations.push({
        type: 'focus_area',
        subject,
        message: `Consider spending more time on ${subject}. Your current progress is ${Math.round(avgProgress)}%.`,
        priority: 'high'
      });
    }
  });

  // Add general recommendations
  if (userProgress.length === 0) {
    recommendations.push({
      type: 'get_started',
      message: 'Start your learning journey by enrolling in a course that interests you!',
      priority: 'high'
    });
  }

  return recommendations;
}

module.exports = router;
