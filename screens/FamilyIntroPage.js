import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { account } from '../lib/appwriteConfig'; // Update path if needed

const { width, height } = Dimensions.get('window');

export default function FamilyIntroPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const imageRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get();
        setUsername(user.prefs.username || 'there');
      } catch (error) {
        console.log('Error fetching user:', error);
        setUsername('there'); // fallback
      } finally {
        setLoading(false);
        startAnimations();
      }
    };

    fetchUser();
  }, []);

  const startAnimations = () => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle image rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(imageRotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for continue button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleContinue = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Add slight delay for better UX
    setTimeout(() => {
      navigation.navigate('Home');
    }, 200);
  };

  const imageRotateInterpolate = imageRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Getting things ready...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <Animated.View 
        style={[
          styles.inner, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Animated.View style={[styles.headerContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.greeting}>👋</Text>
          <Text style={styles.header}>Hi {username}!</Text>
          <Text style={styles.subtext}>
            Now you can join or create your <Text style={styles.bold}>Circle</Text>
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.imageContainer,
            { 
              transform: [
                { scale: scaleAnim },
                { rotate: imageRotateInterpolate }
              ]
            }
          ]}
        >
          <Image
            source={require('../assets/image.png')}
            style={styles.familyImage}
            accessible
            accessibilityLabel="Family illustration"
          />
          <View style={styles.imageGlow} />
        </Animated.View>

        <Animated.View style={[styles.descriptionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.description}>
            A Circle is a private space only accessible by you and your family.
          </Text>
          <Text style={styles.subDescription}>
            Share locations, stay connected, and keep everyone safe.
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            { 
              transform: [
                { scale: Animated.multiply(buttonScaleAnim, pulseAnim) }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, isNavigating && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isNavigating}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {isNavigating ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" style={styles.buttonLoader} />
                  <Text style={styles.continueButtonText}>Loading...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backgroundDecoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(200, 211, 216, 0.08)',
    top: height * 0.1,
    right: -30,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    bottom: height * 0.15,
    left: -20,
  },
  circle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    top: height * 0.25,
    left: width * 0.1,
  },
  inner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 48,
    marginBottom: 15,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '800',
    color: '#38BDF8',
  },
  imageContainer: {
    marginVertical: 40,
    alignItems: 'center',
    position: 'relative',
  },
  familyImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  imageGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(238, 238, 238, 0.1)',
    zIndex: -1,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  subDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#38BDF8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 180,
  },
  continueButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonLoader: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});