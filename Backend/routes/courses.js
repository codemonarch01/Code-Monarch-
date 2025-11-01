const express = require('express');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const { authenticateToken, optionalAuth, requireInstructor } = require('../middleware/auth');
const { validateCourse, validateTopic } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering and search
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      grade,
      difficulty,
      isFree,
      has3D,
      hasAR,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filters = {
      isPublished: true
    };

    if (subject) filters.subject = subject;
    if (grade) filters.grade = grade;
    if (difficulty) filters.difficulty = difficulty;
    if (isFree !== undefined) filters.isFree = isFree === 'true';
    if (has3D !== undefined) filters['features.has3D'] = has3D === 'true';
    if (hasAR !== undefined) filters['features.hasAR'] = hasAR === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search courses
    const courses = await Course.searchCourses(search, filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Course.countDocuments({
      isPublished: true,
      ...filters,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    });

    // Add enrollment status for authenticated users
    if (req.user) {
      const userCourses = await Course.find({
        _id: { $in: courses.map(c => c._id) },
        'enrolledCourses.user': req.user._id
      }).select('_id enrolledCourses');

      courses.forEach(course => {
        const userEnrollment = userCourses.find(uc => uc._id.equals(course._id));
        course.isEnrolled = !!userEnrollment;
        if (userEnrollment) {
          course.userProgress = userEnrollment.enrolledCourses.find(
            ec => ec.user.equals(req.user._id)
          );
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// @route   GET /api/courses/class/:classId
// @desc    Get courses by class
// @access  Public
router.get('/class/:classId', optionalAuth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Map classId to grade
    const classToGrade = {
      '1': 'Grade 9',
      '2': 'Grade 10', 
      '3': 'Grade 11',
      '4': 'Grade 12'
    };

    const grade = classToGrade[classId];
    if (!grade) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid class ID'
      });
    }

    // Build filter object
    const filters = {
      isPublished: true,
      grade: grade
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get courses by grade
    const courses = await Course.find(filters)
      .populate('instructor', 'name email avatar')
      .populate('topics', 'title duration difficulty order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Course.countDocuments(filters);

    // Add enrollment status for authenticated users
    if (req.user) {
      const userCourses = await Course.find({
        _id: { $in: courses.map(c => c._id) },
        'enrolledCourses.user': req.user._id
      }).select('_id enrolledCourses');

      courses.forEach(course => {
        const userEnrollment = userCourses.find(uc => uc._id.equals(course._id));
        course.isEnrolled = !!userEnrollment;
        if (userEnrollment) {
          course.userProgress = userEnrollment.enrolledCourses.find(
            ec => ec.user.equals(req.user._id)
          );
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses by class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses for class',
      error: error.message
    });
  }
});

// @route   GET /api/courses/subject/:subjectId
// @desc    Get courses by subject
// @access  Public
router.get('/subject/:subjectId', optionalAuth, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Map subjectId to subject name
    const subjectMap = {
      '1': 'Mathematics',
      '2': 'Physics',
      '3': 'Chemistry',
      '4': 'Biology',
      '5': 'Computer Science',
      '6': 'English',
      '7': 'History',
      '8': 'Geography'
    };

    const subject = subjectMap[subjectId];
    if (!subject) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subject ID'
      });
    }

    // Build filter object
    const filters = {
      isPublished: true,
      subject: subject
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get courses by subject
    const courses = await Course.find(filters)
      .populate('instructor', 'name email avatar')
      .populate('topics', 'title duration difficulty order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Course.countDocuments(filters);

    // Add enrollment status for authenticated users
    if (req.user) {
      const userCourses = await Course.find({
        _id: { $in: courses.map(c => c._id) },
        'enrolledCourses.user': req.user._id
      }).select('_id enrolledCourses');

      courses.forEach(course => {
        const userEnrollment = userCourses.find(uc => uc._id.equals(course._id));
        course.isEnrolled = !!userEnrollment;
        if (userEnrollment) {
          course.userProgress = userEnrollment.enrolledCourses.find(
            ec => ec.user.equals(req.user._id)
          );
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get courses by subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses for subject',
      error: error.message
    });
  }
});

// @route   GET /api/courses/search
// @desc    Search courses
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    // Build search filter
    const searchFilter = {
      isPublished: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search courses
    const courses = await Course.find(searchFilter)
      .populate('instructor', 'name email avatar')
      .populate('topics', 'title duration difficulty order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Course.countDocuments(searchFilter);

    // Add enrollment status for authenticated users
    if (req.user) {
      const userCourses = await Course.find({
        _id: { $in: courses.map(c => c._id) },
        'enrolledCourses.user': req.user._id
      }).select('_id enrolledCourses');

      courses.forEach(course => {
        const userEnrollment = userCourses.find(uc => uc._id.equals(course._id));
        course.isEnrolled = !!userEnrollment;
        if (userEnrollment) {
          course.userProgress = userEnrollment.enrolledCourses.find(
            ec => ec.user.equals(req.user._id)
          );
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search courses',
      error: error.message
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('topics', 'title duration difficulty order')
      .populate('reviews.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Add enrollment status for authenticated users
    if (req.user) {
      const userEnrollment = course.enrolledCourses.find(
        ec => ec.user.equals(req.user._id)
      );
      course.isEnrolled = !!userEnrollment;
      if (userEnrollment) {
        course.userProgress = userEnrollment;
      }
    }

    res.json({
      status: 'success',
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course',
      error: error.message
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Instructor/Admin)
router.post('/', authenticateToken, requireInstructor, validateCourse, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user._id,
      instructorName: req.user.name
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Instructor/Admin)
router.put('/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update course',
      error: error.message
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Instructor/Admin)
router.delete('/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this course'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete course',
      error: error.message
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        status: 'error',
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledCourses.some(
      ec => ec.user.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        status: 'error',
        message: 'Already enrolled in this course'
      });
    }

    // Add enrollment
    course.enrolledCourses.push({
      user: req.user._id,
      enrolledAt: new Date()
    });

    await course.enrollStudent();
    await course.save();

    res.json({
      status: 'success',
      message: 'Successfully enrolled in course',
      data: { course }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
});

// @route   POST /api/courses/:id/review
// @desc    Add course review
// @access  Private
router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledCourses.some(
      ec => ec.user.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(400).json({
        status: 'error',
        message: 'Must be enrolled to review this course'
      });
    }

    // Remove existing review from this user
    course.reviews = course.reviews.filter(
      review => review.user.toString() !== req.user._id.toString()
    );

    // Add new review
    course.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    await course.updateRating();
    await course.save();

    res.json({
      status: 'success',
      message: 'Review added successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add review',
      error: error.message
    });
  }
});

// @route   GET /api/courses/:id/topics
// @desc    Get course topics
// @access  Public
router.get('/:id/topics', async (req, res) => {
  try {
    const topics = await Topic.find({ 
      course: req.params.id,
      isPublished: true 
    }).sort({ order: 1 });

    res.json({
      status: 'success',
      data: { topics }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch topics',
      error: error.message
    });
  }
});

// @route   POST /api/courses/:id/topics
// @desc    Add topic to course
// @access  Private (Instructor/Admin)
router.post('/:id/topics', authenticateToken, requireInstructor, validateTopic, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to add topics to this course'
      });
    }

    const topicData = {
      ...req.body,
      course: req.params.id,
      subject: course.subject,
      grade: course.grade
    };

    const topic = new Topic(topicData);
    await topic.save();

    // Add topic to course
    course.topics.push(topic._id);
    await course.save();

    res.status(201).json({
      status: 'success',
      message: 'Topic added successfully',
      data: { topic }
    });
  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add topic',
      error: error.message
    });
  }
});

module.exports = router;
