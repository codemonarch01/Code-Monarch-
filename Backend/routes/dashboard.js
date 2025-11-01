const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const AIModel = require('../models/AIModel');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's progress data
    const userProgress = await Progress.getUserProgress(userId);
    
    // Calculate statistics
    const totalCourses = user.enrolledCourses.length;
    const completedCourses = userProgress.filter(cp => cp.completionRate === 100).length;
    const inProgressCourses = totalCourses - completedCourses;
    
    const totalTopics = userProgress.reduce((sum, cp) => sum + cp.totalTopics, 0);
    const completedTopics = userProgress.reduce((sum, cp) => sum + cp.completedTopics, 0);
    
    const averageProgress = userProgress.length > 0 
      ? userProgress.reduce((sum, cp) => sum + cp.averageProgress, 0) / userProgress.length 
      : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProgress = await Progress.find({
      user: userId,
      lastAccessed: { $gte: sevenDaysAgo }
    }).populate('course topic').sort({ lastAccessed: -1 }).limit(5);

    // Get achievements
    const achievements = generateAchievements(user, userProgress);

    // Get learning streak data
    const streakData = {
      current: user.learningStreak,
      longest: user.longestStreak || user.learningStreak,
      totalDays: Math.floor(user.totalStudyHours / 2) // Assuming 2 hours per day
    };

    res.json({
      status: 'success',
      data: {
        user: {
          name: user.name,
          email: user.email,
          grade: user.grade,
          avatar: user.avatar
        },
        stats: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalTopics,
          completedTopics,
          averageProgress: Math.round(averageProgress),
          totalStudyHours: user.totalStudyHours,
          learningStreak: user.learningStreak
        },
        recentActivity: recentProgress.map(progress => ({
          id: progress._id,
          courseTitle: progress.course.title,
          topicTitle: progress.topic.title,
          progress: progress.progress,
          lastAccessed: progress.lastAccessed,
          status: progress.status
        })),
        achievements,
        streakData
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/recommendations
// @desc    Get personalized recommendations for dashboard
// @access  Private
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's enrolled course IDs
    const enrolledCourseIds = user.enrolledCourses.map(ec => ec.courseId);

    // Get user's preferences
    const preferredSubjects = user.preferences?.subjects || [];
    const difficulty = user.preferences?.difficulty || 'beginner';

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
      .limit(6);

    // Get popular AI models
    const popularModels = await AIModel.find({
      isPublished: true,
      subject: { $in: preferredSubjects.length > 0 ? preferredSubjects : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'] }
    })
      .sort({ 'usage.views': -1, 'usage.interactions': -1 })
      .limit(4);

    // Get trending topics
    const trendingTopics = await Topic.find({
      isPublished: true,
      subject: { $in: preferredSubjects.length > 0 ? preferredSubjects : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'] }
    })
      .populate('course', 'title subject grade')
      .sort({ views: -1, createdAt: -1 })
      .limit(4);

    res.json({
      status: 'success',
      data: {
        recommendedCourses: recommendedCourses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description,
          subject: course.subject,
          grade: course.grade,
          instructor: course.instructor,
          duration: course.duration,
          difficulty: course.difficulty,
          rating: course.rating,
          students: course.students,
          thumbnail: course.thumbnail,
          color: course.color,
          features: course.features,
          tags: course.tags,
          isAIRecommended: course.isAIRecommended
        })),
        popularModels: popularModels.map(model => ({
          id: model._id,
          name: model.name,
          title: model.title,
          description: model.description,
          type: model.type,
          subject: model.subject,
          grade: model.grade,
          thumbnail: model.content.thumbnail,
          features: model.features,
          tags: model.tags,
          usage: model.usage
        })),
        trendingTopics: trendingTopics.map(topic => ({
          id: topic._id,
          title: topic.title,
          description: topic.description,
          subject: topic.subject,
          grade: topic.grade,
          duration: topic.duration,
          difficulty: topic.difficulty,
          course: topic.course,
          views: topic.views,
          tags: topic.tags
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/continue-learning
// @desc    Get courses/topics to continue learning
// @access  Private
router.get('/continue-learning', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's progress data
    const userProgress = await Progress.getUserProgress(userId);
    
    // Filter in-progress courses
    const inProgressCourses = userProgress.filter(cp => cp.completionRate > 0 && cp.completionRate < 100);
    
    // Get detailed course data for in-progress courses
    const continueLearningData = await Promise.all(
      inProgressCourses.map(async (courseProgress) => {
        const course = await Course.findById(courseProgress.courseId)
          .populate('instructor', 'name email avatar')
          .populate('topics', 'title duration difficulty order');
        
        if (!course) return null;

        // Get next topic to learn
        const nextTopic = course.topics.find(topic => 
          !courseProgress.completedTopics.includes(topic._id.toString())
        );

        return {
          course: {
            id: course._id,
            title: course.title,
            description: course.description,
            subject: course.subject,
            grade: course.grade,
            instructor: course.instructor,
            thumbnail: course.thumbnail,
            color: course.color,
            duration: course.duration,
            difficulty: course.difficulty
          },
          progress: {
            completionRate: courseProgress.completionRate,
            completedTopics: courseProgress.completedTopics.length,
            totalTopics: courseProgress.totalTopics,
            lastAccessed: courseProgress.lastAccessed,
            timeSpent: courseProgress.timeSpent
          },
          nextTopic: nextTopic ? {
            id: nextTopic._id,
            title: nextTopic.title,
            duration: nextTopic.duration,
            difficulty: nextTopic.difficulty,
            order: nextTopic.order
          } : null
        };
      })
    );

    // Filter out null values and sort by last accessed
    const filteredData = continueLearningData
      .filter(item => item !== null)
      .sort((a, b) => new Date(b.progress.lastAccessed) - new Date(a.progress.lastAccessed));

    res.json({
      status: 'success',
      data: {
        continueLearning: filteredData,
        totalInProgress: filteredData.length
      }
    });
  } catch (error) {
    console.error('Get continue learning error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch continue learning data',
      error: error.message
    });
  }
});

// Helper function to generate achievements
function generateAchievements(user, userProgress) {
  const achievements = [];

  // Learning streak achievements
  if (user.learningStreak >= 7) {
    achievements.push({
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Maintained a 7-day learning streak',
      icon: '🔥',
      unlocked: true,
      unlockedAt: new Date()
    });
  }

  if (user.learningStreak >= 30) {
    achievements.push({
      id: 'month_streak',
      title: 'Monthly Master',
      description: 'Maintained a 30-day learning streak',
      icon: '🏆',
      unlocked: true,
      unlockedAt: new Date()
    });
  }

  // Course completion achievements
  const completedCourses = userProgress.filter(cp => cp.completionRate === 100).length;
  
  if (completedCourses >= 1) {
    achievements.push({
      id: 'first_course',
      title: 'First Steps',
      description: 'Completed your first course',
      icon: '🎓',
      unlocked: true,
      unlockedAt: new Date()
    });
  }

  if (completedCourses >= 5) {
    achievements.push({
      id: 'course_explorer',
      title: 'Course Explorer',
      description: 'Completed 5 courses',
      icon: '🌟',
      unlocked: true,
      unlockedAt: new Date()
    });
  }

  // Study time achievements
  if (user.totalStudyHours >= 10) {
    achievements.push({
      id: 'dedicated_learner',
      title: 'Dedicated Learner',
      description: 'Studied for 10+ hours',
      icon: '⏰',
      unlocked: true,
      unlockedAt: new Date()
    });
  }

  if (user.totalStudyHours >= 50) {
    achievements.push({
      id: 'study_master',
      title: 'Study Master',
      description: 'Studied for 50+ hours',
      icon: '📚',
      unlocked: true,
      unlockedAt: new Date()
    });
  }

  // Subject mastery achievements
  const subjectProgress = userProgress.reduce((acc, cp) => {
    const subject = cp.course.subject;
    if (!acc[subject]) {
      acc[subject] = { total: 0, completed: 0 };
    }
    acc[subject].total += 1;
    acc[subject].completed += cp.completedTopics;
    return acc;
  }, {});

  Object.entries(subjectProgress).forEach(([subject, data]) => {
    if (data.completed >= 10) {
      achievements.push({
        id: `${subject.toLowerCase()}_expert`,
        title: `${subject} Expert`,
        description: `Completed 10+ topics in ${subject}`,
        icon: '🎯',
        unlocked: true,
        unlockedAt: new Date()
      });
    }
  });

  return achievements;
}

module.exports = router;
