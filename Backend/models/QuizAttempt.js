const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  ecoPointsEarned: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
quizAttemptSchema.index({ userId: 1, topicId: 1 });
quizAttemptSchema.index({ userId: 1, quizId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
