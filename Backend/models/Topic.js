const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Topic description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true // e.g., "45 min", "1 hour"
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  content: {
    videoUrl: String,
    videoDuration: Number, // in seconds
    notes: String, // Markdown content
    resources: [{
      title: String,
      url: String,
      type: { type: String, enum: ['pdf', 'video', 'link', 'document'] }
    }],
    quiz: {
      questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
      }]
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  learningOutcomes: [String],
  tags: [String],
  aiTips: [{
    time: String, // e.g., "2:30"
    title: String,
    content: String,
    type: { type: String, enum: ['concept', 'formula', 'warning', 'tip'] }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: Number, // video timestamp
    likes: { type: Number, default: 0 },
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  views: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for topic duration in minutes
topicSchema.virtual('durationMinutes').get(function() {
  const match = this.duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
});

// Increment view count
topicSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

// Add comment
topicSchema.methods.addComment = function(userId, content, timestamp = 0) {
  this.comments.push({
    user: userId,
    content,
    timestamp,
    createdAt: new Date()
  });
  return this.save();
};

// Like comment
topicSchema.methods.likeComment = function(commentId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.likes += 1;
    return this.save();
  }
  throw new Error('Comment not found');
};

// Get topic with progress for user
topicSchema.methods.getWithProgress = function(userId) {
  return this.populate({
    path: 'comments.user',
    select: 'name avatar'
  }).exec();
};

// Search topics
topicSchema.statics.searchTopics = function(query, filters = {}) {
  const searchQuery = {
    isPublished: true,
    ...filters
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { subject: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  return this.find(searchQuery)
    .populate('course', 'title subject grade')
    .sort({ order: 1 });
};

module.exports = mongoose.model('Topic', topicSchema);
