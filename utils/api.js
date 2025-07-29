// utils/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logBackendError } from './backendStatus';
import { account } from '../lib/appwriteConfig';

// API Configuration for deployed Spring Boot backend
export const API_BASE_URL = 'https://tracker-78-backend.onrender.com/api';

export const authenticatedFetch = async (url, options = {}) => {
  try {
    // For now, we'll use a simple approach since we're not actually calling the backend
    // In a real implementation, you'd need to get the Appwrite session token
    const user = await AsyncStorage.getItem('currentUser');
    let token = null;
    
    if (user) {
      const userData = JSON.parse(user);
      token = userData.appwriteId; // Use Appwrite ID as token for now
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Add token if available
      },
    });

    // Check if we got an authentication error
    if (response.status === 401) {
      await AsyncStorage.removeItem('currentUser');
      throw new Error('Authentication failed - please log in again');
    }

    return response;
  } catch (error) {
    console.error('[authenticatedFetch]', error);
    throw error;
  }
};

// Friend Requests API
export const friendRequestsAPI = {
  // Send friend request
  sendFriendRequest: async (targetUserId) => {
    try {
      // For now, just log success since backend endpoint doesn't exist
      console.log('Friend request sent to:', targetUserId);
      return { success: true, message: 'Friend request sent' };
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/friend-requests`, {
      //   method: 'POST',
      //   body: JSON.stringify({ targetUserId }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Failed to send friend request: ${errorData.message || response.status}`);
      // }
      // return await response.json();
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Get pending friend requests
  getPendingRequests: async () => {
    try {
      // For now, return empty array since backend endpoint doesn't exist
      console.log('Backend endpoint not implemented, using local data');
      return [];
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/friend-requests/pending`);
      // if (!response.ok) {
      //   if (response.status === 404) {
      //     console.log('Pending requests endpoint not found, returning empty array');
      //     return [];
      //   }
      //   const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      //   throw new Error(`Failed to fetch pending requests: ${errorData.message || response.status}`);
      // }
      // const data = await response.json().catch(() => []);
      // return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId) => {
    try {
      // For now, just log success since backend endpoint doesn't exist
      console.log('Friend request accepted:', requestId);
      return { success: true, message: 'Friend request accepted', friendId: 'mock-friend-id' };
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/friend-requests/${requestId}/accept`, {
      //   method: 'PUT',
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Failed to accept friend request: ${errorData.message || response.status}`);
      // }
      // return await response.json();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (requestId) => {
    try {
      // For now, just log success since backend endpoint doesn't exist
      console.log('Friend request rejected:', requestId);
      return { success: true, message: 'Friend request rejected' };
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/friend-requests/${requestId}/reject`, {
      //   method: 'PUT',
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Failed to reject friend request: ${errorData.message || response.status}`);
      // }
      // return await response.json();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  },
};

// Location Sharing API
export const locationSharingAPI = {
  // Enable location sharing for a friend
  enableLocationSharing: async (friendId) => {
    try {
      // For now, just log success since backend endpoint doesn't exist
      console.log('Location sharing enabled for friend:', friendId);
      return { success: true, message: 'Location sharing enabled' };
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/location-sharing/enable`, {
      //   method: 'POST',
      //   body: JSON.stringify({ friendId }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Failed to enable location sharing: ${errorData.message || response.status}`);
      // }
      // return await response.json();
    } catch (error) {
      console.error('Error enabling location sharing:', error);
      throw error;
    }
  },

  // Disable location sharing for a friend
  disableLocationSharing: async (friendId) => {
    try {
      // For now, just log success since backend endpoint doesn't exist
      console.log('Location sharing disabled for friend:', friendId);
      return { success: true, message: 'Location sharing disabled' };
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/location-sharing/disable`, {
      //   method: 'POST',
      //   body: JSON.stringify({ friendId }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Failed to disable location sharing: ${errorData.message || response.status}`);
      // }
      // return await response.json();
    } catch (error) {
      console.error('Error disabling location sharing:', error);
      throw error;
    }
  },

  // Get friends who are sharing location with me
  getFriendsSharingLocation: async () => {
    try {
      // For now, return empty array since backend endpoint doesn't exist
      console.log('Backend endpoint not implemented, using local data');
      return [];
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/location-sharing/friends`);
      // if (!response.ok) {
      //   if (response.status === 404) {
      //     console.log('Location sharing endpoint not found, returning empty array');
      //     return [];
      //   }
      //   const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      //   throw new Error(`Failed to fetch friends sharing location: ${errorData.message || response.status}`);
      // }
      // const data = await response.json().catch(() => []);
      // return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching friends sharing location:', error);
      return [];
    }
  },
};

// User Search API
export const userSearchAPI = {
  // Search for users by user ID or email
  searchUsers: async (searchTerm) => {
    try {
      // For now, return empty array since backend endpoint doesn't exist
      console.log('Backend endpoint not implemented, using local data');
      return [];
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(searchTerm)}`);
      // if (!response.ok) {
      //   if (response.status === 404) {
      //     console.log('User search endpoint not found, returning empty array');
      //     return [];
      //   }
      //   const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      //   throw new Error(`Failed to search users: ${errorData.message || response.status}`);
      // }
      // const data = await response.json().catch(() => []);
      // return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/users/${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch user profile: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
};

// Circle Management API - Updated to match backend endpoints
export const circlesAPI = {
  // Create a new circle
  createCircle: async (circleData) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/circles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: circleData.name,
          description: circleData.description || '',
          inviteCode: circleData.inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
        }),
      });

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

  // Join a circle by code
  joinCircle: async (code) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/circles/join?code=${code}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to join circle: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining circle:', error);
      throw error;
    }
  },

  // Get circle members
  getCircleMembers: async (circleId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/circles/${circleId}/members`);

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

  // Leave a circle
  leaveCircle: async (circleId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/circles/leave?circleId=${circleId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to leave circle: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error leaving circle:', error);
      throw error;
    }
  },
};

// Friends Management API
export const friendsAPI = {
  // Add a friend
  addFriend: async (friendData) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/friends`, {
        method: 'POST',
        body: JSON.stringify(friendData),
      });

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
      const response = await authenticatedFetch(`${API_BASE_URL}/friends/user/${userId}`);

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
      const response = await authenticatedFetch(`${API_BASE_URL}/friends/${friendId}`, {
        method: 'DELETE',
      });

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
      const response = await authenticatedFetch(`${API_BASE_URL}/locations/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timestamp: locationData.timestamp || new Date().toISOString(),
        }),
      });

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
  getUserLocation: async (appwriteId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/locations/${appwriteId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch user location: ${errorData.message || response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user location:', error);
      throw error;
    }
  },

  // Get all locations for a circle
  getCircleLocations: async (circleId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/circles/${circleId}/locations`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch circle locations: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching circle locations:', error);
      throw error;
    }
  },

  // Get real-time location of friends
  getFriendsLocations: async () => {
    try {
      // For now, return empty array since backend endpoint doesn't exist
      console.log('Backend endpoint not implemented, using local data');
      return [];
      
      // Uncomment this when backend is ready:
      // const response = await authenticatedFetch(`${API_BASE_URL}/locations/friends`);
      // if (!response.ok) {
      //   if (response.status === 404) {
      //     console.log('Friends locations endpoint not found, returning empty array');
      //     return [];
      //   }
      //   const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      //   throw new Error(`Failed to fetch friends locations: ${errorData.message || response.status}`);
      // }
      // const data = await response.json().catch(() => []);
      // return Array.isArray(data) ? data : [];
    } catch (error) {
      logBackendError(`${API_BASE_URL}/locations/friends`, error);
      return [];
    }
  },
};

// Authentication API - Using Appwrite authentication
export const authAPI = {
  // Login user (using Appwrite)
  login: async (credentials) => {
    try {
      // Use Appwrite account to create email session
      const session = await account.createEmailSession(credentials.email, credentials.password);
      
      // Get user details from Appwrite
      const user = await account.get();
      
      // Store user data in AsyncStorage for fallback
      const userData = {
        id: user.$id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        appwriteId: user.$id
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      return { token: session.$id, user: userData };
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Register user (using Appwrite)
  register: async (userData) => {
    try {
      // Use Appwrite account to create user
      const user = await account.create(
        'unique()', // User ID will be auto-generated
        userData.email,
        userData.password,
        userData.name || userData.email.split('@')[0]
      );
      
      // Create session after registration
      const session = await account.createEmailSession(userData.email, userData.password);
      
      // Store user data in AsyncStorage for fallback
      const userInfo = {
        id: user.$id,
        email: user.email,
        name: user.name || userData.email.split('@')[0],
        appwriteId: user.$id
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo));
      return { token: session.$id, user: userInfo };
    } catch (error) {
      console.error('Error during registration:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Delete Appwrite session
      await account.deleteSession('current');
      
      // Clear local storage
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if Appwrite logout fails, clear local data
      try {
        await AsyncStorage.removeItem('currentUser');
      } catch (clearError) {
        console.error('Error clearing local data:', clearError);
      }
    }
  },
};

// Helper function to get current user ID from Appwrite
export const getCurrentUserId = async () => {
  try {
    // First try to get from Appwrite account
    const appwriteUser = await account.get();
    if (appwriteUser && appwriteUser.$id) {
      return appwriteUser.$id;
    }
    
    // Fallback to AsyncStorage if Appwrite fails
    const user = await AsyncStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData.userId || userData.appwriteId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    // Fallback to AsyncStorage
    try {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData.userId || userData.appwriteId;
      }
    } catch (fallbackError) {
      console.error('Fallback error getting user ID:', fallbackError);
    }
    return null;
  }
};

// Helper function to check if user is authenticated with Appwrite
export const isAuthenticated = async () => {
  try {
    // Check if user has an active Appwrite session
    const user = await account.get();
    return !!user && !!user.$id;
  } catch (error) {
    console.error('Authentication check failed:', error);
    // Fallback to check AsyncStorage
    try {
      const user = await AsyncStorage.getItem('currentUser');
      return !!user;
    } catch (fallbackError) {
      console.error('Fallback authentication check failed:', fallbackError);
      return false;
    }
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
