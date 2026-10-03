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

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ visible, onClose, onSuccess }) => {
  const insets = useSafeAreaInsets();
  const { wallet, refreshProfile } = useAuth();
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [amount, setAmount] = useState('100');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const balance = wallet?.balance || 0;

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is ৳ 50.');
      return;
    }

    if (numAmount > balance) {
      Alert.alert('Insufficient Balance', `Your current balance is ৳ ${balance}. You cannot withdraw more than your balance.`);
      return;
    }

    if (!accountNumber.trim() || accountNumber.trim().length < 11) {
      Alert.alert('Invalid Account Number', 'Please enter your 11-digit bKash or Nagad personal mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitWithdraw({
        amount: numAmount,
        paymentMethod: method,
        accountNumber: accountNumber.trim(),
      });

      if (res.success) {
        await refreshProfile();
        Alert.alert(
          'Withdrawal Request Submitted! 🎉',
          `Your cashout request of ৳ ${numAmount} to ${accountNumber} (${method}) has been submitted. It will be processed and sent to your account shortly!`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Withdrawal Failed', res.error || 'Failed to submit withdrawal request.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
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
              <Text style={styles.headerTag}>PRIZE CASHOUT</Text>
              <Text style={styles.headerTitle}>টাকা উত্তোলন (Withdraw)</Text>
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
            {/* Balance Pill */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>৳ {balance.toFixed(2)}</Text>
            </View>

            {/* Method selection */}
            <Text style={styles.inputLabel}>SELECT CASHOUT METHOD</Text>
            <View style={styles.methodRow}>
              {(['bKash', 'Nagad'] as const).map((m) => {
                const isSelected = method === m;
                const brandColor = m === 'bKash' ? Colors.bkash : Colors.nagad;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodCard,
                      isSelected && { borderColor: brandColor, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                    ]}
                    onPress={() => setMethod(m)}
                  >
                    <View style={[styles.methodDot, { backgroundColor: brandColor }]} />
                    <Text style={[styles.methodName, isSelected && { color: brandColor }]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Withdraw Amount (সর্বনিম্ন ৳৫০) *</Text>
              <TextInput
                style={styles.input}
                placeholder="50 - 5000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Personal {method} Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="01XXXXXXXXX"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>

            {/* Quick Withdraw Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleWithdraw}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>CONFIRM CASHOUT (৳ {amount})</Text>
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
    maxHeight: '85%',
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
  balanceCard: {
    backgroundColor: '#0F1218',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  balanceAmount: {
    color: Colors.yellow,
    fontSize: 20,
    fontWeight: '900',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
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
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
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
