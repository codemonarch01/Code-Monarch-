import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, BookOpen, Play, Clock } from 'lucide-react';
import { subjects } from '../data/mockData';

const SubjectSelect = ({ selectedClass, onSubjectSelect, onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [query, setQuery] = useState('');
  const classSubjects = subjects[selectedClass.id] || [];
  const filtered = classSubjects.filter(s => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject.id);
    setTimeout(() => {
      onSubjectSelect(subject);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <div className="flex items-center space-x-4 mb-8">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 text-slate-600 hover:text-slate-900 transition-all glass-card px-5 py-2.5 rounded-xl shadow-soft"
              data-magnetic
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Classes</span>
            </motion.button>
          </div>

          <div className="text-center">
            <motion.div 
              className={`inline-flex items-center space-x-4 bg-gradient-to-r ${selectedClass.color} text-white px-8 py-4 rounded-2xl mb-6 shadow-lg`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-3xl">{selectedClass.icon}</span>
              <span className="font-bold text-xl">{selectedClass.name}</span>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-cyan-700 to-indigo-700 bg-clip-text text-transparent mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Choose Your Subject
            </motion.h1>
            <motion.p 
              className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Select a subject to explore topics and start your learning journey
            </motion.p>
            {/* Search */}
            <motion.div 
              className="max-w-2xl mx-auto mt-6 md:mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search subjects (e.g., Physics, Calculus)"
                  className="input-field w-full px-5 md:px-6 py-3.5 md:py-4 pr-14 text-base md:text-lg rounded-xl shadow-soft ring-1 ring-black/5"
                  data-magnetic
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
              {query && (
                <motion.p 
                  className="text-sm text-slate-500 mt-3 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Showing {filtered.length} of {classSubjects.length} subjects
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Subject Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
        >
          {filtered.map((subject, index) => (
            <motion.div
              key={subject.id}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSubjectSelect(subject)}
              className={`relative glass-card rounded-2xl p-6 md:p-7 shadow-strong cursor-pointer transition-all duration-500 ${
                selectedSubject === subject.id ? 'ring-2 ring-emerald-500 scale-105 shadow-2xl' : ''
              }`}
              data-magnetic
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-5 rounded-2xl`} />
              
              {/* Icon */}
              <div className="relative mb-6">
                <motion.div 
                  className={`w-18 h-18 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {subject.icon}
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative text-center">
                <h3 className="text-2xl font-bold gradient-text mb-3">
                  {subject.name}
                </h3>
                <p className="text-slate-600 mb-5 md:mb-6 leading-relaxed">
                  {subject.description}
                </p>

                {/* Meta */}
                <div className="flex justify-center items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white/50 px-3 py-1.5 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold">{subject.topics} Topics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white/50 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">Flexible</span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r ${subject.color} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all`}
                >
                  <Play className="w-4 h-4" />
                  <span>Start Learning</span>
                </motion.div>
              </div>

              {/* Selection Indicator */}
              {selectedSubject === subject.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                </motion.div>
              )}

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Subject Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 md:mt-16"
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-strong">
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-700 bg-clip-text text-transparent mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                What You'll Learn
              </motion.h2>
              <motion.p 
                className="text-slate-600 max-w-3xl mx-auto text-base md:text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Each subject is carefully structured with comprehensive topics, interactive content, and practical examples to ensure effective learning.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Play className="w-8 h-8 text-blue-600" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Video Lessons</h3>
                <p className="text-gray-600 leading-relaxed">
                  High-quality video content with 3D models and animations
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
                  className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <BookOpen className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Study Notes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive notes and explanations for each topic
                </p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <ChevronRight className="w-8 h-8 text-purple-600" />
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Practice Tests</h3>
                <p className="text-gray-600 leading-relaxed">
                  Interactive quizzes and assessments to test your knowledge
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubjectSelect;
