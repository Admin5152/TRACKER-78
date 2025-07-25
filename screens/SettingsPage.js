import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Dimensions, Platform, 
  ScrollView, Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { account } from '../lib/appwriteConfig';

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// Device type detection
const isTablet = width >= 768;

export default function SettingsPage() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await account.get();
        setUser(response);
      } catch (error) {
        Alert.alert('Error', error.message || 'An error occurred while fetching user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await account.deleteSession('current');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Logout Failed', error.message || 'An error occurred while logging out.');
            }
          }
        }
      ]
    );
  };

const handleEmailSupport = () => {
  const email = 'sethagyeimensah2@gmail.com';
  const subject = encodeURIComponent('Support Request');
  const body = encodeURIComponent('Hello, I need assistance with...');
  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  Linking.openURL(mailtoUrl).catch((err) =>
    Alert.alert('Error', 'Could not open mail client')
  );
};

  const handleJarvisNavigation = () => {
    navigation.navigate('JarvisPage');
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showChevron = true, hasDropdown = false, expanded = false }) => (
    <View>
      <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={wp(5)} color="#64748B" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {hasDropdown && (
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={wp(4)} 
            color="#64748B" 
          />
        )}
        {showChevron && !hasDropdown && (
          <Ionicons name="chevron-forward" size={wp(4)} color="#64748B" />
        )}
      </TouchableOpacity>
      
      {hasDropdown && expanded && (
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownText}>
            Tracker 78 is your personal safety companion app designed to keep you and your loved ones connected and secure. 
            With real-time location sharing, emergency features, and friend networking capabilities, we help you stay safe 
            and connected wherever you go. Our app provides quick access to maps, emergency services, and your safety network 
            all in one convenient place.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={wp(6)} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading user information...</Text>
              <Text style={styles.loadingSubText}>Please wait</Text>
            </View>
          </View>
        ) : user ? (
          <>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileContent}>
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImage}>
                    <Text style={styles.profileInitial}>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {user.name || user.email.split('@')[0]}
                  </Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>
            </View>

            {/* Settings Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Account Settings</Text>
              
              <View style={styles.settingsCard}>
                <SettingItem 
                  icon="mail-outline"
                  title="Email"
                  subtitle={user.email}
                  onPress={() => {}}
                />
                
                <View style={styles.divider} />
                
                <SettingItem 
                  icon="chatbubble-ellipses-outline"
                  title="Jarvis AI Assistant"
                  subtitle="Access your AI companion"
                  onPress={handleJarvisNavigation}
                />
                
                <View style={styles.divider} />
                
                <SettingItem 
                  icon="information-circle-outline"
                  title="About"
                  onPress={() => setAboutExpanded(!aboutExpanded)}
                  hasDropdown={true}
                  expanded={aboutExpanded}
                  showChevron={false}
                />
                
                <View style={styles.divider} />
                
                <SettingItem 
                  icon="help-circle-outline"
                  title="Need Assistance?"
                  subtitle="Contact us via email"
                  onPress={handleEmailSupport}
                />
              </View>
            </View>

            {/* Coming Soon Section */}
            <View style={styles.comingSoonCard}>
              <View style={styles.comingSoonContent}>
                <Ionicons name="construct-outline" size={wp(6)} color="#64748B" />
                <Text style={styles.comingSoonText}>More Settings Coming Soon...</Text>
                <Text style={styles.comingSoonSubtext}>We're working on exciting new features</Text>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={styles.logoutContent}>
                <Ionicons name="log-out-outline" size={wp(5)} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Log out</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={wp(8)} color="#EF4444" />
              <Text style={styles.errorText}>Unable to load user information</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                setLoading(true);
                // Retry logic here
              }}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingBottom: hp(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: isTablet ? wp(5) : wp(6),
    color: '#0F172A',
    fontWeight: '700',
  },
  headerSpacer: {
    width: wp(12), // Same width as back button to center title
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(20),
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(4),
    paddingHorizontal: wp(8),
    borderRadius: wp(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingText: {
    fontSize: isTablet ? wp(3.5) : wp(4),
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: hp(1),
  },
  loadingSubText: {
    fontSize: isTablet ? wp(3) : wp(3.5),
    color: '#64748B',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(5),
    borderRadius: wp(5),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: wp(4),
  },
  profileImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: wp(6),
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isTablet ? wp(4) : wp(4.5),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: hp(0.5),
  },
  profileEmail: {
    fontSize: isTablet ? wp(3.2) : wp(3.5),
    color: '#64748B',
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: isTablet ? wp(4) : wp(4.5),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: hp(2),
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: isTablet ? wp(3.5) : wp(4),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: hp(0.3),
  },
  settingSubtitle: {
    fontSize: isTablet ? wp(3) : wp(3.2),
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: wp(17),
  },
  dropdownContent: {
    backgroundColor: '#F8FAFC',
    padding: wp(4),
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    borderRadius: wp(3),
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
  },
  dropdownText: {
    fontSize: isTablet ? wp(3) : wp(3.2),
    color: '#475569',
    lineHeight: wp(5),
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(5),
    borderRadius: wp(4),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  comingSoonContent: {
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: isTablet ? wp(3.5) : wp(4),
    color: '#64748B',
    fontWeight: '600',
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  comingSoonSubtext: {
    fontSize: isTablet ? wp(3) : wp(3.2),
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(5),
    borderRadius: wp(4),
    marginBottom: hp(2),
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: isTablet ? wp(3.5) : wp(4),
    marginLeft: wp(2),
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(6),
    borderRadius: wp(5),
    marginTop: hp(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: isTablet ? wp(3.5) : wp(4),
    color: '#EF4444',
    fontWeight: '600',
    marginTop: hp(2),
    marginBottom: hp(3),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: isTablet ? wp(3.2) : wp(3.5),
  },
});