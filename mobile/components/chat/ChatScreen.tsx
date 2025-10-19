import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../../constants/colors';
import { getGeminiResponse } from '../../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

const ChatScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your CitySafe safety assistant powered by Gemini AI. I can help you with safety information about locations in Jamaica, travel advice, or answer any questions about staying safe. How can I help you today?',
      sender: 'system',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Use setTimeout to ensure the FlatList has rendered the new messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    if (isLoading) return; // Prevent multiple requests

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for Gemini AI
      const conversationHistory = messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'system')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.text }]
        }));

      // Get response from Gemini AI
      const response = await getGeminiResponse(inputText, conversationHistory);
      
      // Check if response is valid
      if (!response || response.trim() === '') {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I couldn\'t generate a response for your message. Please try rephrasing your question.',
          sender: 'system',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const systemMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'system',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Error getting Gemini AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        sender: 'system',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom after adding message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };



  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer, 
      item.sender === 'user' ? styles.userMessage : styles.systemMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.systemBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.systemText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CitySafe Assistant</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      {/* Input Area - Positioned to appear over keyboard when visible */}
      <View style={[
        styles.inputContainerAbsolute,
        isKeyboardVisible && styles.inputContainerVisible
      ]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputKeyboardAvoidingView}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor={Colors.textLight}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, (inputText.trim() && !isLoading) ? styles.sendButtonActive : null]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <Ionicons name="time" size={20} color={Colors.gray} />
                ) : (
                  <Ionicons name="send" size={20} color={inputText.trim() && !isLoading ? Colors.accent : Colors.gray} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    width: 24, // Spacer for alignment
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  systemMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
  },
  systemBubble: {
    backgroundColor: Colors.white,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  systemText: {
    color: Colors.primary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainerAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
  },
  inputContainerVisible: {
    // Styles when keyboard is visible
  },
  inputKeyboardAvoidingView: {
    width: '100%',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    maxHeight: 80,
    padding: 0,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
  sendButtonActive: {
    // Change color when active
  },
});

export default ChatScreen;