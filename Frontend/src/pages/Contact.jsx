import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  HelpCircle,
  Users,
  Globe,
  Heart,
  CheckCircle,
  AlertCircle,
  Brain,
  Sparkles
} from 'lucide-react'
import { contactAPI } from '../api/api'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' }
  ]

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['support@edulearn.com', 'info@edulearn.com'],
      description: 'Send us an email and we\'ll respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210'],
      description: 'Speak with our support team Monday - Friday, 9AM-5PM IST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Education Street', 'Ludhiana, Punjab, India'],
      description: 'Come by our office during business hours'
    },
    {
      icon: Clock,
      title: 'Live Chat',
      details: ['Available 24/7', 'Average response: 2 minutes'],
      description: 'Get instant help with our AI-powered chat support'
    }
  ]

  const faqs = [
    {
      question: 'How do I get started with EduLearn?',
      answer: 'Simply create an account, choose your grade level, and start exploring our course catalog. Our AI will recommend the best courses for you based on your interests and learning goals.'
    },
    {
      question: 'Is EduLearn free to use?',
      answer: 'Yes! EduLearn offers a free tier with access to basic courses and features. We also have premium plans with advanced features, 3D/AR content, and personalized learning paths.'
    },
    {
      question: 'What devices are supported?',
      answer: 'EduLearn works on all modern devices including desktop computers, tablets, and smartphones. For the best 3D/AR experience, we recommend using a device with a modern web browser.'
    },
    {
      question: 'How does the AI learning assistant work?',
      answer: 'Our AI analyzes your learning patterns, progress, and preferences to provide personalized recommendations, adaptive content, and real-time feedback to optimize your learning experience.'
    },
    {
      question: 'Can I use EduLearn offline?',
      answer: 'Some content is available for offline viewing. You can download lessons and materials when you have an internet connection and access them later without being online.'
    },
    {
      question: 'How do I contact technical support?',
      answer: 'You can reach our technical support team through email, live chat, or phone. We also have a comprehensive help center with troubleshooting guides and video tutorials.'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')
    
   
    if (!formData.name.trim()) {
      setErrorMessage('Name is required')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.email.trim()) {
      setErrorMessage('Email is required')
      setIsSubmitting(false)
      return
    }
    
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.subject.trim()) {
      setErrorMessage('Subject is required')
      setIsSubmitting(false)
      return
    }
    
    if (formData.subject.trim().length < 2) {
      setErrorMessage('Subject must be at least 2 characters long')
      setIsSubmitting(false)
      return
    }
    
    if (!formData.message.trim()) {
      setErrorMessage('Message is required')
      setIsSubmitting(false)
      return
    }
    
    if (formData.message.trim().length < 3) {
      setErrorMessage('Message must be at least 3 characters long')
      setIsSubmitting(false)
      return
    }
    
    try {
    
      const response = await contactAPI.submitContact(formData)
      
      if (response.status === 'success') {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        })
        
       
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setErrorMessage(response.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)

      if (error.message === 'Validation failed' && error.errors) {
        const errorMessages = error.errors.map(err => `${err.field}: ${err.message}`).join(', ')
        setErrorMessage(`Validation failed: ${errorMessages}`)
      } else {
        setErrorMessage(error.message || 'Failed to send message. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Contact Us
            </h1>
          </div>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            We're here to help! Get in touch with our team for support, questions, 
            or just to say hello. We'd love to hear from you.
          </p>
        </div>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon
            return (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="glass-effect rounded-2xl p-6 text-center card-hover"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{info.title}</h3>
                <div className="space-y-1 mb-4">
                  {info.details.map((detail, idx) => (
                    info.title === 'Call Us' ? (
                      <a
                        key={idx}
                        href={`tel:${detail.replace(/\s/g, '')}`}
                        className="text-slate-700 font-semibold hover:text-primary-600"
                      >
                        {detail}
                      </a>
                    ) : (
                      <p key={idx} className="text-slate-600 font-medium">{detail}</p>
                    )
                  ))}
                </div>
                <p className="text-sm text-slate-500">{info.description}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
       
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-effect rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-green-800 font-medium">Message sent successfully! We'll get back to you soon.</p>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-center space-x-3"
              >
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p className="text-red-800 font-medium">{errorMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {inquiryTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject * (min 2 characters)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="What's this about? (e.g., Help, Bug Report, Question)"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message * (min 3 characters)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell us how we can help you... (minimum 3 characters)"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="glass-effect rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-white/20 rounded-xl p-4 hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Brain className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900">Need More Help?</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Can't find what you're looking for? Our AI assistant is available 24/7 
                to help answer your questions instantly.
              </p>
              <button className="btn-secondary flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Chat with AI Assistant</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

   
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16"
      >
        <div className="glass-effect rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect With Us</h2>
            <p className="text-slate-600">
              Follow us on social media for updates, tips, and community discussions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Website</h3>
              <p className="text-slate-600 text-sm">Visit our main website for the latest news and updates</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Community</h3>
              <p className="text-slate-600 text-sm">Join our vibrant community of learners and educators</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Support</h3>
              <p className="text-slate-600 text-sm">We're committed to providing the best support experience</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Contact
