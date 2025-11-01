// Simplified API service for EduLearn frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Try to parse JSON, but fall back to text to avoid "Unexpected end of JSON" errors
      let parsed;
      const contentType = response.headers.get('content-type') || '';
      try {
        if (contentType.includes('application/json')) {
          parsed = await response.json();
        } else {
          const text = await response.text();
          parsed = text ? { message: text } : {};
        }
      } catch {
        parsed = {};
      }

      if (!response.ok) {
        const message = parsed?.message || parsed?.error || `Request failed (${response.status})`;
        throw new Error(message);
      }

      return parsed;
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

  // Health check
  healthCheck = async () => {
    return this.request('/health');
  };
}

// Create and export API instance
const api = new ApiService();
export default api;

