import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

const STORAGE_KEY = '@Tracker78:friends';

// Helper to generate random coordinates near a base location (for demo)
export function randomNearbyCoords(baseLat = 5.6037, baseLng = -0.1870, radius = 0.02) {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    latitude: baseLat + r * Math.cos(theta),
    longitude: baseLng + r * Math.sin(theta),
  };
}

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load friends from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setFriends(JSON.parse(stored));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save friends to AsyncStorage when changed
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
    }
  }, [friends, loading]);

  // Add a friend (with random location near baseLat/baseLng if provided)
  const addFriend = (friend, baseLat, baseLng) => {
    const exists = friends.some(f => f.contact === friend.contact);
    if (exists) return false;
    const coords = friend.latitude && friend.longitude
      ? { latitude: friend.latitude, longitude: friend.longitude }
      : randomNearbyCoords(baseLat, baseLng);
    setFriends(prev => [
      { ...friend, ...coords, id: Date.now().toString() },
      ...prev
    ]);
    return true;
  };

  // Remove a friend by id
  const removeFriend = (id) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  // Update a friend's location
  const updateFriendLocation = (id, latitude, longitude) => {
    setFriends(prev => prev.map(f => f.id === id ? { ...f, latitude, longitude } : f));
  };

  return (
    <FriendsContext.Provider value={{ friends, addFriend, removeFriend, updateFriendLocation, loading }}>
      {children}
    </FriendsContext.Provider>
  );
}; 