const User = require('../models/User');

// Centralized points map
const POINTS_TABLE = {
  quiz_completed: 10,
  ar_tree_planting: 20,
  waste_segregation_task: 15,
  climate_change_challenge: 25,
  topic_completed: 5
};

// Centralized badge rules
const BADGE_RULES = [
  { id: 'eco_starter', title: 'Eco Starter', minPoints: 20, icon: '🌱' },
  { id: 'eco_warrior', title: 'Eco Warrior', minPoints: 100, icon: '🛡️' },
  { id: 'green_champion', title: 'Green Champion', minPoints: 250, icon: '🏆' },
  { id: 'climate_hero', title: 'Climate Hero', minPoints: 500, icon: '🌍' }
];

async function awardBadgesIfEligible(userDoc) {
  const existingIds = new Set((userDoc.badges || []).map(b => b.id));
  const earned = [];
  for (const rule of BADGE_RULES) {
    if ((userDoc.ecoPoints || 0) >= rule.minPoints && !existingIds.has(rule.id)) {
      const badge = {
        id: rule.id,
        title: rule.title,
        description: `Reached ${rule.minPoints} eco-points`,
        icon: rule.icon,
        earnedAt: new Date()
      };
      userDoc.badges.push(badge);
      earned.push(badge);
    }
  }
  if (earned.length > 0) await userDoc.save();
  return earned;
}

async function awardPointsToUser(userId, points) {
  const user = await User.findById(userId);
  if (!user) return { user: null, newBadges: [] };
  user.ecoPoints = Math.max(0, (user.ecoPoints || 0) + Number(points || 0));
  await user.save();
  const newBadges = await awardBadgesIfEligible(user);
  return { user, newBadges };
}

module.exports = {
  POINTS_TABLE,
  BADGE_RULES,
  awardBadgesIfEligible,
  awardPointsToUser
};


