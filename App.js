import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MapPage from './screens/MapPage';
import FriendPage from './screens/FriendPage'; // make sure file name matches exactly
import HomePage from './screens/HomePage';
import SettingsPage from './screens/SettingsPage'; 
import LoginPage from './screens/LoginPage';
import SignupPage from './screens/SignupPage'; // Import SignupPage if needed
import LandingPage from './screens/LandingPage'; 
import FamilyIntroPage from './screens/FamilyIntroPage';
import SafetyPage from './screens/SafetyPage'; // Adjust the import path if necessary
import JarvisPage from './screens/JarvisPage'; // Import JarvisPage if needed
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LandingPage" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="SignupPage" component={SignupPage} options={{ headerShown: false }} />
        <Stack.Screen name="FamilyIntroPage" component={FamilyIntroPage} options={{ headerShown: false }} />
        <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
        {/* Login screen should be the first screen shown */}
        <Stack.Screen name="SafetyPage" component={SafetyPage} options={{ headerShown: false }} />
         <Stack.Screen name="JarvisPage" component={JarvisPage} options={{ headerShown: false }} /> 
        {/* SafetyPage can be added later if needed */}


        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="MapPage" component={MapPage} options={{ headerShown: false }} />
        <Stack.Screen name="Friends" component={FriendPage} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsPage} options={{ headerShown: false }} />
        {/* Add other screens like Home, Settings here later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
