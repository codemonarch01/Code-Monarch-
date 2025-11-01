const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulearn';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for leaderboard seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const sampleUsers = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    password: 'password123',
    grade: 'Grade 12',
    ecoPoints: 450,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'green_champion', title: 'Green Champion', description: 'Earned 250+ eco points', icon: '🏆', earnedAt: new Date() },
      { id: 'quiz_master', title: 'Quiz Master', description: 'Passed 5 quizzes', icon: '🎯', earnedAt: new Date() },
      { id: 'perfect_score', title: 'Perfect Score', description: 'Achieved 100% on a quiz', icon: '💯', earnedAt: new Date() }
    ]
  },
  {
    name: 'Arjun Patel',
    email: 'arjun.patel@email.com',
    password: 'password123',
    grade: 'Grade 11',
    ecoPoints: 380,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'green_champion', title: 'Green Champion', description: 'Earned 250+ eco points', icon: '🏆', earnedAt: new Date() },
      { id: 'high_performer', title: 'High Performer', description: 'Scored 90% or above on a quiz', icon: '⭐', earnedAt: new Date() }
    ]
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    password: 'password123',
    grade: 'Grade 12',
    ecoPoints: 320,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'green_champion', title: 'Green Champion', description: 'Earned 250+ eco points', icon: '🏆', earnedAt: new Date() },
      { id: 'first_quiz', title: 'Quiz Starter', description: 'Completed your first quiz', icon: '🎯', earnedAt: new Date() }
    ]
  },
  {
    name: 'Rahul Kumar',
    email: 'rahul.kumar@email.com',
    password: 'password123',
    grade: 'Grade 10',
    ecoPoints: 280,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'high_performer', title: 'High Performer', description: 'Scored 90% or above on a quiz', icon: '⭐', earnedAt: new Date() },
      { id: 'perfect_score', title: 'Perfect Score', description: 'Achieved 100% on a quiz', icon: '💯', earnedAt: new Date() }
    ]
  },
  {
    name: 'Kavya Singh',
    email: 'kavya.singh@email.com',
    password: 'password123',
    grade: 'Grade 11',
    ecoPoints: 250,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'green_champion', title: 'Green Champion', description: 'Earned 250+ eco points', icon: '🏆', earnedAt: new Date() }
    ]
  },
  {
    name: 'Vikram Joshi',
    email: 'vikram.joshi@email.com',
    password: 'password123',
    grade: 'Grade 12',
    ecoPoints: 220,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'quiz_master', title: 'Quiz Master', description: 'Passed 5 quizzes', icon: '🎯', earnedAt: new Date() }
    ]
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.gupta@email.com',
    password: 'password123',
    grade: 'Grade 10',
    ecoPoints: 180,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'high_performer', title: 'High Performer', description: 'Scored 90% or above on a quiz', icon: '⭐', earnedAt: new Date() }
    ]
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@email.com',
    password: 'password123',
    grade: 'Grade 11',
    ecoPoints: 150,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'first_quiz', title: 'Quiz Starter', description: 'Completed your first quiz', icon: '🎯', earnedAt: new Date() }
    ]
  },
  {
    name: 'Isha Agarwal',
    email: 'isha.agarwal@email.com',
    password: 'password123',
    grade: 'Grade 12',
    ecoPoints: 120,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() }
    ]
  },
  {
    name: 'Aditya Banerjee',
    email: 'adityabanarjee982@gmail.com',
    password: 'password123',
    grade: 'Grade 12',
    ecoPoints: 160,
    badges: [
      { id: 'eco_warrior', title: 'Eco Warrior', description: 'Earned 100+ eco points', icon: '🌱', earnedAt: new Date() },
      { id: 'high_performer', title: 'High Performer', description: 'Scored 90% or above on a quiz', icon: '⭐', earnedAt: new Date() }
    ]
  }
];

async function seedLeaderboard() {
  try {
    console.log('🌱 Starting leaderboard seeding...');

    // Clear existing users (optional - remove this if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');

    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        // Update existing user with eco points and badges
        existingUser.ecoPoints = userData.ecoPoints;
        existingUser.badges = userData.badges;
        await existingUser.save();
        console.log(`✅ Updated user: ${userData.name}`);
      } else {
        // Create new user
        const newUser = new User(userData);
        await newUser.save();
        console.log(`✅ Created user: ${userData.name}`);
      }
    }

    console.log('🎉 Leaderboard seeding completed successfully!');
    console.log(`📊 Created/Updated ${sampleUsers.length} users with eco points and badges`);
    
    // Show leaderboard preview
    const topUsers = await User.find({})
      .sort({ ecoPoints: -1 })
      .limit(5)
      .select('name ecoPoints badges');
    
    console.log('\n🏆 Top 5 Users:');
    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.ecoPoints} points (${user.badges.length} badges)`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Leaderboard seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedLeaderboard();
