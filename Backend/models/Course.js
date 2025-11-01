const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Other']
  },
  grade: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'B.Tech']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    required: true // e.g., "6 weeks", "45 min"
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  price: {
    type: Number,
    default: 0 // 0 for free courses
  },
  isFree: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  students: {
    enrolled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  features: {
    has3D: { type: Boolean, default: false },
    hasAR: { type: Boolean, default: false },
    hasVideo: { type: Boolean, default: true },
    hasQuiz: { type: Boolean, default: false },
    hasNotes: { type: Boolean, default: true }
  },
  tags: [String],
  prerequisites: [String],
  learningOutcomes: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  isAIRecommended: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'from-blue-500 to-purple-600'
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Virtual for course completion percentage
courseSchema.virtual('completionRate').get(function() {
  if (this.students.enrolled === 0) return 0;
  return Math.round((this.students.completed / this.students.enrolled) * 100);
});

// Update rating when new review is added
courseSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Add student enrollment
courseSchema.methods.enrollStudent = function() {
  this.students.enrolled += 1;
  return this.save();
};

// Mark course as completed by student
courseSchema.methods.completeCourse = function() {
  this.students.completed += 1;
  return this.save();
};

// Search courses
courseSchema.statics.searchCourses = function(query, filters = {}) {
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
    .populate('instructor', 'name email avatar')
    .populate('topics', 'title duration difficulty')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Course', courseSchema);
