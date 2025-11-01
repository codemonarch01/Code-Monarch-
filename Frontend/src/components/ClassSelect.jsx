import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, BookOpen, Clock } from 'lucide-react';
import { classes } from '../data/mockData';

const ClassSelect = ({ onClassSelect, onBack }) => {
  const [selectedClass, setSelectedClass] = useState(null);

  const handleClassSelect = (classData) => {
    setSelectedClass(classData.id);
    setTimeout(() => {
      onClassSelect(classData);
    }, 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-5xl font-bold gradient-text mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Choose Your Class
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Select your academic level to access personalized courses and learning materials
          </motion.p>
        </motion.div>

        {/* Class Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              variants={cardVariants}
              whileHover={{ y: -12, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClassSelect(classItem)}
              className={`relative glass-card rounded-3xl p-10 shadow-strong cursor-pointer transition-all duration-500 ${
                selectedClass === classItem.id ? 'ring-2 ring-blue-500 scale-105 shadow-2xl' : ''
              }`}
              data-magnetic
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${classItem.color} opacity-5 rounded-3xl`} />
              
              {/* Icon */}
              <div className="relative mb-8">
                <motion.div 
                  className={`w-20 h-20 bg-gradient-to-r ${classItem.color} rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {classItem.icon}
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative text-center">
                <h3 className="text-3xl font-bold gradient-text mb-4">
                  {classItem.name}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  {classItem.description}
                </p>

                {/* Stats */}
                <div className="flex justify-center space-x-8 mb-8">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 px-3 py-2 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold">12+ Subjects</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 px-3 py-2 rounded-full">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">1.2k Students</span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${classItem.color} text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Selection Indicator */}
              {selectedClass === classItem.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-4 h-4 bg-white rounded-full"
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="glass-card rounded-3xl p-12 shadow-strong max-w-5xl mx-auto">
            <motion.h2 
              className="text-3xl font-bold gradient-text mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Why Choose Our Platform?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Interactive Learning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Engage with 3D models, videos, and interactive content
                </p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Users className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Expert Teachers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Learn from experienced educators and industry professionals
                </p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Clock className="w-8 h-8 text-purple-600" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Flexible Schedule</h3>
                <p className="text-gray-600 leading-relaxed">
                  Learn at your own pace, anytime and anywhere
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            onClick={onBack}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 left-8 glass-card text-gray-700 px-8 py-4 rounded-2xl shadow-strong border border-white/30 transition-all font-semibold"
            data-magnetic
          >
            ← Back to Dashboard
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ClassSelect;
