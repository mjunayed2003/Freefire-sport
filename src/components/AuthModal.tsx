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

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register extra fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [ffPlayerName, setFfPlayerName] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (id?: string, pass?: string) => {
    const loginId = id || identifier;
    const loginPass = pass || password;

    if (!loginId.trim() || !loginPass.trim()) {
      Alert.alert('Missing Fields', 'Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(loginId.trim(), loginPass.trim());
    setIsLoading(false);

    if (res.success) {
      Alert.alert('Welcome Back! 🎮', 'Logged in successfully!');
      onSuccess();
    } else {
      Alert.alert('Login Failed', res.error || 'Invalid credentials.');
    }
  };

  const handleRegister = async () => {
    if (!fullName || !username || !email || !ffPlayerName || !ffUid || !mobileNumber || !password) {
      Alert.alert('Missing Fields', 'Please fill in all registration fields.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      ffPlayerName: ffPlayerName.trim(),
      ffUid: ffUid.trim(),
      mobileNumber: mobileNumber.trim(),
      password: password.trim(),
    });
    setIsLoading(false);

    if (res.success) {
      Alert.alert('Account Created! 🎉', 'Welcome to Free Fire Esports BD!');
      onSuccess();
    } else {
      Alert.alert('Registration Failed', res.error || 'Failed to create account.');
    }
  };

  const fillSuperAdmin = () => {
    setIdentifier('admin@123.gmail.com');
    setPassword('Admin@123');
    handleLogin('admin@123.gmail.com', 'Admin@123');
  };

  const fillPlayer = () => {
    setIdentifier('player123');
    setPassword('player123');
    handleLogin('player123', 'player123');
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
              <Text style={styles.headerTag}>FREE FIRE ESPORTS BD</Text>
              <Text style={styles.headerTitle}>{isRegister ? 'CREATE ACCOUNT' : 'PLAYER LOGIN'}</Text>
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
            {/* Quick Demo Logins Bar */}
            {!isRegister && (
              <View style={styles.quickLoginBox}>
                <Text style={styles.quickLoginLabel}>⚡ ONE-TAP DEMO LOGIN:</Text>
                <View style={styles.quickBtnRow}>
                  <TouchableOpacity style={styles.adminQuickBtn} onPress={fillSuperAdmin}>
                    <Text style={styles.quickBtnText}>👑 Super Admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.playerQuickBtn} onPress={fillPlayer}>
                    <Text style={styles.quickBtnText}>🎮 Pro Player</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Toggle Tab */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isRegister && styles.toggleBtnActive]}
                onPress={() => setIsRegister(false)}
              >
                <Text style={[styles.toggleText, !isRegister && styles.toggleTextActive]}>SIGN IN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isRegister && styles.toggleBtnActive]}
                onPress={() => setIsRegister(true)}
              >
                <Text style={[styles.toggleText, isRegister && styles.toggleTextActive]}>REGISTER</Text>
              </TouchableOpacity>
            </View>

            {isRegister ? (
              /* Register Fields */
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Full Name"
                    placeholderTextColor={Colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>USERNAME *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="gamer_tag"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FREE FIRE IN-GAME NAME *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. VIPER_CHIEF"
                    placeholderTextColor={Colors.textMuted}
                    value={ffPlayerName}
                    onChangeText={setFfPlayerName}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FREE FIRE UID (NUMBER) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 192837465"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={ffUid}
                    onChangeText={setFfUid}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>MOBILE NUMBER (bKash/Nagad) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="01XXXXXXXXX"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </>
            ) : (
              /* Login Fields */
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>USERNAME OR EMAIL *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email or username"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    value={identifier}
                    onChangeText={setIdentifier}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </>
            )}

            {/* Action Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={() => (isRegister ? handleRegister() : handleLogin())}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isRegister ? 'CREATE ACCOUNT & GET FREE BONUS' : 'SIGN IN NOW'}
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
  quickLoginBox: {
    backgroundColor: 'rgba(255, 90, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 0, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  quickLoginLabel: {
    color: Colors.yellow,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },
  quickBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adminQuickBtn: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  playerQuickBtn: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0F1218',
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.textMuted,
    fontSize: 11.5,
    fontWeight: '800',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '800',
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
