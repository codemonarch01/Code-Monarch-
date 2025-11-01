const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      search,
      role,
      grade,
      isActive,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {};
    if (role) filters.role = role;
    if (grade) filters.grade = grade;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    let query = { ...filters };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users
    const users = await User.find(query)
      .select('-password')
      .populate('enrolledCourses.courseId', 'title subject grade')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access this profile
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this profile'
      });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourses.courseId', 'title subject grade thumbnail')
      .populate('aiRecommendations.courseId', 'title subject grade thumbnail');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user progress summary
    const progressSummary = user.getProgressSummary();

    res.json({
      status: 'success',
      data: {
        user,
        progress: progressSummary
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Check if user can update this profile
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this profile'
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role; // Only admin can change role
    delete updateData.isActive; // Only admin can change active status

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account instead of hard delete
    user.isActive = false;
    await user.save();

    res.json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/courses
// @desc    Get user's enrolled courses
// @access  Private
router.get('/:id/courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access this data
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this data'
      });
    }

    const user = await User.findById(userId)
      .populate('enrolledCourses.courseId', 'title subject grade thumbnail instructorName rating')
      .select('enrolledCourses');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { courses: user.enrolledCourses }
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user courses',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/progress
// @desc    Get user's learning progress
// @access  Private
router.get('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access this data
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this data'
      });
    }

    // Get user's course progress
    const courseProgress = await Progress.getUserProgress(userId);

    // Get learning analytics for last 30 days
    const analytics = await Progress.getLearningAnalytics(userId, 30);

    res.json({
      status: 'success',
      data: {
        courseProgress,
        analytics
      }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user progress',
      error: error.message
    });
  }
});

// =============== USER SKILLS (stored in preferences.subjects) ===============
// GET /api/users/:id/skills - fetch user's skills list
router.get('/:id/skills', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }
    const user = await User.findById(userId).select('preferences.subjects');
    const skills = user?.preferences?.subjects || [];
    return res.json({ status: 'success', data: { skills } });
  } catch (error) {
    console.error('Get skills error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch skills', error: error.message });
  }
});

// POST /api/users/:id/skills - add a skill
router.post('/:id/skills', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { skill } = req.body || {};
    if (!skill || typeof skill !== 'string' || skill.trim().length < 2) {
      return res.status(400).json({ status: 'error', message: 'Valid skill is required' });
    }
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized' });
    }

    const clean = skill.trim();
    const updated = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { 'preferences.subjects': clean } },
      { new: true, runValidators: false, select: 'preferences.subjects' }
    );

    if (!updated) return res.status(404).json({ status: 'error', message: 'User not found' });
    const skills = updated.preferences?.subjects || [];
    return res.json({ status: 'success', message: 'Skill added', data: { skills } });
  } catch (error) {
    console.error('Add skill error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to add skill', error: error.message });
  }
});

// @route   GET /api/users/:id/achievements
// @desc    Get user's achievements
// @access  Private
router.get('/:id/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access this data
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this data'
      });
    }

    const user = await User.findById(userId).select('achievements');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { achievements: user.achievements }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user achievements',
      error: error.message
    });
  }
});

// @route   POST /api/users/:id/achievements
// @desc    Add achievement to user
// @access  Private
router.post('/:id/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { id, title, description, icon } = req.body;

    // Check if user can update this profile
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this profile'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if achievement already exists
    const existingAchievement = user.achievements.find(a => a.id === id);
    if (existingAchievement) {
      return res.status(400).json({
        status: 'error',
        message: 'Achievement already exists'
      });
    }

    // Add achievement
    user.achievements.push({
      id,
      title,
      description,
      icon,
      earnedAt: new Date()
    });

    await user.save();

    res.json({
      status: 'success',
      message: 'Achievement added successfully',
      data: { achievements: user.achievements }
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add achievement',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this data
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view these stats'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's learning statistics
    const userProgress = await Progress.getUserProgress(id);
    const learningAnalytics = await Progress.getLearningAnalytics(id, 30);

    // Calculate stats
    const totalCourses = user.enrolledCourses.length;
    const completedCourses = userProgress.filter(p => p.status === 'completed').length;
    const totalStudyHours = user.totalStudyHours || 0;
    const learningStreak = user.learningStreak || 0;
    const achievements = user.achievements.length;

    // Get recent activity
    const recentActivity = await Progress.find({ user: id })
      .populate('course', 'title subject')
      .populate('topic', 'title duration')
      .sort({ lastAccessed: -1 })
      .limit(5);

    const stats = {
      totalCourses,
      completedCourses,
      totalStudyHours,
      learningStreak,
      achievements,
      recentActivity,
      progress: userProgress,
      analytics: learningAnalytics
    };

    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          instructors: { $sum: { $cond: [{ $eq: ['$role', 'instructor'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          byGrade: {
            $push: {
              grade: '$grade',
              role: '$role'
            }
          }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: { stats: stats[0] || {} }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

module.exports = router;
