// utils/backendStatus.js
import { API_BASE_URL } from './api';

export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return { status: 'online', message: 'Backend is running' };
    } else {
      return { status: 'error', message: `Backend responded with ${response.status}` };
    }
  } catch (error) {
    return { 
      status: 'offline', 
      message: 'Backend is not accessible. Please check if your Spring Boot server is running.' 
    };
  }
};

export const getBackendInfo = () => {
  return {
    baseUrl: API_BASE_URL,
    endpoints: {
      health: `${API_BASE_URL}/health`,
      auth: `${API_BASE_URL}/auth`,
      users: `${API_BASE_URL}/users`,
      friends: `${API_BASE_URL}/friends`,
      locations: `${API_BASE_URL}/locations`,
      friendRequests: `${API_BASE_URL}/friend-requests`,
      locationSharing: `${API_BASE_URL}/location-sharing`,
    }
  };
};

export const logBackendError = (endpoint, error) => {
  console.error(`Backend Error (${endpoint}):`, {
    message: error.message,
    status: error.status,
    url: endpoint,
    timestamp: new Date().toISOString(),
  });
}; 