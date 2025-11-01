import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000, // 30 second timeout for AI responses (increased from 5s)
  headers: {
    'Content-Type': 'application/json',
  },
});

(() => {
  const legacy = localStorage.getItem('edulearn_token');
  const current = localStorage.getItem('token');
  if (legacy && !current) {
    localStorage.setItem('token', legacy);
  }
})();

// Set token method for API
api.setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // maintain backward compatibility with components expecting this key
    localStorage.setItem('edulearn_token', token);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('edulearn_token');
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('edulearn_token');
    // Prevent hitting /auth/me when there is no token to avoid 401 spam/blinking
    const url = config?.url || '';
    if (!token && (url.endsWith('/auth/me') || url.includes('/auth/me'))) {
      return Promise.reject(new Error('Skip /auth/me request: no token present'));
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // For protected endpoints, try to use a guest/anonymous token or handle gracefully
      // We'll let the request go through and the backend will handle 401
      console.warn('⚠️ No token found for protected endpoint:', url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('edulearn_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ------------------- Auth API -------------------
const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // persist token if present so protected endpoints (ai-video) work
      const token = response?.data?.data?.token;
      if (token) {
        api.setToken(token);
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  getCurrentUser: async () => {
    // Avoid unnecessary 401 spam when there is no token set yet
    const token = localStorage.getItem('token') || localStorage.getItem('edulearn_token');
    if (!token) {
      return { data: null };
    }
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  }
};

// ------------------- Content API -------------------
const contentAPI = {
  getClasses: async () => {
    try {
      const response = await api.get('/content/classes');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch classes');
    }
  },

  getSubjects: async (classId) => {
    try {
      const response = await api.get(`/content/subjects/${classId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subjects');
    }
  },

  getTopics: async (subjectId) => {
    try {
      const response = await api.get(`/content/topics/${subjectId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch topics');
    }
  }
};

// ------------------- Progress API -------------------
const progressAPI = {
  // Current logged-in user progress
  getMyProgress: async () => {
    try {
      const response = await api.get('/progress');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch progress');
    }
  },

  // Progress by userId (admin or self)
  getProgressByUser: async (userId) => {
    try {
      const response = await api.get(`/progress/user/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch progress');
    }
  },

  // Mark topic as completed
  markTopicCompleted: async (topicId, userId = null) => {
    try {
      const body = userId ? { topicId, userId } : { topicId };
      const response = await api.post('/progress/complete', body);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark topic completed');
    }
  },

  // Update topic progress
  updateTopicProgress: async (topicId, progress, timeSpent = 0) => {
    try {
      const response = await api.put(`/progress/topic/${topicId}`, { progress, timeSpent });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update topic progress');
    }
  },

  // Submit quiz score
  submitQuizScore: async (topicId, score, totalQuestions) => {
    try {
      const response = await api.post(`/progress/topic/${topicId}/quiz`, { score, totalQuestions });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit quiz score');
    }
  },

  // Add note
  addNote: async (topicId, content, timestamp = 0) => {
    try {
      const response = await api.post(`/progress/topic/${topicId}/note`, { content, timestamp });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add note');
    }
  },

  // Add bookmark
  addBookmark: async (topicId, timestamp, title, note = '') => {
    try {
      const response = await api.post(`/progress/topic/${topicId}/bookmark`, { timestamp, title, note });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add bookmark');
    }
  },

  // Course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/progress/course/${courseId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course progress');
    }
  },

  // Learning analytics
  getAnalytics: async (userId = null, days = 30) => {
    try {
      const endpoint = userId ? `/progress/analytics/${userId}?days=${days}` : `/progress/analytics?days=${days}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
};

// ------------------- Gamify API -------------------
const gamifyAPI = {
  me: async () => {
    try {
      const response = await api.get('/eco/me');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
  },

  leaderboard: async (filters = {}) => {
    try {
      const response = await api.get('/leaderboard', { params: filters });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  },

  completeTask: async (taskData) => {
    try {
      const response = await api.post('/gamify/complete-task', taskData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete task');
    }
  }
};

// ------------------- Quiz API -------------------
const quizAPI = {
  getQuiz: async (topicId) => {
    try {
      const response = await api.get(`/quiz/${topicId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz');
    }
  },

  submitQuiz: async (data) => {
    try {
      const response = await api.post('/quiz/submit', data);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit quiz');
    }
  },

  getQuizHistory: async (topicId) => {
    try {
      const response = await api.get(`/quiz/history/${topicId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz history');
    }
  }
};

// ------------------- Contact API -------------------
const contactAPI = {
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/contact', messageData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }
};

// ------------------- User API -------------------
const userAPI = {
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Skills helpers (stored in preferences.subjects)
  getSkills: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/skills`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch skills');
    }
  },

  addSkill: async (userId, skill) => {
    try {
      const response = await api.post(`/users/${userId}/skills`, { skill });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add skill');
    }
  },

  // Achievements helpers
  getAchievements: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/achievements`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch achievements');
    }
  },

  addAchievement: async (userId, achievementData) => {
    try {
      const response = await api.post(`/users/${userId}/achievements`, achievementData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add achievement');
    }
  }
};

// ------------------- Health API -------------------
const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }
};

// ------------------- AI Video API -------------------
const aiVideoAPI = {
  generate: async (data) => {
    try {
      const response = await api.post('/ai-video/generate', data);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate AI video');
    }
  },

  getVideo: async (videoId) => {
    try {
      const response = await api.get(`/ai-video/${videoId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AI video');
    }
  },

  getTemplates: async () => {
    try {
      const response = await api.get('/ai-video/templates/list');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video templates');
    }
  }
};

// ------------------- AI Chat API -------------------
const aiAPI = {
  chat: async (message, context = {}, opts = {}) => {
    try {
      // Build payload with conversation history if provided
      const payload = { 
        message, 
        context,
        ...opts 
      };
      
      console.log('📤 Sending to /api/chat:', payload);
      
      const response = await api.post('/chat', payload);
      return response;
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to process chat message');
    }
  }
};

// ------------------- Skill Path API -------------------
const skillPathAPI = {
  getRecommendations: async (userData) => {
    try {
      console.log('📤 Calling /skill-path/recommend with:', userData);
      const response = await api.post('/skill-path/recommend', userData);
      console.log('✅ Recommend response:', response);
      return response;
    } catch (error) {
      console.error('❌ Recommend API Error:', error);
      console.error('❌ Error response:', error.response);
      // Fallback to sample so UI keeps working
      try {
        console.warn('⚠️ Falling back to /skill-path/sample');
        const fallback = await api.get('/skill-path/sample');
        // mimic the same shape so callers can proceed
        return fallback;
      } catch (fallbackErr) {
        console.error('❌ Sample fallback failed:', fallbackErr);
        throw new Error(error.response?.data?.message || error.message || 'Failed to get career recommendations');
      }
    }
  },

  getSampleRecommendations: async () => {
    try {
      console.log('📤 Calling /skill-path/sample endpoint...');
      const response = await api.get('/skill-path/sample');
      console.log('✅ Sample response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Sample API Error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to get sample recommendations');
    }
  },

  getSkillVisualization: async (skillName, careerTitle = '') => {
    try {
      const response = await api.post('/skill-path/visualize', { skillName, careerTitle });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get skill visualization');
    }
  }
};

// ------------------- Main API export -------------------
const mainAPI = {
  auth: authAPI,
  content: contentAPI,
  progress: progressAPI,
  quiz: quizAPI,
  contact: contactAPI,
  user: userAPI,
  health: healthAPI,
  gamify: gamifyAPI,
  aiAPI,
  aiVideoAPI,
  skillPath: skillPathAPI,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  // Optional AI endpoints
  getInsights: async () => {
    try {
      const response = await api.get('/ai/insights');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get AI insights');
    }
  },

  getRecommendations: async (userId = null) => {
    try {
      const endpoint = userId ? `/ai/recommendations/${userId}` : '/ai/recommendations';
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }
};

export default mainAPI;
export { 
  aiAPI,
  aiVideoAPI, 
  gamifyAPI, 
  contentAPI, 
  progressAPI, 
  quizAPI, 
  authAPI,
  userAPI,
  contactAPI,
  healthAPI,
  skillPathAPI 
};
