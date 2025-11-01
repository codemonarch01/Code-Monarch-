const express = require('express');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/content/subjects
// @desc    Get all subjects
// @access  Public
router.get('/subjects', async (req, res) => {
  try {
    const subjects = [
      { 
        id: '1', 
        name: 'Mathematics', 
        description: 'Algebra, Geometry, Calculus', 
        icon: '📐',
        color: 'from-blue-500 to-blue-600',
        topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry']
      },
      { 
        id: '2', 
        name: 'Physics', 
        description: 'Mechanics, Thermodynamics, Optics', 
        icon: '⚛️',
        color: 'from-green-500 to-green-600',
        topics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Quantum Physics']
      },
      { 
        id: '3', 
        name: 'Chemistry', 
        description: 'Organic, Inorganic, Physical Chemistry', 
        icon: '🧪',
        color: 'from-purple-500 to-purple-600',
        topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry']
      },
      { 
        id: '4', 
        name: 'Biology', 
        description: 'Cell Biology, Genetics, Ecology', 
        icon: '🧬',
        color: 'from-pink-500 to-pink-600',
        topics: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Human Anatomy']
      },
      { 
        id: '5', 
        name: 'Computer Science', 
        description: 'Programming, Algorithms, Data Structures', 
        icon: '💻',
        color: 'from-indigo-500 to-indigo-600',
        topics: ['Programming', 'Data Structures', 'Algorithms', 'Database Systems', 'Software Engineering']
      },
      { 
        id: '6', 
        name: 'English', 
        description: 'Literature, Grammar, Writing', 
        icon: '📚',
        color: 'from-yellow-500 to-yellow-600',
        topics: ['Grammar', 'Literature', 'Writing', 'Communication', 'Critical Thinking']
      },
      { 
        id: '7', 
        name: 'History', 
        description: 'World History, Ancient Civilizations', 
        icon: '🏛️',
        color: 'from-amber-500 to-amber-600',
        topics: ['World History', 'Ancient Civilizations', 'Modern History', 'Political History', 'Cultural History']
      },
      { 
        id: '8', 
        name: 'Geography', 
        description: 'Physical Geography, Human Geography', 
        icon: '🌍',
        color: 'from-teal-500 to-teal-600',
        topics: ['Physical Geography', 'Human Geography', 'Climate', 'Population', 'Economic Geography']
      }
    ];

    res.json({
      status: 'success',
      data: { subjects }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
});

// @route   GET /api/content/subjects/class/:classId
// @desc    Get subjects by class
// @access  Public
router.get('/subjects/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Mock data - in real app, this would query database
    const subjectsByClass = {
      '1': ['1', '2', '3', '4', '5', '6'], // Grade 9
      '2': ['1', '2', '3', '4', '5', '6'], // Grade 10
      '3': ['1', '2', '3', '4', '5', '6'], // Grade 11
      '4': ['1', '2', '3', '4', '5', '6']  // Grade 12
    };

    const subjectIds = subjectsByClass[classId] || [];
    const subjects = [
      { id: '1', name: 'Mathematics', description: 'Algebra, Geometry, Calculus', icon: '📐' },
      { id: '2', name: 'Physics', description: 'Mechanics, Thermodynamics, Optics', icon: '⚛️' },
      { id: '3', name: 'Chemistry', description: 'Organic, Inorganic, Physical Chemistry', icon: '🧪' },
      { id: '4', name: 'Biology', description: 'Cell Biology, Genetics, Ecology', icon: '🧬' },
      { id: '5', name: 'Computer Science', description: 'Programming, Algorithms, Data Structures', icon: '💻' },
      { id: '6', name: 'English', description: 'Literature, Grammar, Writing', icon: '📚' }
    ].filter(subject => subjectIds.includes(subject.id));

    res.json({
      status: 'success',
      data: { subjects }
    });
  } catch (error) {
    console.error('Get subjects by class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subjects for class',
      error: error.message
    });
  }
});

// @route   GET /api/content/topics/subject/:subjectId
// @desc    Get topics by subject
// @access  Public
router.get('/topics/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Build filter object
    const filters = {
      isPublished: true,
      subject: subjectId
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get topics by subject
    const topics = await Topic.find(filters)
      .populate('course', 'title subject grade instructorName thumbnail')
      .sort({ order: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Topic.countDocuments(filters);

    res.json({
      status: 'success',
      data: {
        topics,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get topics by subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch topics for subject',
      error: error.message
    });
  }
});

// @route   GET /api/content/classes
// @desc    Get all classes
// @access  Public
router.get('/classes', async (req, res) => {
  try {
    const classes = [
      { 
        id: '1', 
        name: 'Grade 9', 
        description: 'Freshman year', 
        level: 9,
        color: 'from-blue-500 to-blue-600',
        icon: '🎓',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']
      },
      { 
        id: '2', 
        name: 'Grade 10', 
        description: 'Sophomore year', 
        level: 10,
        color: 'from-green-500 to-green-600',
        icon: '📚',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']
      },
      { 
        id: '3', 
        name: 'Grade 11', 
        description: 'Junior year', 
        level: 11,
        color: 'from-purple-500 to-purple-600',
        icon: '🔬',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
      },
      { 
        id: '4', 
        name: 'Grade 12', 
        description: 'Senior year', 
        level: 12,
        color: 'from-orange-500 to-orange-600',
        icon: '🎯',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
      },
      { 
        id: '5', 
        name: 'B.Tech', 
        description: 'Bachelor of Technology', 
        level: 'btech',
        color: 'from-indigo-500 to-indigo-600',
        icon: '💻',
        subjects: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Engineering']
      }
    ];

    res.json({
      status: 'success',
      data: { classes }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch classes',
      error: error.message
    });
  }
});

// @route   GET /api/content/topics
// @desc    Get all topics with filtering
// @access  Public
router.get('/topics', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      difficulty,
      course,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {
      isPublished: true
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (difficulty) filters.difficulty = difficulty;
    if (course) filters.course = course;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search topics
    const topics = await Topic.searchTopics(search, filters)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Topic.countDocuments({
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
        topics,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch topics',
      error: error.message
    });
  }
});

// @route   GET /api/content/topics/:id
// @desc    Get single topic by ID
// @access  Public
router.get('/topics/:id', optionalAuth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('course', 'title subject grade instructorName')
      .populate('comments.user', 'name avatar');

    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    if (!topic.isPublished) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    // Increment view count
    await topic.incrementView();

    // Add user progress if authenticated
    let userProgress = null;
    if (req.user) {
      const progress = await Progress.findOne({
        user: req.user._id,
        course: topic.course._id,
        topic: topic._id
      });

      if (progress) {
        userProgress = {
          progress: progress.progress,
          status: progress.status,
          timeSpent: progress.timeSpent,
          lastAccessed: progress.lastAccessed,
          notes: progress.notes,
          bookmarks: progress.bookmarks
        };
      }
    }

    res.json({
      status: 'success',
      data: {
        topic,
        userProgress
      }
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch topic',
      error: error.message
    });
  }
});

// @route   POST /api/content/topics/:id/comment
// @desc    Add comment to topic
// @access  Private
router.post('/topics/:id/comment', authenticateToken, validateComment, async (req, res) => {
  try {
    const { content, timestamp } = req.body;
    const topicId = req.params.id;

    const topic = await Topic.findById(topicId).populate('course');

    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    // Check if user is enrolled in course
    const isEnrolled = topic.course.enrolledCourses.some(
      ec => ec.user.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        status: 'error',
        message: 'Must be enrolled in course to comment'
      });
    }

    // Add comment
    await topic.addComment(req.user._id, content, timestamp || 0);

    // Get updated topic with comments
    const updatedTopic = await Topic.findById(topicId)
      .populate('comments.user', 'name avatar');

    res.json({
      status: 'success',
      message: 'Comment added successfully',
      data: { topic: updatedTopic }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// @route   POST /api/content/topics/:id/comment/:commentId/like
// @desc    Like a comment
// @access  Private
router.post('/topics/:id/comment/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    // Like comment
    await topic.likeComment(commentId);

    res.json({
      status: 'success',
      message: 'Comment liked successfully'
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to like comment',
      error: error.message
    });
  }
});

// @route   GET /api/content/videos
// @desc    Get video lessons
// @access  Public
router.get('/videos', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      difficulty,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {
      isPublished: true,
      'content.videoUrl': { $exists: true, $ne: '' }
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (difficulty) filters.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search video topics
    const topics = await Topic.find(filters)
      .populate('course', 'title subject grade instructorName thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Topic.countDocuments(filters);

    res.json({
      status: 'success',
      data: {
        videos: topics,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
});

// @route   GET /api/content/3d-models
// @desc    Get 3D models and AR content
// @access  Public
router.get('/3d-models', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      type,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {
      isPublished: true,
      type: { $in: ['3d_model', 'ar_content'] }
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (type) filters.type = type;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search 3D models
    const models = await require('../models/AIModel').find(filters)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await require('../models/AIModel').countDocuments(filters);

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

// @route   GET /api/content/quiz/:topicId
// @desc    Get quiz for topic
// @access  Private
router.get('/quiz/:topicId', authenticateToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId)
      .populate('course');

    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    // Check if user is enrolled in course
    const isEnrolled = topic.course.enrolledCourses.some(
      ec => ec.user.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        status: 'error',
        message: 'Must be enrolled in course to access quiz'
      });
    }

    if (!topic.content.quiz || topic.content.quiz.questions.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No quiz available for this topic'
      });
    }

    // Return quiz without correct answers
    const quiz = {
      topicId: topic._id,
      title: topic.title,
      questions: topic.content.quiz.questions.map(q => ({
        question: q.question,
        options: q.options
      }))
    };

    res.json({
      status: 'success',
      data: { quiz }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
});

// @route   POST /api/content/quiz/:topicId/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/quiz/:topicId/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const topicId = req.params.topicId;

    const topic = await Topic.findById(topicId).populate('course');

    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    // Check if user is enrolled in course
    const isEnrolled = topic.course.enrolledCourses.some(
      ec => ec.user.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        status: 'error',
        message: 'Must be enrolled in course to submit quiz'
      });
    }

    if (!topic.content.quiz || topic.content.quiz.questions.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No quiz available for this topic'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = topic.content.quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) correctAnswers++;

      return {
        question: question.question,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctAnswers / topic.content.quiz.questions.length) * 100);

    // Save quiz score to progress
    const progress = await Progress.findOne({
      user: req.user._id,
      course: topic.course._id,
      topic: topicId
    });

    if (progress) {
      await progress.addQuizScore(score, topic.content.quiz.questions.length);
    }

    res.json({
      status: 'success',
      message: 'Quiz submitted successfully',
      data: {
        score,
        totalQuestions: topic.content.quiz.questions.length,
        correctAnswers,
        results
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

// @route   GET /api/content/search
// @desc    Search all content
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, type, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const results = {
      courses: [],
      topics: [],
      videos: [],
      models: []
    };

    // Search courses
    if (!type || type === 'courses') {
      results.courses = await Course.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { subject: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .populate('instructor', 'name email avatar')
      .limit(5);
    }

    // Search topics
    if (!type || type === 'topics') {
      results.topics = await Topic.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { subject: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .populate('course', 'title subject grade')
      .limit(5);
    }

    // Search videos
    if (!type || type === 'videos') {
      results.videos = await Topic.find({
        isPublished: true,
        'content.videoUrl': { $exists: true, $ne: '' },
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { subject: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('course', 'title subject grade')
      .limit(5);
    }

    // Search 3D models
    if (!type || type === 'models') {
      results.models = await require('../models/AIModel').find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { subject: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .populate('createdBy', 'name email avatar')
      .limit(5);
    }

    res.json({
      status: 'success',
      data: { results }
    });
  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search content',
      error: error.message
    });
  }
});

module.exports = router;
