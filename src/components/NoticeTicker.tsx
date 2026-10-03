import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface NoticeTickerProps {
  text?: string;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({
  text = '🔥 bKash Instant Deposit Active 24/7! Join upcoming Solo & Squad custom matches now!',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>📢 NOTICE</Text>
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.tickerText} numberOfLines={1}>
          {text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 90, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 0, 0.4)',
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textWrapper: {
    flex: 1,
  },
  tickerText: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '500',
  },
});
