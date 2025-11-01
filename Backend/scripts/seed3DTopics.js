// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Course = require('../models/Course');
// const Topic = require('../models/Topic');

// dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulearn';


// const enhanced3DTopics = [
//   // Mathematics - Grade 12
//   {
//     title: 'Introduction to Limits - 3D Visualization',
//     description: 'Understanding limits in calculus with interactive 3D graphs and animations',
//     subject: 'Mathematics',
//     grade: 'Grade 12',
//     duration: '45 min',
//     difficulty: 'Beginner',
//     order: 1,
//     isPublished: true,
//     content: {
//       videoUrl: 'https://www.youtube.com/embed/3d9CO9Mh6n8', // 3Blue1Brown Calculus
//       videoDuration: 2700,
//       notes: `# Introduction to Limits - 3D Visualization

// ## What is a Limit?
// A limit describes the behavior of a function as its input approaches a particular value.

// ## 3D Visualization Benefits
// - See function behavior in 3D space
// - Interactive exploration of limit concepts
// - Visual understanding of approaching values

// ## Key Concepts
// - **Left-hand limit**: As x approaches from the left
// - **Right-hand limit**: As x approaches from the right
// - **Two-sided limit**: Both left and right limits exist and are equal

// ## 3D Examples
// 1. Visualizing f(x,y) = sin(x)/x as x approaches 0
// 2. 3D surface limits as (x,y) approaches (0,0)
// 3. Interactive limit calculator with 3D plots`,
//       resources: [
//         {
//           title: '3D Limits Interactive Tool',
//           url: 'https://www.geogebra.org/3d',
//           type: 'link'
//         }
//       ]
//     },
//     aiTips: [
//       {
//         time: '5:30',
//         title: '3D Visualization Tip',
//         content: 'Use the interactive 3D model to rotate and explore the function behavior',
//         type: 'tip'
//       }
//     ],
//     tags: ['limits', 'calculus', '3d-visualization', 'interactive']
//   },
//   {
//     title: 'Derivatives in 3D Space',
//     description: 'Exploring derivatives with 3D models showing tangent planes and gradients',
//     subject: 'Mathematics',
//     grade: 'Grade 12',
//     duration: '50 min',
//     difficulty: 'Intermediate',
//     order: 2,
//     isPublished: true,
//     content: {
//       videoUrl: 'https://www.youtube.com/embed/TrcCbdWwCBc', // 3Blue1Brown Derivatives
//       videoDuration: 3000,
//       notes: `# Derivatives in 3D Space

// ## 3D Derivative Concepts
// - **Partial derivatives**: Rate of change in one direction
// - **Gradient vectors**: Direction of steepest ascent
// - **Tangent planes**: 3D equivalent of tangent lines

// ## Interactive 3D Features
// - Rotate 3D surfaces to see tangent planes
// - Visualize gradient vectors
// - Explore directional derivatives

// ## Applications
// - Optimization in 3D space
// - Physics simulations
// - Computer graphics`,
//       resources: [
//         {
//           title: '3D Derivative Calculator',
//           url: 'https://www.wolframalpha.com/widgets/view.jsp?id=3d-derivative',
//           type: 'link'
//         }
//       ]
//     },
//     aiTips: [
//       {
//         time: '10:15',
//         title: '3D Gradient Visualization',
//         content: 'The gradient always points in the direction of steepest increase',
//         type: 'concept'
//       }
//     ],
//     tags: ['derivatives', 'calculus', '3d-models', 'gradients']
//   },

//   // Physics - Grade 12
//   {
//     title: 'Electromagnetic Fields in 3D',
//     description: 'Visualizing electric and magnetic fields with interactive 3D simulations',
//     subject: 'Physics',
//     grade: 'Grade 12',
//     duration: '50 min',
//     difficulty: 'Advanced',
//     order: 1,
//     isPublished: true,
//     content: {
//       videoUrl: 'https://www.youtube.com/embed/C7tQJ42nGno', // 3D Electromagnetic Fields
//       videoDuration: 3300,
//       notes: `# Electromagnetic Fields in 3D

// ## 3D Field Visualization
// - **Electric field lines**: 3D vector field representation
// - **Magnetic field patterns**: Interactive 3D magnetic field lines
// - **Electromagnetic waves**: 3D wave propagation

// ## Interactive Features
// - Manipulate charge positions in 3D space
// - See real-time field line updates
// - Explore field strength with color coding

// ## Key Concepts
// - Gauss's law in 3D
// - Ampère's law visualization
// - Maxwell's equations in 3D space`,
//       resources: [
//         {
//           title: '3D Electromagnetic Simulator',
//           url: 'https://phet.colorado.edu/en/simulation/charges-and-fields',
//           type: 'link'
//         }
//       ]
//     },
//     aiTips: [
//       {
//         time: '8:45',
//         title: '3D Field Lines',
//         content: 'Field lines never cross - they show the direction a positive test charge would move',
//         type: 'concept'
//       }
//     ],
//     tags: ['electromagnetism', 'physics', '3d-simulation', 'fields']
//   },
//   {
//     title: 'Wave Mechanics in 3D',
//     description: 'Understanding wave propagation, interference, and diffraction in 3D space',
//     subject: 'Physics',
//     grade: 'Grade 12',
//     duration: '48 min',
//     difficulty: 'Intermediate',
//     order: 2,
//     isPublished: true,
//     content: {
//       videoUrl: 'https://www.youtube.com/embed/imdFhDbWDyM', // Wave Mechanics in 3D - Custom video
//       videoDuration: 2880,
//       notes: `# Wave Mechanics in 3D

// ## 3D Wave Concepts
// - **Wave propagation**: 3D spherical and plane waves
// - **Interference patterns**: 3D constructive and destructive interference
// - **Diffraction**: 3D wave bending around obstacles

// ## Interactive 3D Models
// - Adjust wave frequency and amplitude
// - See interference patterns in real-time
// - Explore Doppler effect in 3D

// ## Applications
// - Sound wave propagation
// - Light wave behavior
// - Quantum wave functions`,
//       resources: [
//         {
//           title: '3D Wave Simulator',
//           url: 'https://www.falstad.com/ripple/',
//           type: 'link'
//         }
//       ]
//     },
//     aiTips: [
//       {
//         time: '12:30',
//         title: '3D Interference',
//         content: 'Constructive interference occurs when wave crests align in 3D space',
//         type: 'concept'
//       }
//     ],
//     tags: ['waves', 'physics', '3d-animation', 'interference']
//   },

//   // Chemistry - Grade 12
//   {
//     title: 'Molecular Structures in 3D',
//     description: 'Exploring molecular geometry and bonding with interactive 3D models',
//     subject: 'Chemistry',
//     grade: 'Grade 12',
//     duration: '42 min',
//     difficulty: 'Intermediate',
//     order: 1,
//     isPublished: true,
//     content: {
//       videoUrl: 'https://www.youtube.com/embed/QqjcCvzWwww', // 3D Molecular Models
//       videoDuration: 2520,
//       notes: `# Molecular Structures in 3D

// ## 3D Molecular Geometry
// - **VSEPR Theory**: Visualizing electron pair repulsion in 3D
// - **Hybridization**: 3D orbital overlap models
// - **Molecular shapes**: Interactive 3D molecular models

// ## Interactive Features
// - Rotate molecules in 3D space
// - See electron density maps
// - Explore bond angles and lengths

// ## Key Molecules
// - Methane (CH₄) - tetrahedral
// - Water (H₂O) - bent
// - Benzene (C₆H₆) - planar ring`,
//       resources: [
//         {
//           title: '3D Molecular Viewer',
//           url: 'https://www.rcsb.org/3d-view',
//           type: 'link'
//         }
//       ]
//     },
//     aiTips: [
//       {
//         time: '15:20',
//         title: '3D Bond Angles',
//         content: 'Tetrahedral molecules have bond angles of 109.5 degrees',
//         type: 'concept'
//       }
//     ],
//     tags: ['chemistry', 'molecules', '3d-models', 'bonding']
//   },

//   // Computer Science - B.Tech
//   {
//     title: 'Data Structures Visualization in 3D',
//     description: 'Understanding complex data structures through interactive 3D visualizations',
//     subject: 'Computer Science',
//     grade: 'B.Tech',
//     duration: '60 min',
//     difficulty: 'Advanced',
//     order: 1,
//     isPublished: true,
//     content: {
//       videoUrl: 'https://www.youtube.com/embed/92S4zgXN17o', // 3D Data Structures
//       videoDuration: 3600,
//       notes: `# Data Structures in 3D

// ## 3D Visualization Benefits
// - **Trees**: See hierarchical structures in 3D space
// - **Graphs**: Navigate complex network connections
// - **Algorithms**: Watch sorting and searching in action

// ## Interactive 3D Models
// - Binary trees with 3D node positioning
// - Graph traversal animations
// - Hash table collision visualization

// ## Algorithms Covered
// - Binary search tree operations
// - Graph traversal (BFS, DFS)
// - Sorting algorithm animations`,
//       resources: [
//         {
//           title: '3D Algorithm Visualizer',
//           url: 'https://algorithm-visualizer.org/',
//           type: 'link'
//         }
//       ]
//     },
//     aiTips: [
//       {
//         time: '20:45',
//         title: '3D Tree Traversal',
//         content: 'In-order traversal of a 3D binary tree visits left subtree, root, then right subtree',
//         type: 'concept'
//       }
//     ],
//     tags: ['data-structures', 'algorithms', '3d-visualization', 'programming']
//   }
// ];

// async function seed3DTopics() {
//   try {
//     console.log('🌱 Starting 3D Topics Seeding...');
    
//     // Connect to MongoDB
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('✅ Connected to MongoDB');

//     // Get existing courses to link topics
//     const courses = await Course.find({});
//     console.log(`📚 Found ${courses.length} existing courses`);

//     if (courses.length === 0) {
//       console.log('❌ No courses found. Please run the main seed script first.');
//       return;
//     }

//     // Create a course mapping
//     const courseMap = {};
//     courses.forEach(course => {
//       const key = `${course.subject}-${course.grade}`;
//       courseMap[key] = course._id;
//     });

//     // Clear existing topics
//     await Topic.deleteMany({});
//     console.log('🗑️ Cleared existing topics');

//     // Add course references to topics
//     const topicsWithCourses = enhanced3DTopics.map(topic => {
//       const courseKey = `${topic.subject}-${topic.grade}`;
//       const courseId = courseMap[courseKey];
      
//       if (!courseId) {
//         console.log(`⚠️ No course found for ${courseKey}`);
//         return null;
//       }

//       return {
//         ...topic,
//         course: courseId
//       };
//     }).filter(Boolean);

//     // Insert topics
//     const insertedTopics = await Topic.insertMany(topicsWithCourses);
//     console.log(`✅ Inserted ${insertedTopics.length} 3D topics`);

//     // Log summary
//     console.log('\n📊 3D Topics Summary:');
//     const subjectCounts = {};
//     insertedTopics.forEach(topic => {
//       const key = `${topic.subject} - ${topic.grade}`;
//       subjectCounts[key] = (subjectCounts[key] || 0) + 1;
//     });

//     Object.entries(subjectCounts).forEach(([subject, count]) => {
//       console.log(`   ${subject}: ${count} topics`);
//     });

//     console.log('\n🎉 3D Topics seeding completed successfully!');
//     console.log('🚀 Your topics now include:');
//     console.log('   • Interactive 3D visualizations');
//     console.log('   • Real educational video content');
//     console.log('   • AI-powered tips and explanations');
//     console.log('   • Hands-on learning resources');

//   } catch (error) {
//     console.error('❌ Error seeding 3D topics:', error);
//   } finally {
//     await mongoose.disconnect();
//     console.log('📤 Disconnected from MongoDB');
//   }
// }

// // Run if called directly
// if (require.main === module) {
//   seed3DTopics();
// }

// module.exports = { seed3DTopics, enhanced3DTopics };
