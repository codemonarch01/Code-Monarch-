const express = require('express');
const Contact = require('../models/Contact');
const { validateContact } = require('../middleware/validation');
const { sendContactEmails } = require('../services/email');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', validateContact, async (req, res) => {
  try {
    const { name, email, subject, message, inquiryType } = req.body;

    // Create contact record
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      inquiryType: inquiryType || 'general'
    });

    await contact.save();

    // Send email notification with robust fallback
    try {
      await sendContactEmails({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        inquiryType: contact.inquiryType,
        createdAt: contact.createdAt
      });
    } catch (emailError) {
      console.error('Email sending failed, but contact saved:', emailError.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully. We\'ll get back to you soon!',
      data: { contactId: contact._id }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message. Please try again later.',
      error: error.message
    });
  }
});

// @route   GET /api/contact/faq
// @desc    Get FAQ data
// @access  Public
router.get('/faq', async (req, res) => {
  try {
    const faqs = [
      {
        id: 1,
        question: 'How do I get started with EduLearn?',
        answer: 'Simply create an account, choose your grade level, and start exploring our course catalog. Our AI will recommend the best courses for you based on your interests and learning goals.',
        category: 'general'
      },
      {
        id: 2,
        question: 'Is EduLearn free to use?',
        answer: 'Yes! EduLearn offers a free tier with access to basic courses and features. We also have premium plans with advanced features, 3D/AR content, and personalized learning paths.',
        category: 'billing'
      },
      {
        id: 3,
        question: 'What devices are supported?',
        answer: 'EduLearn works on all modern devices including desktop computers, tablets, and smartphones. For the best 3D/AR experience, we recommend using a device with a modern web browser.',
        category: 'technical'
      },
      {
        id: 4,
        question: 'How does the AI learning assistant work?',
        answer: 'Our AI analyzes your learning patterns, progress, and preferences to provide personalized recommendations, adaptive content, and real-time feedback to optimize your learning experience.',
        category: 'general'
      },
      {
        id: 5,
        question: 'Can I use EduLearn offline?',
        answer: 'Some content is available for offline viewing. You can download lessons and materials when you have an internet connection and access them later without being online.',
        category: 'technical'
      },
      {
        id: 6,
        question: 'How do I contact technical support?',
        answer: 'You can reach our technical support team through email, live chat, or phone. We also have a comprehensive help center with troubleshooting guides and video tutorials.',
        category: 'technical'
      },
      {
        id: 7,
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.',
        category: 'technical'
      },
      {
        id: 8,
        question: 'Can I get a refund?',
        answer: 'We offer a 30-day money-back guarantee for all paid courses. If you\'re not satisfied with your purchase, contact our support team within 30 days for a full refund.',
        category: 'billing'
      },
      {
        id: 9,
        question: 'How do I update my profile?',
        answer: 'Go to your profile page and click "Edit Profile" to update your personal information, preferences, and learning goals.',
        category: 'general'
      },
      {
        id: 10,
        question: 'Is my data secure?',
        answer: 'Yes, we take data security seriously. All your personal information and learning data is encrypted and stored securely. We never share your data with third parties without your consent.',
        category: 'general'
      }
    ];

    res.json({
      status: 'success',
      data: { faqs }
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch FAQ data',
      error: error.message
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Contact.getStatistics();

    res.json({
      status: 'success',
      data: { stats: stats[0] || {} }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contact statistics',
      error: error.message
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private (Admin)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      inquiryType,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (inquiryType) filters.inquiryType = inquiryType;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search contacts
    const contacts = await Contact.searchContacts(search, filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Contact.countDocuments({
      ...filters,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ]
      })
    });

    res.json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { status, assignedTo, response } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
    }

    // Update status
    if (status) {
      await contact.updateStatus(status, assignedTo);
    }

    // Add response
    if (response) {
      await contact.addResponse(response.content, response.respondedBy);
    }

    res.json({
      status: 'success',
      message: 'Contact message updated successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update contact message',
      error: error.message
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
});

// Old inline email sender removed in favor of centralized service

module.exports = router;
