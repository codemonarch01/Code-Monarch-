const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulearn';


const missingCourses = [
  {
    title: 'Advanced Physics - Grade 12',
    description: 'Comprehensive physics course covering electromagnetism, waves, and modern physics with 3D visualizations',
    subject: 'Physics',
    grade: 'Grade 12',
    instructorName: 'Dr. Sarah Wilson',
    duration: '6 months',
    difficulty: 'Advanced',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
    isPublished: true,
    topics: [],
    learningOutcomes: [
      'Master electromagnetic field theory',
      'Understand wave mechanics and optics',
      'Explore quantum physics concepts',
      'Apply physics to real-world problems'
    ],
    prerequisites: ['Basic Physics', 'Mathematics Grade 11'],
    tags: ['physics', 'electromagnetism', 'waves', 'quantum', '3d-visualization']
  },
  {
    title: 'Organic Chemistry - Grade 12',
    description: 'Advanced chemistry focusing on molecular structures, reactions, and 3D molecular modeling',
    subject: 'Chemistry',
    grade: 'Grade 12',
    instructorName: 'Prof. Michael Chen',
    duration: '6 months',
    difficulty: 'Advanced',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    isPublished: true,
    topics: [],
    learningOutcomes: [
      'Understand molecular geometry in 3D',
      'Master organic reaction mechanisms',
      'Analyze molecular structures',
      'Apply chemistry to biological systems'
    ],
    prerequisites: ['Basic Chemistry', 'Mathematics Grade 11'],
    tags: ['chemistry', 'organic', 'molecules', '3d-models', 'reactions']
  },
  {
    title: 'Advanced Data Structures & Algorithms',
    description: 'Comprehensive computer science course with 3D algorithm visualizations and interactive coding',
    subject: 'Computer Science',
    grade: 'B.Tech',
    instructorName: 'Dr. Priya Sharma',
    duration: '1 semester',
    difficulty: 'Advanced',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
    isPublished: true,
    topics: [],
    learningOutcomes: [
      'Master fundamental data structures',
      'Understand algorithm complexity',
      'Implement efficient algorithms',
      'Visualize data structures in 3D'
    ],
    prerequisites: ['Programming Fundamentals', 'Mathematics'],
    tags: ['computer-science', 'algorithms', 'data-structures', '3d-visualization', 'programming']
  }
];

async function addMissingCourses() {
  try {
    console.log('🌱 Adding Missing Courses for 3D Topics...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get a default instructor (first user in database)
    const defaultInstructor = await User.findOne({});
    if (!defaultInstructor) {
      console.log('❌ No users found in database. Please run the main seed script first.');
      return;
    }
    console.log(`👨‍🏫 Using default instructor: ${defaultInstructor.name}`);

    // Check existing courses
    const existingCourses = await Course.find({});
    console.log(`📚 Found ${existingCourses.length} existing courses:`);
    existingCourses.forEach(course => {
      console.log(`   • ${course.subject} - ${course.grade}: ${course.title}`);
    });

    // Add missing courses
    for (const courseData of missingCourses) {
      const existingCourse = await Course.findOne({
        subject: courseData.subject,
        grade: courseData.grade
      });

      if (existingCourse) {
        console.log(`⚠️ Course already exists: ${courseData.subject} - ${courseData.grade}`);
      } else {
        const courseWithInstructor = {
          ...courseData,
          instructor: defaultInstructor._id
        };
        const newCourse = await Course.create(courseWithInstructor);
        console.log(`✅ Added course: ${newCourse.subject} - ${newCourse.grade}`);
      }
    }

    // Show final course list
    const finalCourses = await Course.find({});
    console.log(`\n📊 Total courses now: ${finalCourses.length}`);
    finalCourses.forEach(course => {
      console.log(`   • ${course.subject} - ${course.grade}: ${course.title}`);
    });

    console.log('\n🎉 Missing courses added successfully!');

  } catch (error) {
    console.error('❌ Error adding missing courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  addMissingCourses();
}

module.exports = { addMissingCourses, missingCourses };
