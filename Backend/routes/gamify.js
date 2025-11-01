const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { POINTS_TABLE, awardBadgesIfEligible, awardPointsToUser } = require('../utils/gamify');

// Award eco-points directly
router.post('/award', authenticateToken, async (req, res, next) => {
  try {
    const { userId, points, reason } = req.body;
    const id = userId || req.user._id;
    if (!points || Number.isNaN(Number(points))) {
      return res.status(400).json({ status: 'error', message: 'Valid points required' });
    }
    const { user, newBadges } = await awardPointsToUser(id, Number(points));
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: { ecoPoints: user.ecoPoints, newBadges }, message: `Awarded ${points} points${reason ? ' for ' + reason : ''}` });
  } catch (err) { next(err); }
});

// Complete a gamified task (mapped to points)
router.post('/complete-task', authenticateToken, async (req, res, next) => {
  try {
    const { taskType, courseId, topicId } = req.body;
    const points = POINTS_TABLE[taskType] || 0;
    if (!points) return res.status(400).json({ status: 'error', message: 'Unknown taskType' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    user.ecoPoints = Math.max(0, (user.ecoPoints || 0) + points);
    await user.save();

    // Optionally mark topic progress for topic-related tasks
    if (topicId && courseId) {
      await Progress.findOneAndUpdate(
        { user: req.user._id, course: courseId, topic: topicId },
        { $setOnInsert: { status: 'completed', progress: 100, completedAt: new Date() }, $max: { progress: 100 }, $set: { status: 'completed' } },
        { upsert: true, new: true }
      );
    }

    const newBadges = await awardBadgesIfEligible(user);
    res.json({ status: 'success', data: { ecoPoints: user.ecoPoints, newBadges, taskType, points } });
  } catch (err) { next(err); }
});

// Leaderboard by eco-points (global or by grade)
router.get('/leaderboard', optionalAuth, async (req, res, next) => {
  try {
    const { grade, limit = 20 } = req.query;
    const query = {};
    if (grade) query.grade = grade;
    const users = await User.find(query)
      .select('name avatar grade ecoPoints badges')
      .sort({ ecoPoints: -1 })
      .limit(Math.min(Number(limit) || 20, 100));
    res.json({ status: 'success', data: { users } });
  } catch (err) { next(err); }
});

// Get current user eco profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ecoPoints badges');
    res.json({ status: 'success', data: { ecoPoints: user.ecoPoints || 0, badges: user.badges || [] } });
  } catch (err) { next(err); }
});

module.exports = router;


