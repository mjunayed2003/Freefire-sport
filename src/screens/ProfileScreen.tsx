import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProfileScreenProps {
  onOpenAuth: () => void;
  onOpenSupport: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenAuth, onOpenSupport }) => {
  const { user, wallet, isAuthenticated, logout } = useAuth();
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(api.getBaseUrl());

  const handleSaveServerUrl = async () => {
    if (!customServerUrl.trim()) return;
    await api.setBaseUrl(customServerUrl.trim());
    setShowServerConfig(false);
    Alert.alert('Server URL Updated', `Backend API is now pointing to: ${customServerUrl}`);
  };

  const handleLogoutConfirm = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authIcon}>🎮</Text>
        <Text style={styles.authTitle}>Free Fire Esports Account</Text>
        <Text style={styles.authDesc}>
          Sign in to view your career statistics, manage in-game UID, and participate in cash tournaments.
        </Text>
        <TouchableOpacity style={styles.authBtn} onPress={onOpenAuth} activeOpacity={0.85}>
          <Text style={styles.authBtnText}>SIGN IN / CREATE ACCOUNT</Text>
        </TouchableOpacity>

        {/* Server Config for Developer */}
        <TouchableOpacity
          style={styles.devServerBtn}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.devServerText}>⚙️ Backend Server IP Settings</Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverConfigBox}>
            <Text style={styles.serverLabel}>Backend Host URL:</Text>
            <TextInput
              style={styles.serverInput}
              value={customServerUrl}
              onChangeText={setCustomServerUrl}
              autoCapitalize="none"
              placeholder="http://10.0.2.2:3000"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
              <Text style={styles.saveServerBtnText}>SAVE SERVER URL</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Profile Gamer Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>🎮</Text>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.infoCol}>
            <View style={styles.roleRow}>
              <Text style={styles.playerName}>{user.fullName || user.username}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            </View>
            <Text style={styles.usernameText}>@{user.username}</Text>
            <View style={styles.uidPill}>
              <Text style={styles.uidLabel}>FF UID:</Text>
              <Text style={styles.uidValue}>{user.ffUid}</Text>
            </View>
          </View>
        </View>

        {/* Quick Career Stats Grid */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>IGN</Text>
            <Text style={styles.statValue} numberOfLines={1}>{user.ffPlayerName}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BALANCE</Text>
            <Text style={[styles.statValue, { color: Colors.yellow }]}>৳ {wallet?.balance?.toFixed(0) || '0'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TOTAL WON</Text>
            <Text style={[styles.statValue, { color: Colors.gold }]}>৳ {wallet?.totalWon?.toFixed(0) || '0'}</Text>
          </View>
        </View>
      </View>

      {/* Menu Options List */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>ACCOUNT & SUPPORT</Text>

        <TouchableOpacity style={styles.menuItem} onPress={onOpenSupport}>
          <Text style={styles.menuIcon}>🎧</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>24/7 Live Customer Support</Text>
            <Text style={styles.menuSubtitle}>Chat with admin for instant help with deposits and rooms</Text>
          </View>
          <Text style={styles.menuArrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              'How to Deposit',
              '1. Tap Add Money from Wallet\n2. Send Money to our official bKash/Nagad number\n3. Enter the TrxID and Sender Number\n4. Your balance will be credited within 5-15 mins!'
            )
          }
        >
          <Text style={styles.menuIcon}>💳</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>How to Deposit & Withdraw</Text>
            <Text style={styles.menuSubtitle}>Step by step guide for bKash and Nagad payments</Text>
          </View>
          <Text style={styles.menuArrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              'Tournament Rules',
              '• Mobile devices only. PC Emulators are prohibited.\n• No teaming or third-party hacks.\n• Room ID and Password will be displayed on the match card 10-15 minutes before the match.\n• Prizes credited automatically to in-app wallet.'
            )
          }
        >
          <Text style={styles.menuIcon}>📜</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Rules & Fair Play Guidelines</Text>
            <Text style={styles.menuSubtitle}>Anti-cheat policy and room credentials release</Text>
          </View>
          <Text style={styles.menuArrow}>➔</Text>
        </TouchableOpacity>

        {/* Server Host URL Settings */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Backend Server Connection</Text>
            <Text style={styles.menuSubtitle}>Current: {api.getBaseUrl()}</Text>
          </View>
          <Text style={styles.menuArrow}>{showServerConfig ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverConfigBox}>
            <Text style={styles.serverLabel}>Backend Host URL:</Text>
            <TextInput
              style={styles.serverInput}
              value={customServerUrl}
              onChangeText={setCustomServerUrl}
              autoCapitalize="none"
              placeholder="http://10.0.2.2:3000"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
              <Text style={styles.saveServerBtnText}>SAVE SERVER URL</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutConfirm} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>LOG OUT OF ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  authContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  authIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  authTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  authDesc: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  authBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  authBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  devServerBtn: {
    marginTop: 20,
    padding: 8,
  },
  devServerText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  profileHeader: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cardElevated,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  infoCol: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 90, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  roleText: {
    color: Colors.primary,
    fontSize: 8.5,
    fontWeight: '900',
  },
  usernameText: {
    color: Colors.textMuted,
    fontSize: 11.5,
    marginTop: 1,
  },
  uidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  uidLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  uidValue: {
    color: Colors.yellow,
    fontSize: 10,
    fontWeight: '900',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  menuSection: {
    padding: 16,
    paddingBottom: 40,
  },
  menuSectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  menuSubtitle: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  menuArrow: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  serverConfigBox: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  serverLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  serverInput: {
    backgroundColor: '#0F1218',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 8,
  },
  saveServerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveServerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  logoutBtnText: {
    color: Colors.danger,
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
