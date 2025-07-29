// test-user-id.js
import { getCurrentUserId, isAuthenticated } from './utils/api';

// Test function to check user ID
export const testUserId = async () => {
  console.log('Testing user ID retrieval...');
  
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();
    console.log('Is authenticated:', authenticated);
    
    if (authenticated) {
      // Get user ID
      const userId = await getCurrentUserId();
      console.log('User ID:', userId);
      
      if (userId) {
        console.log('✅ User ID retrieved successfully');
        return userId;
      } else {
        console.log('❌ User ID is null or undefined');
        return null;
      }
    } else {
      console.log('❌ User is not authenticated');
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing user ID:', error);
    return null;
  }
};

// Test function to check Appwrite session
export const testAppwriteSession = async () => {
  console.log('Testing Appwrite session...');
  
  try {
    const { account } = await import('./lib/appwriteConfig');
    const user = await account.get();
    console.log('Appwrite user:', user);
    return user;
  } catch (error) {
    console.error('❌ Error getting Appwrite session:', error);
    return null;
  }
}; 