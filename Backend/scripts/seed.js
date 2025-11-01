const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const AIModel = require('../models/AIModel');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@edulearn.com',
    password: 'admin123',
    role: 'admin',
    grade: 'Grade 12'
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@edulearn.com',
    password: 'instructor123',
    role: 'instructor',
    grade: 'Grade 12'
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@edulearn.com',
    password: 'student123',
    role: 'student',
    grade: 'Grade 12'
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@edulearn.com',
    password: 'student123',
    role: 'student',
    grade: 'Grade 11'
  }
];

const sampleCourses = [
  {
    title: 'Advanced Mathematics',
    description: 'Comprehensive course covering calculus, algebra, and advanced mathematical concepts with interactive 3D visualizations.',
    subject: 'Mathematics',
    grade: 'Grade 12',
    duration: '6 weeks',
    difficulty: 'Advanced',
    isFree: true,
    features: {
      has3D: true,
      hasAR: false,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['calculus', 'algebra', 'trigonometry', 'advanced'],
    learningOutcomes: [
      'Master advanced calculus concepts',
      'Solve complex algebraic equations',
      'Apply mathematical principles to real-world problems'
    ],
    color: 'from-blue-500 to-purple-600'
  },
  {
    title: 'Physics in 3D',
    description: 'Explore physics concepts through immersive 3D simulations and interactive experiments.',
    subject: 'Physics',
    grade: 'Grade 11',
    duration: '8 weeks',
    difficulty: 'Intermediate',
    isFree: true,
    features: {
      has3D: true,
      hasAR: true,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['mechanics', 'thermodynamics', 'waves', '3d'],
    learningOutcomes: [
      'Understand fundamental physics principles',
      'Visualize complex physical phenomena',
      'Apply physics concepts in practical scenarios'
    ],
    color: 'from-green-500 to-teal-600'
  },
  {
    title: 'Chemistry Lab AR',
    description: 'Virtual chemistry lab with AR experiments and interactive molecular models.',
    subject: 'Chemistry',
    grade: 'Grade 10',
    duration: '4 weeks',
    difficulty: 'Beginner',
    isFree: true,
    features: {
      has3D: false,
      hasAR: true,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['organic', 'inorganic', 'lab', 'ar'],
    learningOutcomes: [
      'Perform virtual chemistry experiments',
      'Understand molecular structures',
      'Learn chemical reactions safely'
    ],
    color: 'from-orange-500 to-red-600'
  },
  {
    title: 'Biology 3D Models',
    description: 'Detailed 3D models of human anatomy, cell structures, and biological processes.',
    subject: 'Biology',
    grade: 'Grade 9',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    isFree: true,
    features: {
      has3D: true,
      hasAR: false,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['anatomy', 'cell biology', 'genetics', '3d'],
    learningOutcomes: [
      'Explore human anatomy in 3D',
      'Understand cellular processes',
      'Learn about genetic inheritance'
    ],
    color: 'from-pink-500 to-rose-600'
  }
];

const sampleTopics = [
  {
    title: 'Introduction to Calculus',
    description: 'Basic concepts and fundamental principles of calculus',
    duration: '45 min',
    difficulty: 'Beginner',
    order: 1,
    content: {
      videoUrl: 'https://example.com/video1.mp4',
      videoDuration: 2700, // 45 minutes in seconds
      notes: `# Introduction to Calculus

## What is Calculus?
Calculus is a branch of mathematics that deals with rates of change and accumulation. It has two main branches:
- **Differential Calculus**: Studies rates of change
- **Integral Calculus**: Studies accumulation

## Key Concepts
- **Limits**: The foundation of calculus
- **Derivatives**: Rate of change
- **Integrals**: Accumulation of quantities

## Applications
- Physics and engineering
- Economics and finance
- Medicine and biology
- Computer science`,
      resources: [
        {
          title: 'Calculus Textbook Chapter 1',
          url: 'https://example.com/textbook.pdf',
          type: 'pdf'
        },
        {
          title: 'Practice Problems',
          url: 'https://example.com/practice.pdf',
          type: 'pdf'
        }
      ],
      quiz: {
        questions: [
          {
            question: 'What is the main purpose of differential calculus?',
            options: [
              'To study rates of change',
              'To study accumulation',
              'To solve equations',
              'To draw graphs'
            ],
            correctAnswer: 0,
            explanation: 'Differential calculus focuses on studying rates of change, particularly through derivatives.'
          },
          {
            question: 'Which of the following is NOT a key concept in calculus?',
            options: [
              'Limits',
              'Derivatives',
              'Integrals',
              'Fractions'
            ],
            correctAnswer: 3,
            explanation: 'Fractions are basic arithmetic, not a key concept specific to calculus.'
          }
        ]
      }
    },
    aiTips: [
      {
        time: '2:30',
        title: 'Key Concept',
        content: 'Remember that limits are the foundation of calculus - they help us understand what happens as we approach a value.',
        type: 'concept'
      },
      {
        time: '8:15',
        title: 'Important Formula',
        content: 'The limit definition of derivative: f\'(x) = lim[h→0] (f(x+h) - f(x))/h',
        type: 'formula'
      }
    ]
  },
  {
    title: 'Newton\'s Laws of Motion',
    description: 'Understanding the three fundamental laws that govern motion',
    duration: '50 min',
    difficulty: 'Intermediate',
    order: 1,
    content: {
      videoUrl: 'https://example.com/video2.mp4',
      videoDuration: 3000,
      notes: `# Newton's Laws of Motion

## First Law (Law of Inertia)
An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.

## Second Law
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**Formula:** F = ma

## Third Law
For every action, there is an equal and opposite reaction.

## Applications
- Vehicle safety systems
- Rocket propulsion
- Sports mechanics`,
      resources: [
        {
          title: 'Physics Simulation',
          url: 'https://example.com/simulation.html',
          type: 'link'
        }
      ],
      quiz: {
        questions: [
          {
            question: 'What does Newton\'s First Law describe?',
            options: [
              'Force equals mass times acceleration',
              'Objects at rest stay at rest',
              'Every action has an equal reaction',
              'Gravity pulls objects down'
            ],
            correctAnswer: 1,
            explanation: 'Newton\'s First Law describes inertia - objects at rest stay at rest unless acted upon by a force.'
          }
        ]
      }
    },
    aiTips: [
      {
        time: '5:00',
        title: 'Key Concept',
        content: 'Inertia is the tendency of objects to resist changes in their motion.',
        type: 'concept'
      }
    ]
  }
];

const sampleAIModels = [
  {
    name: 'Human Heart',
    type: '3d_model',
    subject: 'Biology',
    grade: 'Grade 9',
    title: 'Interactive 3D Heart Model',
    description: 'Detailed 3D model of the human heart with interactive anatomy labels and blood flow animation',
    content: {
      modelUrl: 'https://example.com/heart-model.glb',
      thumbnail: 'https://example.com/heart-thumbnail.jpg',
      metadata: {
        fileSize: 2048000,
        format: 'GLB',
        duration: 0,
        dimensions: { width: 1920, height: 1080 }
      }
    },
    features: [
      { name: 'AR View', description: 'View in augmented reality', icon: '📱' },
      { name: '3D Rotation', description: 'Rotate and examine from all angles', icon: '🔄' },
      { name: 'Anatomy Labels', description: 'Interactive labels for all parts', icon: '🏷️' },
      { name: 'Blood Flow', description: 'Animated blood circulation', icon: '🩸' }
    ],
    aiTooltips: [
      {
        position: { x: 20, y: 30, z: 0 },
        title: 'Cardiac Chambers',
        content: 'The heart has four chambers: two atria and two ventricles',
        trigger: 'hover',
        isVisible: true
      },
      {
        position: { x: 60, y: 50, z: 0 },
        title: 'Blood Vessels',
        content: 'Arteries carry blood away from the heart, veins carry blood to the heart',
        trigger: 'click',
        isVisible: true
      }
    ],
    interactions: [
      {
        type: 'rotation',
        description: 'Drag to rotate the heart model',
        parameters: { sensitivity: 0.5 }
      },
      {
        type: 'zoom',
        description: 'Pinch or scroll to zoom in/out',
        parameters: { minZoom: 0.5, maxZoom: 3.0 }
      }
    ],
    difficulty: 'Beginner',
    tags: ['anatomy', 'heart', 'circulatory', '3d'],
    isPublished: true
  },
  {
    name: 'DNA Helix',
    type: '3d_model',
    subject: 'Biology',
    grade: 'Grade 11',
    title: 'DNA Double Helix Structure',
    description: 'Interactive 3D model of DNA showing the double helix structure with base pair interactions',
    content: {
      modelUrl: 'https://example.com/dna-model.glb',
      thumbnail: 'https://example.com/dna-thumbnail.jpg',
      metadata: {
        fileSize: 1536000,
        format: 'GLB',
        duration: 0,
        dimensions: { width: 1920, height: 1080 }
      }
    },
    features: [
      { name: 'AR View', description: 'View in augmented reality', icon: '📱' },
      { name: '3D Rotation', description: 'Examine the helix structure', icon: '🔄' },
      { name: 'Base Pairs', description: 'Highlight A-T and G-C pairs', icon: '🧬' },
      { name: 'Replication', description: 'Watch DNA replication process', icon: '⚡' }
    ],
    difficulty: 'Intermediate',
    tags: ['genetics', 'dna', 'molecular', '3d'],
    isPublished: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulearn');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Topic.deleteMany({});
    await AIModel.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.name}`);
    }

    // Create courses
    const courses = [];
    for (let i = 0; i < sampleCourses.length; i++) {
      const courseData = {
        ...sampleCourses[i],
        instructor: users[1]._id, // Dr. Sarah Johnson
        instructorName: users[1].name
      };
      const course = new Course(courseData);
      await course.save();
      courses.push(course);
      console.log(`📚 Created course: ${course.title}`);
    }

    // Create topics
    const topics = [];
    for (let i = 0; i < sampleTopics.length; i++) {
      const topicData = {
        ...sampleTopics[i],
        course: courses[i % courses.length]._id,
        subject: courses[i % courses.length].subject,
        grade: courses[i % courses.length].grade
      };
      const topic = new Topic(topicData);
      await topic.save();
      topics.push(topic);
      console.log(`📖 Created topic: ${topic.title}`);

      // Add topic to course
      courses[i % courses.length].topics.push(topic._id);
      await courses[i % courses.length].save();
    }

    // Create AI models
    for (const modelData of sampleAIModels) {
      const model = new AIModel({
        ...modelData,
        createdBy: users[1]._id // Dr. Sarah Johnson
      });
      await model.save();
      console.log(`🤖 Created AI model: ${model.title}`);
    }

    // Enroll sample students in courses
    const student1 = users[2]; // Alex Johnson
    const student2 = users[3]; // Emma Wilson

    // Enroll Alex in all courses
    for (const course of courses) {
      course.enrolledCourses.push({
        user: student1._id,
        enrolledAt: new Date(),
        progress: Math.floor(Math.random() * 100)
      });
      await course.save();
    }

    // Enroll Emma in some courses
    for (let i = 0; i < 2; i++) {
      courses[i].enrolledCourses.push({
        user: student2._id,
        enrolledAt: new Date(),
        progress: Math.floor(Math.random() * 100)
      });
      await courses[i].save();
    }

    console.log('🎓 Enrolled students in courses');

    // Update course statistics
    for (const course of courses) {
      course.students.enrolled = course.enrolledCourses.length;
      course.students.completed = course.enrolledCourses.filter(ec => ec.progress === 100).length;
      await course.save();
    }

    console.log('📊 Updated course statistics');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample accounts:');
    console.log('👑 Admin: admin@edulearn.com / admin123');
    console.log('👨‍🏫 Instructor: sarah.johnson@edulearn.com / instructor123');
    console.log('👨‍🎓 Student: alex.johnson@edulearn.com / student123');
    console.log('👩‍🎓 Student: emma.wilson@edulearn.com / student123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedDatabase();
