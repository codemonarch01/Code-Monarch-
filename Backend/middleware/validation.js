const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('grade')
    .optional()
    .isIn(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'B.Tech', 'Other'])
    .withMessage('Invalid grade level'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Course creation validation
const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('subject')
    .isIn(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Other'])
    .withMessage('Invalid subject'),
  
  body('grade')
    .isIn(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'B.Tech'])
    .withMessage('Invalid grade level'),
  
  body('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required'),
  
  body('price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  handleValidationErrors
];

// Topic creation validation
const validateTopic = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('course')
    .isMongoId()
    .withMessage('Invalid course ID'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required'),
  
  body('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  handleValidationErrors
];

// Contact form validation
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('subject')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Message must be between 3 and 1000 characters'),
  
  body('inquiryType')
    .optional()
    .isIn(['general', 'technical', 'billing', 'partnership', 'feedback'])
    .withMessage('Invalid inquiry type'),
  
  handleValidationErrors
];

// Progress update validation
const validateProgress = [
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number'),
  
  handleValidationErrors
];

// Comment validation
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  
  body('timestamp')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Timestamp must be a positive number'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateCourse,
  validateTopic,
  validateContact,
  validateProgress,
  validateComment
};
