import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { friendRequestsAPI, locationSharingAPI } from '../utils/api';

export default function FriendRequestsModal({ visible, onClose, onRequestsUpdated }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await friendRequestsAPI.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      Alert.alert('Error', error.message || 'Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    if (visible) {
      loadRequests();
    }
  }, [visible]);

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      // Accept the friend request
      const result = await friendRequestsAPI.acceptFriendRequest(requestId);
      
      // Automatically enable location sharing for the new friend
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
      
      onRequestsUpdated();
      loadRequests(); // Refresh the list
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      await friendRequestsAPI.rejectFriendRequest(requestId);
      Alert.alert('Success', 'Friend request rejected');
      loadRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', error.message || 'Failed to reject friend request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const renderRequest = (request) => (
    <View key={request.id} style={styles.requestItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {request.sender?.name 
              ? request.sender.name.charAt(0).toUpperCase() 
              : request.sender?.email?.charAt(0).toUpperCase() || 'U'
            }
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {request.sender?.name || 'Unknown User'}
          </Text>
          <Text style={styles.userEmail}>{request.sender?.email}</Text>
          <Text style={styles.requestDate}>
            {new Date(request.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(request.id)}
          disabled={processingRequest === request.id}
        >
          {processingRequest === request.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(request.id)}
          disabled={processingRequest === request.id}
        >
          {processingRequest === request.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="close" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Friend Requests</Text>
            <Text style={styles.subtitle}>Accept to start tracking location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.requestsContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading requests...</Text>
              </View>
            ) : requests.length > 0 ? (
              requests.map(renderRequest)
            ) : (
              <View style={styles.noRequests}>
                <Ionicons name="mail-outline" size={48} color="#ccc" />
                <Text style={styles.noRequestsText}>No pending friend requests</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 5,
  },
  requestsContainer: {
    flex: 1,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  noRequests: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noRequestsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
}); 