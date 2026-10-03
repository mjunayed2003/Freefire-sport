import React, { useState, useEffect } from 'react';
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
import { Tournament } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface JoinModalProps {
  visible: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDeposit: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  visible,
  tournament,
  onClose,
  onSuccess,
  onOpenDeposit,
}) => {
  const insets = useSafeAreaInsets();
  const { user, wallet, refreshProfile } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player1Uid, setPlayer1Uid] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player2Uid, setPlayer2Uid] = useState('');
  const [player3Name, setPlayer3Name] = useState('');
  const [player3Uid, setPlayer3Uid] = useState('');
  const [player4Name, setPlayer4Name] = useState('');
  const [player4Uid, setPlayer4Uid] = useState('');
  const [agreeRules, setAgreeRules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setPlayer1Name(user.ffPlayerName || user.fullName || '');
      setPlayer1Uid(user.ffUid || '');
    }
  }, [user, visible]);

  if (!tournament) return null;

  const entryFee = tournament.entryFee || 0;
  const currentBalance = wallet?.balance || 0;
  const hasEnoughBalance = currentBalance >= entryFee;

  const handleJoin = async () => {
    if (!agreeRules) {
      Alert.alert('Rules Agreement Required', 'Please accept the tournament rules before joining.');
      return;
    }

    if (!player1Name.trim() || !player1Uid.trim()) {
      Alert.alert('Missing Details', 'Please provide Player 1 In-Game Name and Free Fire UID.');
      return;
    }

    if (tournament.gameMode === 'DUO' && (!player2Name.trim() || !player2Uid.trim())) {
      Alert.alert('Missing Details', 'DUO matches require Player 2 In-Game Name and UID.');
      return;
    }

    if (tournament.gameMode === 'SQUAD') {
      if (!teamName.trim()) {
        Alert.alert('Missing Details', 'Please provide your Squad Team Name.');
        return;
      }
      if (!player2Uid.trim() || !player3Uid.trim() || !player4Uid.trim()) {
        Alert.alert('Missing Details', 'Squad matches require all 4 players Free Fire UIDs.');
        return;
      }
    }

    if (!hasEnoughBalance) {
      Alert.alert(
        'Insufficient Balance',
        `Entry fee is ৳ ${entryFee}, but your current wallet balance is ৳ ${currentBalance}. Would you like to deposit now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Deposit Now', onPress: onOpenDeposit },
        ]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.joinTournament(tournament.id, {
        teamName: teamName.trim() || undefined,
        player1Name: player1Name.trim(),
        player1Uid: player1Uid.trim(),
        player2Name: player2Name.trim() || undefined,
        player2Uid: player2Uid.trim() || undefined,
        player3Name: player3Name.trim() || undefined,
        player3Uid: player3Uid.trim() || undefined,
        player4Name: player4Name.trim() || undefined,
        player4Uid: player4Uid.trim() || undefined,
      });

      if (res.success) {
        await refreshProfile();
        Alert.alert(
          'Registration Successful! 🎉',
          `You have successfully registered for ${tournament.title}. Room ID and password will be displayed in the app 15 minutes before the match!`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Registration Failed', res.error || 'Failed to join match. Please try again.');
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
              <Text style={styles.headerTitle}>REGISTER MATCH</Text>
              <Text style={styles.matchTitle} numberOfLines={1}>
                {tournament.title}
              </Text>
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
            {/* Balance vs Entry Fee Box */}
            <View style={styles.feeCard}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Entry Fee:</Text>
                <Text style={styles.feeValue}>{entryFee === 0 ? 'FREE' : `৳ ${entryFee}`}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Your Balance:</Text>
                <Text style={[styles.balanceValue, !hasEnoughBalance && styles.balanceLow]}>
                  ৳ {currentBalance}
                </Text>
              </View>
              {!hasEnoughBalance && (
                <TouchableOpacity style={styles.addMoneyBtn} onPress={onOpenDeposit}>
                  <Text style={styles.addMoneyText}>+ Add Money (Deposit)</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Squad Team Name if Duo/Squad */}
            {(tournament.gameMode === 'SQUAD' || tournament.gameMode === 'DUO') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TEAM / CLAN NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. BD CYBER TITANS"
                  placeholderTextColor={Colors.textMuted}
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>
            )}

            {/* Player 1 (Leader / Solo) */}
            <View style={styles.playerSection}>
              <Text style={styles.sectionHeader}>👤 PLAYER 1 (LEADER)</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Free Fire In-Game Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="In-Game Name"
                  placeholderTextColor={Colors.textMuted}
                  value={player1Name}
                  onChangeText={setPlayer1Name}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Free Fire UID *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 198273645"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={player1Uid}
                  onChangeText={setPlayer1Uid}
                />
              </View>
            </View>

            {/* Player 2 (If Duo or Squad) */}
            {(tournament.gameMode === 'DUO' || tournament.gameMode === 'SQUAD') && (
              <View style={styles.playerSection}>
                <Text style={styles.sectionHeader}>👤 PLAYER 2</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Player 2 Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Player 2 Name"
                    placeholderTextColor={Colors.textMuted}
                    value={player2Name}
                    onChangeText={setPlayer2Name}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Player 2 UID *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Player 2 UID"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={player2Uid}
                    onChangeText={setPlayer2Uid}
                  />
                </View>
              </View>
            )}

            {/* Player 3 & 4 (If Squad) */}
            {tournament.gameMode === 'SQUAD' && (
              <>
                <View style={styles.playerSection}>
                  <Text style={styles.sectionHeader}>👤 PLAYER 3</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Player 3 Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Player 3 Name"
                      placeholderTextColor={Colors.textMuted}
                      value={player3Name}
                      onChangeText={setPlayer3Name}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Player 3 UID *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Player 3 UID"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      value={player3Uid}
                      onChangeText={setPlayer3Uid}
                    />
                  </View>
                </View>

                <View style={styles.playerSection}>
                  <Text style={styles.sectionHeader}>👤 PLAYER 4</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Player 4 Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Player 4 Name"
                      placeholderTextColor={Colors.textMuted}
                      value={player4Name}
                      onChangeText={setPlayer4Name}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Player 4 UID *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Player 4 UID"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      value={player4Uid}
                      onChangeText={setPlayer4Uid}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Rules Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreeRules(!agreeRules)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreeRules && styles.checkboxActive]}>
                {agreeRules && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rulesText}>
                I confirm that my player details and Free Fire UIDs are correct, and I agree to play fairly without any third-party scripts or emulator.
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, (!agreeRules || isSubmitting) && styles.submitBtnDisabled]}
              onPress={handleJoin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  CONFIRM REGISTRATION (৳ {entryFee})
                </Text>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  matchTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
    maxWidth: 260,
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
  feeCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feeLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  feeValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  balanceValue: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '900',
  },
  balanceLow: {
    color: Colors.danger,
  },
  addMoneyBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 90, 0, 0.15)',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addMoneyText: {
    color: Colors.primary,
    fontSize: 11.5,
    fontWeight: '800',
  },
  playerSection: {
    backgroundColor: '#0F1218',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    color: Colors.yellow,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 10.5,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1218',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  rulesText: {
    flex: 1,
    color: Colors.textMuted,
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
