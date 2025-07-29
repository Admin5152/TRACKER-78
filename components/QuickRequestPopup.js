import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuickRequestPopup({ 
  visible, 
  onClose, 
  requests, 
  onAccept, 
  onReject,
  processingRequest 
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Friend Requests</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              {requests.length > 0 ? 'Tap to accept or decline' : 'No pending requests'}
            </Text>
          </View>
          
          {requests.length > 0 ? (
            <>
              <View style={styles.requestsList}>
                {requests.map((request) => (
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
                      </View>
                    </View>
                    
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => onAccept(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => onReject(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.viewAllButton} onPress={onClose}>
                <Text style={styles.viewAllText}>View All Requests</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noRequestsContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.noRequestsText}>No requests yet</Text>
              <Text style={styles.noRequestsSubtext}>
                When you receive friend requests, they'll appear here
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 300,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  requestsList: {
    maxHeight: 250,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  noRequestsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  noRequestsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  noRequestsSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 