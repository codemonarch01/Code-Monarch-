const express = require('express');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateTopicCreation, validateComment } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/topics
// @desc    Get all topics with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      course,
      difficulty,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filters = {
      isPublished: true
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (course) filters.course = course;
    if (difficulty) filters.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Search topics
    let query = Topic.find(filters);

    if (search) {
      query = query.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    const topics = await query
      .populate('course', 'title subject grade instructor')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Topic.countDocuments({
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

// @route   GET /api/topics/:id
// @desc    Get single topic by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('course', 'title subject grade instructor')
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
    await topic.incrementViews();

    // Get user's progress for this topic if authenticated
    let userProgress = null;
    if (req.user) {
      userProgress = await Progress.findOne({
        user: req.user._id,
        topic: topic._id
      });
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

// @route   POST /api/topics/:id/comments
// @desc    Add comment to topic
// @access  Private
router.post('/:id/comments', authenticateToken, validateComment, async (req, res) => {
  try {
    const { content } = req.body;
    const topicId = req.params.id;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    const comment = await topic.addComment(req.user._id, content);

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: { comment }
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

// @route   POST /api/topics/:id/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/:id/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { id: topicId, commentId } = req.params;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found'
      });
    }

    const result = await topic.likeComment(commentId, userId);

    res.json({
      status: 'success',
      message: result.liked ? 'Comment liked' : 'Comment unliked',
      data: { 
        liked: result.liked,
        likesCount: result.likesCount
      }
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

// @route   GET /api/topics/subject/:subjectId
// @desc    Get topics by subject
// @access  Public
router.get('/subject/:subjectId', optionalAuth, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Map subject ID to subject name
    const subjectMap = {
      '1': 'Mathematics',
      '2': 'Physics',
      '3': 'Chemistry',
      '4': 'Biology',
      '5': 'Computer Science',
      '6': 'English',
      '7': 'History',
      '8': 'Geography'
    };

    const subjectName = subjectMap[subjectId];
    if (!subjectName) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subject ID'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const topics = await Topic.find({
      subject: subjectName,
      isPublished: true
    })
      .populate('course', 'title subject grade instructor')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Topic.countDocuments({
      subject: subjectName,
      isPublished: true
    });

    res.json({
      status: 'success',
      data: {
        topics,
        subject: {
          id: subjectId,
          name: subjectName
        },
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

module.exports = router;






