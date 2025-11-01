require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');




// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const progressRoutes = require('./routes/progress');
const contentRoutes = require('./routes/content');
const aiRoutes = require('./routes/ai');
const contactRoutes = require('./routes/contact');
const lessonsRoutes = require('./routes/lessons');
const dashboardRoutes = require('./routes/dashboard');
const modulesRoutes = require('./routes/modules');
const topicsRoutes = require('./routes/topics');
const gamifyRoutes = require('./routes/gamify');
const openaiService = require('./services/openaiService');
const googleAIService = require('./services/googleAI');
const ecoRoutes = require('./routes/ecoRoutes');
const quizRoutes = require('./routes/quiz');
const aiVideoRoutes = require('./routes/aiVideo');
const aiCareerRoutes = require('./routes/aiCareer');
const skillPathRoutes = require('./routes/skillPath');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration - Updated for better frontend compatibility
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() =>console.log("Connecting to MongoDB:", process.env.MONGODB_URI))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/gamify', gamifyRoutes);
app.use('/api/eco', ecoRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/ai-video', aiVideoRoutes);
app.use('/api', aiCareerRoutes);
app.use('/api/skill-path', skillPathRoutes);
// Lightweight OpenAI chat endpoint for AI Assistant
app.post('/api/chat', async (req, res) => {
  try {
    console.log('\n📨 /api/chat endpoint called');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { message, context, json } = req.body || {};
    if (!message || typeof message !== 'string') {
      console.error('❌ Message validation failed');
      return res.status(400).json({ status: 'error', message: 'Message is required' });
    }
    
    console.log('💬 User message:', message);
    console.log('🎯 Context:', context);
    
    
    if (process.env.GEMINI_API_KEY || true) { // Force Gemini usage for now
      try {
        console.log('🔵 Attempting Gemini API call...');
        if (json) {
          const ctx = {
            title: context?.topic || context?.title,
            subject: context?.subject,
            grade: context?.grade,
            description: context?.description,
            difficulty: context?.difficulty
          };
          console.log('🔍 Calling Gemini for structured notes with context:', ctx);
          const notesJson = await googleAIService.generateStructuredNotes(ctx);
          console.log('✅ Gemini notes response received (length:', notesJson.length, ')');
          return res.json({ status: 'success', data: { response: notesJson, provider: 'gemini' } });
        } else {
          console.log('🗣️ Calling Gemini generateEducationalResponse...');
          const geminiText = await googleAIService.generateEducationalResponse(message, context || {}, context?.user || {});
          console.log('✅ Gemini response received (length:', geminiText.length, ')');
          console.log('📝 Response preview:', geminiText.substring(0, 100) + '...');
          return res.json({ status: 'success', data: { response: geminiText, provider: 'gemini' } });
        }
      } catch (geminiDirectError) {
        console.error('❌ Gemini primary error:', geminiDirectError?.response?.data || geminiDirectError.message);
        console.error('❌ Gemini error stack:', geminiDirectError.stack);
        // fallthrough to OpenAI or static below
      }
    }

    // Always try Gemini as fallback
    console.log('🔄 Attempting Gemini fallback...');
    try {
      if (json) {
        const ctx = {
          title: context?.topic || context?.title,
          subject: context?.subject,
          grade: context?.grade,
          description: context?.description,
          difficulty: context?.difficulty
        };
        console.log('🔍 Fallback: Calling Gemini for structured notes with context:', ctx);
        const notesJson = await googleAIService.generateStructuredNotes(ctx);
        console.log('✅ Fallback Gemini notes response received (length:', notesJson.length, ')');
        return res.json({ status: 'success', data: { response: notesJson, provider: 'gemini-fallback' } });
      } else {
        console.log('🔄 Fallback: Calling Gemini generateEducationalResponse...');
        const geminiText = await googleAIService.generateEducationalResponse(message, context || {}, context?.user || {});
        console.log('✅ Fallback Gemini response received (length:', geminiText.length, ')');
        return res.json({ status: 'success', data: { response: geminiText, provider: 'gemini-fallback' } });
      }
    } catch (geminiDirectError) {
      console.error('❌ Gemini fallback error:', geminiDirectError?.response?.data || geminiDirectError.message);
      console.error('❌ Gemini fallback stack:', geminiDirectError.stack);
      console.log('⚠️ Returning static fallback response');
      return res.json({ status: 'success', data: { response: 'AI temporarily unavailable. Please try again later.' } });
    }
    
    // Try OpenAI API if key is configured
    try {
      const reply = await openaiService.createChatCompletion(message, context || {}, { responseFormatJson: !!json });
      return res.json({ status: 'success', data: { response: reply } });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError?.response?.data || openaiError.message);

      // Secondary attempt with Google Gemini
      try {
        if (json) {
          // Ask Gemini to return strict JSON notes
          const ctx = {
            title: context?.topic || context?.title,
            subject: context?.subject,
            grade: context?.grade,
            description: context?.description,
            difficulty: context?.difficulty
          };
          const notesJson = await googleAIService.generateStructuredNotes(ctx);
          return res.json({ status: 'success', data: { response: notesJson } });
        } else {
          const geminiText = await googleAIService.generateEducationalResponse(message, context || {}, context?.user || {});
          return res.json({ status: 'success', data: { response: geminiText } });
        }
      } catch (geminiError) {
        console.error('Gemini fallback error:', geminiError?.response?.data || geminiError.message);
        // Final graceful fallback (plain text guidance)
        const response = 'I\'m here to help with your learning journey! I can assist with course recommendations, study tips, progress tracking, and 3D model explanations. What would you like to know?';
        return res.json({ status: 'success', data: { response } });
      }
    }
  } catch (err) {
    console.error('❌❌ Chat endpoint fatal error:', err);
    console.error('❌❌ Error stack:', err.stack);
    return res.status(500).json({ status: 'error', message: 'AI chat failed: ' + err.message });
  }
});

// Back-compat: also expose under /api/ai/chat so old frontend calls still work
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Message is required' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ status: 'error', message: 'OPENAI_API_KEY is not configured' });
    }
    const reply = await openaiService.createChatCompletion(message, context || {});
    return res.json({ status: 'success', data: { response: reply } });
  } catch (err) {
    console.error('OpenAI /api/ai/chat error:', err?.response?.data || err.message);
    return res.status(500).json({ status: 'error', message: 'AI chat failed' });
  }
});
// Mount lessons bridge routes at /api to serve /api/lessons, /api/notes/:id, etc
app.use('/api', lessonsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EduLearn API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EduLearn API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      progress: '/api/progress',
      content: '/api/content',
      ai: '/api/ai',
      contact: '/api/contact',
      dashboard: '/api/dashboard',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err
    })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server accessible at http://localhost:${PORT}`);
  console.log(`🌐 Server accessible at http://127.0.0.1:${PORT}`);
});





module.exports = app;