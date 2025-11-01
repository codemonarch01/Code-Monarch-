const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  quizScores: [{
    attempt: Number,
    score: Number,
    totalQuestions: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  notes: [{
    content: String,
    timestamp: Number, // video timestamp
    createdAt: { type: Date, default: Date.now }
  }],
  bookmarks: [{
    timestamp: Number,
    title: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  aiInsights: [{
    type: { type: String, enum: ['recommendation', 'warning', 'tip', 'achievement'] },
    content: String,
    confidence: Number,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ user: 1, course: 1, topic: 1 }, { unique: true });

// Update progress
progressSchema.methods.updateProgress = function(progress, timeSpent = 0) {
  this.progress = Math.min(100, Math.max(0, progress));
  this.timeSpent += timeSpent;
  this.lastAccessed = new Date();
  
  if (progress >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (progress > 0 && this.status === 'not_started') {
    this.status = 'in_progress';
  }
  
  return this.save();
};

// Add quiz score
progressSchema.methods.addQuizScore = function(score, totalQuestions) {
  const attempt = this.quizScores.length + 1;
  this.quizScores.push({
    attempt,
    score,
    totalQuestions,
    completedAt: new Date()
  });
  return this.save();
};

// Add note
progressSchema.methods.addNote = function(content, timestamp = 0) {
  this.notes.push({
    content,
    timestamp,
    createdAt: new Date()
  });
  return this.save();
};

// Add bookmark
progressSchema.methods.addBookmark = function(timestamp, title, note = '') {
  this.bookmarks.push({
    timestamp,
    title,
    note,
    createdAt: new Date()
  });
  return this.save();
};

// Get user's course progress
progressSchema.statics.getCourseProgress = function(userId, courseId) {
  return this.find({ user: userId, course: courseId })
    .populate('topic', 'title duration difficulty order')
    .sort({ 'topic.order': 1 });
};

// Get user's overall progress
progressSchema.statics.getUserProgress = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$course',
        totalTopics: { $sum: 1 },
        completedTopics: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageProgress: { $avg: '$progress' }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $project: {
        course: '$course',
        totalTopics: 1,
        completedTopics: 1,
        totalTimeSpent: 1,
        averageProgress: { $round: ['$averageProgress', 2] },
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$completedTopics', '$totalTopics'] }, 100] },
            2
          ]
        }
      }
    }
  ]);
};

// Get learning analytics
progressSchema.statics.getLearningAnalytics = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        lastAccessed: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$lastAccessed' }
        },
        topicsStudied: { $sum: 1 },
        timeSpent: { $sum: '$timeSpent' },
        topicsCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema);
