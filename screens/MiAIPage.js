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
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import axios from "axios";

const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// Device type detection
const isTablet = width >= 768;

export default function MiAIPage() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I am Oracle. How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const flatListRef = useRef(null);

  const handleBack = () => {
    navigation.goBack();
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

    const systemPrompt = `You are Oracle, an advanced AI assistant. Respond with wisdom, intelligence, and insight. Be helpful, concise, and knowledgeable.`;

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
            key: "AIzaSyCfV7ZB5cO3OUUP3EMEee6jAn3dzPndlpY",
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
            "⚠️ An error occurred while contacting the AI. Please try again later.",
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
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header matching HomePage style */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={wp(5.5)} color="#475569" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Oracle</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, isLoading && styles.statusDotActive]} />
              <Text style={styles.headerSubtitle}>
                {isLoading ? "Processing..." : "AI Assistant Online"}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Messages Container */}
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

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Ask me anything..."
              placeholderTextColor="#94A3B8"
              style={[
                styles.input,
                inputFocused && styles.inputFocused,
                input && styles.inputFilled
              ]}
              value={input}
              onChangeText={setInput}
              multiline
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  opacity: input.trim() && !isLoading ? 1 : 0.5,
                  backgroundColor: input.trim() && !isLoading ? '#38BDF8' : '#CBD5E1'
                },
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingDots}>⋯</Text>
                </View>
              ) : (
                <Ionicons name="send" size={wp(5)} color="#FFFFFF" />
              )}
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
    backgroundColor: "#F8FAFC" 
  },
  header: {
    paddingTop: hp(1),
    paddingBottom: hp(2),
    paddingHorizontal: wp(5),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerPlaceholder: {
    width: wp(11),
    height: wp(11),
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: isTablet ? wp(5.5) : wp(6.5),
    color: "#0F172A",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: hp(0.5),
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: "#10B981",
    marginRight: wp(2),
    opacity: 0.6,
  },
  statusDotActive: {
    opacity: 1,
    backgroundColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: isTablet ? wp(2.8) : wp(3.2),
    color: "#64748B",
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  messageList: { 
    padding: wp(4),
    paddingBottom: hp(2),
  },
  messageBubble: {
    maxWidth: "85%",
    padding: wp(4),
    marginVertical: hp(0.8),
    borderRadius: wp(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#38BDF8",
    borderBottomRightRadius: wp(2),
    shadowColor: "#38BDF8",
    shadowOpacity: 0.15,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: wp(2),
  },
  messageText: { 
    fontSize: isTablet ? wp(3.5) : wp(4),
    lineHeight: wp(5.5),
    fontWeight: "400",
  },
  userText: { 
    color: "#FFFFFF",
    fontWeight: "500",
  },
  botText: { 
    color: "#374151",
  },
  inputContainer: {
    padding: wp(4),
    paddingBottom: Platform.OS === "ios" ? hp(3) : wp(4),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    borderRadius: wp(6),
    borderWidth: 2,
    borderColor: "#E2E8F0",
    paddingLeft: wp(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: isTablet ? wp(3.8) : wp(4.2),
    color: "#0F172A",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.8),
    maxHeight: hp(15),
    lineHeight: wp(5.5),
  },
  inputFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputFilled: {
    backgroundColor: "#FFFFFF",
    borderColor: "#10B981",
  },
  sendButton: {
    margin: wp(1),
    borderRadius: wp(5),
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDots: {
    color: "#FFFFFF",
    fontSize: wp(5),
    fontWeight: "700",
  },
});