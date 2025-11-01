# EduLearn Backend API

A comprehensive backend API for the EduLearn e-learning platform built with Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **User Management** - Authentication, authorization, and user profiles
- **Course Management** - CRUD operations for courses, topics, and content
- **Progress Tracking** - Learning analytics and progress monitoring
- **AI Integration** - AI-powered recommendations and insights
- **3D/AR Content** - Management of 3D models and AR experiences
- **Video Lessons** - Video streaming and interactive content
- **Communication** - Contact forms and support system

### Technical Features
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Student, Instructor, and Admin roles
- **Data Validation** - Comprehensive input validation
- **Error Handling** - Centralized error management
- **Rate Limiting** - API protection against abuse
- **Security Headers** - Helmet.js for security
- **CORS Support** - Cross-origin resource sharing
- **Database Indexing** - Optimized MongoDB queries

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs, CORS
- **Email**: Nodemailer
- **File Upload**: Multer + Cloudinary
- **Documentation**: JSDoc

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edulearn-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/edulearn
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "grade": "Grade 12"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Course Endpoints

#### Get All Courses
```http
GET /api/courses?search=math&subject=Mathematics&grade=Grade 12&page=1&limit=10
```

#### Get Single Course
```http
GET /api/courses/:id
```

#### Enroll in Course
```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

#### Add Course Review
```http
POST /api/courses/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent course!"
}
```

### Progress Endpoints

#### Get User Progress
```http
GET /api/progress
Authorization: Bearer <token>
```

#### Update Topic Progress
```http
PUT /api/progress/topic/:topicId
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 75,
  "timeSpent": 30
}
```

#### Submit Quiz Score
```http
POST /api/progress/topic/:topicId/quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85,
  "totalQuestions": 10
}
```

### AI Endpoints

#### Get AI Recommendations
```http
GET /api/ai/recommendations
Authorization: Bearer <token>
```

#### AI Chat Assistant
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I need help with calculus",
  "context": "learning"
}
```

#### Get 3D/AR Models
```http
GET /api/ai/models?type=3d_model&subject=Biology
```

### Content Endpoints

#### Get Video Lessons
```http
GET /api/content/videos?subject=Physics&grade=Grade 11
```

#### Get Topic Content
```http
GET /api/content/topics/:id
```

#### Add Comment to Topic
```http
POST /api/content/topics/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great explanation!",
  "timestamp": 120
}
```

### Contact Endpoints

#### Submit Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Technical Support",
  "message": "I need help with...",
  "inquiryType": "technical"
}
```

#### Get FAQ
```http
GET /api/contact/faq
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  grade: String,
  role: String (student/instructor/admin),
  avatar: String,
  learningStreak: Number,
  totalStudyHours: Number,
  preferences: Object,
  achievements: Array,
  enrolledCourses: Array,
  aiRecommendations: Array
}
```

### Courses Collection
```javascript
{
  title: String,
  description: String,
  subject: String,
  grade: String,
  instructor: ObjectId,
  duration: String,
  difficulty: String,
  rating: Object,
  students: Object,
  features: Object,
  tags: Array,
  topics: Array,
  reviews: Array
}
```

### Topics Collection
```javascript
{
  title: String,
  description: String,
  course: ObjectId,
  subject: String,
  grade: String,
  duration: String,
  difficulty: String,
  content: Object,
  aiTips: Array,
  comments: Array,
  views: Number
}
```

### Progress Collection
```javascript
{
  user: ObjectId,
  course: ObjectId,
  topic: ObjectId,
  status: String,
  progress: Number,
  timeSpent: Number,
  lastAccessed: Date,
  quizScores: Array,
  notes: Array,
  bookmarks: Array
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - Comprehensive validation using express-validator
- **Rate Limiting** - Protection against API abuse
- **CORS Configuration** - Controlled cross-origin access
- **Security Headers** - Helmet.js for security headers
- **SQL Injection Protection** - Mongoose ODM prevents NoSQL injection
- **XSS Protection** - Input sanitization and validation

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name edulearn-api
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

The API includes health check endpoints and logging for monitoring:

```http
GET /api/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@edulearn.com
- Documentation: [API Docs](https://docs.edulearn.com)

## 🔄 API Versioning

Current API version: v1.0.0

All endpoints are prefixed with `/api/` and versioning will be implemented as needed.

---

**EduLearn Backend API** - Powering the future of education with AI and immersive learning experiences.
