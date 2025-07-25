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

const { width, height } = Dimensions.get('window');

export default function FriendTrackingSystem() {
  const [modalVisible, setModalVisible] = useState(false);
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendContact, setNewFriendContact] = useState("");
  const [peopleYouTrack, setPeopleYouTrack] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [selectedFriendToRemove, setSelectedFriendToRemove] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const navigation = useNavigation();

  // Storage keys
  const STORAGE_KEYS = {
    PEOPLE_YOU_TRACK: '@FriendTracking:peopleYouTrack',
    PENDING_REQUESTS: '@FriendTracking:pendingRequests',
    NOTIFICATIONS: '@FriendTracking:notifications',
  };

  // Load data from AsyncStorage
  const loadStoredData = async () => {
    try {
      setLoading(true);
      const [storedPeople, storedRequests, storedNotifications] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PEOPLE_YOU_TRACK),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
      ]);

      if (storedPeople) {
        setPeopleYouTrack(JSON.parse(storedPeople));
      }

      if (storedRequests) {
        setPendingRequests(JSON.parse(storedRequests));
      }

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
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

  // Save people you track whenever it changes
  useEffect(() => {
    if (isDataLoaded) {
      saveDataToStorage(STORAGE_KEYS.PEOPLE_YOU_TRACK, peopleYouTrack);
    }
  }, [peopleYouTrack, isDataLoaded]);

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

  // Load data when component mounts or when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isDataLoaded) {
        loadStoredData();
      }
      
      // Animate header when screen comes into focus
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim, isDataLoaded])
  );

  // Real-time updates - Check for accepted requests
  useEffect(() => {
    let interval;
    
    if (isDataLoaded) {
      interval = setInterval(() => {
        checkForRequestUpdates();
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [checkForRequestUpdates, isDataLoaded]);

  // Mock function to simulate checking for request updates
  const checkForRequestUpdates = useCallback(() => {
    if (!isDataLoaded) return;
    
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

        setPeopleYouTrack(current => [...current, ...newFriends]);
        
        // Add success notifications
        newFriends.forEach(friend => {
          addNotification(`${friend.name} accepted your request!`, 'success');
        });

        // Remove accepted requests from pending
        return updated.filter(req => !toAccept.includes(req));
      }
      
      return prev;
    });
  }, [isDataLoaded]);

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

  // Add this function to handle removing a friend
  const removeFriend = (friendId) => {
    setPeopleYouTrack(current => current.filter(friend => friend.id !== friendId));
    addNotification(`Friend removed successfully`, 'success');
    setRemoveModalVisible(false);
    setSelectedFriendToRemove(null);
  };

  const handleMoreButtonPress = (friend) => {
    setSelectedFriendToRemove(friend);
    setRemoveModalVisible(true);
  };

  const sendTrackingRequest = async () => {
    if (!newFriendContact.trim() || !validateContact(newFriendContact.trim())) {
      Alert.alert('Invalid Contact', 'Please enter a valid email address or phone number');
      return;
    }

    const contact = newFriendContact.trim();
    const contactType = getContactType(contact);

    // Check if already tracking or request pending
    const alreadyTracking = peopleYouTrack.some(friend => friend.contact === contact);
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
      // Send SMS or Email
      await simulateSendRequest(contact, contactType);
      
      // Add to pending requests
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

  const handleEmergency = () => {
    Alert.alert(
      "Emergency Alert", 
      "Emergency services will be contacted and your location will be shared with your emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call Emergency", 
          style: "destructive",
          onPress: () => {
            // Call emergency services
            Linking.openURL('tel:911');
            // Share location with tracked friends
            addNotification('Emergency alert sent to all friends', 'error');
          }
        }
      ]
    );
  };

  // Add function to clear all data (useful for testing or reset)
  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PEOPLE_YOU_TRACK,
        STORAGE_KEYS.PENDING_REQUESTS,
        STORAGE_KEYS.NOTIFICATIONS,
      ]);
      setPeopleYouTrack([]);
      setPendingRequests([]);
      setNotifications([]);
      addNotification('All data cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing data:', error);
      addNotification('Failed to clear data', 'error');
    }
  };

  const filteredPeople = peopleYouTrack.filter(person =>
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
            <Text style={styles.contactText}>{item.contact}</Text>
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
      <Text style={styles.placeholderIcon}>👥</Text>
      <Text style={styles.placeholderTitle}>Start Tracking Friends</Text>
      <Text style={styles.placeholderSubtitle}>
        Send tracking requests to your friends via SMS or email. When they accept, you'll see their location here!
      </Text>
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
                  {peopleYouTrack.length} friends • {pendingRequests.length} pending
                </Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationText}>🔔</Text>
                {(notifications.length > 0 || pendingRequests.length > 0) && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>
                      {notifications.length + pendingRequests.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                <FlatList
                  data={pendingRequests}
                  renderItem={renderPendingRequest}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Friends List */}
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
          </ScrollView>

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
              style={styles.emergencyBtn} 
              onPress={handleEmergency}
            >
              <Text style={styles.emergencyIcon}>🚨</Text>
              <Text style={styles.emergencyText}>Emergency</Text>
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
                {__DEV__ && (
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
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
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
                    onPress={() => removeFriend(selectedFriendToRemove?.id)}
                  >
                    <Text style={styles.removeModalConfirmText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
    top: 100,
    right: 20,
    zIndex: 1000,
    width: width * 0.8,
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
  },
  menuButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748B',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 20,
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#10B981',
    top: -2,
    left: -2,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
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
    borderRadius: 8,
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
  contactText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400',
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
  removeButtonText: {
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
  pendingActions: {
    alignItems: 'center',
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
  cancelRequestButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRequestText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  addFriendButton: {
    flex: 1,
    backgroundColor: '#38BDF8',
    paddingVertical: 16,
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
  addFriendIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  emergencyText: {
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
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    color: '#1E293B',
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
});