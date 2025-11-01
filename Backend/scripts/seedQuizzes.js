const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edulearn';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for quiz seeding'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const sampleQuizzes = [
  {
    topicTitle: 'Molecular Structures in 3D',
    quiz: {
      title: 'Molecular Structures Quiz',
      description: 'Test your understanding of molecular geometry and bonding',
      difficulty: 'Medium',
      timeLimit: 10,
      questions: [
        {
          question: 'What is the molecular geometry of methane (CH4)?',
          options: [
            'Tetrahedral',
            'Trigonal planar',
            'Linear',
            'Bent'
          ],
          correctAnswer: 0,
          explanation: 'Methane has a tetrahedral geometry due to sp3 hybridization of carbon.',
          points: 10
        },
        {
          question: 'Which type of bond is strongest?',
          options: [
            'Ionic bond',
            'Covalent bond',
            'Hydrogen bond',
            'Van der Waals forces'
          ],
          correctAnswer: 1,
          explanation: 'Covalent bonds are generally the strongest type of chemical bond.',
          points: 10
        },
        {
          question: 'What is the bond angle in water (H2O)?',
          options: [
            '109.5°',
            '120°',
            '104.5°',
            '180°'
          ],
          correctAnswer: 2,
          explanation: 'Water has a bent geometry with a bond angle of approximately 104.5°.',
          points: 15
        },
        {
          question: 'Which molecule has a linear geometry?',
          options: [
            'H2O',
            'CO2',
            'NH3',
            'CH4'
          ],
          correctAnswer: 1,
          explanation: 'CO2 has a linear geometry due to sp hybridization of carbon.',
          points: 10
        },
        {
          question: 'What determines the shape of a molecule?',
          options: [
            'Number of atoms',
            'Electron pair repulsion',
            'Atomic mass',
            'Bond length'
          ],
          correctAnswer: 1,
          explanation: 'VSEPR theory states that electron pairs around the central atom repel each other, determining molecular shape.',
          points: 15
        }
      ]
    }
  },
  {
    topicTitle: 'Photosynthesis Process',
    quiz: {
      title: 'Photosynthesis Quiz',
      description: 'Test your knowledge of the photosynthesis process',
      difficulty: 'Easy',
      timeLimit: 8,
      questions: [
        {
          question: 'What is the main product of photosynthesis?',
          options: [
            'Oxygen',
            'Glucose',
            'Carbon dioxide',
            'Water'
          ],
          correctAnswer: 1,
          explanation: 'Glucose (C6H12O6) is the main product of photosynthesis.',
          points: 10
        },
        {
          question: 'Which organelle is responsible for photosynthesis?',
          options: [
            'Mitochondria',
            'Chloroplast',
            'Nucleus',
            'Ribosome'
          ],
          correctAnswer: 1,
          explanation: 'Chloroplasts contain chlorophyll and are the site of photosynthesis.',
          points: 10
        },
        {
          question: 'What gas is absorbed during photosynthesis?',
          options: [
            'Oxygen',
            'Nitrogen',
            'Carbon dioxide',
            'Hydrogen'
          ],
          correctAnswer: 2,
          explanation: 'Carbon dioxide is absorbed from the atmosphere during photosynthesis.',
          points: 10
        }
      ]
    }
  },
  {
    topicTitle: 'Climate Change Effects',
    quiz: {
      title: 'Climate Change Quiz',
      description: 'Test your understanding of climate change impacts',
      difficulty: 'Hard',
      timeLimit: 12,
      questions: [
        {
          question: 'What is the main cause of global warming?',
          options: [
            'Solar radiation',
            'Greenhouse gases',
            'Ocean currents',
            'Volcanic activity'
          ],
          correctAnswer: 1,
          explanation: 'Greenhouse gases trap heat in the atmosphere, causing global warming.',
          points: 15
        },
        {
          question: 'Which of the following is NOT a greenhouse gas?',
          options: [
            'CO2',
            'Methane',
            'Nitrogen',
            'Water vapor'
          ],
          correctAnswer: 2,
          explanation: 'Nitrogen (N2) is not a greenhouse gas, while CO2, methane, and water vapor are.',
          points: 15
        },
        {
          question: 'What percentage of Earth\'s surface is covered by oceans?',
          options: [
            '60%',
            '71%',
            '80%',
            '90%'
          ],
          correctAnswer: 1,
          explanation: 'Approximately 71% of Earth\'s surface is covered by oceans.',
          points: 10
        },
        {
          question: 'Which human activity contributes most to CO2 emissions?',
          options: [
            'Transportation',
            'Electricity generation',
            'Agriculture',
            'Industry'
          ],
          correctAnswer: 1,
          explanation: 'Electricity generation from fossil fuels is the largest source of CO2 emissions.',
          points: 20
        }
      ]
    }
  }
];

async function seedQuizzes() {
  try {
    console.log('🌱 Starting quiz seeding...');

    for (const { topicTitle, quiz } of sampleQuizzes) {
      // Find the topic by title
      const topic = await Topic.findOne({ title: topicTitle });
      
      if (!topic) {
        console.log(`⚠️  Topic "${topicTitle}" not found, skipping quiz creation`);
        continue;
      }

      // Check if quiz already exists for this topic
      const existingQuiz = await Quiz.findOne({ topicId: topic._id });
      if (existingQuiz) {
        console.log(`⚠️  Quiz already exists for topic "${topicTitle}", skipping`);
        continue;
      }

      // Create the quiz
      const newQuiz = new Quiz({
        topicId: topic._id,
        ...quiz
      });

      await newQuiz.save();
      console.log(`✅ Created quiz for topic: ${topicTitle}`);
    }

    console.log('🎉 Quiz seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Quiz seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedQuizzes();
