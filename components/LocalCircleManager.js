import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LocalCircleManager({ visible, onClose, friends, onCircleCreated }) {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createCircleModal, setCreateCircleModal] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [creatingCircle, setCreatingCircle] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [showCircleDetails, setShowCircleDetails] = useState(false);

  useEffect(() => {
    if (visible) {
      loadLocalCircles();
    }
  }, [visible]);

  const loadLocalCircles = async () => {
    setLoading(true);
    try {
      const storedCircles = await AsyncStorage.getItem('localCircles');
      if (storedCircles) {
        setCircles(JSON.parse(storedCircles));
      } else {
        setCircles([]);
      }
    } catch (error) {
      console.error('Error loading local circles:', error);
      setCircles([]);
    } finally {
      setLoading(false);
    }
  };

  const saveLocalCircles = async (circlesData) => {
    try {
      await AsyncStorage.setItem('localCircles', JSON.stringify(circlesData));
    } catch (error) {
      console.error('Error saving local circles:', error);
    }
  };

  const handleCreateCircle = async () => {
    if (!circleName.trim()) {
      Alert.alert('Error', 'Please enter a circle name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend for the circle');
      return;
    }

    setCreatingCircle(true);
    try {
      const newCircle = {
        id: Date.now().toString(),
        name: circleName.trim(),
        description: circleDescription.trim(),
        members: selectedFriends.map(friend => ({
          id: friend.id,
          name: friend.name,
          contact: friend.contact,
          image: friend.image,
          isOnline: friend.isOnline,
          lastSeen: friend.time,
        })),
        createdAt: new Date().toISOString(),
        isActive: true,
        admin: 'You', // WhatsApp-style admin
        totalMembers: selectedFriends.length,
      };

      const updatedCircles = [...circles, newCircle];
      setCircles(updatedCircles);
      await saveLocalCircles(updatedCircles);
      
      Alert.alert('Success', `Circle "${circleName}" created successfully!`);
      setCircleName('');
      setCircleDescription('');
      setSelectedFriends([]);
      setCreateCircleModal(false);
      
      // Notify parent component
      if (onCircleCreated) {
        onCircleCreated(newCircle);
      }
    } catch (error) {
      console.error('Error creating circle:', error);
      Alert.alert('Error', 'Failed to create circle. Please try again.');
    } finally {
      setCreatingCircle(false);
    }
  };

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.id === friend.id);
      if (isSelected) {
        return prev.filter(f => f.id !== friend.id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const deleteCircle = async (circleId) => {
    Alert.alert(
      'Delete Circle',
      'Are you sure you want to delete this circle? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCircles = circles.filter(circle => circle.id !== circleId);
              setCircles(updatedCircles);
              await saveLocalCircles(updatedCircles);
              Alert.alert('Success', 'Circle deleted successfully!');
            } catch (error) {
              console.error('Error deleting circle:', error);
              Alert.alert('Error', 'Failed to delete circle.');
            }
          }
        }
      ]
    );
  };

  const viewCircleDetails = (circle) => {
    setSelectedCircle(circle);
    setShowCircleDetails(true);
  };

  const renderCreateCircleModal = () => (
    <Modal
      visible={createCircleModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCreateCircleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Circle</Text>
            <TouchableOpacity
              onPress={() => setCreateCircleModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Circle Name *</Text>
              <TextInput
                style={styles.textInput}
                value={circleName}
                onChangeText={setCircleName}
                placeholder="Enter circle name"
                placeholderTextColor="#94A3B8"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={circleDescription}
                onChangeText={setCircleDescription}
                placeholder="Enter circle description (optional)"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Friends *</Text>
              <Text style={styles.inputSubtext}>
                Choose friends to add to this circle ({selectedFriends.length} selected)
              </Text>
              
              <View style={styles.friendsList}>
                {friends.map((friend) => {
                  const isSelected = selectedFriends.some(f => f.id === friend.id);
                  return (
                    <TouchableOpacity
                      key={friend.id}
                      style={[
                        styles.friendItem,
                        isSelected && styles.friendItemSelected
                      ]}
                      onPress={() => toggleFriendSelection(friend)}
                    >
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {friend.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.name}</Text>
                        <Text style={styles.friendContact}>{friend.contact}</Text>
                      </View>
                      <View style={[
                        styles.selectionIndicator,
                        isSelected && styles.selectionIndicatorSelected
                      ]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCreateCircleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.createButton,
                (!circleName.trim() || selectedFriends.length === 0) && styles.createButtonDisabled
              ]}
              onPress={handleCreateCircle}
              disabled={!circleName.trim() || selectedFriends.length === 0 || creatingCircle}
            >
              {creatingCircle ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Create Circle</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCircleDetailsModal = () => (
    <Modal
      visible={showCircleDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCircleDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Circle Info</Text>
            <TouchableOpacity
              onPress={() => setShowCircleDetails(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedCircle && (
              <>
                <View style={styles.circleInfoHeader}>
                  <View style={styles.circleAvatar}>
                    <Text style={styles.circleAvatarText}>
                      {selectedCircle.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{selectedCircle.name}</Text>
                    <Text style={styles.circleDescription}>
                      {selectedCircle.description || 'No description'}
                    </Text>
                    <Text style={styles.circleStats}>
                      {selectedCircle.totalMembers} members • Created {new Date(selectedCircle.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.membersSection}>
                  <Text style={styles.sectionTitle}>Members ({selectedCircle.totalMembers})</Text>
                  {selectedCircle.members.map((member, index) => (
                    <View key={index} style={styles.memberItem}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberContact}>{member.contact}</Text>
                      </View>
                      <View style={styles.memberStatus}>
                        <View style={[styles.statusDot, { backgroundColor: member.isOnline ? '#10B981' : '#94A3B8' }]} />
                        <Text style={styles.statusText}>
                          {member.isOnline ? 'Online' : member.lastSeen}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.adminSection}>
                  <Text style={styles.sectionTitle}>Admin</Text>
                  <View style={styles.adminItem}>
                    <View style={styles.adminAvatar}>
                      <Text style={styles.adminAvatarText}>👑</Text>
                    </View>
                    <View style={styles.adminInfo}>
                      <Text style={styles.adminName}>{selectedCircle.admin}</Text>
                      <Text style={styles.adminRole}>Circle Admin</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                setShowCircleDetails(false);
                if (selectedCircle) {
                  deleteCircle(selectedCircle.id);
                }
              }}
            >
              <Text style={styles.deleteButtonText}>Delete Circle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCircleItem = (circle) => (
    <TouchableOpacity
      key={circle.id}
      style={styles.circleItem}
      onPress={() => viewCircleDetails(circle)}
    >
      <View style={styles.circleAvatar}>
        <Text style={styles.circleAvatarText}>
          {circle.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.circleContent}>
        <View style={styles.circleHeader}>
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.circleTime}>
            {new Date(circle.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.circleDescription}>
          {circle.description || 'No description'}
        </Text>
        
        <View style={styles.circleFooter}>
          <Text style={styles.circleMemberCount}>
            {circle.totalMembers} members
          </Text>
          <View style={styles.circleStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.circleArrow}
        onPress={() => viewCircleDetails(circle)}
      >
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Circles</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.createCircleButton}
              onPress={() => setCreateCircleModal(true)}
            >
              <Text style={styles.createCircleButtonText}>+ Create New Circle</Text>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading circles...</Text>
              </View>
            ) : circles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>No Circles Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first circle to group friends together
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.circlesList}>
                {circles.map(renderCircleItem)}
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      {renderCreateCircleModal()}
      {renderCircleDetailsModal()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  createCircleButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createCircleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  circlesList: {
    maxHeight: height * 0.5,
  },
  circleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  circleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  circleAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  circleContent: {
    flex: 1,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  circleTime: {
    fontSize: 12,
    color: '#64748B',
  },
  circleDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  circleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleMemberCount: {
    fontSize: 12,
    color: '#64748B',
  },
  circleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
  },
  circleArrow: {
    padding: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  friendItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  friendContact: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
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
  createButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  circleInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  circleStats: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  membersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  memberContact: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminSection: {
    marginBottom: 20,
  },
  adminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminAvatarText: {
    fontSize: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  adminRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
}); 