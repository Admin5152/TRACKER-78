import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAuthenticated, getCurrentUserId } from '../utils/api';

export default function AuthCheck({ visible, onClose }) {
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (visible) {
      checkAuthStatus();
    }
  }, [visible]);

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated with Appwrite
      const isAuth = await isAuthenticated();
      
      // Get stored user data
      const storedUser = await AsyncStorage.getItem('currentUser');
      const storedSession = await AsyncStorage.getItem('sessionId');
      
      // Get current user ID
      const currentUserId = await getCurrentUserId();
      
      setAuthStatus(isAuth ? 'Authenticated' : 'Not Authenticated');
      setUserData(storedUser ? JSON.parse(storedUser) : null);
      setSessionData(storedSession);
      
      console.log('Auth Check Results:', {
        isAuthenticated: isAuth,
        currentUserId,
        storedUser: storedUser ? 'Present' : 'Missing',
        storedSession: storedSession ? 'Present' : 'Missing'
      });
      
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus('Error checking auth');
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'All stored data cleared');
      checkAuthStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data');
    }
  };

  const testBackendConnection = async () => {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        Alert.alert('Success', `Backend connection working! User ID: ${userId}`);
      } else {
        Alert.alert('Error', 'Backend connection failed - no user ID');
      }
    } catch (error) {
      Alert.alert('Error', `Backend connection failed: ${error.message}`);
    }
  };

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
            <Text style={styles.modalTitle}>Authentication Status</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Status</Text>
              <Text style={[
                styles.statusText,
                { color: authStatus === 'Authenticated' ? '#10B981' : '#EF4444' }
              ]}>
                {authStatus}
              </Text>
            </View>

            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Stored Data</Text>
              
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Session ID:</Text>
                <Text style={styles.dataValue}>
                  {sessionData ? `${sessionData.slice(0, 8)}...` : 'Not found'}
                </Text>
              </View>
              
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>User Data:</Text>
                <Text style={styles.dataValue}>
                  {userData ? 'Present' : 'Not found'}
                </Text>
              </View>
              
              {userData && (
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>User ID:</Text>
                  <Text style={styles.dataValue}>
                    {userData.$id ? `${userData.$id.slice(0, 8)}...` : 'Not found'}
                  </Text>
                </View>
              )}
              
              {userData && (
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Email:</Text>
                  <Text style={styles.dataValue}>
                    {userData.email || 'Not found'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={checkAuthStatus}
              >
                <Text style={styles.actionButtonText}>Refresh Status</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={testBackendConnection}
              >
                <Text style={styles.actionButtonText}>Test Backend</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={clearAllData}
              >
                <Text style={styles.clearButtonText}>Clear All Data</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: '600',
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
  statusSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  dataSection: {
    marginBottom: 20,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 