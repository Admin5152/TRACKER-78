import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import axios from "axios";

// 3D Sphere Loader Component
const SphereLoader = () => {
  const animatedValues = useRef(
    Array.from({ length: 9 }, () => ({
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0.3),
    }))
  ).current;

  const mainRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main container rotation
    const mainRotationAnimation = Animated.loop(
      Animated.timing(mainRotation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Individual sphere animations
    const sphereAnimations = animatedValues.map((values, index) => {
      const rotationAnimation = Animated.loop(
        Animated.timing(values.rotation, {
          toValue: 1,
          duration: 3000 + index * 200, // Staggered timing
          useNativeDriver: true,
        })
      );

      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(values.scale, {
            toValue: 1.2,
            duration: 1500 + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(values.scale, {
            toValue: 0.8,
            duration: 1500 + index * 100,
            useNativeDriver: true,
          }),
        ])
      );

      const opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(values.opacity, {
            toValue: 0.7,
            duration: 2000 + index * 150,
            useNativeDriver: true,
          }),
          Animated.timing(values.opacity, {
            toValue: 0.2,
            duration: 2000 + index * 150,
            useNativeDriver: true,
          }),
        ])
      );

      return Animated.parallel([rotationAnimation, scaleAnimation, opacityAnimation]);
    });

    mainRotationAnimation.start();
    sphereAnimations.forEach(animation => animation.start());

    return () => {
      mainRotationAnimation.stop();
      sphereAnimations.forEach(animation => animation.stop());
    };
  }, []);

  const mainRotationInterpolate = mainRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sphereColors = [
    'rgba(14, 165, 233, 0.6)',   // Primary blue
    'rgba(14, 165, 233, 0.4)',   // Lighter blue
    'rgba(14, 165, 233, 0.5)',   // Medium blue
    'rgba(56, 189, 248, 0.6)',   // Sky blue
    'rgba(56, 189, 248, 0.4)',   // Light sky blue
    'rgba(14, 165, 233, 0.7)',   // Deeper blue
    'rgba(96, 165, 250, 0.5)',   // Soft blue
    'rgba(30, 144, 255, 0.6)',   // Dodger blue
    'rgba(14, 165, 233, 0.3)',   // Very light blue
  ];

  const positions = [
    { x: 0, y: -80 },      // Top
    { x: 60, y: -40 },     // Top right
    { x: 80, y: 0 },       // Right
    { x: 60, y: 40 },      // Bottom right
    { x: 0, y: 80 },       // Bottom
    { x: -60, y: 40 },     // Bottom left
    { x: -80, y: 0 },      // Left
    { x: -60, y: -40 },    // Top left
    { x: 0, y: 0 },        // Center
  ];

  return (
    <View style={styles.sphereContainer}>
      <Animated.View
        style={[
          styles.sphereLoader,
          {
            transform: [{ rotate: mainRotationInterpolate }],
          },
        ]}
      >
        {animatedValues.map((values, index) => {
          const rotationInterpolate = values.rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.sphere,
                {
                  backgroundColor: sphereColors[index],
                  left: positions[index].x + 100,
                  top: positions[index].y + 100,
                  transform: [
                    { rotate: rotationInterpolate },
                    { scale: values.scale },
                  ],
                  opacity: values.opacity,
                },
              ]}
            >
              {/* Inner rotating elements to simulate 3D effect */}
              <View style={[styles.sphereInner, { backgroundColor: sphereColors[index] }]} />
              <View style={[styles.sphereCore, { backgroundColor: sphereColors[index] }]} />
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
};

export default function App({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I am JARVIS. How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const handleBack = () => {
    // Option 1: If using React Navigation
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } 
    // Option 2: If using a different navigation system, you can replace this with your navigation logic
    // For example: props.onBack() or your custom navigation function
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInput("");
    setIsLoading(true);

    const systemPrompt = `You are JARVIS (Just A Rather Very Intelligent System), Tony Stark's AI assistant. Respond concisely, formally, and intelligently.`;

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCfV7ZB5cO3OUUP3EMEee6jAn3dzPndlpY",
        {
          contents: [
            { parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage.text}` }] },
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 200,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            key: "AIzaSyCfV7ZB5cO3OUUP3EMEee6jAn3dzPndlpY", // <-- put your key here
          },
        }
      );

      const botText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "I apologize, but I am unable to respond at the moment.";

      const botReply = {
        id: Math.random().toString(),
        text: botText,
        sender: "bot",
      };

      setMessages((prev) => [botReply, ...prev]);
    } catch (error) {
      console.error("Gemini error:", error?.response?.data || error.message);
      setMessages((prev) => [
        {
          id: Math.random().toString(),
          text:
            "⚠️ Huh, well that's weird. Give me a minute.",
          sender: "bot",
        },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.botText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>JARVIS</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, isLoading && styles.statusDotActive]} />
                <Text style={styles.headerSubtitle}>
                  {isLoading ? "Processing..." : "AI Assistant Online"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.messagesContainer}>
          {/* 3D Sphere Background Loader */}
          <SphereLoader />
          
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#64748B"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: input.trim() && !isLoading ? 1 : 0.5 },
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? "⋯" : "→"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  header: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2FE",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F9FF",
    borderWidth: 2,
    borderColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  backButtonText: {
    color: "#0EA5E9",
    fontSize: 22,
    fontWeight: "800",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: -44, // Compensate for back button to keep title centered
  },
  headerTitle: {
    fontSize: 36,
    color: "#1E293B",
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: "#0EA5E9",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    marginRight: 8,
    opacity: 0.8,
  },
  statusDotActive: {
    backgroundColor: "#F59E0B",
    opacity: 1,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: 'relative',
  },
  messageList: { 
    padding: 20,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 18,
    marginVertical: 6,
    borderRadius: 20,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0EA5E9",
    borderTopRightRadius: 6,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderTopLeftRadius: 6,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.1,
  },
  messageText: { 
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  userText: { 
    color: "#FFFFFF",
    fontWeight: "600",
  },
  botText: { 
    color: "#1E293B",
  },
  inputContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 24 : 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0F2FE",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#E0F2FE",
    paddingLeft: 6,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 120,
    lineHeight: 22,
    fontWeight: "500",
  },
  sendButton: {
    margin: 6,
    backgroundColor: "#0EA5E9",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  
  // 3D Sphere Loader Styles
  sphereContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    zIndex: 0,
    opacity: 0.12,
  },
  sphereLoader: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  sphere: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  sphereInner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: 4,
    left: 4,
    opacity: 0.7,
  },
  sphereCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 8,
    left: 8,
    opacity: 1,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});