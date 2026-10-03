import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

export type TabType = 'home' | 'matches' | 'wallet' | 'leaderboard' | 'profile';

interface BottomTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'matches', label: 'Matches', icon: '🎮' },
  { id: 'wallet', label: 'Wallet', icon: '💰' },
  { id: 'leaderboard', label: 'Rankings', icon: '🏆' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            {/* Active Glow line on top */}
            {isActive && <View style={styles.activeIndicator} />}
            <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F1218',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 6,
    paddingBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeTabButton: {},
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 28,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    color: Colors.textMuted,
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '900',
  },
});
