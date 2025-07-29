import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';

export default function LandingPage({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/Tracker_78_logo.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.subtitle}>Share your location with the people you love.</Text>
        <ActivityIndicator size="large" color="#1E293B" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0b0b0bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 300,
    height: 300,
    borderRadius: 50,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginTop: 10,
  },
});