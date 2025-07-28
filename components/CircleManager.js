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
} from 'react-native';
import { circlesAPI, friendsAPI, getCurrentUserId, handleAPIError } from '../utils/api';

const { width, height } = Dimensions.get('window');

export default function CircleManager({ visible, onClose, friends, onCircleCreated }) {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createCircleModal, setCreateCircleModal] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [creatingCircle, setCreatingCircle] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUserCircles();
    }
  }, [visible]);

  const loadUserCircles = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const response = await circlesAPI.getUserCircles(userId);
      setCircles(response.documents || []);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      Alert.alert('Error', errorInfo.message);
    } finally {
      setLoading(false);
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
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const circleData = {
        name: circleName.trim(),
        description: circleDescription.trim(),
        createdBy: userId,
        members: selectedFriends.map(friend => ({
          friendId: friend.id,
          name: friend.name,
          contact: friend.contact,
        })),
      };

      const newCircle = await circlesAPI.createCircle(circleData);
      
      Alert.alert('Success', `Circle "${circleName}" created successfully!`);
      setCircleName('');
      setCircleDescription('');
      setSelectedFriends([]);
      setCreateCircleModal(false);
      
      // Refresh circles list
      await loadUserCircles();
      
      // Notify parent component
      if (onCircleCreated) {
        onCircleCreated(newCircle);
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      Alert.alert('Error', errorInfo.message);
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

  const renderCircleItem = (circle) => (
    <View key={circle.$id} style={styles.circleItem}>
      <View style={styles.circleHeader}>
        <Text style={styles.circleName}>{circle.name}</Text>
        <Text style={styles.circleMemberCount}>
          {circle.members?.length || 0} members
        </Text>
      </View>
      
      {circle.description && (
        <Text style={styles.circleDescription}>{circle.description}</Text>
      )}
      
      <View style={styles.circleMembers}>
        {circle.members?.slice(0, 3).map((member, index) => (
          <View key={index} style={styles.memberChip}>
            <Text style={styles.memberName}>{member.name}</Text>
          </View>
        ))}
        {circle.members?.length > 3 && (
          <View style={styles.memberChip}>
            <Text style={styles.memberName}>+{circle.members.length - 3} more</Text>
          </View>
        )}
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  circleMemberCount: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  circleDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  circleMembers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberName: {
    fontSize: 12,
    color: '#475569',
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
    justifyContent: 'space-between',
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
}); 