import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  Users, 
  Award, 
  BookOpen, 
  Box, 
  PlayCircle,
  Target,
  Lightbulb,
  Globe,
  Heart,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized learning paths powered by advanced AI algorithms that adapt to your learning style and pace.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Box,
      title: "3D & AR Experiences",
      description: "Immersive 3D models and Augmented Reality content that brings complex concepts to life.",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Curriculum",
      description: "Extensive course library covering all major subjects from Grade 9 to 12 with expert instructors.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: PlayCircle,
      title: "Interactive Video Lessons",
      description: "Engaging video content with interactive elements, quizzes, and real-time feedback.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Connect with peers, join study groups, and learn together in a supportive community.",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Gamified learning with badges, certificates, and progress tracking to keep you motivated.",
      color: "from-yellow-500 to-orange-600"
    }
  ]

  const stats = [
    { number: "50K+", label: "Active Students", icon: Users },
    { number: "500+", label: "Expert Instructors", icon: Award },
    { number: "1000+", label: "Courses Available", icon: BookOpen },
    { number: "95%", label: "Student Satisfaction", icon: Star }
  ]

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for the highest quality in education and technology, ensuring every student receives the best learning experience."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously innovate with cutting-edge technology to make learning more engaging and effective."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Education should be accessible to everyone, everywhere. We break down barriers to quality learning."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "We're passionate about education and committed to helping every student achieve their full potential."
    }
  ]

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              About EduLearn
            </h1>
          </div>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Revolutionizing education through AI-powered learning, immersive 3D experiences, 
            and personalized learning paths that adapt to every student's unique needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="btn-primary flex items-center space-x-2 group">
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <PlayCircle className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-16"
      >
        <div className="glass-effect rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-16"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            To democratize education by making high-quality, personalized learning experiences 
            accessible to students worldwide through innovative technology and AI-driven insights.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
              <h3 className="text-2xl font-bold text-slate-900">Vision</h3>
            </div>
            <p className="text-lg text-slate-700">
              To become the world's leading platform for immersive, AI-powered education, 
              transforming how students learn and teachers teach in the digital age.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose EduLearn?
          </h2>
          <p className="text-xl text-slate-600">
            Discover the features that make learning engaging, effective, and fun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="glass-effect rounded-2xl p-6 card-hover"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Our Values
          </h2>
          <p className="text-xl text-slate-600">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Technology Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="mb-16"
      >
        <div className="glass-effect rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-slate-600">
              We leverage cutting-edge technology to create the best learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Artificial Intelligence</h3>
              <p className="text-slate-600">
                Machine learning algorithms that personalize content and track progress
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Box className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3D & AR Technology</h3>
              <p className="text-slate-600">
                Immersive experiences using WebXR and Three.js for interactive learning
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Cloud Infrastructure</h3>
              <p className="text-slate-600">
                Scalable, secure, and fast delivery of content worldwide
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center"
      >
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already experiencing the future of education. 
            Start your journey today and unlock your full potential.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 group">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default About
