import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { account } from '../lib/appwriteConfig'; // ✅ Adjust if needed

const { width, height } = Dimensions.get('window');

export default function LoginPage({ navigation }) {
  
  //const [name , setName] = useState('');//
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        // Clear any existing tokens from storage
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('sessionId');
        
        await fetch(
          'https://fra.cloud.appwrite.io/v1/account/sessions/current',
          {
            method: 'DELETE',
            headers: {
              'X-Appwrite-Project': '683f5658000ba43c36cd',
            },
            credentials: 'include', // important so the cookie is sent
          }
        );
        console.log('Old session cleared');
      } catch (e) {
        console.log('No session to clear or network error', e);
      }
    })();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [isLoading]);

  // Helper function to store token securely
  const storeAuthToken = async (token, sessionId) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('sessionId', sessionId);
      console.log('Auth token stored successfully');
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  };

  // Helper function to get stored token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create session with Appwrite
      const response = await fetch('https://fra.cloud.appwrite.io/v1/account/sessions/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': '683f5658000ba43c36cd',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for session cookies
      });

      const sessionData = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', sessionData.message || 'Check your credentials');
        return;
      }

      console.log('Login successful, session created:', sessionData);

      // Step 2: Store session ID and user data
      const sessionId = sessionData.$id;
      const userId = sessionData.userId;
      
      await AsyncStorage.setItem('sessionId', sessionId);
      
      // Step 3: Get user details and store them
      const userResponse = await fetch('https://fra.cloud.appwrite.io/v1/account', {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': '683f5658000ba43c36cd',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('User data stored:', userData);
      }

      Alert.alert('Login Successful', 'Welcome back!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'FamilyIntroPage' }],
      });

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to test authenticated requests
  const testAuthenticatedRequest = async (token) => {
    try {
      // Example: Get current user info to verify token works
      const userResponse = await fetch('https://fra.cloud.appwrite.io/v1/account', {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': '683f5658000ba43c36cd',
          'Authorization': `Bearer ${token}`, // Add token to Authorization header
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('Token verified, user data:', userData);
        return true;
      } else {
        console.log('Token verification failed');
        return false;
      }
    } catch (error) {
      console.error('Error testing authenticated request:', error);
      return false;
    }
  };

  // Example function for making future backend requests with stored token
  const makeBackendRequest = async (endpoint, options = {}) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`, // Attach token to Authorization header
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      console.error('Backend request error:', error);
      throw error;
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const spinInterpolate = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        <View style={styles.circle4} />
      </View>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Animated.View 
            style={[
              styles.headerContainer,
              { 
                opacity: titleAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>✨</Text>
              </View>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.formContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                  email && styles.inputFilled
                ]}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    passwordFocused && styles.inputFocused,
                    password && styles.inputFilled
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={togglePasswordVisibility}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.eyeIcon,
                    isLoading && styles.eyeIconDisabled
                  ]}>
                    {showPassword ? '🙈' : '🐵'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <>
                      <Animated.Text style={[
                        styles.loadingSpinner,
                        { transform: [{ rotate: spinInterpolate }] }
                      ]}>
                        ⟳
                      </Animated.Text>
                      <Text style={styles.loginButtonText}>Signing In...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Text style={styles.buttonIcon}>→</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={styles.signupContainer}
              onPress={() => navigation.navigate('SignupPage')}
              disabled={isLoading}
            >
              <Text style={[styles.signupText, isLoading && styles.disabledText]}>
                Don't have an account?{' '}
                <Text style={[styles.signupLink, isLoading && styles.disabledLink]}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundDecoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(147, 51, 234, 0.03)',
    bottom: 100,
    left: -30,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(236, 72, 153, 0.04)',
    top: height * 0.3,
    left: width * 0.8,
  },
  circle4: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    top: height * 0.15,
    left: width * 0.1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: '#38BDF8',
    backgroundColor: '#ffffff',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFilled: {
    backgroundColor: '#ffffff',
    borderColor: '#10B981',
  },
  // New styles for password container and eye button
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60, // Make room for the eye button
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  eyeIconDisabled: {
    opacity: 0.3,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#38BDF8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingSpinner: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  signupText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
  },
  signupLink: {
    color: '#38BDF8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.5,
  },
  disabledLink: {
    opacity: 0.5,
  },
  
});

//scam5152@gmail.com//
//Scam5152//