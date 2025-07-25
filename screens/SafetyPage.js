import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Dimensions,
  ScrollView,
  Animated,
  StatusBar,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import * as SMS from 'expo-sms';

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// Device type detection
const isTablet = width >= 768;

export default function SafetyPage() {
  const navigation = useNavigation();
  const [pressStart, setPressStart] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [ringAnim] = useState(new Animated.Value(0));
  const [location, setLocation] = useState(null);
  const [progressInterval, setProgressInterval] = useState(null);
  const [showInfoDropdown, setShowInfoDropdown] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(0));

  const EMERGENCY_EMAIL = 'sethagyeimensah2@gmail.com';
  const EMERGENCY_PHONE = '0205803724';

  useEffect(() => {
    // Request location permission and get current location
    requestLocationPermission();
    
    // Pulse animation for the emergency button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const toggleInfoDropdown = () => {
    const toValue = showInfoDropdown ? 0 : 1;
    setShowInfoDropdown(!showInfoDropdown);
    
    Animated.timing(dropdownAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePressIn = () => {
    const startTime = Date.now();
    setPressStart(startTime);
    setIsPressed(true);
    setProgress(0);

    // Ring animation
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Progress animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(elapsed / 2000, 1);
      setProgress(progressValue);
      
      if (progressValue >= 1) {
        clearInterval(interval);
      }
    }, 16);

    setProgressInterval(interval);
  };

  const handlePressOut = () => {
    const heldTime = Date.now() - (pressStart || 0);
    setIsPressed(false);
    setProgress(0);
    
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    // Reset ring animation
    ringAnim.setValue(0);

    if (heldTime >= 2000) {
      sendEmergencyAlert();
    } else if (pressStart) {
      Alert.alert(
        "Hold Longer", 
        "Hold the button for 2 seconds to send emergency alert",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const getCurrentLocationString = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nGoogle Maps: https://maps.google.com/?q=${latitude},${longitude}`;
    }
    return 'Location: Unable to determine current location';
  };

  const sendEmergencyEmail = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Email Not Available', 'Email is not available on this device');
        return false;
      }

      const locationString = getCurrentLocationString();
      const timestamp = new Date().toLocaleString();

      const emailBody = `
🚨 EMERGENCY ALERT 🚨

This is an automated emergency message.

Time: ${timestamp}
${locationString}

The user has activated the emergency alert system. Please respond immediately.

This message was sent automatically by the Safety App.
      `;

      const result = await MailComposer.composeAsync({
        recipients: [EMERGENCY_EMAIL],
        subject: '🚨 EMERGENCY ALERT - Immediate Response Required',
        body: emailBody,
      });

      return result.status === 'sent';
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const sendEmergencySMS = async () => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS Not Available', 'SMS is not available on this device');
        return false;
      }

      const locationString = getCurrentLocationString();
      const timestamp = new Date().toLocaleString();

      const smsBody = `🚨 EMERGENCY ALERT 🚨\n\nTime: ${timestamp}\n${locationString}\n\nPlease respond immediately. This is an automated emergency message.`;

      const result = await SMS.sendSMSAsync([EMERGENCY_PHONE], smsBody);
      return result.result === 'sent';
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  };

  const sendEmergencyAlert = async () => {
    try {
      // Show loading alert
      Alert.alert(
        "Sending Emergency Alert", 
        "Please wait while we send your emergency message...",
        [],
        { cancelable: false }
      );

      // Try both email and SMS
      const emailSent = await sendEmergencyEmail();
      const smsSent = await sendEmergencySMS();

      // Dismiss loading alert and show result
      if (emailSent || smsSent) {
        let message = "Emergency alert sent successfully via ";
        if (emailSent && smsSent) {
          message += "email and SMS";
        } else if (emailSent) {
          message += "email";
        } else {
          message += "SMS";
        }
        
        Alert.alert(
          "✅ Emergency Alert Sent!", 
          message + "\n\nYour emergency contact has been notified with your location.",
          [{ text: "OK", style: "default" }]
        );
      } else {
        // If both fail, try opening phone dialer as fallback
        Alert.alert(
          "Alert Failed", 
          "Unable to send emergency message. Would you like to call emergency services directly?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Call", 
              style: "default", 
              onPress: () => {
                Linking.openURL(`tel:${EMERGENCY_PHONE}`);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Emergency alert error:', error);
      Alert.alert(
        "Alert Failed", 
        "Failed to send emergency alert. Please try again or contact emergency services directly.",
        [
          { text: "Retry", style: "default", onPress: sendEmergencyAlert },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(5)} color="#475569" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Emergency Safety</Text>
            <Text style={styles.headerSubtitle}>Your safety is our priority</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.infoButton, showInfoDropdown && styles.infoButtonActive]} 
              onPress={toggleInfoDropdown}
            >
              <Ionicons 
                name={showInfoDropdown ? "close" : "information-circle-outline"} 
                size={wp(5)} 
                color={showInfoDropdown ? "#EF4444" : "#475569"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Dropdown */}
        {showInfoDropdown && (
          <Animated.View 
            style={[
              styles.infoDropdown,
              {
                maxHeight: dropdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1000]
                }),
                opacity: dropdownAnim
              }
            ]}
          >
            {/* Safety Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIcon}>
                  <Ionicons name="shield-checkmark" size={wp(6)} color="#10B981" />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Safety Status</Text>
                  <Text style={styles.statusSubtitle}>System Active & Monitoring</Text>
                </View>
                <View style={styles.statusIndicator} />
              </View>
              <View style={styles.statusDetails}>
                <View style={styles.statusItem}>
                  <Ionicons name="location" size={wp(4)} color="#0EA5E9" />
                  <Text style={styles.statusItemText}>
                    {location ? 'Location tracking enabled' : 'Location access needed'}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="mail" size={wp(4)} color="#8B5CF6" />
                  <Text style={styles.statusItemText}>Email alerts configured</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="chatbubble" size={wp(4)} color="#EF4444" />
                  <Text style={styles.statusItemText}>SMS alerts configured</Text>
                </View>
              </View>
            </View>

            {/* Emergency Instruction Card */}
            <View style={styles.instructionCard}>
              <View style={styles.instructionHeader}>
                <Text style={styles.instructionTitle}>How to Use Emergency Alert</Text>
                <View style={styles.instructionBadge}>
                  <Text style={styles.instructionBadgeText}>HOLD 2s</Text>
                </View>
              </View>
              <Text style={styles.instructionText}>
                Press and hold the emergency button for 2 seconds to instantly send emergency alerts via email and SMS with your current location.
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color="#10B981" />
                  <Text style={styles.featureText}>GPS location sharing</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color="#10B981" />
                  <Text style={styles.featureText}>Email notification sent</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color="#10B981" />
                  <Text style={styles.featureText}>SMS alert sent</Text>
                </View>
              </View>
            </View>

            {/* Safety Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>Safety Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="location" size={wp(4)} color="#0EA5E9" />
                  </View>
                  <Text style={styles.tipText}>Keep location services enabled for accurate emergency response</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="battery-charging" size={wp(4)} color="#10B981" />
                  </View>
                  <Text style={styles.tipText}>Maintain adequate battery level for emergency situations</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="wifi" size={wp(4)} color="#8B5CF6" />
                  </View>
                  <Text style={styles.tipText}>Ensure stable internet connection for message delivery</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Enhanced Emergency Button */}
        <View style={styles.emergencySection}>
          <View style={styles.buttonContainer}>
            {/* Outer rings for animation */}
            <Animated.View 
              style={[
                styles.outerRing,
                {
                  opacity: ringAnim,
                  transform: [{
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })
                  }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.middleRing,
                {
                  opacity: ringAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 0]
                  }),
                  transform: [{
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.4]
                    })
                  }]
                }
              ]} 
            />
            
            <Animated.View
              style={[
                styles.helpButton,
                {
                  transform: [
                    { scale: pulseAnim },
                    { scale: isPressed ? 0.95 : 1 }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.buttonTouchable}
                activeOpacity={0.9}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonIcon}>🆘</Text>
                  <Text style={styles.buttonText}>EMERGENCY</Text>
                  <Text style={styles.buttonSubtext}>Hold for 2 seconds</Text>
                  
                  {/* Progress indicator */}
                  {isPressed && (
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Emergency Contact Info */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="person-circle" size={wp(8)} color="#0EA5E9" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Emergency Contact</Text>
              <Text style={styles.contactDetails}>Email: {EMERGENCY_EMAIL}</Text>
              <Text style={styles.contactDetails}>Phone: {EMERGENCY_PHONE}</Text>
            </View>
          </View>
        </View>

        {/* Footer Warning */}
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={wp(5)} color="#F59E0B" />
          </View>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              This emergency feature will share your location and send alerts to emergency contacts. Use only in genuine emergencies.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(3),
    marginTop: hp(1),
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    padding: wp(3),
    borderRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? wp(4.5) : wp(5.5),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: isTablet ? wp(3) : wp(3.5),
    color: '#64748B',
    marginTop: hp(0.3),
  },
  headerRight: {
    width: wp(11),
    alignItems: 'flex-end',
  },
  infoButton: {
    backgroundColor: '#FFFFFF',
    padding: wp(3),
    borderRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoButtonActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  infoDropdown: {
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(5),
    borderRadius: wp(5),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  statusIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: isTablet ? wp(4) : wp(4.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  statusSubtitle: {
    fontSize: isTablet ? wp(3) : wp(3.5),
    color: '#10B981',
    fontWeight: '600',
    marginTop: hp(0.3),
  },
  statusIndicator: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: '#10B981',
  },
  statusDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: hp(2),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  statusItemText: {
    marginLeft: wp(2),
    fontSize: wp(3.5),
    color: '#64748B',
    fontWeight: '500',
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(5),
    borderRadius: wp(5),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  instructionTitle: {
    fontSize: isTablet ? wp(4) : wp(4.5),
    fontWeight: '700',
    color: '#0F172A',
  },
  instructionBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  instructionBadgeText: {
    fontSize: wp(2.5),
    fontWeight: '700',
    color: '#DC2626',
  },
  instructionText: {
    fontSize: isTablet ? wp(3.2) : wp(3.8),
    color: '#64748B',
    lineHeight: wp(5.5),
    marginBottom: hp(2),
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: hp(2),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  featureText: {
    marginLeft: wp(2),
    fontSize: wp(3.5),
    color: '#475569',
    fontWeight: '500',
  },
  emergencySection: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: wp(70),
    height: wp(70),
    borderRadius: wp(35),
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  middleRing: {
    position: 'absolute',
    width: wp(75),
    height: wp(75),
    borderRadius: wp(37.5),
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  helpButton: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  buttonTouchable: {
    flex: 1,
    width: '100%',
    borderRadius: wp(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonIcon: {
    fontSize: wp(8),
    marginBottom: hp(0.5),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? wp(3.5) : wp(4),
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  buttonSubtext: {
    color: '#FECACA',
    fontSize: wp(3),
    fontWeight: '500',
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: -wp(2),
    left: -wp(20),
    right: -wp(20),
    height: hp(0.5),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: hp(0.25),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: hp(0.25),
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(4),
    borderRadius: wp(4),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: wp(3),
    flex: 1,
  },
  contactTitle: {
    fontSize: wp(4),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: hp(0.5),
  },
  contactDetails: {
    fontSize: wp(3.2),
    color: '#64748B',
    marginBottom: hp(0.2),
  },
  tipsSection: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: isTablet ? wp(4) : wp(4.5),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: hp(2),
  },
  tipsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    padding: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tipIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  tipText: {
    flex: 1,
    fontSize: wp(3.5),
    color: '#475569',
    lineHeight: wp(5),
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    padding: wp(4),
    borderRadius: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: hp(2),
  },
  warningIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: wp(3.8),
    fontWeight: '700',
    color: '#92400E',
    marginBottom: hp(0.5),
  },
  warningText: {
    fontSize: wp(3.2),
    color: '#A16207',
    lineHeight: wp(4.5),
    fontWeight: '500',
  },
});