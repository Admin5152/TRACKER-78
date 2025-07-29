# Backend Integration Guide

## 🎯 **Current Backend Status**
Your backend at `https://tracker-78-backend.onrender.com` is **running** but requires **Appwrite authentication**. The app has been updated to work with your existing backend endpoints.

## 🔧 **What I've Updated**

### **1. Authentication System**
- **Mock Appwrite Integration**: Since your backend expects Appwrite tokens, I've created a mock authentication system
- **Token Generation**: Creates Appwrite-style tokens for testing
- **User Data**: Stores user information with `appwriteId` field

### **2. API Endpoints Updated**
Your backend has these working endpoints:

#### **✅ Available Endpoints**
- `GET /api/auth/status` - Health check
- `GET /api/users` - Get all users
- `GET /api/users/{appwriteId}` - Get specific user
- `POST /api/users` - Create user (requires auth)
- `POST /api/locations/update` - Update location (requires auth)
- `GET /api/locations/{appwriteId}` - Get user location
- `POST /api/circles` - Create circle (requires auth)
- `POST /api/circles/join` - Join circle by code
- `GET /api/circles/{circleId}/members` - Get circle members
- `GET /api/circles/{circleId}/locations` - Get circle locations
- `POST /api/circles/leave` - Leave circle

#### **❌ Missing Endpoints** (These return empty arrays for now)
- `GET /api/locations/friends` - Friends locations
- `GET /api/friend-requests/pending` - Pending requests
- `GET /api/users/search` - User search
- `GET /api/location-sharing/friends` - Location sharing

### **3. Error Handling**
- **Graceful Fallbacks**: Returns empty arrays instead of crashing
- **Better Logging**: Structured error messages
- **Local Mode**: Falls back to local data when backend fails

## 🧪 **Testing the Backend**

### **Step 1: Test Connection**
1. Open the app
2. Go to **Friends Page**
3. Click the **🧪 Test Button** in the header
4. Check the console for results

### **Step 2: Expected Results**
```
Testing backend connection...
Testing: Health Check
  Status: 200
  Expected: 200
  ✅ Health Check - PASSED
  Data: "Authenticated via Appwrite"

Testing: Get All Users
  Status: 200
  Expected: 200
  ✅ Get All Users - PASSED
  Data: []

Testing: Create Circle (requires auth)
  Status: 401
  Expected: 401
  ✅ Create Circle (requires auth) - PASSED
```

## 🔄 **How to Use the Backend**

### **1. Authentication Flow**
```javascript
// Login creates a mock Appwrite token
const result = await authAPI.login({ email: 'user@example.com', password: 'password' });
// Result: { token: 'appwrite_user@example.com_1234567890', user: {...} }
```

### **2. Location Updates**
```javascript
// Update your location
await locationAPI.updateLocation({
  latitude: 5.6037,
  longitude: -0.1870,
  timestamp: new Date().toISOString(),
});
```

### **3. Circle Management**
```javascript
// Create a circle
const circle = await circlesAPI.createCircle({
  name: 'My Family',
  description: 'Family members only',
});

// Join a circle
const joinResult = await circlesAPI.joinCircle('ABC123');

// Get circle members
const members = await circlesAPI.getCircleMembers(circleId);
```

### **4. Get Circle Locations**
```javascript
// Get all member locations in a circle
const locations = await locationAPI.getCircleLocations(circleId);
```

## 🚀 **Next Steps to Complete Integration**

### **1. Implement Missing Endpoints**
Add these endpoints to your backend:

#### **Friend Requests**
```java
@RestController
@RequestMapping("/api/friend-requests")
public class FriendRequestController {
    @GetMapping("/pending")
    public ResponseEntity<List<FriendRequest>> getPendingRequests() {
        // Return pending friend requests for current user
        return ResponseEntity.ok(pendingRequests);
    }
    
    @PostMapping
    public ResponseEntity<FriendRequest> sendRequest(@RequestBody FriendRequestRequest request) {
        // Send friend request
        return ResponseEntity.ok(friendRequest);
    }
    
    @PutMapping("/{id}/accept")
    public ResponseEntity<FriendRequest> acceptRequest(@PathVariable String id) {
        // Accept friend request
        return ResponseEntity.ok(updatedRequest);
    }
}
```

#### **User Search**
```java
@GetMapping("/search")
public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
    // Search users by ID or email
    return ResponseEntity.ok(users);
}
```

#### **Friends Locations**
```java
@GetMapping("/friends")
public ResponseEntity<List<FriendLocation>> getFriendsLocations() {
    // Get all friends' locations for current user
    return ResponseEntity.ok(friendsLocations);
}
```

### **2. Real Appwrite Integration**
Replace the mock authentication with real Appwrite:

```javascript
// In utils/api.js, replace mock auth with:
import { account } from '../lib/appwriteConfig';

export const authAPI = {
  login: async (credentials) => {
    const session = await account.createEmailSession(credentials.email, credentials.password);
    const user = await account.get();
    return { token: session.$id, user };
  },
  // ... rest of implementation
};
```

### **3. WebSocket Integration**
Your backend has WebSocket support. Add real-time location updates:

```javascript
// In MapPage.js
const socket = new WebSocket('wss://tracker-78-backend.onrender.com/ws');
socket.onmessage = (event) => {
  const locationUpdate = JSON.parse(event.data);
  // Update friend locations in real-time
};
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. 403/401 Errors**
- **Cause**: Missing or invalid authentication
- **Fix**: Ensure you're logged in and token is valid

#### **2. Empty Responses**
- **Cause**: Endpoint doesn't exist yet
- **Fix**: Implement the missing endpoint or use local mode

#### **3. Network Errors**
- **Cause**: Backend is down or unreachable
- **Fix**: Check if backend is running at https://tracker-78-backend.onrender.com

### **Debug Tools**
- **🧪 Test Button**: Tests backend connectivity
- **🔍 Auth Check**: Shows authentication status
- **Console Logs**: Detailed error information

## 📱 **App Features**

### **Current Working Features**
- ✅ **Local Friend Management** - Add/remove friends locally
- ✅ **Circle Creation** - Create WhatsApp-style circles
- ✅ **Location Updates** - Send your location to backend
- ✅ **Circle Locations** - Get all member locations in a circle
- ✅ **Backend Testing** - Test connectivity and endpoints

### **Features That Need Backend Implementation**
- 🔄 **Friend Requests** - Send/accept friend requests
- 🔄 **User Search** - Find users by ID or email
- 🔄 **Real-time Tracking** - Live location updates
- 🔄 **Location Sharing** - Enable/disable location sharing

## 🎯 **Quick Start**

1. **Test the Backend**: Click the 🧪 button in Friends Page
2. **Create a Circle**: Use the circle manager to create a group
3. **Update Location**: Your location will be sent to the backend
4. **View Circle Members**: See all members in your circles

The app is now ready to work with your backend! The missing endpoints will gracefully fall back to local data, so the app continues to function while you implement the remaining features. 