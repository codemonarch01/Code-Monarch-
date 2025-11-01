# EduLearn - AI-Powered Student E-Learning Platform

A modern, interactive React + Vite e-learning application with AI, AR, and 3D features designed for students.

## 🚀 Features

### 🏠 Home/Dashboard
- Interactive 3D course cards with hover animations
- AI-recommended courses based on learning patterns
- Student progress tracking and statistics
- Quick action buttons for easy navigation

### 📚 Course Catalog
- Advanced filtering by grade level and subject
- Grid and list view modes
- Hover animations and 3D/AR preview icons
- Search functionality with real-time results

### 🥽 AR/3D Learning Module
- Interactive 3D model viewer with rotation and zoom controls
- AR mode toggle for immersive learning
- AI-powered tooltips and guidance
- Multiple 3D models for different subjects

### 🎥 Video Lessons
- Interactive video player with overlay controls
- AI-powered learning tips and insights
- Real-time comments and note-taking
- Lesson progression tracking

### 👤 Profile & Progress
- Comprehensive student profile with statistics
- Interactive progress charts and analytics
- Achievement system with badges
- Course completion tracking

### 🎨 Design Features
- Modern, colorful UI with Tailwind CSS
- Responsive design for mobile and tablet
- Smooth animations with Framer Motion
- Glass morphism effects and gradients
- Rounded corners and subtle shadows

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **3D Graphics**: Three.js + React Three Fiber
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-elearning-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navigation.jsx   # Main navigation component
│   ├── 3DCourseCard.jsx # 3D course card component
│   ├── LoadingSpinner.jsx
│   └── AnimatedCounter.jsx
├── pages/              # Main page components
│   ├── Home.jsx        # Dashboard/Home page
│   ├── CourseCatalog.jsx # Course listing page
│   ├── ARModule.jsx    # AR/3D learning module
│   ├── VideoLessons.jsx # Video lessons page
│   └── Profile.jsx     # Student profile page
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## 🎯 Key Components

### Home Page
- **3D Course Cards**: Interactive cards with hover effects
- **AI Recommendations**: Smart course suggestions
- **Progress Dashboard**: Visual progress tracking
- **Quick Actions**: Easy access to main features

### Course Catalog
- **Advanced Filters**: Grade level and subject filtering
- **Search Functionality**: Real-time course search
- **View Modes**: Grid and list view options
- **AR/3D Indicators**: Visual badges for immersive content

### AR/3D Module
- **3D Model Viewer**: Interactive 3D content display
- **Rotation Controls**: X, Y, Z axis rotation
- **Zoom Controls**: Scale adjustment
- **AR Mode**: Augmented reality toggle
- **AI Tooltips**: Contextual learning hints

### Video Lessons
- **Interactive Player**: Custom video controls
- **AI Overlay**: Smart learning tips
- **Comments System**: Student interaction
- **Note Taking**: Personal learning notes

### Profile Page
- **Progress Charts**: Visual learning analytics
- **Achievement System**: Badges and milestones
- **Course Tracking**: Personal course management
- **Statistics Dashboard**: Learning metrics

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Secondary**: Purple gradient (#d946ef to #c026d3)
- **Accent**: Green gradient (#22c55e to #16a34a)
- **Neutral**: Slate grays for text and backgrounds

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable text
- **Gradient Text**: Eye-catching accent text

### Animations
- **Hover Effects**: Scale and rotation transforms
- **Page Transitions**: Smooth fade and slide effects
- **Loading States**: Spinner and skeleton animations
- **Micro-interactions**: Button and card animations

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Enhanced layout for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Large touch targets and gestures

## 🚀 Getting Started

1. **Explore the Dashboard**: Start with the home page to see your learning overview
2. **Browse Courses**: Use the course catalog to find interesting subjects
3. **Try AR Learning**: Experience immersive 3D and AR content
4. **Watch Lessons**: Engage with interactive video content
5. **Track Progress**: Monitor your learning journey in the profile section

## 🔧 Customization

### Adding New Courses
Edit the course data in each page component to add new courses.

### Modifying Colors
Update the color scheme in `tailwind.config.js`.

### Adding Animations
Use Framer Motion for custom animations throughout the app.

## 📄 License

This project is created for educational purposes. Feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ for modern education**
