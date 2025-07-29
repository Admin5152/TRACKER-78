# User ID Test Guide

## Problem
You're getting "backend user id error" because the app is trying to get user ID from the Spring Boot backend, but you're using Appwrite for authentication.

## Solution Applied
I've updated the `getCurrentUserId()` function to:
1. **First try Appwrite**: Get user ID from `account.get()`
2. **Fallback to AsyncStorage**: If Appwrite fails, get from stored user data
3. **Return Appwrite ID**: Use the actual Appwrite user ID (`$id`)

## How to Test

### 1. Check Authentication Status
Open the app and go to the Friend Page, then tap the 🔐 button to open the Auth Check modal.

### 2. Test User ID Retrieval
Add this to any component to test:

```javascript
import { getCurrentUserId, isAuthenticated } from '../utils/api';

const testUserId = async () => {
  try {
    const authenticated = await isAuthenticated();
    console.log('Is authenticated:', authenticated);
    
    if (authenticated) {
      const userId = await getCurrentUserId();
      console.log('User ID:', userId);
      Alert.alert('User ID Test', `User ID: ${userId}`);
    } else {
      Alert.alert('Not Authenticated', 'Please log in first');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', error.message);
  }
};
```

### 3. Check Console Logs
Look for these logs in your console:
- `"Testing user ID retrieval..."`
- `"Is authenticated: true/false"`
- `"User ID: [some-id]"`
- `"✅ User ID retrieved successfully"`

### 4. Manual Testing Steps

1. **Login**: Make sure you're logged in with Appwrite
2. **Check Auth**: Use the Auth Check modal (🔐 button)
3. **Test Functions**: The app should now get user ID from Appwrite
4. **Verify**: User ID should be a long string like `"64f8a1b2c3d4e5f6a7b8c9d0"`

## Expected Results

### ✅ Success Case
```
Is authenticated: true
User ID: 64f8a1b2c3d4e5f6a7b8c9d0
✅ User ID retrieved successfully
```

### ❌ Failure Cases
```
Is authenticated: false
❌ User is not authenticated
```

```
Is authenticated: true
User ID: null
❌ User ID is null or undefined
```

## Debugging Steps

### If User ID is Still Null:

1. **Check Appwrite Session**:
   ```javascript
   import { account } from '../lib/appwriteConfig';
   const user = await account.get();
   console.log('Appwrite user:', user);
   ```

2. **Check AsyncStorage**:
   ```javascript
   const user = await AsyncStorage.getItem('currentUser');
   console.log('Stored user:', user);
   ```

3. **Verify Login**: Make sure you're actually logged in with Appwrite

### If Getting Appwrite Errors:

1. **Check Appwrite Config**: Verify your project ID and endpoint
2. **Check Network**: Make sure you can reach Appwrite
3. **Check Session**: The session might have expired

## Updated Functions

### `getCurrentUserId()`
- ✅ Gets user ID from Appwrite first
- ✅ Falls back to AsyncStorage if needed
- ✅ Returns the actual Appwrite user ID

### `isAuthenticated()`
- ✅ Checks Appwrite session
- ✅ Falls back to AsyncStorage check
- ✅ Returns true/false

### `authAPI.login()`
- ✅ Uses Appwrite `createEmailSession()`
- ✅ Gets user data from Appwrite
- ✅ Stores user data in AsyncStorage

### `authAPI.register()`
- ✅ Uses Appwrite `create()` and `createEmailSession()`
- ✅ Stores user data in AsyncStorage

## Next Steps

1. **Test the app** - Try logging in and check if user ID works
2. **Check console logs** - Look for any errors
3. **Use Auth Check modal** - Verify authentication status
4. **Test friend features** - Add friends and see if user ID is used correctly

The user ID error should now be resolved! 🎉 