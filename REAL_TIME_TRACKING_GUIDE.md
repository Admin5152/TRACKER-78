# Real-Time Location Tracking Guide

## Overview
Your tracker app now supports real-time location tracking between users! This guide explains how the new system works and how to use it.

## New Features

### 1. User Search & Friend Requests
- **Search by User ID or Email**: Find other users who have the app installed
- **Send Friend Requests**: Send requests to other users to become friends
- **Accept/Reject Requests**: Manage incoming friend requests
- **Real-time Notifications**: Get notified when requests are accepted/rejected

### 2. Location Sharing Permissions
- **Enable Location Sharing**: Allow specific friends to see your location
- **Disable Location Sharing**: Stop sharing your location with specific friends
- **Granular Control**: Choose which friends can track your location

### 3. Real-Time Location Updates
- **Live Location Tracking**: See friends' locations in real-time
- **Automatic Updates**: Location refreshes every 10 seconds
- **Backend Integration**: Uses your deployed Spring Boot backend
- **Fallback System**: Falls back to local data if backend is unavailable

## How It Works

### For the Tracker (You)
1. **Add Friends**: Use the "Add Friend" button to search for users by ID or email
2. **Send Requests**: Send friend requests to users you want to track
3. **Wait for Acceptance**: Users must accept your friend request
4. **Enable Location Sharing**: Once friends accept, enable location sharing
5. **View on Map**: See real-time locations on the map page

### For the Tracked User (Your Friends)
1. **Receive Requests**: Get notified of incoming friend requests
2. **Accept/Reject**: Choose whether to accept tracking requests
3. **Control Sharing**: Enable/disable location sharing per friend
4. **Real-time Updates**: Your location is automatically shared with approved friends

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify authentication

### User Management
- `GET /api/users/search?q={term}` - Search users by ID or email
- `GET /api/users/{userId}` - Get user profile

### Friend Requests
- `POST /api/friend-requests` - Send friend request
- `GET /api/friend-requests/pending` - Get pending requests
- `PUT /api/friend-requests/{id}/accept` - Accept request
- `PUT /api/friend-requests/{id}/reject` - Reject request

### Location Sharing
- `POST /api/location-sharing/enable` - Enable location sharing
- `POST /api/location-sharing/disable` - Disable location sharing
- `GET /api/location-sharing/friends` - Get friends sharing location

### Location Updates
- `POST /api/locations` - Update user location
- `GET /api/locations/user/{userId}/current` - Get user's current location
- `GET /api/locations/friends` - Get all friends' locations

## User Interface

### FriendPage Updates
- **Add Friend Button**: Opens modal to search and add users
- **Requests Button**: Shows pending friend requests with badge
- **Real-time Data**: Displays friends with live location updates
- **Location Sharing Controls**: Enable/disable per friend

### MapPage Updates
- **Real-time Markers**: Shows friends' live locations
- **Auto-refresh**: Updates every 10 seconds
- **Location Updates**: Sends your location to backend automatically
- **Fallback System**: Uses local data if backend fails

## Security & Privacy

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure API calls with headers

### Location Privacy
- Users control who can see their location
- Granular permission system
- Can disable sharing at any time
- No location stored without consent

### Data Protection
- Encrypted API communication
- Secure token storage
- Automatic session cleanup on logout

## Backend Requirements

Your Spring Boot backend should implement these endpoints:

### User Management
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String q);
    
    @GetMapping("/{userId}")
    public User getUserProfile(@PathVariable String userId);
}
```

### Friend Requests
```java
@RestController
@RequestMapping("/api/friend-requests")
public class FriendRequestController {
    @PostMapping
    public FriendRequest sendRequest(@RequestBody FriendRequestRequest request);
    
    @GetMapping("/pending")
    public List<FriendRequest> getPendingRequests();
    
    @PutMapping("/{id}/accept")
    public FriendRequest acceptRequest(@PathVariable String id);
    
    @PutMapping("/{id}/reject")
    public FriendRequest rejectRequest(@PathVariable String id);
}
```

### Location Management
```java
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @PostMapping
    public Location updateLocation(@RequestBody LocationRequest request);
    
    @GetMapping("/user/{userId}/current")
    public Location getCurrentLocation(@PathVariable String userId);
    
    @GetMapping("/friends")
    public List<FriendLocation> getFriendsLocations();
}
```

## Testing the System

### 1. Create Test Users
- Register multiple accounts with different emails
- Note the user IDs for testing

### 2. Test Friend Requests
- Use one account to search for another by ID/email
- Send friend request
- Accept request from the other account

### 3. Test Location Sharing
- Enable location sharing between friends
- Check map to see real-time locations
- Test disabling location sharing

### 4. Test Real-time Updates
- Move around with location services enabled
- Check if friends see your updated location
- Verify automatic refresh every 10 seconds

## Troubleshooting

### Common Issues

1. **"User not found"**
   - Verify the user ID or email is correct
   - Ensure the user has registered on the app

2. **"Location not updating"**
   - Check location permissions are granted
   - Verify backend is running and accessible
   - Check network connectivity

3. **"Friend request not sending"**
   - Verify authentication is working
   - Check backend API is responding
   - Ensure user exists in database

4. **"Map not showing friends"**
   - Check if friends have accepted requests
   - Verify location sharing is enabled
   - Check if backend is returning location data

### Debug Tools
- Use the Auth Check button (🔐) to verify authentication
- Check console logs for API errors
- Use the backend health check endpoint

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time alerts for location updates
- **Geofencing**: Alerts when friends enter/leave areas
- **Location History**: Track location over time
- **Emergency Alerts**: Quick emergency location sharing
- **Group Tracking**: Track multiple friends simultaneously

### Performance Optimizations
- **WebSocket Integration**: Real-time updates without polling
- **Location Caching**: Reduce API calls
- **Battery Optimization**: Smart location update intervals
- **Offline Support**: Cache data for offline viewing

## Conclusion

The real-time tracking system provides a secure, privacy-focused way to share locations between friends. The system prioritizes user control and consent while providing real-time location updates through your Spring Boot backend.

Remember: Users must explicitly accept friend requests and enable location sharing before any tracking can occur. This ensures privacy and consent are maintained throughout the tracking process. 