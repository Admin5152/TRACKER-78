import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Animated,
  StatusBar,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedFetch } from '../utils/api'; // Ensure this path is correct
import { useIsFocused } from '@react-navigation/native';
import { account } from '../lib/appwriteConfig'; // Update path if needed
import { useFriends, randomNearbyCoords } from '../components/FriendsContext';
import * as Location from 'expo-location';
import CircleManager from '../components/CircleManager';
import LocalCircleManager from '../components/LocalCircleManager';
import AuthCheck from '../components/AuthCheck';
import { 
  friendsAPI, 
  getCurrentUserId, 
  handleAPIError,
  friendRequestsAPI,
  locationSharingAPI,
  locationAPI
} from '../utils/api';
import AddFriendModal from '../components/AddFriendModal';
import FriendRequestsModal from '../components/FriendRequestsModal';
import QuickRequestPopup from '../components/QuickRequestPopup';
import { testBackendConnection } from '../utils/testBackend';

const { width, height } = Dimensions.get('window');

export default function FriendTrackingSystem() {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendContact, setNewFriendContact] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [selectedFriendToRemove, setSelectedFriendToRemove] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // New states for API integration
  const [useApiData, setUseApiData] = useState(true);
  const [loadingApiData, setLoadingApiData] = useState(false);
  const [circleMembers, setCircleMembers] = useState([]);
  const [circleManagerVisible, setCircleManagerVisible] = useState(false);
  const [backendMode, setBackendMode] = useState(false); // Default to local mode
  const [backendFriends, setBackendFriends] = useState([]);
  const [loadingBackendFriends, setLoadingBackendFriends] = useState(false);
  const [authCheckVisible, setAuthCheckVisible] = useState(false);
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
  const [friendRequestsModalVisible, setFriendRequestsModalVisible] = useState(false);
  const [quickRequestPopupVisible, setQuickRequestPopupVisible] = useState(false);
  const [realTimeFriends, setRealTimeFriends] = useState([]);
  const [loadingRealTimeData, setLoadingRealTimeData] = useState(false);

  const navigation = useNavigation();

  // Replace with your actual circle ID
  const CIRCLE_ID = 1;

  // Storage keys
  const STORAGE_KEYS = {
    PEOPLE_YOU_TRACK: '@FriendTracking:peopleYouTrack',
    PENDING_REQUESTS: '@FriendTracking:pendingRequxests',
    NOTIFICATIONS: '@FriendTracking:notifications',
    USE_API_DATA: '@FriendTracking:useApiData',
  };

  const { friends, addFriend, removeFriend, loading: friendsLoading } = useFriends();

  // Load real-time friends data
  const loadRealTimeFriends = async () => {
    setLoadingRealTimeData(true);
    try {
      const friendsData = await locationAPI.getFriendsLocations();
      setRealTimeFriends(friendsData);
    } catch (error) {
      console.error('Error loading real-time friends:', error);
      // Fallback to local friends if API fails
      setRealTimeFriends(friends);
    } finally {
      setLoadingRealTimeData(false);
    }
  };

  // Enable location sharing for a friend
  const enableLocationSharing = async (friendId) => {
    try {
      await locationSharingAPI.enableLocationSharing(friendId);
      Alert.alert('Success', 'Location sharing enabled for this friend');
      loadRealTimeFriends(); // Refresh data
    } catch (error) {
      console.error('Error enabling location sharing:', error);
      Alert.alert('Error', error.message || 'Failed to enable location sharing');
    }
  };

  // Disable location sharing for a friend
  const disableLocationSharing = async (friendId) => {
    try {
      await locationSharingAPI.disableLocationSharing(friendId);
      Alert.alert('Success', 'Location sharing disabled for this friend');
      loadRealTimeFriends(); // Refresh data
    } catch (error) {
      console.error('Error disabling location sharing:', error);
      Alert.alert('Error', error.message || 'Failed to disable location sharing');
    }
  };

  // Test backend connection
  const testBackend = async () => {
    try {
      await testBackendConnection();
      Alert.alert('Backend Test', 'Check console for results');
    } catch (error) {
      console.error('Backend test error:', error);
      Alert.alert('Error', 'Failed to test backend');
    }
  };

  // Quick request handlers
  const handleQuickAccept = async (requestId) => {
    try {
      const result = await friendRequestsAPI.acceptFriendRequest(requestId);
      
      // Automatically enable location sharing
      if (result && result.friendId) {
        try {
          await locationSharingAPI.enableLocationSharing(result.friendId);
          Alert.alert('Success', 'Friend request accepted and location sharing enabled!');
        } catch (locationError) {
          console.error('Error enabling location sharing:', locationError);
          Alert.alert('Success', 'Friend request accepted! Location sharing can be enabled later.');
        }
      } else {
        Alert.alert('Success', 'Friend request accepted!');
      }
      
      loadRealTimeFriends();
      setQuickRequestPopupVisible(false);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    }
  };

  const handleQuickReject = async (requestId) => {
    try {
      await friendRequestsAPI.rejectFriendRequest(requestId);
      Alert.alert('Success', 'Friend request rejected');
      setQuickRequestPopupVisible(false);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    }
  };

  // Load circle members from API
  const loadCircleMembers = async () => {
    if (!useApiData) return;
    
    setLoadingApiData(true);
    try {
      const response = await authenticatedFetch(
        `https://api.yourdomain.com/api/circles/${CIRCLE_ID}/locations`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const membersData = await response.json();
      console.log('Loaded circle members:', membersData);
      
      // Transform API data to match friends format
      const transformedMembers = membersData.map(member => ({
        id: member.appwriteId,
        name: member.username || `User ${member.appwriteId.slice(-4)}`,
        contact: member.email || member.phone || 'No contact info',
        location: member.latitude && member.longitude ? 
          `${member.latitude.toFixed(4)}, ${member.longitude.toFixed(4)}` : 
          'Location shared',
        activity: member.statusMessage || 'Available',
        statusColor: member.isOnline ? "#10B981" : "#6B7280",
        time: new Date(member.timestamp).toLocaleTimeString(),
        image: member.profileImage || `https://images.unsplash.com/photo-${500 + Math.floor(Math.random() * 100)}?w=100&h=100&fit=crop&crop=face`,
        isOnline: member.isOnline || false
      }));
      
      setCircleMembers(transformedMembers);
      addNotification(`Loaded ${transformedMembers.length} friends from API`, 'success');
    } catch (error) {
      console.error('Error loading circle members:', error);
      addNotification('Failed to load API data, using stored data', 'error');
      setUseApiData(false); // Fallback to stored data
    } finally {
      setLoadingApiData(false);
    }
  };

  // Load friends from backend
  const loadBackendFriends = async () => {
    setLoadingBackendFriends(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log('User not authenticated, using local mode');
        setBackendMode(false);
        return;
      }

      const response = await friendsAPI.getUserFriends(userId);
      const backendFriendsData = response.documents || [];
      
      // Transform backend data to match local format
      const transformedFriends = backendFriendsData.map(friend => ({
        id: friend.$id,
        name: friend.name,
        contact: friend.contact,
        activity: 'Available',
        statusColor: '#10B981',
        time: 'Just now',
        image: `https://images.unsplash.com/photo-${500 + Math.floor(Math.random() * 100)}?w=100&h=100&fit=crop&crop=face`,
        isOnline: true,
        // Add random location for demo (in real app, this would come from location API)
        ...randomNearbyCoords()
      }));
      
      setBackendFriends(transformedFriends);
      setBackendMode(true);
    } catch (error) {
      console.error('Error loading backend friends:', error);
      setBackendMode(false);
    } finally {
      setLoadingBackendFriends(false);
    }
  };

  // Add friend to backend
  const addFriendToBackend = async (friendData) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const backendFriendData = {
        name: friendData.name,
        contact: friendData.contact,
        contactType: friendData.contactType || 'email',
        addedBy: userId,
      };

      const response = await friendsAPI.addFriend(backendFriendData);
      return response;
    } catch (error) {
      console.error('Error adding friend to backend:', error);
      throw error;
    }
  };

  // Remove friend from backend
  const removeFriendFromBackend = async (friendId) => {
    try {
      await friendsAPI.removeFriend(friendId);
    } catch (error) {
      console.error('Error removing friend from backend:', error);
      throw error;
    }
  };

  // Handle circle creation
  const handleCircleCreated = (newCircle) => {
    addNotification(`Circle "${newCircle.name}" created successfully!`, 'success');
    // Optionally refresh friends or circles data
  };

  // Toggle between local and backend mode
  const toggleBackendMode = () => {
    if (backendMode) {
      setBackendMode(false);
      addNotification('Switched to local mode', 'info');
    } else {
      loadBackendFriends();
    }
  };

  // Get current friends data based on mode
  const getCurrentFriendsData = () => {
    if (backendMode && backendFriends.length > 0) {
      return backendFriends;
    }
    return friends;
  };

  // Load data from AsyncStorage
  const loadStoredData = async () => {
    try {
      setLoading(true);
      const [storedPeople, storedRequests, storedNotifications, storedUseApi] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PEOPLE_YOU_TRACK),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.USE_API_DATA),
      ]);

      if (storedPeople) {
        // setPeopleYouTrack(JSON.parse(storedPeople)); // This state is removed
      }

      if (storedRequests) {
        setPendingRequests(JSON.parse(storedRequests));
      }

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      if (storedUseApi !== null) {
        setUseApiData(JSON.parse(storedUseApi));
      }

      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error loading stored data:', error);
      setError('Failed to load saved data');
    } finally {
      setLoading(false);
    }
  };

  // Save data to AsyncStorage
  const saveDataToStorage = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
    }
  };

  // Save pending requests whenever it changes
  useEffect(() => {
    if (isDataLoaded) {
      saveDataToStorage(STORAGE_KEYS.PENDING_REQUESTS, pendingRequests);
    }
  }, [pendingRequests, isDataLoaded]);

  // Save notifications whenever it changes
  useEffect(() => {
    if (isDataLoaded) {
      saveDataToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }, [notifications, isDataLoaded]);

  // Save API preference whenever it changes
  useEffect(() => {
    if (isDataLoaded) {
      saveDataToStorage(STORAGE_KEYS.USE_API_DATA, useApiData);
    }
  }, [useApiData, isDataLoaded]);

  // Load data when component mounts or when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isDataLoaded) {
        loadStoredData();
      }
      
      // Load real-time friends data
      loadRealTimeFriends();
      
      // Load API data if enabled
      if (useApiData && isDataLoaded) {
        loadCircleMembers();
      }
      
      // Disable automatic backend loading to prevent errors
      // if (isDataLoaded) {
      //   loadBackendFriends();
      // }
      
      // Animate header when screen comes into focus
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isDataLoaded, useApiData])
  );

  // Real-time updates - Check for accepted requests and refresh API data
  useEffect(() => {
    let interval;
    
    if (isDataLoaded) {
      interval = setInterval(() => {
        if (!useApiData) {
          checkForRequestUpdates();
        }
        // Refresh API data every 30 seconds if enabled
        if (useApiData && !loadingApiData) {
          loadCircleMembers();
        }
      }, useApiData ? 30000 : 3000); // 30 seconds for API, 3 seconds for local updates
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isDataLoaded, useApiData, loadingApiData]);

  // Mock function to simulate checking for request updates (only for local mode)
  const checkForRequestUpdates = useCallback(() => {
    if (!isDataLoaded || useApiData) return; // Skip for API mode
    
    setPendingRequests(prev => {
      const updated = [...prev];
      // Simulate random acceptance of pending requests (5% chance each check)
      const toAccept = updated.filter(() => Math.random() > 0.95);
      
      if (toAccept.length > 0) {
        // Move accepted requests to friends list
        const newFriends = toAccept.map(request => ({
          id: Date.now() + Math.random(),
          name: request.contactType === 'email' 
            ? request.contact.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') 
            : `Friend ${request.contact.slice(-4)}`,
          contact: request.contact,
          location: "Location shared",
          activity: "Available",
          statusColor: "#10B981",
          time: "Just now",
          image: `https://images.unsplash.com/photo-${500 + Math.floor(Math.random() * 100)}?w=100&h=100&fit=crop&crop=face`,
          isOnline: true
        }));

        // setPeopleYouTrack(current => [...current, ...newFriends]); // This state is removed
        
        // Add success notifications
        newFriends.forEach(friend => {
          addNotification(`${friend.name} accepted your request!`, 'success');
        });

        // Remove accepted requests from pending
        return updated.filter(req => !toAccept.includes(req));
      }
      
      return prev;
    });
  }, [isDataLoaded, useApiData]);

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep last 5
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const validateContact = (contact) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    
    return emailRegex.test(contact) || phoneRegex.test(contact);
  };

  const getContactType = (contact) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(contact) ? 'email' : 'phone';
  };

  // Update remove friend to work with both modes
  const handleRemoveFriend = async (friendId) => {
    if (backendMode) {
      try {
        await removeFriendFromBackend(friendId);
        await loadBackendFriends(); // Refresh backend friends
        addNotification('Friend removed from backend successfully', 'success');
      } catch (error) {
        const errorInfo = handleAPIError(error);
        addNotification(`Backend error: ${errorInfo.message}`, 'error');
      }
    } else {
      removeFriend(friendId);
      // addNotification('Friend removed successfully', 'success');
    }
    setRemoveModalVisible(false);
    setSelectedFriendToRemove(null);
  };

  const handleMoreButtonPress = (friend) => {
    setSelectedFriendToRemove(friend);
    setRemoveModalVisible(true);
  };

  // Toggle between API and local data
  const toggleDataSource = () => {
    const newUseApi = !useApiData;
    setUseApiData(newUseApi);
    
    if (newUseApi) {
      addNotification('Switched to API mode', 'info');
      // Load API data immediately
      loadCircleMembers();
    } else {
      addNotification('Switched to local mode', 'info');
    }
  };

  // Update sendTrackingRequest to work with both modes
  const sendTrackingRequest = async () => {
    if (!newFriendContact.trim() || !validateContact(newFriendContact.trim())) {
      Alert.alert('Invalid Contact', 'Please enter a valid email address or phone number');
      return;
    }
    const contact = newFriendContact.trim();
    const contactType = getContactType(contact);

    const currentFriends = getCurrentFriendsData();
    const alreadyTracking = currentFriends.some(friend => friend.contact === contact);
    const requestPending = pendingRequests.some(req => req.contact === contact);

    if (alreadyTracking) {
      Alert.alert('Already Tracking', 'You are already tracking this person!');
      return;
    }
    if (requestPending) {
      Alert.alert('Request Pending', 'Request already sent to this contact!');
      return;
    }

    setRequestLoading(true);
    try {
      await simulateSendRequest(contact, contactType);
      
      const newRequest = {
        id: Date.now(),
        contact,
        contactType,
        sentAt: new Date().toISOString(),
        status: 'pending'
      };
      
      setPendingRequests(prev => [...prev, newRequest]);
      addNotification(
        `Request sent to ${contact} via ${contactType === 'email' ? 'email' : 'SMS'}`, 
        'success'
      );
      
      setNewFriendContact("");
      setAddFriendModalVisible(false);
      
      // Get user's current location for base
      let baseLat = 5.6037, baseLng = -0.1870;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          baseLat = loc.coords.latitude;
          baseLng = loc.coords.longitude;
        }
      } catch (e) { /* fallback to default */ }
      
      // Auto-accept after 2 seconds
      setTimeout(async () => {
        const friendData = {
          name: contactType === 'email' ? contact.split('@')[0] : `Friend ${contact.slice(-4)}`,
          contact,
          activity: 'Available',
          statusColor: '#10B981',
          time: 'Just now',
          image: `https://images.unsplash.com/photo-${500 + Math.floor(Math.random() * 100)}?w=100&h=100&fit=crop&crop=face`,
          isOnline: true,
          contactType
        };

        if (backendMode) {
          try {
            await addFriendToBackend(friendData);
            await loadBackendFriends(); // Refresh backend friends
            addNotification(`${contact} added to backend successfully!`, 'success');
          } catch (error) {
            const errorInfo = handleAPIError(error);
            addNotification(`Backend error: ${errorInfo.message}`, 'error');
          }
        } else {
          addFriend(friendData, baseLat, baseLng);
          addNotification(`${contact} accepted your request!`, 'success');
        }
        
        setPendingRequests(prev => prev.filter(r => r.contact !== contact));
      }, 2000);
    } catch (error) {
      console.error('Error sending request:', error);
      addNotification('Failed to send request. Please try again.', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  // Simulate sending SMS or Email
  const simulateSendRequest = async (contact, contactType) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          const message = "Hi! Someone wants to track your location for safety. Reply 'YES' to accept or 'NO' to decline.";
          
          if (contactType === 'phone') {
            console.log(`SMS sent to ${contact}: ${message}`);
            // In real app, use SMS service like Twilio
            // Twilio.sendSMS(contact, message);
          } else {
            console.log(`Email sent to ${contact}: ${message}`);
            // In real app, use email service
            // EmailService.send(contact, 'Location Tracking Request', message);
          }
          
          resolve();
        } else {
          reject(new Error('Failed to send message'));
        }
      }, 1000);
    });
  };

  const handleMenuPress = (option) => {
    setModalVisible(false);
    switch (option) {
      case "Home":
        navigation.navigate("Home");
        break;
      case "Map View":
        navigation.navigate("MapPage");
        break;
      case "Settings":
        navigation.navigate("Settings");
        break;
      default:
        Alert.alert("Navigation", `Navigating to ${option}`);
    }
  };

  // Remove emergency function - no longer needed

  // Add function to clear all data (useful for testing or reset)
  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PEOPLE_YOU_TRACK,
        STORAGE_KEYS.PENDING_REQUESTS,
        STORAGE_KEYS.NOTIFICATIONS,
      ]);
      // setPeopleYouTrack([]); // This state is removed
      setPendingRequests([]);
      setNotifications([]);
      setCircleMembers([]);
      addNotification('All data cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing data:', error);
      addNotification('Failed to clear data', 'error');
    }
  };

  const currentFriends = getCurrentFriendsData();
  const filteredPeople = currentFriends.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatus = (color) => (
    <View style={styles.statusContainer}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Animated.View style={[styles.dotPulse, { backgroundColor: color }]} />
    </View>
  );

  const renderFriendCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.image }} style={styles.avatar} />
          <View style={styles.avatarBorder} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {renderStatus(item.statusColor)}
            {item.isOnline && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineBadgeText}>Online</Text>
              </View>
            )}
          </View>
          <View style={styles.activityRow}>
            <Text style={styles.activityIcon}>🏃</Text>
            <Text style={styles.details}>{item.activity}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📱</Text>
            <Text style={styles.contact}>{item.contact}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{item.time}</Text>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => handleMoreButtonPress(item)}
          >
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderPendingRequest = ({ item }) => (
    <View style={styles.pendingCard}>
      <View style={styles.pendingContent}>
        <View style={styles.pendingInfo}>
          <Text style={styles.pendingTitle}>Request Pending</Text>
          <Text style={styles.pendingContact}>{item.contact}</Text>
          <Text style={styles.pendingTime}>
            Sent {new Date(item.sentAt).toLocaleString()}
          </Text>
          <View style={styles.pendingType}>
            <Text style={styles.pendingTypeIcon}>
              {item.contactType === 'email' ? '📧' : '📱'}
            </Text>
            <Text style={styles.pendingTypeText}>
              via {item.contactType === 'email' ? 'Email' : 'SMS'}
            </Text>
          </View>
        </View>
        <View style={styles.pendingStatus}>
          <ActivityIndicator size="small" color="#F59E0B" />
          <Text style={styles.pendingStatusText}>Waiting...</Text>
        </View>
      </View>
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <Animated.View
      style={[
        styles.notificationItem,
        {
          backgroundColor: 
            item.type === 'success' ? '#D1FAE5' :
            item.type === 'error' ? '#FEE2E2' : '#DBEAFE'
        }
      ]}
    >
      <Text style={[
        styles.notificationText,
        {
          color: 
            item.type === 'success' ? '#065F46' :
            item.type === 'error' ? '#991B1B' : '#1E40AF'
        }
      ]}>
        {item.message}
      </Text>
      <Text style={styles.notificationTime}>{item.timestamp}</Text>
    </Animated.View>
  );

  const renderPlaceholder = () => (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderIconContainer}>
      <Text style={styles.placeholderIcon}>👥</Text>
      </View>
      <Text style={styles.placeholderTitle}>Start Tracking Friends</Text>
      <Text style={styles.placeholderSubtitle}>
        Add friends to start tracking their locations. Send tracking requests via email or phone number.
      </Text>
      <TouchableOpacity 
        style={styles.placeholderButton}
        onPress={() => setAddFriendModalVisible(true)}
      >
        <Text style={styles.placeholderButtonText}>Add Your First Friend</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Notifications Overlay */}
          {notifications.length > 0 && (
            <View style={styles.notificationsOverlay}>
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.notificationsList}
              />
            </View>
          )}

          {/* Header */}
          <Animated.View 
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerBackground} />
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuButton}>
                <Text style={styles.menuText}>☰</Text>
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.header}>People You Track</Text>
                <Text style={styles.subtitle}>
                  {filteredPeople.length} friends • {pendingRequests.length} requests • Local mode
                </Text>
              </View>
              {/* <TouchableOpacity 
                style={[styles.dataToggleButton, { opacity: 0.5 }]} // Make it less prominent
                onPress={toggleBackendMode}
              >
                <Text style={styles.dataToggleText}>
                  {backendMode ? '☁️' : '🔗'}
                </Text>
                {loadingBackendFriends && (
                  <ActivityIndicator 
                    size="small" 
                    color="#3B82F6" 
                    style={styles.loadingIndicator}
                  />
                )}
              </TouchableOpacity> */}
              <TouchableOpacity 
                style={styles.circleButton}
                onPress={() => setCircleManagerVisible(true)}
              >
                <Text style={styles.circleButtonText}>👥</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => {
                  setQuickRequestPopupVisible(true);
                }}
              >
                <Text style={styles.notificationText}>🔔</Text>
                {pendingRequests.length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>
                      {pendingRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.authCheckButton}
                onPress={() => setAuthCheckVisible(true)}
              >
                <Text style={styles.authCheckButtonText}>🔐</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity 
                style={styles.testBackendButton}
                onPress={testBackend}
              >
                <Text style={styles.testBackendButtonText}>🧪</Text>
              </TouchableOpacity> */}
            </View>
          </Animated.View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading friends...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadStoredData}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredPeople.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Tracking</Text>
                <FlatList
                  data={filteredPeople}
                  renderItem={renderFriendCard}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              renderPlaceholder()
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.addFriendButton} 
              onPress={() => setAddFriendModalVisible(true)}
            >
              <Text style={styles.addFriendIcon}>👥</Text>
              <Text style={styles.addFriendText}>Add Friend</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.createCircleButton} 
              onPress={() => setCircleManagerVisible(true)}
            >
              <Text style={styles.createCircleIcon}>+</Text>
              <Text style={styles.createCircleText}>Create Circle</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Menu Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Menu</Text>
              
              <View style={styles.modalContent}>
                {[
                  { name: "Home", icon: "🏠" },
                  { name: "Map View", icon: "🗺️" },
                  { name: "Settings", icon: "⚙️" }
                ].map((item) => (
                  <Pressable 
                    key={item.name} 
                    style={styles.modalItem} 
                    onPress={() => handleMenuPress(item.name)}
                  >
                    <View style={styles.modalIconContainer}>
                      <Text style={styles.modalItemIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalItemText}>{item.name}</Text>
                      <Text style={styles.modalItemSubtext}>Navigate to {item.name.toLowerCase()}</Text>
                    </View>
                  </Pressable>
                ))}
                
                {/* Debug option to clear all data - remove in production */}
                {/* {__DEV__ && (
                  <Pressable 
                    style={[styles.modalItem, { backgroundColor: '#FEE2E2' }]} 
                    onPress={clearAllData}
                  >
                    <View style={styles.modalIconContainer}>
                      <Text style={styles.modalItemIconText}>🗑️</Text>
                    </View>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalItemText}>Clear All Data</Text>
                      <Text style={styles.modalItemSubtext}>Reset all stored data (Debug only)</Text>
                    </View>
                  </Pressable>
                )} */}
              </View>
              
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Friend Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={addFriendModalVisible}
          onRequestClose={() => setAddFriendModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable 
              style={styles.modalBackdrop} 
              onPress={() => setAddFriendModalVisible(false)} 
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.addFriendModalContainer}>
                <View style={styles.modalHandle} />
                
                <View style={styles.addFriendModalHeader}>
                  <Text style={styles.addFriendModalTitle}>Add New Friend</Text>
                  <TouchableOpacity 
                    style={styles.modalCloseIcon}
                    onPress={() => setAddFriendModalVisible(false)}
                  >
                    <Text style={styles.modalCloseIconText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.addFriendDescription}>
                  Enter your friend's phone number or email address. They'll receive a request to share their location with you.
                </Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>
                    {getContactType(newFriendContact) === 'email' ? '📧' : '📱'}
                  </Text>
                  <TextInput
                    style={styles.addFriendInput}
                    placeholder="Phone number or email address"
                    placeholderTextColor="#94a3b8"
                    value={newFriendContact}
                    onChangeText={setNewFriendContact}
                    autoFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={sendTrackingRequest}
                    keyboardType={getContactType(newFriendContact) === 'email' ? 'email-address' : 'phone-pad'}
                  />
                </View>
                
                <View style={styles.addFriendActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setNewFriendContact("");
                      setAddFriendModalVisible(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.addButton, 
                      { 
                        opacity: newFriendContact.trim().length > 0 && !requestLoading ? 1 : 0.5 
                      }
                    ]}
                    disabled={newFriendContact.trim().length === 0 || requestLoading}
                    onPress={sendTrackingRequest}
                  >
                    {requestLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.addButtonText}>Send Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
        
        {/* Remove Friend Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={removeModalVisible}
          onRequestClose={() => setRemoveModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setRemoveModalVisible(false)} />
            <View style={styles.removeModalContainer}>
              <View style={styles.removeModalContent}>
                <Text style={styles.removeModalIcon}>⚠️</Text>
                <Text style={styles.removeModalTitle}>Remove Friend</Text>
                <Text style={styles.removeModalMessage}>
                  Are you sure you want to remove {selectedFriendToRemove?.name} from your tracking list? 
                  You won't be able to see their location anymore.
                </Text>
                
                <View style={styles.removeModalActions}>
                  <TouchableOpacity
                    style={styles.removeModalCancelButton}
                    onPress={() => {
                      setRemoveModalVisible(false);
                      setSelectedFriendToRemove(null);
                    }}
                  >
                    <Text style={styles.removeModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.removeModalConfirmButton}
                    onPress={() => handleRemoveFriend(selectedFriendToRemove?.id)}
                  >
                    <Text style={styles.removeModalConfirmText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Circle Manager Modal */}
        <LocalCircleManager
          visible={circleManagerVisible}
          onClose={() => setCircleManagerVisible(false)}
          friends={currentFriends}
          onCircleCreated={handleCircleCreated}
        />

        {/* Add Friend Modal */}
        <AddFriendModal
          visible={addFriendModalVisible}
          onClose={() => setAddFriendModalVisible(false)}
          onFriendAdded={() => {
            loadRealTimeFriends();
            setAddFriendModalVisible(false);
          }}
        />

        {/* Quick Request Popup */}
        <QuickRequestPopup
          visible={quickRequestPopupVisible}
          onClose={() => setQuickRequestPopupVisible(false)}
          requests={pendingRequests}
          onAccept={handleQuickAccept}
          onReject={handleQuickReject}
          processingRequest={null}
        />

        {/* Friend Requests Modal */}
        <FriendRequestsModal
          visible={friendRequestsModalVisible}
          onClose={() => setFriendRequestsModalVisible(false)}
          onRequestsUpdated={() => {
            loadRealTimeFriends();
            setFriendRequestsModalVisible(false);
          }}
        />

        {/* Auth Check Modal */}
        <AuthCheck
          visible={authCheckVisible}
          onClose={() => setAuthCheckVisible(false)}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  notificationsOverlay: {
    position: 'absolute',
    top: 80,
    right: 10,
    zIndex: 1000,
    width: '90%',
    maxWidth: 340,
    alignItems: 'flex-end',
  },
  notificationsList: {
    maxHeight: 220,
    width: '100%',
  },
  notificationItem: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minWidth: 180,
    maxWidth: 320,
    alignSelf: 'flex-end',
  },
  notificationText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 17,
  },
  notificationTime: {
    fontSize: 11,
    opacity: 0.6,
    alignSelf: 'flex-end',
  },
  headerContainer: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    marginRight: 15,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  dataToggleButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative',
  },
  dataToggleText: {
    fontSize: 20,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  circleButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  circleButtonText: {
    fontSize: 20,
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationText: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748B',
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  apiStatusCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  apiStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiStatusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  apiStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
  },
  apiStatusText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  placeholderButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusContainer: {
    position: 'relative',
    width: 12,
    height: 12,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 2,
    left: 2,
  },
  dotPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.3,
    position: 'absolute',
  },
  onlineBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  onlineBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  details: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  contact: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 8,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    fontSize: 16,
  },
  pendingCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  pendingContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  pendingContact: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 2,
  },
  pendingTime: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  pendingType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingTypeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  pendingTypeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingStatusText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  addFriendButton: {
    flex: 1,
    backgroundColor: '#38BDF8',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addFriendIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createCircleButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createCircleIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  createCircleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalItemIconText: {
    fontSize: 20,
  },
  modalTextContainer: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  modalItemSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  modalClose: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF0000',
  },
  keyboardAvoidingView: {
    justifyContent: 'flex-end',
  },
  addFriendModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    minHeight: 300,
  },
  addFriendModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addFriendModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  modalCloseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIconText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: 'bold',
  },
  addFriendDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#64748B',
  },
  addFriendInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 16,
    fontWeight: '500',
  },
  addFriendActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  removeModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    maxWidth: 320,
  },
  removeModalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  removeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  removeModalMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  removeModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  removeModalCancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  removeModalConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authCheckButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  authCheckButtonText: {
    fontSize: 20,
  },
  testBackendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FF6B35',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  testBackendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});