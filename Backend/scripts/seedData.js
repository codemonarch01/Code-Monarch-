const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const AIModel = require('../models/AIModel');
const Progress = require('../models/Progress');

// Sample data for seeding
const sampleUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'Password123',
    grade: 'Grade 12',
    role: 'student',
    preferences: {
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      difficulty: 'intermediate',
      notifications: { email: true, push: true, aiTips: true }
    }
  },
  {
    name: 'Dr. Sarah Wilson',
    email: 'sarah@example.com',
    password: 'Password123',
    grade: 'B.Tech',
    role: 'instructor',
    preferences: {
      subjects: ['Mathematics', 'Physics'],
      difficulty: 'advanced',
      notifications: { email: true, push: true, aiTips: true }
    }
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Password123',
    grade: 'B.Tech',
    role: 'admin',
    preferences: {
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
      difficulty: 'advanced',
      notifications: { email: true, push: true, aiTips: true }
    }
  }
];

const sampleCourses = [
  {
    title: 'Advanced Calculus',
    description: 'Master advanced calculus concepts with interactive 3D visualizations and real-world applications.',
    subject: 'Mathematics',
    grade: 'Grade 12',
    instructorName: 'Dr. Sarah Wilson',
    duration: '12 weeks',
    difficulty: 'Advanced',
    isFree: true,
    isPublished: true,
    isAIRecommended: true,
    features: {
      has3D: true,
      hasAR: true,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['calculus', 'mathematics', 'advanced', '3d'],
    learningOutcomes: [
      'Master differential and integral calculus',
      'Apply calculus to real-world problems',
      'Understand 3D mathematical concepts',
      'Solve complex optimization problems'
    ],
    color: 'from-blue-500 to-purple-600'
  },
  {
    title: 'Physics in 3D Space',
    description: 'Explore physics concepts through immersive 3D simulations and AR experiences.',
    subject: 'Physics',
    grade: 'Grade 11',
    instructorName: 'Dr. Sarah Wilson',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    isFree: true,
    isPublished: true,
    isAIRecommended: true,
    features: {
      has3D: true,
      hasAR: true,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['physics', '3d', 'simulation', 'mechanics'],
    learningOutcomes: [
      'Understand 3D physics concepts',
      'Visualize complex physical phenomena',
      'Apply physics principles in 3D space',
      'Use AR for hands-on learning'
    ],
    color: 'from-green-500 to-teal-600'
  },
  {
    title: 'Chemistry Lab AR',
    description: 'Virtual chemistry lab with AR experiments and interactive molecular models.',
    subject: 'Chemistry',
    grade: 'Grade 10',
    instructorName: 'Dr. Sarah Wilson',
    duration: '8 weeks',
    difficulty: 'Beginner',
    isFree: true,
    isPublished: true,
    isAIRecommended: false,
    features: {
      has3D: false,
      hasAR: true,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['chemistry', 'ar', 'lab', 'molecular'],
    learningOutcomes: [
      'Perform virtual chemistry experiments',
      'Understand molecular structures',
      'Learn lab safety procedures',
      'Analyze chemical reactions'
    ],
    color: 'from-orange-500 to-red-600'
  },
  {
    title: 'Human Anatomy 3D',
    description: 'Detailed 3D models of human anatomy with interactive learning features.',
    subject: 'Biology',
    grade: 'Grade 9',
    instructorName: 'Dr. Sarah Wilson',
    duration: '14 weeks',
    difficulty: 'Intermediate',
    isFree: true,
    isPublished: true,
    isAIRecommended: true,
    features: {
      has3D: true,
      hasAR: false,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['biology', 'anatomy', '3d', 'human body'],
    learningOutcomes: [
      'Study human anatomy in 3D',
      'Understand organ systems',
      'Learn anatomical terminology',
      'Explore body functions'
    ],
    color: 'from-pink-500 to-rose-600'
  },
  {
    title: 'Data Structures & Algorithms',
    description: 'Master fundamental data structures and algorithms with interactive visualizations.',
    subject: 'Computer Science',
    grade: 'B.Tech',
    instructorName: 'Dr. Sarah Wilson',
    duration: '16 weeks',
    difficulty: 'Advanced',
    isFree: true,
    isPublished: true,
    isAIRecommended: true,
    features: {
      has3D: true,
      hasAR: false,
      hasVideo: true,
      hasQuiz: true,
      hasNotes: true
    },
    tags: ['programming', 'algorithms', 'data structures', 'computer science'],
    learningOutcomes: [
      'Master fundamental data structures',
      'Implement efficient algorithms',
      'Analyze time and space complexity',
      'Solve programming problems'
    ],
    color: 'from-indigo-500 to-purple-600'
  }
];

const sampleTopics = [
  // Calculus topics
  {
    title: 'Introduction to Limits',
    description: 'Understanding the fundamental concept of limits in calculus',
    subject: 'Mathematics',
    grade: 'Grade 12',
    duration: '45 min',
    difficulty: 'Beginner',
    order: 1,
    isPublished: true,
    content: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoDuration: 2700, // 45 minutes in seconds
      notes: `# Introduction to Limits

## What is a Limit?
A limit describes the behavior of a function as its input approaches a particular value.

## Key Concepts
- **Left-hand limit**: As x approaches from the left
- **Right-hand limit**: As x approaches from the right
- **Two-sided limit**: Both left and right limits exist and are equal

## Notation
\`\`\`
lim(x→a) f(x) = L
\`\`\`

## Examples
1. lim(x→2) (x² - 4)/(x - 2) = 4
2. lim(x→0) sin(x)/x = 1

## Properties
- Sum rule: lim[f(x) + g(x)] = lim f(x) + lim g(x)
- Product rule: lim[f(x) × g(x)] = lim f(x) × lim g(x)
- Quotient rule: lim[f(x)/g(x)] = lim f(x) / lim g(x)`,
      resources: [
        {
          title: 'Limits Practice Problems',
          url: 'https://example.com/limits-practice',
          type: 'pdf'
        }
      ],
      quiz: {
        questions: [
          {
            question: 'What is the limit of f(x) = x² as x approaches 3?',
            options: ['6', '9', '3', '0'],
            correctAnswer: 1,
            explanation: 'Substitute x = 3 into f(x) = x² to get 3² = 9'
          },
          {
            question: 'Which property allows us to split limits?',
            options: ['Sum rule', 'Product rule', 'Quotient rule', 'All of the above'],
            correctAnswer: 3,
            explanation: 'All three properties allow us to manipulate limits algebraically'
          }
        ]
      }
    },
    aiTips: [
      {
        time: '5:30',
        title: 'Key Concept',
        content: 'Remember that limits describe behavior, not actual values',
        type: 'concept'
      },
      {
        time: '15:20',
        title: 'Common Mistake',
        content: 'Don\'t confuse the limit value with the function value at that point',
        type: 'warning'
      }
    ],
    tags: ['limits', 'calculus', 'mathematics']
  },
  {
    title: 'Derivatives and Rate of Change',
    description: 'Understanding derivatives as the rate of change and their applications',
    subject: 'Mathematics',
    grade: 'Grade 12',
    duration: '50 min',
    difficulty: 'Intermediate',
    order: 2,
    isPublished: true,
    content: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoDuration: 3000,
      notes: `# Derivatives and Rate of Change

## Definition
The derivative of a function f(x) at point a is:
\`\`\`
f'(a) = lim(h→0) [f(a+h) - f(a)] / h
\`\`\`

## Physical Interpretation
- **Velocity**: Rate of change of position
- **Acceleration**: Rate of change of velocity
- **Slope**: Rate of change of y with respect to x

## Basic Rules
1. **Power Rule**: d/dx[x^n] = nx^(n-1)
2. **Constant Rule**: d/dx[c] = 0
3. **Sum Rule**: d/dx[f(x) + g(x)] = f'(x) + g'(x)
4. **Product Rule**: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)

## Applications
- Finding maximum and minimum values
- Optimization problems
- Curve sketching
- Related rates problems`,
      resources: [
        {
          title: 'Derivative Rules Cheat Sheet',
          url: 'https://example.com/derivative-rules',
          type: 'pdf'
        }
      ],
      quiz: {
        questions: [
          {
            question: 'What is the derivative of f(x) = x³?',
            options: ['3x²', 'x²', '3x', 'x³'],
            correctAnswer: 0,
            explanation: 'Using the power rule: d/dx[x³] = 3x²'
          }
        ]
      }
    },
    aiTips: [
      {
        time: '8:15',
        title: 'Important Formula',
        content: 'The power rule: d/dx[x^n] = nx^(n-1)',
        type: 'formula'
      }
    ],
    tags: ['derivatives', 'calculus', 'rate of change']
  },
  // Physics topics
  {
    title: 'Newton\'s Laws of Motion',
    description: 'Understanding the three fundamental laws that govern motion',
    subject: 'Physics',
    grade: 'Grade 11',
    duration: '60 min',
    difficulty: 'Beginner',
    order: 1,
    isPublished: true,
    content: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoDuration: 3600,
      notes: `# Newton's Laws of Motion

## First Law (Law of Inertia)
An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.

## Second Law
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**Formula:** F = ma

Where:
- F = Force (Newtons)
- m = Mass (kg)
- a = Acceleration (m/s²)

## Third Law
For every action, there is an equal and opposite reaction.

## Key Points
- Forces always occur in pairs
- Net force determines acceleration
- Mass is a measure of inertia
- Weight = mg (where g = 9.8 m/s²)

## Applications
- Vehicle safety systems
- Rocket propulsion
- Sports mechanics
- Engineering design`,
      resources: [
        {
          title: 'Newton\'s Laws Practice Problems',
          url: 'https://example.com/newton-laws',
          type: 'pdf'
        }
      ],
      quiz: {
        questions: [
          {
            question: 'What does Newton\'s First Law describe?',
            options: ['Force equals mass times acceleration', 'For every action there is an equal and opposite reaction', 'Objects at rest stay at rest unless acted upon', 'Gravity pulls objects downward'],
            correctAnswer: 2,
            explanation: 'Newton\'s First Law describes inertia - objects resist changes in motion'
          }
        ]
      }
    },
    aiTips: [
      {
        time: '10:30',
        title: 'Key Concept',
        content: 'Remember that forces always occur in pairs',
        type: 'concept'
      }
    ],
    tags: ['physics', 'motion', 'newton', 'laws']
  },
  // Computer Science topics
  {
    title: 'Array Fundamentals',
    description: 'Understanding arrays as the foundation of data structures',
    subject: 'Computer Science',
    grade: 'B.Tech',
    duration: '60 min',
    difficulty: 'Beginner',
    order: 1,
    isPublished: true,
    content: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoDuration: 3600,
      notes: `# Array Fundamentals

## What is an Array?
An array is a collection of elements stored in contiguous memory locations. Each element can be accessed using an index.

## Key Characteristics
- **Fixed Size**: Size is determined at creation
- **Homogeneous**: All elements are of the same data type
- **Indexed**: Elements accessed via zero-based indexing

## Time Complexities
- **Access**: O(1) - Direct access via index
- **Search**: O(n) - Linear search through elements
- **Insertion**: O(n) - May require shifting elements
- **Deletion**: O(n) - May require shifting elements

## Common Operations
\`\`\`python
# Creating an array
arr = [1, 2, 3, 4, 5]

# Accessing elements
first = arr[0]  # O(1)

# Searching for an element
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
\`\`\`

## Applications
- Storing collections of data
- Implementing other data structures
- Mathematical computations
- Image processing`,
      resources: [
        {
          title: 'Array Implementation Guide',
          url: 'https://example.com/array-guide',
          type: 'pdf'
        }
      ],
      quiz: {
        questions: [
          {
            question: 'What is the time complexity of accessing an element in an array?',
            options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
            correctAnswer: 1,
            explanation: 'Array access is O(1) because we can directly calculate the memory address'
          }
        ]
      }
    },
    aiTips: [
      {
        time: '15:45',
        title: 'Memory Tip',
        content: 'Arrays use contiguous memory, making access very fast',
        type: 'tip'
      }
    ],
    tags: ['arrays', 'data structures', 'programming']
  }
];

const sampleAIModels = [
  {
    name: 'Human Heart 3D',
    type: '3d_model',
    subject: 'Biology',
    grade: 'Grade 9',
    title: 'Interactive Human Heart',
    description: 'Detailed 3D model of the human heart with interactive anatomy labels and blood flow animation',
    difficulty: 'Beginner',
    isPublished: true,
    content: {
      modelUrl: 'https://example.com/models/heart.glb',
      thumbnail: 'https://example.com/thumbnails/heart.jpg',
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
      { name: 'Blood Flow Animation', description: 'Animated blood circulation', icon: '🩸' }
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
    tags: ['heart', 'anatomy', 'biology', '3d', 'interactive']
  },
  {
    name: 'DNA Helix AR',
    type: 'ar_content',
    subject: 'Biology',
    grade: 'Grade 11',
    title: 'DNA Double Helix AR',
    description: 'Augmented reality experience of DNA double helix structure with base pair interactions',
    difficulty: 'Intermediate',
    isPublished: true,
    content: {
      arData: {
        markers: ['dna_marker_1', 'dna_marker_2'],
        animations: ['helix_rotation', 'base_pair_formation'],
        interactions: ['tap_base', 'swipe_helix']
      },
      thumbnail: 'https://example.com/thumbnails/dna.jpg',
      metadata: {
        fileSize: 1024000,
        format: 'AR',
        duration: 0,
        dimensions: { width: 1920, height: 1080 }
      }
    },
    features: [
      { name: 'AR View', description: 'View in augmented reality', icon: '📱' },
      { name: 'Base Pairs', description: 'Interactive base pair formation', icon: '🧬' },
      { name: 'Replication Animation', description: 'DNA replication process', icon: '🔄' },
      { name: '3D Rotation', description: 'Rotate and examine structure', icon: '🔄' }
    ],
    aiTooltips: [
      {
        position: { x: 50, y: 50, z: 0 },
        title: 'Base Pairs',
        content: 'Adenine pairs with Thymine, Guanine pairs with Cytosine',
        trigger: 'hover',
        isVisible: true
      }
    ],
    interactions: [
      {
        type: 'click',
        description: 'Tap on base pairs to see interactions',
        parameters: { feedback: 'haptic' }
      }
    ],
    tags: ['dna', 'genetics', 'biology', 'ar', 'molecular']
  },
  {
    name: 'Solar System 3D',
    type: '3d_model',
    subject: 'Physics',
    grade: 'Grade 9',
    title: 'Interactive Solar System',
    description: 'Complete solar system with planetary orbits, moons, and scale comparisons',
    difficulty: 'Beginner',
    isPublished: true,
    content: {
      modelUrl: 'https://example.com/models/solar_system.glb',
      thumbnail: 'https://example.com/thumbnails/solar_system.jpg',
      metadata: {
        fileSize: 5120000,
        format: 'GLB',
        duration: 0,
        dimensions: { width: 1920, height: 1080 }
      }
    },
    features: [
      { name: 'Orbital Animation', description: 'Planets orbit the sun in real-time', icon: '🌍' },
      { name: 'Scale Comparison', description: 'Compare planet sizes', icon: '📏' },
      { name: 'Planet Details', description: 'Click planets for information', icon: 'ℹ️' },
      { name: 'AR View', description: 'View in augmented reality', icon: '📱' }
    ],
    aiTooltips: [
      {
        position: { x: 30, y: 40, z: 0 },
        title: 'Mercury',
        content: 'The smallest planet and closest to the sun',
        trigger: 'hover',
        isVisible: true
      }
    ],
    interactions: [
      {
        type: 'click',
        description: 'Click planets to get detailed information',
        parameters: { showInfo: true }
      }
    ],
    tags: ['solar system', 'planets', 'astronomy', '3d', 'space']
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear existing data
async function clearData() {
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Topic.deleteMany({});
    await AIModel.deleteMany({});
    await Progress.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Seed users
async function seedUsers() {
  try {
    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    return [];
  }
}

// Seed courses
async function seedCourses(users) {
  try {
    const instructor = users.find(user => user.role === 'instructor');
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: instructor._id
    }));
    
    const courses = await Course.insertMany(coursesWithInstructor);
    console.log(`📚 Created ${courses.length} courses`);
    return courses;
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    return [];
  }
}

// Seed topics
async function seedTopics(courses) {
  try {
    const topicsWithCourses = sampleTopics.map(topic => {
      const course = courses.find(c => c.subject === topic.subject && c.grade === topic.grade);
      return {
        ...topic,
        course: course ? course._id : courses[0]._id
      };
    });
    
    const topics = await Topic.insertMany(topicsWithCourses);
    console.log(`📖 Created ${topics.length} topics`);
    
    // Update courses with topic references
    for (const course of courses) {
      const courseTopics = topics.filter(topic => topic.course.equals(course._id));
      course.topics = courseTopics.map(topic => topic._id);
      await course.save();
    }
    
    return topics;
  } catch (error) {
    console.error('❌ Error seeding topics:', error);
    return [];
  }
}

// Seed AI models
async function seedAIModels(users) {
  try {
    const instructor = users.find(user => user.role === 'instructor');
    const modelsWithCreator = sampleAIModels.map(model => ({
      ...model,
      createdBy: instructor._id
    }));
    
    const models = await AIModel.insertMany(modelsWithCreator);
    console.log(`🤖 Created ${models.length} AI models`);
    return models;
  } catch (error) {
    console.error('❌ Error seeding AI models:', error);
    return [];
  }
}

// Seed progress data
async function seedProgress(users, courses, topics) {
  try {
    const student = users.find(user => user.role === 'student');
    const progressData = [];
    
    // Create progress for some topics
    for (let i = 0; i < Math.min(3, topics.length); i++) {
      const topic = topics[i];
      const course = courses.find(c => c._id.equals(topic.course));
      
      if (course) {
        const progress = new Progress({
          user: student._id,
          course: course._id,
          topic: topic._id,
          status: i === 0 ? 'completed' : 'in_progress',
          progress: i === 0 ? 100 : Math.floor(Math.random() * 80) + 20,
          timeSpent: Math.floor(Math.random() * 60) + 30,
          lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          notes: [
            {
              content: `Notes for ${topic.title}`,
              timestamp: 0,
              createdAt: new Date()
            }
          ]
        });
        
        progressData.push(progress);
      }
    }
    
    await Progress.insertMany(progressData);
    console.log(`📊 Created ${progressData.length} progress records`);
    
    // Update user's enrolled courses
    const enrolledCourses = courses.slice(0, 2).map(course => ({
      courseId: course._id,
      enrolledAt: new Date(),
      progress: Math.floor(Math.random() * 50) + 25,
      completedTopics: [],
      lastAccessed: new Date()
    }));
    
    await User.findByIdAndUpdate(student._id, {
      enrolledCourses,
      learningStreak: 5,
      totalStudyHours: 25
    });
    
    console.log('👤 Updated user progress data');
  } catch (error) {
    console.error('❌ Error seeding progress:', error);
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    const users = await seedUsers();
    const courses = await seedCourses(users);
    const topics = await seedTopics(courses);
    const models = await seedAIModels(users);
    await seedProgress(users, courses, topics);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Topics: ${topics.length}`);
    console.log(`- AI Models: ${models.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('Student: alex@example.com / password123');
    console.log('Instructor: sarah@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
