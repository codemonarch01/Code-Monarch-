const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['3d_model', 'ar_content', 'video_lesson', 'quiz', 'recommendation'],
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
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    modelUrl: String, // 3D model file URL
    arData: {
      markers: [String],
      animations: [String],
      interactions: [String]
    },
    videoUrl: String,
    thumbnail: String,
    metadata: {
      fileSize: Number,
      format: String,
      duration: Number,
      dimensions: {
        width: Number,
        height: Number
      }
    }
  },
  features: [{
    name: String,
    description: String,
    icon: String
  }],
  aiTooltips: [{
    position: { x: Number, y: Number, z: Number },
    title: String,
    content: String,
    trigger: String, // 'hover', 'click', 'time'
    isVisible: { type: Boolean, default: true }
  }],
  interactions: [{
    type: { type: String, enum: ['rotation', 'zoom', 'click', 'drag'] },
    description: String,
    parameters: mongoose.Schema.Types.Mixed
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  tags: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  usage: {
    views: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
    ratings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for average rating
aiModelSchema.virtual('averageRating').get(function() {
  if (this.usage.ratings.length === 0) return 0;
  const totalRating = this.usage.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return Math.round((totalRating / this.usage.ratings.length) * 10) / 10;
});

// Increment usage
aiModelSchema.methods.incrementUsage = function(interactionType = 'view') {
  this.usage.views += 1;
  if (interactionType === 'interaction') {
    this.usage.interactions += 1;
  }
  return this.save();
};

// Add rating
aiModelSchema.methods.addRating = function(userId, rating, feedback = '') {
  // Remove existing rating from this user
  this.usage.ratings = this.usage.ratings.filter(r => !r.user.equals(userId));
  
  // Add new rating
  this.usage.ratings.push({
    user: userId,
    rating,
    feedback,
    createdAt: new Date()
  });
  
  return this.save();
};

// Search AI models
aiModelSchema.statics.searchModels = function(query, filters = {}) {
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
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Get popular models
aiModelSchema.statics.getPopularModels = function(limit = 10) {
  return this.find({ isPublished: true })
    .sort({ 'usage.views': -1, 'usage.interactions': -1 })
    .limit(limit)
    .populate('createdBy', 'name email avatar');
};

module.exports = mongoose.model('AIModel', aiModelSchema);
