const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const { awardPointsToUser, BADGE_RULES } = require('../utils/gamify');

// POST /api/eco/addPoints
router.post('/addPoints', authenticateToken, async (req, res, next) => {
  try {
    const { points, reason } = req.body;
    const numeric = Number(points);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return res.status(400).json({ status: 'error', message: 'Positive points required' });
    }
    const { user, newBadges } = await awardPointsToUser(req.user._id, numeric);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: { ecoPoints: user.ecoPoints, badges: user.badges, newBadges }, message: reason ? `Added ${numeric} points for ${reason}` : `Added ${numeric} points` });
  } catch (err) { next(err); }
});

// GET /api/leaderboard
router.get('/leaderboard', optionalAuth, async (req, res, next) => {
  try {
    const { school, college, grade, class: classAlias, limit = 10 } = req.query;
    const query = {};
    // Grade or class alias
    const gradeValue = grade || classAlias;
    if (gradeValue) query['grade'] = gradeValue;
    // Case-insensitive matching for school/college if provided
    if (school) query['preferences.school'] = { $regex: String(school), $options: 'i' };
    if (college) query['preferences.college'] = { $regex: String(college), $options: 'i' };
    const safeLimit = Math.min(Number(limit) || 10, 100);
    const users = await User.find(query)
      .select('name avatar grade ecoPoints badges')
      .sort({ ecoPoints: -1 })
      .limit(safeLimit);
    res.json({ status: 'success', data: { users } });
  } catch (err) { next(err); }
});

// GET /api/eco/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ecoPoints badges');
    res.json({ status: 'success', data: { ecoPoints: user?.ecoPoints || 0, badges: user?.badges || [], rules: BADGE_RULES } });
  } catch (err) { next(err); }
});

module.exports = router;


