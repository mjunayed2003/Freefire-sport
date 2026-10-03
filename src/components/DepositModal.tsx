import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OFFICIAL_NUMBER = '01892837461';
const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000];

export const DepositModal: React.FC<DepositModalProps> = ({ visible, onClose, onSuccess }) => {
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useAuth();
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState('100');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Number Copied! 📋', `Official ${method} number ${OFFICIAL_NUMBER} copied. Send Money now from your app.`);
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      Alert.alert('Invalid Amount', 'Minimum deposit amount is ৳ 50.');
      return;
    }

    if (!senderNumber.trim() || senderNumber.trim().length < 11) {
      Alert.alert('Invalid Number', 'Please enter a valid 11-digit sender phone number.');
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      Alert.alert('Invalid TrxID', 'Please enter the valid Transaction ID (TrxID) from your SMS or app.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitDeposit({
        amount: numAmount,
        paymentMethod: method,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim().toUpperCase(),
      });

      if (res.success) {
        await refreshProfile();
        Alert.alert(
          'Deposit Request Submitted! 🚀',
          `Your deposit request of ৳ ${numAmount} via ${method} has been received. Admin will verify your Transaction ID (${transactionId}) within 5-15 minutes and credit your balance automatically!`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Submission Error', res.error || 'Failed to submit deposit request. Please try again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTag}>INSTANT WALLET DEPOSIT</Text>
              <Text style={styles.headerTitle}>টাকা অ্যাড করুন (Add Money)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step 1: Select Payment Method */}
            <Text style={styles.stepTitle}>১. পেমেন্ট মেথড নির্বাচন করুন</Text>
            <View style={styles.methodRow}>
              {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => {
                const isSelected = method === m;
                const brandColor = m === 'bKash' ? Colors.bkash : m === 'Nagad' ? Colors.nagad : Colors.rocket;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodCard,
                      isSelected && { borderColor: brandColor, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                    ]}
                    onPress={() => setMethod(m)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.methodDot, { backgroundColor: brandColor }]} />
                    <Text style={[styles.methodName, isSelected && { color: brandColor }]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Official Number Copy Box */}
            <View style={styles.numberBox}>
              <View>
                <Text style={styles.numberLabel}>OFFICIAL {method.toUpperCase()} PERSONAL NUMBER</Text>
                <Text style={styles.numberValue}>{OFFICIAL_NUMBER}</Text>
                <Text style={styles.numberType}>* Send Money (সেন্ড মানি করুন)</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyNumber}>
                <Text style={styles.copyBtnText}>{copied ? 'COPIED ✓' : 'COPY 📋'}</Text>
              </TouchableOpacity>
            </View>

            {/* Step 2: Amount Selection */}
            <Text style={styles.stepTitle}>২. ডিপোজিট পরিমাণ (Amount)</Text>
            <View style={styles.presetGrid}>
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.presetBtn,
                    amount === amt.toString() && styles.presetBtnActive,
                  ]}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text
                    style={[
                      styles.presetText,
                      amount === amt.toString() && styles.presetTextActive,
                    ]}
                  >
                    ৳ {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Custom Amount (সর্বনিম্ন ৳৫০)</Text>
              <TextInput
                style={styles.input}
                placeholder="50 - 25000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Step 3: Transaction Details */}
            <Text style={styles.stepTitle}>৩. ট্রানজেকশন তথ্য পূরণ করুন</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sender Phone Number (যে নম্বর থেকে পাঠিয়েছেন) *</Text>
              <TextInput
                style={styles.input}
                placeholder="017XXXXXXXX"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={senderNumber}
                onChangeText={setSenderNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction ID / TrxID (এসএমএস এর TrxID) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BL9X2910KP"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                value={transactionId}
                onChangeText={setTransactionId}
              />
            </View>

            {/* Notice / Warning */}
            <View style={styles.infoAlert}>
              <Text style={styles.infoIcon}>⚡</Text>
              <Text style={styles.infoText}>
                টাকা পাঠানোর পর প্রাপ্ত TrxID দিন। ভুয়া ট্রানজেকশন আইডি দিলে অ্যাকাউন্ট ব্যান হতে পারে।
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>CONFIRM DEPOSIT REQUEST (৳ {amount})</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTag: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
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
  scrollBody: {
    padding: 16,
    paddingBottom: 60,
  },
  stepTitle: {
    color: Colors.yellow,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  methodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  methodName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  numberBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F1218',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  numberLabel: {
    color: Colors.textMuted,
    fontSize: 8.5,
    fontWeight: '800',
  },
  numberValue: {
    color: Colors.yellow,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginVertical: 2,
  },
  numberType: {
    color: Colors.textSecondary,
    fontSize: 9.5,
  },
  copyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetBtn: {
    width: '31%',
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: 'rgba(255, 90, 0, 0.2)',
    borderColor: Colors.primary,
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  presetTextActive: {
    color: Colors.primary,
    fontWeight: '900',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    color: '#FBBF24',
    fontSize: 10.5,
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
