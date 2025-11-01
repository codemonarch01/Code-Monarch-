// const express = require('express');
// const mongoose = require('mongoose');
// const Progress = require('../models/Progress');
// const User = require('../models/User');
// const Course = require('../models/Course');
// const Topic = require('../models/Topic');
// const { authenticateToken } = require('../middleware/auth');
// const { validateProgress } = require('../middleware/validation');
// const { awardPointsToUser, POINTS_TABLE } = require('../utils/gamify');

// const router = express.Router();

// // @route   GET /api/progress
// // @desc    Get user's overall progress
// // @access  Private
// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Get user's course progress
//     const courseProgress = await Progress.getUserProgress(userId);

//     // Get learning analytics for last 30 days
//     const analytics = await Progress.getLearningAnalytics(userId, 30);

//     // Get user's enrolled courses
//     const user = await User.findById(userId).populate('enrolledCourses.courseId', 'title subject grade thumbnail');
    
//     // Get recent activity
//     const recentActivity = await Progress.find({ user: userId })
//       .populate('course', 'title subject')
//       .populate('topic', 'title duration')
//       .sort({ lastAccessed: -1 })
//       .limit(10);

//     res.json({
//       status: 'success',
//       data: {
//         courseProgress,
//         analytics,
//         enrolledCourses: user.enrolledCourses,
//         recentActivity
//       }
//     });
//   } catch (error) {
//     console.error('Get progress error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch progress',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/progress/user/:userId
// // @desc    Get user progress by user ID
// // @access  Private
// router.get('/user/:userId', authenticateToken, async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Check if user can access this data
//     if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not authorized to view this progress'
//       });
//     }

//     // Get user's course progress
//     const courseProgress = await Progress.getUserProgress(userId);

//     // Get learning analytics for last 30 days
//     const analytics = await Progress.getLearningAnalytics(userId, 30);

//     // Get user's enrolled courses
//     const user = await User.findById(userId).populate('enrolledCourses.courseId', 'title subject grade thumbnail');
    
//     // Get recent activity
//     const recentActivity = await Progress.find({ user: userId })
//       .populate('course', 'title subject')
//       .populate('topic', 'title duration')
//       .sort({ lastAccessed: -1 })
//       .limit(10);

//     res.json({
//       status: 'success',
//       data: {
//         courseProgress,
//         analytics,
//         enrolledCourses: user.enrolledCourses,
//         recentActivity
//       }
//     });
//   } catch (error) {
//     console.error('Get user progress error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch user progress',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/progress/user/:userId/topic/:topicId
// // @desc    Get progress by topic for specific user
// // @access  Private
// router.get('/user/:userId/topic/:topicId', authenticateToken, async (req, res) => {
//   try {
//     const { userId, topicId } = req.params;

//     // Check if user can access this data
//     if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not authorized to view this progress'
//       });
//     }

//     // Get topic and course info
//     const topic = await Topic.findById(topicId).populate('course');
//     if (!topic) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Topic not found'
//       });
//     }

//     // Get progress for this topic
//     const progress = await Progress.findOne({
//       user: userId,
//       course: topic.course._id,
//       topic: topicId
//     });

//     if (!progress) {
//       return res.json({
//         status: 'success',
//         data: {
//           progress: null,
//           topic: {
//             _id: topic._id,
//             title: topic.title,
//             description: topic.description,
//             duration: topic.duration,
//             difficulty: topic.difficulty
//           }
//         }
//       });
//     }

//     res.json({
//       status: 'success',
//       data: {
//         progress,
//         topic: {
//           _id: topic._id,
//           title: topic.title,
//           description: topic.description,
//           duration: topic.duration,
//           difficulty: topic.difficulty
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get topic progress error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch topic progress',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/progress/analytics/:userId
// // @desc    Get learning analytics for specific user
// // @access  Private
// router.get('/analytics/:userId', authenticateToken, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { days = 30 } = req.query;

//     // Check if user can access this data
//     if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not authorized to view this analytics'
//       });
//     }

//     // Get learning analytics
//     const analytics = await Progress.getLearningAnalytics(userId, parseInt(days));

//     // Get subject-wise progress
//     const subjectProgress = await Progress.aggregate([
//       { $match: { user: new mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: 'topics',
//           localField: 'topic',
//           foreignField: '_id',
//           as: 'topicData'
//         }
//       },
//       { $unwind: '$topicData' },
//       {
//         $group: {
//           _id: '$topicData.subject',
//           totalTopics: { $sum: 1 },
//           completedTopics: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
//           averageProgress: { $avg: '$progress' },
//           totalTimeSpent: { $sum: '$timeSpent' }
//         }
//       },
//       {
//         $project: {
//           subject: '$_id',
//           totalTopics: 1,
//           completedTopics: 1,
//           averageProgress: { $round: ['$averageProgress', 2] },
//           completionRate: {
//             $round: [
//               { $multiply: [{ $divide: ['$completedTopics', '$totalTopics'] }, 100] },
//               2
//             ]
//           },
//           totalTimeSpent: 1
//         }
//       }
//     ]);

//     res.json({
//       status: 'success',
//       data: {
//         dailyAnalytics: analytics,
//         subjectProgress
//       }
//     });
//   } catch (error) {
//     console.error('Get analytics error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch analytics',
//       error: error.message
//     });
//   }
// });

// // @route   POST /api/progress/complete
// // @desc    Mark topic as completed
// // @access  Private
// router.post('/complete', authenticateToken, async (req, res) => {
//   try {
//     const { userId, topicId, completed } = req.body;

//     // Check if user can update this progress
//     if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not authorized to update this progress'
//       });
//     }

//     // Get topic and course info
//     const topic = await Topic.findById(topicId).populate('course');
//     if (!topic) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Topic not found'
//       });
//     }

//     // Check if user is enrolled in course (guard against undefined arrays)
//     const enrolledArr = Array.isArray(topic.course.enrolledCourses) ? topic.course.enrolledCourses : [];
//     const isEnrolled = enrolledArr.some(ec => ec.user && ec.user.toString() === userId);

//     if (!isEnrolled) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not enrolled in this course'
//       });
//     }

//     // Find or create progress record
//     let progressRecord = await Progress.findOne({
//       user: userId,
//       course: topic.course._id,
//       topic: topicId
//     });

//     if (!progressRecord) {
//       progressRecord = new Progress({
//         user: userId,
//         course: topic.course._id,
//         topic: topicId
//       });
//     }

//     // Update progress
//     if (completed) {
//       await progressRecord.updateProgress(100, 0);
//       progressRecord.status = 'completed';
//       progressRecord.completedAt = new Date();
//     // Award eco-points for completing a topic
//     try {
//       await awardPointsToUser(userId, POINTS_TABLE.topic_completed);
//     } catch (_) {}
//     }

//     await progressRecord.save();

//     res.json({
//       status: 'success',
//       message: 'Progress updated successfully',
//       data: { progress: progressRecord }
//     });
//   } catch (error) {
//     console.error('Mark topic completed error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to update progress',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/progress/course/:courseId
// // @desc    Get progress for specific course
// // @access  Private
// router.get('/course/:courseId', authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user._id;

//     // Check if user is enrolled in course
//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Course not found'
//       });
//     }

//     const enrolledArr = Array.isArray(course.enrolledCourses) ? course.enrolledCourses : [];
//     const isEnrolled = enrolledArr.some(ec => ec.user && ec.user.toString() === userId.toString());

//     if (!isEnrolled) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not enrolled in this course'
//       });
//     }

//     // Get course progress
//     const progress = await Progress.getCourseProgress(userId, courseId);

//     // Calculate overall course progress
//     const totalTopics = progress.length;
//     const completedTopics = progress.filter(p => p.status === 'completed').length;
//     const averageProgress = totalTopics > 0 
//       ? progress.reduce((sum, p) => sum + p.progress, 0) / totalTopics 
//       : 0;

//     res.json({
//       status: 'success',
//       data: {
//         course,
//         progress,
//         summary: {
//           totalTopics,
//           completedTopics,
//           averageProgress: Math.round(averageProgress),
//           completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get course progress error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch course progress',
//       error: error.message
//     });
//   }
// });

// // @route   PUT /api/progress/topic/:topicId
// // @desc    Update topic progress
// // @access  Private
// router.put('/topic/:topicId', authenticateToken, validateProgress, async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const { progress, timeSpent } = req.body;
//     const userId = req.user._id;

//     // Get topic and course info
//     const topic = await Topic.findById(topicId).populate('course');
//     if (!topic) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Topic not found'
//       });
//     }

//     // Check if user is enrolled in course
//     const enrolledArr = Array.isArray(topic.course.enrolledCourses) ? topic.course.enrolledCourses : [];
//     const isEnrolled = enrolledArr.some(ec => ec.user && ec.user.toString() === userId.toString());

//     if (!isEnrolled) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not enrolled in this course'
//       });
//     }

//     // Find or create progress record
//     let progressRecord = await Progress.findOne({
//       user: userId,
//       course: topic.course._id,
//       topic: topicId
//     });

//     if (!progressRecord) {
//       progressRecord = new Progress({
//         user: userId,
//         course: topic.course._id,
//         topic: topicId
//       });
//     }

//     // Update progress
//     await progressRecord.updateProgress(progress, timeSpent || 0);

//     // Update user's total study hours
//     if (timeSpent) {
//       await User.findByIdAndUpdate(userId, {
//         $inc: { totalStudyHours: timeSpent }
//       });
//     }

//     // Update course enrollment progress
//     const courseProgress = await Progress.find({
//       user: userId,
//       course: topic.course._id
//     });

//     const courseAverageProgress = courseProgress.length > 0
//       ? courseProgress.reduce((sum, p) => sum + p.progress, 0) / courseProgress.length
//       : 0;

//     // Update course enrollment
//     await Course.findByIdAndUpdate(topic.course._id, {
//       $set: {
//         'enrolledCourses.$[elem].progress': Math.round(courseAverageProgress),
//         'enrolledCourses.$[elem].lastAccessed': new Date()
//       }
//     }, {
//       arrayFilters: [{ 'elem.user': userId }]
//     });

//     res.json({
//       status: 'success',
//       message: 'Progress updated successfully',
//       data: { progress: progressRecord }
//     });
//   } catch (error) {
//     console.error('Update progress error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to update progress',
//       error: error.message
//     });
//   }
// });

// // @route   POST /api/progress/topic/:topicId/quiz
// // @desc    Submit quiz score
// // @access  Private
// router.post('/topic/:topicId/quiz', authenticateToken, async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const { score, totalQuestions } = req.body;
//     const userId = req.user._id;

//     // Get topic and course info
//     const topic = await Topic.findById(topicId).populate('course');
//     if (!topic) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Topic not found'
//       });
//     }

//     // Check if user is enrolled in course
//     const isEnrolled = topic.course.enrolledCourses.some(
//       ec => ec.user.toString() === userId.toString()
//     );

//     if (!isEnrolled) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not enrolled in this course'
//       });
//     }

//     // Find or create progress record
//     let progressRecord = await Progress.findOne({
//       user: userId,
//       course: topic.course._id,
//       topic: topicId
//     });

//     if (!progressRecord) {
//       progressRecord = new Progress({
//         user: userId,
//         course: topic.course._id,
//         topic: topicId
//       });
//     }

//     // Add quiz score
//     await progressRecord.addQuizScore(score, totalQuestions);

//     // Award eco-points for completing quiz (only if decent score or any attempt)
//     try {
//       const pct = totalQuestions > 0 ? (score / totalQuestions) : 0;
//       if (pct >= 0.5) {
//         await awardPointsToUser(userId, POINTS_TABLE.quiz_completed);
//       }
//     } catch (_) {}

//     res.json({
//       status: 'success',
//       message: 'Quiz score recorded successfully',
//       data: { progress: progressRecord }
//     });
//   } catch (error) {
//     console.error('Submit quiz error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to submit quiz score',
//       error: error.message
//     });
//   }
// });

// // @route   POST /api/progress/topic/:topicId/note
// // @desc    Add note to topic
// // @access  Private
// router.post('/topic/:topicId/note', authenticateToken, async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const { content, timestamp } = req.body;
//     const userId = req.user._id;

//     // Get topic and course info
//     const topic = await Topic.findById(topicId).populate('course');
//     if (!topic) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Topic not found'
//       });
//     }

//     // Check if user is enrolled in course
//     const isEnrolled = topic.course.enrolledCourses.some(
//       ec => ec.user.toString() === userId.toString()
//     );

//     if (!isEnrolled) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not enrolled in this course'
//       });
//     }

//     // Find or create progress record
//     let progressRecord = await Progress.findOne({
//       user: userId,
//       course: topic.course._id,
//       topic: topicId
//     });

//     if (!progressRecord) {
//       progressRecord = new Progress({
//         user: userId,
//         course: topic.course._id,
//         topic: topicId
//       });
//     }

//     // Add note
//     await progressRecord.addNote(content, timestamp || 0);

//     res.json({
//       status: 'success',
//       message: 'Note added successfully',
//       data: { progress: progressRecord }
//     });
//   } catch (error) {
//     console.error('Add note error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to add note',
//       error: error.message
//     });
//   }
// });

// // @route   POST /api/progress/topic/:topicId/bookmark
// // @desc    Add bookmark to topic
// // @access  Private
// router.post('/topic/:topicId/bookmark', authenticateToken, async (req, res) => {
//   try {
//     const { topicId } = req.params;
//     const { timestamp, title, note } = req.body;
//     const userId = req.user._id;

//     // Get topic and course info
//     const topic = await Topic.findById(topicId).populate('course');
//     if (!topic) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Topic not found'
//       });
//     }

//     // Check if user is enrolled in course
//     const isEnrolled = topic.course.enrolledCourses.some(
//       ec => ec.user.toString() === userId.toString()
//     );

//     if (!isEnrolled) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Not enrolled in this course'
//       });
//     }

//     // Find or create progress record
//     let progressRecord = await Progress.findOne({
//       user: userId,
//       course: topic.course._id,
//       topic: topicId
//     });

//     if (!progressRecord) {
//       progressRecord = new Progress({
//         user: userId,
//         course: topic.course._id,
//         topic: topicId
//       });
//     }

//     // Add bookmark
//     await progressRecord.addBookmark(timestamp, title, note || '');

//     res.json({
//       status: 'success',
//       message: 'Bookmark added successfully',
//       data: { progress: progressRecord }
//     });
//   } catch (error) {
//     console.error('Add bookmark error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to add bookmark',
//       error: error.message
//     });
//   }
// });

// // @route   GET /api/progress/analytics
// // @desc    Get learning analytics
// // @access  Private
// router.get('/analytics', authenticateToken, async (req, res) => {
//   try {
//     const { days = 30 } = req.query;
//     const userId = req.user._id;

//     // Get learning analytics
//     const analytics = await Progress.getLearningAnalytics(userId, parseInt(days));

//     // Get subject-wise progress
//     const subjectProgress = await Progress.aggregate([
//       { $match: { user: new mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: 'topics',
//           localField: 'topic',
//           foreignField: '_id',
//           as: 'topicData'
//         }
//       },
//       { $unwind: '$topicData' },
//       {
//         $group: {
//           _id: '$topicData.subject',
//           totalTopics: { $sum: 1 },
//           completedTopics: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
//           averageProgress: { $avg: '$progress' },
//           totalTimeSpent: { $sum: '$timeSpent' }
//         }
//       },
//       {
//         $project: {
//           subject: '$_id',
//           totalTopics: 1,
//           completedTopics: 1,
//           averageProgress: { $round: ['$averageProgress', 2] },
//           completionRate: {
//             $round: [
//               { $multiply: [{ $divide: ['$completedTopics', '$totalTopics'] }, 100] },
//               2
//             ]
//           },
//           totalTimeSpent: 1
//         }
//       }
//     ]);

//     res.json({
//       status: 'success',
//       data: {
//         dailyAnalytics: analytics,
//         subjectProgress
//       }
//     });
//   } catch (error) {
//     console.error('Get analytics error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch analytics',
//       error: error.message
//     });
//   }
// });

// module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const { authenticateToken } = require('../middleware/auth');
const { validateProgress } = require('../middleware/validation');
const { awardPointsToUser, POINTS_TABLE } = require('../utils/gamify');

const router = express.Router();

// ======================= GET USER OVERALL PROGRESS =======================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const courseProgress = await Progress.getUserProgress(userId);
    const analytics = await Progress.getLearningAnalytics(userId, 30);
    const user = await User.findById(userId).populate('enrolledCourses.courseId', 'title subject grade thumbnail');
    const recentActivity = await Progress.find({ user: userId })
      .populate('course', 'title subject')
      .populate('topic', 'title duration')
      .sort({ lastAccessed: -1 })
      .limit(10);

    res.json({
      status: 'success',
      data: {
        courseProgress,
        analytics,
        enrolledCourses: user.enrolledCourses,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch progress', error: error.message });
  }
});

// ======================= GET USER PROGRESS BY ID =======================
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to view this progress' });
    }

    const courseProgress = await Progress.getUserProgress(userId);
    const analytics = await Progress.getLearningAnalytics(userId, 30);
    const user = await User.findById(userId).populate('enrolledCourses.courseId', 'title subject grade thumbnail');
    const recentActivity = await Progress.find({ user: userId })
      .populate('course', 'title subject')
      .populate('topic', 'title duration')
      .sort({ lastAccessed: -1 })
      .limit(10);

    res.json({
      status: 'success',
      data: { courseProgress, analytics, enrolledCourses: user.enrolledCourses, recentActivity }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user progress', error: error.message });
  }
});

// ======================= GET TOPIC PROGRESS =======================
router.get('/user/:userId/topic/:topicId', authenticateToken, async (req, res) => {
  try {
    const { userId, topicId } = req.params;
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to view this progress' });
    }

    const topic = await Topic.findById(topicId).populate('course');
    if (!topic) return res.status(404).json({ status: 'error', message: 'Topic not found' });

    const progress = await Progress.findOne({ user: userId, course: topic.course._id, topic: topicId });

    res.json({
      status: 'success',
      data: {
        progress: progress || null,
        topic: {
          _id: topic._id,
          title: topic.title,
          description: topic.description,
          duration: topic.duration,
          difficulty: topic.difficulty
        }
      }
    });
  } catch (error) {
    console.error('Get topic progress error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch topic progress', error: error.message });
  }
});

// ======================= GET LEARNING ANALYTICS =======================
router.get('/analytics/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to view this analytics' });
    }

    const analytics = await Progress.getLearningAnalytics(userId, parseInt(days));

    const subjectProgress = await Progress.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'topics', localField: 'topic', foreignField: '_id', as: 'topicData' } },
      { $unwind: '$topicData' },
      { $group: {
        _id: '$topicData.subject',
        totalTopics: { $sum: 1 },
        completedTopics: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        averageProgress: { $avg: '$progress' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }},
      { $project: {
        subject: '$_id',
        totalTopics: 1,
        completedTopics: 1,
        averageProgress: { $round: ['$averageProgress', 2] },
        completionRate: { $round: [{ $multiply: [{ $divide: ['$completedTopics', '$totalTopics'] }, 100] }, 2] },
        totalTimeSpent: 1
      }}
    ]);

    res.json({ status: 'success', data: { dailyAnalytics: analytics, subjectProgress } });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics', error: error.message });
  }
});

// ======================= MARK TOPIC COMPLETED =======================
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { userId, topicId, completed } = req.body;

    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to update this progress' });
    }

    const topic = await Topic.findById(topicId).populate('course');
    if (!topic) return res.status(404).json({ status: 'error', message: 'Topic not found' });

    const enrolledArr = Array.isArray(topic.course.enrolledCourses) ? topic.course.enrolledCourses : [];
    const isEnrolled = enrolledArr.some(ec => ec.user && ec.user.toString() === userId);
    if (!isEnrolled) return res.status(403).json({ status: 'error', message: 'Not enrolled in this course' });

    let progressRecord = await Progress.findOne({ user: userId, course: topic.course._id, topic: topicId });
    if (!progressRecord) progressRecord = new Progress({ user: userId, course: topic.course._id, topic: topicId });

    if (completed) {
      await progressRecord.updateProgress(100, 0);
      progressRecord.status = 'completed';
      progressRecord.completedAt = new Date();
      try { await awardPointsToUser(userId, POINTS_TABLE.topic_completed); } catch (_) {}
    }

    await progressRecord.save();

    res.json({ status: 'success', message: 'Progress updated successfully', data: { progress: progressRecord } });
  } catch (error) {
    console.error('Mark topic completed error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update progress', error: error.message });
  }
});

// ======================= UPDATE TOPIC PROGRESS =======================
router.put('/topic/:topicId', authenticateToken, validateProgress, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { progress, timeSpent } = req.body;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId).populate('course');
    if (!topic) return res.status(404).json({ status: 'error', message: 'Topic not found' });

    const enrolledArr = Array.isArray(topic.course.enrolledCourses) ? topic.course.enrolledCourses : [];
    const isEnrolled = enrolledArr.some(ec => ec.user.toString() === userId.toString());
    if (!isEnrolled) return res.status(403).json({ status: 'error', message: 'Not enrolled in this course' });

    let progressRecord = await Progress.findOne({ user: userId, course: topic.course._id, topic: topicId });
    if (!progressRecord) progressRecord = new Progress({ user: userId, course: topic.course._id, topic: topicId });

    await progressRecord.updateProgress(progress, timeSpent || 0);

    if (timeSpent) await User.findByIdAndUpdate(userId, { $inc: { totalStudyHours: timeSpent } });

    const courseProgress = await Progress.find({ user: userId, course: topic.course._id });
    const courseAverageProgress = courseProgress.length > 0 ? courseProgress.reduce((sum, p) => sum + p.progress, 0) / courseProgress.length : 0;

    await Course.findByIdAndUpdate(topic.course._id, {
      $set: { 'enrolledCourses.$[elem].progress': Math.round(courseAverageProgress), 'enrolledCourses.$[elem].lastAccessed': new Date() }
    }, { arrayFilters: [{ 'elem.user': userId }] });

    res.json({ status: 'success', message: 'Progress updated successfully', data: { progress: progressRecord } });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update progress', error: error.message });
  }
});

// ======================= QUIZ SUBMISSION =======================
router.post('/topic/:topicId/quiz', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { score, totalQuestions } = req.body;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId).populate('course');
    if (!topic) return res.status(404).json({ status: 'error', message: 'Topic not found' });

    const isEnrolled = topic.course.enrolledCourses.some(ec => ec.user.toString() === userId.toString());
    if (!isEnrolled) return res.status(403).json({ status: 'error', message: 'Not enrolled in this course' });

    let progressRecord = await Progress.findOne({ user: userId, course: topic.course._id, topic: topicId });
    if (!progressRecord) progressRecord = new Progress({ user: userId, course: topic.course._id, topic: topicId });

    await progressRecord.addQuizScore(score, totalQuestions);

    try {
      const pct = totalQuestions > 0 ? score / totalQuestions : 0;
      if (pct >= 0.5) await awardPointsToUser(userId, POINTS_TABLE.quiz_completed);
    } catch (_) {}

    res.json({ status: 'success', message: 'Quiz score recorded successfully', data: { progress: progressRecord } });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit quiz score', error: error.message });
  }
});

// ======================= NOTES =======================
router.post('/topic/:topicId/note', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content, timestamp } = req.body;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId).populate('course');
    if (!topic) return res.status(404).json({ status: 'error', message: 'Topic not found' });

    const isEnrolled = topic.course.enrolledCourses.some(ec => ec.user.toString() === userId.toString());
    if (!isEnrolled) return res.status(403).json({ status: 'error', message: 'Not enrolled in this course' });

    let progressRecord = await Progress.findOne({ user: userId, course: topic.course._id, topic: topicId });
    if (!progressRecord) progressRecord = new Progress({ user: userId, course: topic.course._id, topic: topicId });

    await progressRecord.addNote(content, timestamp || 0);

    res.json({ status: 'success', message: 'Note added successfully', data: { progress: progressRecord } });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add note', error: error.message });
  }
});

// ======================= BOOKMARKS =======================
router.post('/topic/:topicId/bookmark', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { timestamp, title, note } = req.body;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId).populate('course');
    if (!topic) return res.status(404).json({ status: 'error', message: 'Topic not found' });

    const isEnrolled = topic.course.enrolledCourses.some(ec => ec.user.toString() === userId.toString());
    if (!isEnrolled) return res.status(403).json({ status: 'error', message: 'Not enrolled in this course' });

    let progressRecord = await Progress.findOne({ user: userId, course: topic.course._id, topic: topicId });
    if (!progressRecord) progressRecord = new Progress({ user: userId, course: topic.course._id, topic: topicId });

    await progressRecord.addBookmark(timestamp, title, note || '');

    res.json({ status: 'success', message: 'Bookmark added successfully', data: { progress: progressRecord } });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add bookmark', error: error.message });
  }
});

module.exports = router;
