import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { 
  authenticatedFetch, 
  circlesAPI, 
  getCurrentUserId, 
  handleAPIError,
  locationAPI,
  locationSharingAPI
} from '../utils/api';
import { useFriends } from '../components/FriendsContext';

const { width, height } = Dimensions.get('window');

// Backup/demo friends data - you can keep this for testing
const DEMO_FRIENDS_DATA = [
  {
    id: 1,
    name: "Alice Johnson",
    latitude: 5.6037,
    longitude: -0.1870,
    status: "online",
    lastSeen: "2 min ago",
    avatar: "👩‍💼"
  },
  {
    id: 2,
    name: "Friend 4488",
    latitude: 5.6150,
    longitude: -0.1750,
    status: "offline",
    lastSeen: "1 hour ago",
    avatar: "👨‍🔬"
  },
  {
    id: 3,
    name: "Friend 7673",
    latitude: 5.5920,
    longitude: -0.1920,
    status: "online",
    lastSeen: "Just now",
    avatar: "👩‍🚀"
  }
];

export default function MapPage({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendsVisible, setFriendsVisible] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [routeCoords, setRouteCoords] = useState([]);
  const [showRoute, setShowRoute] = useState(false);
  const { friends, loading: friendsLoading } = useFriends();
  const [backendMode, setBackendMode] = useState(false); // Default to local mode
  const [backendFriends, setBackendFriends] = useState([]);
  const [loadingBackendFriends, setLoadingBackendFriends] = useState(false);
  const [realTimeFriends, setRealTimeFriends] = useState([]);
  const [loadingRealTimeData, setLoadingRealTimeData] = useState(false);

  // Replace with your actual circle ID
  const CIRCLE_ID = 1;
  
  // Add map reference for controlling zoom
  const mapRef = useRef(null);

  // Load real-time friends location data
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

  // Update user's location to backend
  const updateMyLocation = async (latitude, longitude) => {
    // Skip network request in local mode
    if (!backendMode) return;
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        await locationAPI.updateLocation({
          userId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Load circle members from API
  const loadCircleMembers = async () => {
    // setLoadingMembers(true); // This state is removed, so this function is no longer needed
    try {
      const response = await authenticatedFetch(
        `https://api.yourdomain.com/api/circles/${CIRCLE_ID}/locations`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const membersData = await response.json();
      console.log('Loaded members:', membersData);
      // setMembers(membersData); // This state is removed
    } catch (error) {
      console.error('Error loading circle members:', error);
      Alert.alert(
        'Error loading circle', 
        error.message,
        [
          { text: 'Use Demo Data', onPress: () => { /* setUseApiData(false) */ } },
          { text: 'Retry', onPress: loadCircleMembers },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      // setLoadingMembers(false); // This state is removed
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

      // Get user's circles first
      const circlesResponse = await circlesAPI.getUserCircles(userId);
      const circles = circlesResponse.documents || [];
      
      // Get friends from all circles
      const allFriends = [];
      for (const circle of circles) {
        const membersResponse = await circlesAPI.getCircleMembers(circle.$id);
        const members = membersResponse.documents || [];
        
        // Transform members to friend format
        const circleFriends = members.map(member => ({
          id: member.$id,
          name: member.name || `Friend ${member.$id.slice(-4)}`,
          latitude: member.latitude || 5.6037 + (Math.random() - 0.5) * 0.02,
          longitude: member.longitude || -0.1870 + (Math.random() - 0.5) * 0.02,
          status: 'online',
          lastSeen: 'Just now',
          avatar: '👤',
          contact: member.contact || 'No contact',
          activity: 'Available',
          statusColor: '#10B981',
          time: 'Just now',
          isOnline: true,
        }));
        
        allFriends.push(...circleFriends);
      }
      
      setBackendFriends(allFriends);
      setBackendMode(true);
    } catch (error) {
      console.error('Error loading backend friends:', error);
      setBackendMode(false);
    } finally {
      setLoadingBackendFriends(false);
    }
  };

  // Load backend friends when component mounts
  useEffect(() => {
    // Disable automatic backend loading to prevent errors
    // loadBackendFriends();
  }, []);

  // Initialize location tracking
  useEffect(() => {
    let subscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to view the map.');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc.coords);
          setLoading(false);
          // Update location to backend
          updateMyLocation(loc.coords.latitude, loc.coords.longitude);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Load real-time friends data on component mount
  useEffect(() => {
    loadRealTimeFriends();
    
    // Set up interval to refresh real-time data
    const interval = setInterval(() => {
      loadRealTimeFriends();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle friend marker press
  const handleFriendMarkerPress = async (friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedFriend(friend);
    // Center map on friend
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: friend.latitude,
        longitude: friend.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    // Show Alert with option to show route
    Alert.alert(
      `${friend.name}`,
      `Lat: ${friend.latitude?.toFixed(4)}, Lng: ${friend.longitude?.toFixed(4)}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Show Route', onPress: () => handleShowRoute(friend) },
      ]
    );
  };

  const handleShowRoute = async (friend) => {
    setShowRoute(true);
    // Use Google Directions API if you have an API key, else draw a straight line
    const apiKey = null; // <-- Put your Google Directions API key here if you have one
    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${friend.latitude},${friend.longitude}&mode=walking&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoords(points);
        } else {
          setRouteCoords([{ latitude: location.latitude, longitude: location.longitude }, { latitude: friend.latitude, longitude: friend.longitude }]);
        }
      } catch (e) {
        setRouteCoords([{ latitude: location.latitude, longitude: location.longitude }, { latitude: friend.latitude, longitude: friend.longitude }]);
      }
    } else {
      // No API key: draw straight line
      setRouteCoords([{ latitude: location.latitude, longitude: location.longitude }, { latitude: friend.latitude, longitude: friend.longitude }]);
    }
  };

  // Polyline decoder for Google Directions API
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }

  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'hybrid' : 'standard');
  };

  const handleMenuPress = (option) => {
    setModalVisible(false);
    switch (option) {
      case "FriendPage":
        navigation.navigate("Friends");
        break;
      case "Home":
        navigation.navigate("Home");
        break;
      case "MapPage":
        navigation.navigate("MapPage");
        break;
      case "Settings":
        navigation.navigate("Settings");
        break;
      default:
        Alert.alert(`You pressed ${option}`);
    }
  };

  const handleEmergency = () => {
    Alert.alert("Emergency", "Emergency services have been contacted!");
  };

  const toggleFriendsVisibility = () => {
    setFriendsVisible(!friendsVisible);
  };

  // Function to zoom to user's current location
  const zoomToMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005, // Smaller delta for more zoom
        longitudeDelta: 0.005,
      }, 1000); // 1 second animation
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Get friends data based on current mode
  // const getFriendsData = () => { // This function is removed
  //   if (useApiData && members.length > 0) {
  //     return members.map(member => ({
  //       id: member.appwriteId,
  //       name: member.username,
  //       latitude: member.latitude,
  //       longitude: member.longitude,
  //       status: member.statusMessage || 'online',
  //       lastSeen: new Date(member.timestamp).toLocaleTimeString(),
  //       avatar: "👤" // Default avatar for API users
  //     }));
  //   }
  //   return DEMO_FRIENDS_DATA;
  // };

  const getCurrentFriendsData = () => {
    // Prioritize real-time data
    if (realTimeFriends.length > 0) {
      return realTimeFriends;
    }
    // Fallback to backend friends
    if (backendMode && backendFriends.length > 0) {
      return backendFriends;
    }
    // Fallback to local friends
    return friends;
  };

  const friendsData = getCurrentFriendsData();

  if (loading || !location) {
    return (
      <SafeAreaView style={styles.loader}>
        <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
          <Text style={styles.loaderText}>Fetching your live location...</Text>
          <Text style={styles.loaderSubtext}>Please wait while we locate you</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      
      {/* Header with gradient background */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.menuText}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>Map View</Text>
            <Text style={styles.headerSubtext}>
              Offline mode • {friendsData.length} friends
            </Text>
          </View>
          {/* Toggle between API and demo data */}
          {/* <TouchableOpacity 
            style={styles.friendsToggle} 
            onPress={() => setUseApiData(!useApiData)}
          >
            <Text style={styles.friendsToggleText}>
              {useApiData ? '📡' : '🎭'}
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Map Container with rounded corners and shadow */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* Your location marker */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
          
          {/* Friends markers */}
          {friendsVisible && friendsData.map((friend) => (
            <Marker
              key={friend.id}
              coordinate={{
                latitude: friend.latitude,
                longitude: friend.longitude,
              }}
              title={friend.name}
              description={`Lat: ${friend.latitude?.toFixed(4)}, Lng: ${friend.longitude?.toFixed(4)}`}
              pinColor={getMarkerColor(friend.status)}
              onPress={() => handleFriendMarkerPress(friend)}
            />
          ))}
          {/* Route polyline */}
          {showRoute && routeCoords.length > 1 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#2563eb"
              strokeWidth={4}
            />
          )}
        </MapView>
        
        {/* Map overlay controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFriendsVisibility}>
            <Text style={styles.controlButtonText}>
              {friendsVisible ? '👥' : '👤'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={zoomToMyLocation}>
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <Text style={styles.controlButtonText}>🗺</Text>
          </TouchableOpacity>
          {/* {useApiData && ( // This state is removed
            <TouchableOpacity 
              style={[styles.controlButton, loadingMembers && { opacity: 0.6 }]} 
              onPress={loadCircleMembers}
              disabled={loadingMembers}
            >
              <Text style={styles.controlButtonText}>
                {loadingMembers ? '⟳' : '🔄'}
              </Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>

      {/* Location info card */}
      <View style={styles.locationCard}>
        <View style={styles.locationCardHeader}>
          <Text style={styles.locationCardTitle}>Current Location</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.coordinates}>
          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
        <View style={styles.friendsCounter}>
          <Text style={styles.friendsCounterText}>
            {friendsVisible 
              ? `${friendsData.length} friends visible` 
              : 'Friends hidden'
            }
            {friendsLoading && ' • Loading...'}
          </Text>
        </View>
      </View>

      {/* Friends list card */}
      {friendsVisible && (
        <View style={styles.friendsCard}>
          <Text style={styles.friendsCardTitle}>Friends Nearby</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {friendsData.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItem}
                onPress={() => handleFriendMarkerPress(friend)}
              >
                <Text style={styles.friendAvatar}>{friend.avatar}</Text>
                <Text style={styles.friendName}>{friend.name.split(' ')[0]}</Text>
                <View style={[styles.statusDot, { backgroundColor: getMarkerColor(friend.status) }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Enhanced Slide-Up Modal Menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalHeader}>Navigation Menu</Text>
            
            <View style={styles.menuGrid}>
              <Pressable style={styles.modalItem} onPress={() => handleMenuPress("Home")}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalIcon}>🏠</Text>
                </View>
                <Text style={styles.modalText}>Home</Text>
                <Text style={styles.modalSubtext}>Main dashboard</Text>
              </Pressable>
              
              <Pressable style={styles.modalItem} onPress={() => handleMenuPress("FriendPage")}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalIcon}>👥</Text>
                </View>
                <Text style={styles.modalText}>Friends</Text>
                <Text style={styles.modalSubtext}>Your network</Text>
              </Pressable>
              
              <Pressable style={styles.modalItem} onPress={() => handleMenuPress("Settings")}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalIcon}>⚙️</Text>
                </View>
                <Text style={styles.modalText}>Settings</Text>
                <Text style={styles.modalSubtext}>Preferences</Text>
              </Pressable>
            </View>
            
            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close Menu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loader: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    padding: 40,
  },
  loaderIconContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loaderText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loaderSubtext: {
    color: '#64748B',
    fontSize: 14,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 20,
    color: '#475569',
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  friendsToggle: {
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  friendsToggleText: {
    fontSize: 20,
  },
  mapContainer: {
    flex: 1,
    margin: width * 0.05,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 16,
  },
  locationCard: {
    marginHorizontal: width * 0.05,
    marginTop: 15,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  locationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  coordinates: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  friendsCounter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  friendsCounterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  friendsCard: {
    marginHorizontal: width * 0.05,
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  friendsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  friendAvatar: {
    fontSize: 24,
    marginBottom: 6,
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emergencyBtn: {
    marginHorizontal: width * 0.05,
    marginTop: 15,
    marginBottom: 30,
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
    maxHeight: height * 0.7,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#0F172A',
    textAlign: 'center',
  },
  menuGrid: {
    marginBottom: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
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
  modalIcon: {
    fontSize: 20,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  modalSubtext: {
    fontSize: 12,
    color: '#64748B',
    position: 'absolute',
    bottom: 16,
    left: 76,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  modalCloseText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});