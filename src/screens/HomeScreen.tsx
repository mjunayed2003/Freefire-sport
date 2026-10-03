import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { HeroBanner } from '../components/HeroBanner';
import { NoticeTicker } from '../components/NoticeTicker';
import { TournamentCard } from '../components/TournamentCard';
import { Tournament } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  onSelectTab: (tab: any) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSupport: () => void;
  onJoinMatch: (t: Tournament) => void;
  onViewMatchDetails: (t: Tournament) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectTab,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSupport,
  onJoinMatch,
  onViewMatchDetails,
}) => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noticeText, setNoticeText] = useState('🔥 bKash Instant Deposit Active 24/7! Join upcoming Solo & Squad custom matches now!');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      const [tourneysRes, settingsRes] = await Promise.all([
        api.getTournaments({ status: 'ALL' }),
        api.getSettings(),
      ]);

      if (tourneysRes.success && tourneysRes.data?.tournaments) {
        setTournaments(tourneysRes.data.tournaments);
      }
      if (settingsRes.success && settingsRes.data?.settings?.notice_text) {
        setNoticeText(settingsRes.data.settings.notice_text);
      }
    } catch (e) {
      console.log('Error loading home data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Notice Ticker */}
      <NoticeTicker text={noticeText} />

      {/* Hero Carousel Banner */}
      <HeroBanner onPressMatch={() => onSelectTab('matches')} />

      {/* Quick Action Hub */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionItem} onPress={onOpenDeposit} activeOpacity={0.8}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255, 90, 0, 0.15)' }]}>
            <Text style={styles.actionEmoji}>💳</Text>
          </View>
          <Text style={styles.actionLabel}>Add Money</Text>
          <Text style={styles.actionSub}>Instant bKash</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={onOpenWithdraw} activeOpacity={0.8}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Text style={styles.actionEmoji}>💸</Text>
          </View>
          <Text style={styles.actionLabel}>Withdraw</Text>
          <Text style={styles.actionSub}>Prize Cashout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => onSelectTab('matches')} activeOpacity={0.8}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(0, 229, 255, 0.15)' }]}>
            <Text style={styles.actionEmoji}>🎮</Text>
          </View>
          <Text style={styles.actionLabel}>Matches</Text>
          <Text style={styles.actionSub}>Custom Rooms</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => onSelectTab('leaderboard')} activeOpacity={0.8}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
            <Text style={styles.actionEmoji}>🏆</Text>
          </View>
          <Text style={styles.actionLabel}>Rankings</Text>
          <Text style={styles.actionSub}>Top Earners</Text>
        </TouchableOpacity>
      </View>

      {/* Community Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>100%</Text>
          <Text style={styles.statDesc}>Verified Payouts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNum}>24/7</Text>
          <Text style={styles.statDesc}>Instant Support</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNum}>0%</Text>
          <Text style={styles.statDesc}>Hacker Tolerance</Text>
        </View>
      </View>

      {/* Featured Tournaments Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTag}>🔥 LIVE & UPCOMING</Text>
          <Text style={styles.sectionTitle}>FEATURED TOURNAMENTS</Text>
        </View>
        <TouchableOpacity onPress={() => onSelectTab('matches')}>
          <Text style={styles.seeAllText}>VIEW ALL ➔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tournamentsList}>
        {isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>Loading live matches...</Text>
          </View>
        ) : tournaments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎮</Text>
            <Text style={styles.emptyTitle}>No Tournaments Available</Text>
            <Text style={styles.emptySub}>Check back shortly for upcoming matches!</Text>
          </View>
        ) : (
          tournaments.slice(0, 3).map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onJoin={onJoinMatch}
              onViewDetails={onViewMatchDetails}
            />
          ))
        )}
      </View>

      {/* Why Choose Us Banner */}
      <View style={styles.trustBanner}>
        <Text style={styles.trustTitle}>🛡️ BANGLADESH'S #1 ESPORTS HUB</Text>
        <Text style={styles.trustDesc}>
          Join thousands of Free Fire competitive players in daily custom rooms. Win real cash prizes sent directly to your bKash or Nagad wallet.
        </Text>
        <TouchableOpacity style={styles.trustSupportBtn} onPress={onOpenSupport}>
          <Text style={styles.trustSupportText}>Need Help? Talk to Support 24/7 💬</Text>
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
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionItem: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  actionSub: {
    color: Colors.textMuted,
    fontSize: 8.5,
    marginTop: 1,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    marginBottom: 18,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    color: Colors.yellow,
    fontSize: 14,
    fontWeight: '900',
  },
  statDesc: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTag: {
    color: Colors.primary,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  seeAllText: {
    color: Colors.yellow,
    fontSize: 11,
    fontWeight: '800',
  },
  tournamentsList: {
    paddingHorizontal: 16,
  },
  loaderBox: {
    padding: 30,
    alignItems: 'center',
  },
  loaderText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  trustBanner: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    marginBottom: 30,
  },
  trustTitle: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  trustDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  trustSupportBtn: {
    backgroundColor: 'rgba(255, 90, 0, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  trustSupportText: {
    color: Colors.primary,
    fontSize: 11.5,
    fontWeight: '800',
  },
});
