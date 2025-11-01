const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // Index of correct option (0, 1, 2, 3)
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

const quizSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes
    default: 15
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total points when questions are added
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
