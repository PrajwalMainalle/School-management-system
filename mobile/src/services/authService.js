import { apiClient } from './apiClient';

/**
 * Mobile Authentication Service
 */
export const mobileAuthService = {
  login: async (identifier, password) => {
    try {
      const response = await apiClient.post('/auth/login', { identifier, password });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Mobile login failed',
      };
    }
  },

  getProfile: async (token) => {
    try {
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user profile',
      };
    }
  },
};
