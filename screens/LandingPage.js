import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';

export default function LandingPage({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/Tracker_78_logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Share your location with the people you love.</Text>
        <ActivityIndicator size="large" color="#1E293B" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 1000,
    height: 500,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569', // Slate gray
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginTop: 10,
  },
});