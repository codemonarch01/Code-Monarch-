const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  inquiryType: {
    type: String,
    enum: ['general', 'technical', 'billing', 'partnership', 'feedback'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    content: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date
  },
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'chat'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Auto-assign priority based on inquiry type
contactSchema.pre('save', function(next) {
  if (this.inquiryType === 'technical' || this.inquiryType === 'billing') {
    this.priority = 'high';
  } else if (this.inquiryType === 'partnership') {
    this.priority = 'medium';
  } else {
    this.priority = 'low';
  }
  next();
});

// Mark as read
contactSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Add response
contactSchema.methods.addResponse = function(content, respondedBy) {
  this.response = {
    content,
    respondedBy,
    respondedAt: new Date()
  };
  this.status = 'resolved';
  return this.save();
};

// Update status
contactSchema.methods.updateStatus = function(status, assignedTo = null) {
  this.status = status;
  if (assignedTo) {
    this.assignedTo = assignedTo;
  }
  return this.save();
};

// Search contacts
contactSchema.statics.searchContacts = function(query, filters = {}) {
  const searchQuery = { ...filters };

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { subject: { $regex: query, $options: 'i' } },
      { message: { $regex: query, $options: 'i' } }
    ];
  }

  return this.find(searchQuery)
    .populate('assignedTo', 'name email')
    .populate('response.respondedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Get contact statistics
contactSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        byType: {
          $push: {
            type: '$inquiryType',
            status: '$status'
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        new: 1,
        inProgress: 1,
        resolved: 1,
        closed: 1,
        resolutionRate: {
          $round: [
            { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] },
            2
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Contact', contactSchema);
