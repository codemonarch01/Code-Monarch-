import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import mainAPI from '../api/api';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (!validateForm()) return;
    
  //   setIsLoading(true);
  //   setErrors({});
    
  //   try {
  //     const response = await mainAPI.auth.register({
  //       name: formData.name,
  //       email: formData.email,
  //       password: formData.password,
  //       grade: 'Grade 11' // Default grade
  //     });
      
  //     if (response.status === 'success') {
  //       onRegister(response.data.user);
  //     }
  //   } 
    
  //   // catch (error) {
  //   //   console.warn('Backend not available, using fallback registration:', error.message);
  //   //   // Fallback to mock registration if backend is not available
  //   //   onRegister({
  //   //     name: formData.name,
  //   //     email: formData.email,
  //   //     id: Date.now().toString()
  //   //   });
  //   // } 
    
  //   finally {
  //     setIsLoading(false);
  //   }
  // };

// Updated by ChatGPT
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);
  setErrors({});

  try {
    const response = await mainAPI.auth.register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      grade: 'Grade 11' // Default grade
    });

    if (response.data.status === 'success') {
      onRegister(response.data.data.user);
    } else {
      setErrors({ general: response.data.message || 'Registration failed' });
    }
  } catch (error) {
    // Backend error show karna
    setErrors({ general: error.message || 'Registration failed' });
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-36 h-36 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-r from-pink-500/10 to-blue-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-lg"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 relative overflow-hidden">
          {/* Card Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>
          
          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 right-4 flex items-center space-x-1 text-emerald-400 text-xs font-medium"
          >
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </motion.div>

          <div className="text-center mb-10 relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-600 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative"
            >
              <UserPlus className="w-10 h-10 text-white" />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-600 to-red-500 rounded-2xl blur-md opacity-50"
              />
            </motion.div>
            <motion.h2 
              className="text-4xl font-bold bg-gradient-to-r from-white via-pink-100 to-purple-100 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Create Account
            </motion.h2>
            <motion.p 
              className="text-gray-300 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Join us and start your learning adventure
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 text-red-200 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm flex items-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-3">
                Full Name
              </label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-colors ${
                  fieldFocus.name ? 'text-purple-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFieldFocus(prev => ({ ...prev, name: true }))}
                  onBlur={() => setFieldFocus(prev => ({ ...prev, name: false }))}
                  className={`w-full pl-12 pr-4 py-4 text-lg bg-white/10 border-2 rounded-xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                    errors.name 
                      ? 'border-red-400/50 bg-red-500/10 text-red-100' 
                      : fieldFocus.name
                      ? 'border-purple-400/50 bg-purple-500/10 text-white'
                      : 'border-white/20 bg-white/5 text-gray-200 hover:border-white/30'
                  }`}
                  placeholder="Enter your full name"
                />
                {formData.name && !errors.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2 font-medium flex items-center space-x-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-colors ${
                  fieldFocus.email ? 'text-purple-400' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFieldFocus(prev => ({ ...prev, email: true }))}
                  onBlur={() => setFieldFocus(prev => ({ ...prev, email: false }))}
                  className={`w-full pl-12 pr-4 py-4 text-lg bg-white/10 border-2 rounded-xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                    errors.email 
                      ? 'border-red-400/50 bg-red-500/10 text-red-100' 
                      : fieldFocus.email
                      ? 'border-purple-400/50 bg-purple-500/10 text-white'
                      : 'border-white/20 bg-white/5 text-gray-200 hover:border-white/30'
                  }`}
                  placeholder="Enter your email"
                />
                {formData.email && !errors.email && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2 font-medium flex items-center space-x-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-colors ${
                  fieldFocus.password ? 'text-purple-400' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFieldFocus(prev => ({ ...prev, password: true }))}
                  onBlur={() => setFieldFocus(prev => ({ ...prev, password: false }))}
                  className={`w-full pl-12 pr-14 py-4 text-lg bg-white/10 border-2 rounded-xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                    errors.password 
                      ? 'border-red-400/50 bg-red-500/10 text-red-100' 
                      : fieldFocus.password
                      ? 'border-purple-400/50 bg-purple-500/10 text-white'
                      : 'border-white/20 bg-white/5 text-gray-200 hover:border-white/30'
                  }`}
                  placeholder="Create a password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </motion.button>
                {formData.password && !errors.password && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2 font-medium flex items-center space-x-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-200 mb-3">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-colors ${
                  fieldFocus.confirmPassword ? 'text-purple-400' : 'text-gray-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFieldFocus(prev => ({ ...prev, confirmPassword: true }))}
                  onBlur={() => setFieldFocus(prev => ({ ...prev, confirmPassword: false }))}
                  className={`w-full pl-12 pr-14 py-4 text-lg bg-white/10 border-2 rounded-xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                    errors.confirmPassword 
                      ? 'border-red-400/50 bg-red-500/10 text-red-100' 
                      : fieldFocus.confirmPassword
                      ? 'border-purple-400/50 bg-purple-500/10 text-white'
                      : 'border-white/20 bg-white/5 text-gray-200 hover:border-white/30'
                  }`}
                  placeholder="Confirm your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </motion.button>
                {formData.confirmPassword && !errors.confirmPassword && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                )}
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-2 font-medium flex items-center space-x-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-white/30 text-purple-500 shadow-sm focus:border-purple-400 focus:ring focus:ring-purple-400/20 focus:ring-opacity-50 bg-white/10 backdrop-blur-sm appearance-none checked:bg-purple-500 checked:border-purple-500 transition-all duration-200"
                  required
                />
                {agreeToTerms && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
              <label htmlFor="terms" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer">
                I agree to the{' '}
                <motion.button
                  type="button"
                  className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  Terms of Service
                </motion.button>{' '}
                and{' '}
                <motion.button
                  type="button"
                  className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  Privacy Policy
                </motion.button>
              </label>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !agreeToTerms}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-4 px-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <motion.div 
            className="mt-10 text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent h-px"></div>
              <div className="relative bg-indigo-900 px-4">
                <p className="text-gray-300 text-lg">
                  Already have an account?{' '}
                  <motion.button
                    onClick={onSwitchToLogin}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors relative group"
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign in
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                  </motion.button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
