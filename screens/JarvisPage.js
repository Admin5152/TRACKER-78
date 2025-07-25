import React, { useState, useRef } from "react";
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
});






//.  AIzaSyCfV7ZB5cO3OUUP3EMEee6jAn3dzPndlpY //