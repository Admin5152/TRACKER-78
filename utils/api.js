// utils/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../lib/appwriteConfig';

// API Configuration
const API_BASE_URL = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '683f5658000ba43c36cd';

// Database and Collection IDs (you'll need to create these in Appwrite)
const DATABASE_ID = 'tracker78_db';
const CIRCLES_COLLECTION_ID = 'circles';
const FRIENDS_COLLECTION_ID = 'friends';
const LOCATIONS_COLLECTION_ID = 'locations';

export const authenticatedFetch = async (url, options = {}) => {
  try {
    // For Appwrite, we need to use session cookies, not Bearer tokens
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'X-Appwrite-Project': PROJECT_ID,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // This is crucial for Appwrite session cookies
    });

    // Check if we got an authentication error
    if (response.status === 401) {
      // Clear stored session data
      await AsyncStorage.removeItem('sessionId');
      await AsyncStorage.removeItem('currentUser');
      throw new Error('Authentication failed - please log in again');
    }

    return response;
  } catch (error) {
    console.error('[authenticatedFetch]', error);
    throw error;
  }
};

// Circle Management API
export const circlesAPI = {
  // Create a new circle
  createCircle: async (circleData) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${CIRCLES_COLLECTION_ID}/documents`,
        {
          method: 'POST',
          body: JSON.stringify({
            documentId: 'unique()',
            data: {
              name: circleData.name,
              description: circleData.description || '',
              createdBy: circleData.createdBy,
              members: circleData.members || [],
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create circle: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating circle:', error);
      throw error;
    }
  },

  // Get user's circles
  getUserCircles: async (userId) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${CIRCLES_COLLECTION_ID}/documents?queries[]=equal("createdBy", "${userId}")&queries[]=equal("isActive", true)`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch circles: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching circles:', error);
      throw error;
    }
  },

  // Add member to circle
  addMemberToCircle: async (circleId, memberData) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${CIRCLES_COLLECTION_ID}/documents/${circleId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            data: {
              members: memberData,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add member: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  },

  // Get circle members with locations
  getCircleMembers: async (circleId) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${LOCATIONS_COLLECTION_ID}/documents?queries[]=equal("circleId", "${circleId}")`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch circle members: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching circle members:', error);
      throw error;
    }
  },
};

// Friends Management API
export const friendsAPI = {
  // Add a friend
  addFriend: async (friendData) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${FRIENDS_COLLECTION_ID}/documents`,
        {
          method: 'POST',
          body: JSON.stringify({
            documentId: 'unique()',
            data: {
              name: friendData.name,
              contact: friendData.contact,
              contactType: friendData.contactType,
              addedBy: friendData.addedBy,
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add friend: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  },

  // Get user's friends
  getUserFriends: async (userId) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${FRIENDS_COLLECTION_ID}/documents?queries[]=equal("addedBy", "${userId}")&queries[]=equal("isActive", true)`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch friends: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },

  // Remove a friend
  removeFriend: async (friendId) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${FRIENDS_COLLECTION_ID}/documents/${friendId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to remove friend: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },
};

// Location Management API
export const locationAPI = {
  // Update user's location
  updateLocation: async (locationData) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${LOCATIONS_COLLECTION_ID}/documents`,
        {
          method: 'POST',
          body: JSON.stringify({
            documentId: 'unique()',
            data: {
              userId: locationData.userId,
              circleId: locationData.circleId,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              timestamp: new Date().toISOString(),
              isActive: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update location: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Get user's current location
  getUserLocation: async (userId) => {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/databases/${DATABASE_ID}/collections/${LOCATIONS_COLLECTION_ID}/documents?queries[]=equal("userId", "${userId}")&queries[]=equal("isActive", true)&queries[]=orderDesc("timestamp")&queries[]=limit(1)`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch user location: ${errorData.message || response.status}`);
      }

      const data = await response.json();
      return data.documents[0] || null;
    } catch (error) {
      console.error('Error fetching user location:', error);
      throw error;
    }
  },
};

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  try {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      return userData.$id;
    }
    
    // If no stored user, try to get current user from Appwrite
    const response = await authenticatedFetch(`${API_BASE_URL}/account`);
    if (response.ok) {
      const userData = await response.json();
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      return userData.$id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/account`);
    return response.ok;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

// Helper function to handle API errors
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  if (error.message.includes('Authentication failed')) {
    return { type: 'AUTH_ERROR', message: 'Please log in again' };
  } else if (error.message.includes('404')) {
    return { type: 'NOT_FOUND', message: 'Resource not found' };
  } else if (error.message.includes('500')) {
    return { type: 'SERVER_ERROR', message: 'Server error, please try again' };
  } else {
    return { type: 'NETWORK_ERROR', message: 'Network error, please check your connection' };
  }
};
