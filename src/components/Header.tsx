import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenWallet: () => void;
  onOpenAuth: () => void;
  onOpenSupport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWallet, onOpenAuth, onOpenSupport }) => {
  const { user, wallet, isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      {/* Brand Logo & Name */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoFire}>🔥</Text>
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitleMain}>FREE FIRE</Text>
            <Text style={styles.brandTitleTag}>ESPORTS</Text>
          </View>
          <Text style={styles.brandSubtitle}>BANGLADESH CHAMPIONSHIP</Text>
        </View>
      </View>

      {/* Right Action Icons: Wallet & User */}
      <View style={styles.actionsRow}>
        {/* Support Chat Quick Button */}
        <TouchableOpacity style={styles.supportButton} onPress={onOpenSupport} activeOpacity={0.8}>
          <Text style={styles.supportIcon}>💬</Text>
        </TouchableOpacity>

        {/* Wallet Balance Pill */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.walletPill} onPress={onOpenWallet} activeOpacity={0.8}>
            <Text style={styles.coinIcon}>💰</Text>
            <View style={styles.walletTextContainer}>
              <Text style={styles.walletLabel}>BALANCE</Text>
              <Text style={styles.walletAmount}>৳ {wallet?.balance?.toFixed(0) || '0'}</Text>
            </View>
            <View style={styles.walletAddBtn}>
              <Text style={styles.walletAddText}>+</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginPill} onPress={onOpenAuth} activeOpacity={0.8}>
            <Text style={styles.loginPillText}>LOGIN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 90, 0, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFire: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitleMain: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  brandTitleTag: {
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportIcon: {
    fontSize: 16,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 0, 0.4)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 6,
    gap: 6,
  },
  coinIcon: {
    fontSize: 14,
  },
  walletTextContainer: {
    alignItems: 'flex-start',
  },
  walletLabel: {
    color: Colors.textSecondary,
    fontSize: 7.5,
    fontWeight: '800',
  },
  walletAmount: {
    color: Colors.yellow,
    fontSize: 13,
    fontWeight: '800',
  },
  walletAddBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAddText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: -1,
  },
  loginPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  loginPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
