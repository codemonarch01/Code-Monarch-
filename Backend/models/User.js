const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  grade: {
    type: String,
    enum: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'B.Tech', 'Other'],
    default: 'Grade 11'
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  // Total eco-points earned via gamified environmental activities
  ecoPoints: {
    type: Number,
    default: 0
  },
  // Badges unlocked based on eco-points milestones or specific tasks
  badges: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  learningStreak: {
    type: Number,
    default: 0
  },
  totalStudyHours: {
    type: Number,
    default: 0
  },
  preferences: {
    subjects: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      aiTips: { type: Boolean, default: true }
    }
  },
  achievements: [{
    id: String,
    title: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }
  }],
  enrolledCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    completedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    lastAccessed: { type: Date, default: Date.now }
  }],
  aiRecommendations: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    reason: String,
    confidence: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  // Quiz completions tracking
  quizCompletions: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: Number,
    percentage: Number,
    passed: Boolean,
    ecoPointsEarned: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  // Topic mastery levels
  topicMastery: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    masteryLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
    quizAttempts: Number,
    bestScore: Number,
    lastAttempt: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user progress summary
userSchema.methods.getProgressSummary = function() {
  const completedCourses = this.enrolledCourses.filter(course => course.progress === 100).length;
  const totalCourses = this.enrolledCourses.length;
  const averageProgress = totalCourses > 0 
    ? this.enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / totalCourses 
    : 0;

  return {
    totalCourses,
    completedCourses,
    averageProgress: Math.round(averageProgress),
    learningStreak: this.learningStreak,
    totalStudyHours: this.totalStudyHours,
    achievements: this.achievements.length
  };
};

// Update learning streak
userSchema.methods.updateLearningStreak = function() {
  const today = new Date();
  const lastLogin = new Date(this.lastLogin);
  const diffTime = today - lastLogin;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    this.learningStreak += 1;
  } else if (diffDays > 1) {
    this.learningStreak = 1;
  }

  this.lastLogin = today;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
