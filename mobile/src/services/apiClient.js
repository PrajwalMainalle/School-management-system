import axios from 'axios';

// Development default pointing to host machine API
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android Emulator alias for localhost

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkMobileHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.warn('[Mobile API] Connection error:', error.message);
    return { success: false, message: error.message };
  }
};
