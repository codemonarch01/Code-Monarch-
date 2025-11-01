import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import mainAPI from '../api/api';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login form submitted:', formData);
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('📡 Making API call to backend...');
      const response = await mainAPI.auth.login(formData);
      console.log('✅ API response:', response);
      
      if (response.data.status === 'success') {
        console.log('🎉 Login successful, calling onLogin');
        onLogin(response.data.data.user);
      } else {
        console.log('❌ Login failed:', response.data.message);
        setErrors({ general: response.data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({ general: error.message || 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear",
            type: "tween"
          }}
          style={{ willChange: 'transform' }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear",
            type: "tween"
          }}
          style={{ willChange: 'transform' }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear",
            type: "tween"
          }}
          style={{ willChange: 'transform' }}
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-lg"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-card rounded-3xl shadow-strong p-10 border border-white/30">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2 
              className="text-4xl font-bold gradient-text mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome Back
            </motion.h2>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Sign in to continue your learning journey
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-soft"
              >
                {errors.general}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-12 pr-4 py-4 text-lg ${
                    errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  data-magnetic
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 font-medium"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-12 pr-14 py-4 text-lg ${
                    errors.password ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  data-magnetic
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-magnetic
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 font-medium"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  data-magnetic
                />
                <span className="ml-3 text-sm font-medium text-gray-600">Remember me</span>
              </label>
              <motion.button
                type="button"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                data-magnetic
              >
                Forgot password?
              </motion.button>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full btn-primary py-4 px-6 text-lg font-bold shadow-strong hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              data-magnetic
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-gray-600 text-lg">
              Don't have an account?{' '}
              <motion.button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
                whileHover={{ scale: 1.05 }}
                data-magnetic
              >
                Sign up
              </motion.button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;