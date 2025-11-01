// API service for EduLearn frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('edulearn_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('edulearn_token', token);
    } else {
      localStorage.removeItem('edulearn_token');
    }
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication API
  auth = {
    // Register user
    register: async (userData) => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    // Login user
    login: async (credentials) => {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.data?.token) {
        this.setToken(response.data.token);
      }
      
      return response;
    },

    // Get current user
    getCurrentUser: async () => {
      // Prevent 401 spam/blinking when there is no token yet
      const token = this.token || localStorage.getItem('edulearn_token') || localStorage.getItem('token');
      if (!token) {
        return { data: null };
      }
      return this.request('/auth/me');
    },

    // Update profile
    updateProfile: async (profileData) => {
      return this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    // Logout
    logout: () => {
      this.setToken(null);
    },

    // Forgot password
    forgotPassword: async (email) => {
      return this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  };

  // Courses API
  courses = {
    // Get all courses
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
    },

    // Get single course
    getById: async (id) => {
      return this.request(`/courses/${id}`);
    },

    // Enroll in course
    enroll: async (courseId) => {
      return this.request(`/courses/${courseId}/enroll`, {
        method: 'POST',
      });
    },

    // Add course review
    addReview: async (courseId, reviewData) => {
      return this.request(`/courses/${courseId}/review`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },

    // Get course topics
    getTopics: async (courseId) => {
      return this.request(`/courses/${courseId}/topics`);
    },
  };

  // Progress API
  progress = {
    // Get user progress
    getUserProgress: async () => {
      return this.request('/progress');
    },

    // Get course progress
    getCourseProgress: async (courseId) => {
      return this.request(`/progress/course/${courseId}`);
    },

    // Update topic progress
    updateTopicProgress: async (topicId, progressData) => {
      return this.request(`/progress/topic/${topicId}`, {
        method: 'PUT',
        body: JSON.stringify(progressData),
      });
    },

    // Submit quiz score
    submitQuiz: async (topicId, quizData) => {
      return this.request(`/progress/topic/${topicId}/quiz`, {
        method: 'POST',
        body: JSON.stringify(quizData),
      });
    },

    // Add note
    addNote: async (topicId, noteData) => {
      return this.request(`/progress/topic/${topicId}/note`, {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
    },

    // Add bookmark
    addBookmark: async (topicId, bookmarkData) => {
      return this.request(`/progress/topic/${topicId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify(bookmarkData),
      });
    },

    // Get analytics
    getAnalytics: async (days = 30) => {
      return this.request(`/progress/analytics?days=${days}`);
    },
  };

  // AI API
  ai = {
    // Get AI recommendations
    getRecommendations: async () => {
      return this.request('/ai/recommendations');
    },

    // AI chat
    chat: async (message, context = {}) => {
      return this.request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, context }),
      });
    },

    // Get AI insights
    getInsights: async () => {
      return this.request('/ai/insights');
    },

    // Get 3D/AR models
    getModels: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/ai/models${queryString ? `?${queryString}` : ''}`);
    },

    // Get single model
    getModel: async (id) => {
      return this.request(`/ai/models/${id}`);
    },

    // Record model interaction
    recordInteraction: async (modelId, interactionType) => {
      return this.request(`/ai/models/${modelId}/interact`, {
        method: 'POST',
        body: JSON.stringify({ interactionType }),
      });
    },

    // Rate model
    rateModel: async (modelId, rating, feedback = '') => {
      return this.request(`/ai/models/${modelId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, feedback }),
      });
    },
  };

  // Content API
  content = {
    // Get topics
    getTopics: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/content/topics${queryString ? `?${queryString}` : ''}`);
    },

    // Get single topic
    getTopic: async (id) => {
      return this.request(`/content/topics/${id}`);
    },

    // Add comment to topic
    addComment: async (topicId, commentData) => {
      return this.request(`/content/topics/${topicId}/comment`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
    },

    // Like comment
    likeComment: async (topicId, commentId) => {
      return this.request(`/content/topics/${topicId}/comment/${commentId}/like`, {
        method: 'POST',
      });
    },

    // Get videos
    getVideos: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/content/videos${queryString ? `?${queryString}` : ''}`);
    },

    // Get 3D models
    get3DModels: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/content/3d-models${queryString ? `?${queryString}` : ''}`);
    },

    // Get quiz
    getQuiz: async (topicId) => {
      return this.request(`/content/quiz/${topicId}`);
    },

    // Submit quiz
    submitQuiz: async (topicId, answers) => {
      return this.request(`/content/quiz/${topicId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    },

    // Search content
    search: async (query, type = null) => {
      const params = { q: query };
      if (type) params.type = type;
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/content/search?${queryString}`);
    },
  };

  // Contact API
  contact = {
    // Submit contact form
    submit: async (formData) => {
      return this.request('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },

    // Get FAQ
    getFAQ: async () => {
      return this.request('/contact/faq');
    },
  };

  // Users API
  users = {
    // Get user by ID
    getById: async (id) => {
      return this.request(`/users/${id}`);
    },

    // Update user
    update: async (id, userData) => {
      return this.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    // Get user courses
    getCourses: async (id) => {
      return this.request(`/users/${id}/courses`);
    },

    // Get user progress
    getProgress: async (id) => {
      return this.request(`/users/${id}/progress`);
    },

    // Get user achievements
    getAchievements: async (id) => {
      return this.request(`/users/${id}/achievements`);
    },

    // Add achievement
    addAchievement: async (id, achievementData) => {
      return this.request(`/users/${id}/achievements`, {
        method: 'POST',
        body: JSON.stringify(achievementData),
      });
    },
  };

  // Health check
  healthCheck = async () => {
    return this.request('/health');
  };
}

// Create and export API instance
const api = new ApiService();
export default api;
