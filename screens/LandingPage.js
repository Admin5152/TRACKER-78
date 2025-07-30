import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';

export default function LandingPage({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Bounce loop for pin animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Animated.Text style={[styles.logoText, { opacity: fadeAnim }]}>
          TRACKER 78
        </Animated.Text>

        {/* Custom animated location pin */}
        <Animated.View style={[styles.pinWrapper, { transform: [{ translateY: bounceAnim }] }]}>
          <View style={styles.pinDot} />
          <View style={styles.pinShadow} />
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
          Share your location with the people you love.
        </Animated.Text>

        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },
  pinWrapper: {
    alignItems: 'center',
    marginBottom: 25,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
  },
  pinShadow: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  loader: {
    marginTop: 10,
  },
});
