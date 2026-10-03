import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SupportChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  time: string;
}

const FAQS = [
  'কখন রুম আইডি দেওয়া হবে?',
  'ডিপোজিট কতক্ষণে অ্যাড হয়?',
  'কিভাবে টাকা তুলব (Withdraw)?',
  'রুলস ও ফেয়ার প্লে কি?',
];

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'হ্যালো! Free Fire Esports BD লাইভ সাপোর্টে আপনাকে স্বাগতম। আপনি কিভাবে সাহায্য চান বা নিচের যেকোনো প্রশ্নে ক্লিক করুন:',
      time: 'Now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<any>(null);

  const sessionId = user ? `user_${user.id}` : 'guest_session';

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.sendChatMessage(sessionId, text, user?.ffPlayerName || user?.fullName || 'Gamer');
      if (res.success && res.data?.reply) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Fallback local smart reply if server is unreachable
        let replyText = 'ধন্যবাদ আপনার মেসেজের জন্য! আমাদের কাস্টমার সাপোর্ট টিম খুব দ্রুতই আপনার সমস্যার সমাধান করবে।';
        if (text.includes('রুম আইডি') || text.includes('room')) {
          replyText = 'ম্যাচ শুরু হওয়ার ১০ থেকে ১৫ মিনিট আগে ম্যাচের কার্ডে "VIEW ROOM ID & PASSWORD" বাটনে ক্লিক করে আইডি ও পাসওয়ার্ড দেখতে পাবেন।';
        } else if (text.includes('ডিপোজিট') || text.includes('টাকা')) {
          replyText = 'বিকাশ বা নগদ থেকে সেন্ড মানি করে প্রাপ্ত TrxID দিয়ে সাবমিট করলে সাধারণত ৫ থেকে ১৫ মিনিটের মধ্যে ব্যালেন্স যুক্ত হয়।';
        } else if (text.includes('উত্তোলন') || text.includes('withdraw') || text.includes('তুলব')) {
          replyText = 'ওয়ালেট থেকে "WITHDRAW" বাটনে ক্লিক করে আপনার বিকাশ বা নগদ পার্সোনাল নম্বর দিয়ে ক্যাশআউট রিকোয়েস্ট করতে পারেন।';
        }

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e) {
      console.log('Chat error:', e);
    } finally {
      setIsSending(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🎧</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>LIVE SUPPORT 24/7</Text>
                <Text style={styles.headerSubtitle}>কাস্টমার সাপোর্ট সহকারী • Active Now 🟢</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick FAQ Chips */}
          <View style={styles.faqContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.faqScroll}>
              {FAQS.map((faq, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.faqChip}
                  onPress={() => handleSendMessage(faq)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqText}>{faq}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}
                >
                  <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
                    {m.text}
                  </Text>
                  <Text style={styles.messageTime}>{m.time}</Text>
                </View>
              );
            })}
            {isSending && (
              <View style={[styles.messageBubble, styles.botBubble, { width: 60 }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <TextInput
              style={styles.chatInput}
              placeholder="মেসেজ লিখুন..."
              placeholderTextColor={Colors.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputMessage.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSending}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 90, 0, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  faqContainer: {
    paddingVertical: 8,
    backgroundColor: '#0F1218',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  faqChip: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  faqText: {
    color: Colors.yellow,
    fontSize: 10.5,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 14,
    gap: 10,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 10,
    borderRadius: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  botText: {
    color: '#E2E8F0',
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8.5,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#0F1218',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 2,
  },
});
