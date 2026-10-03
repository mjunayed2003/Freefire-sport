import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { LeaderboardPlayer } from '../types';
import { api } from '../services/api';

const TIME_FILTERS = [
  { id: 'all', label: 'All-Time' },
  { id: 'monthly', label: 'This Month' },
  { id: 'weekly', label: 'This Week' },
];

export const LeaderboardScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLeaderboard(filter);
      if (res.success && res.data?.leaderboard) {
        setPlayers(res.data.leaderboard);
      }
    } catch (e) {
      console.log('Error fetching leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];
  const restPlayers = players.slice(3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>HALL OF FAME 🏆</Text>
        <Text style={styles.headerTitle}>TOP PLAYERS & WINNERS</Text>
        <Text style={styles.headerSub}>Real-time leaderboard updated after every match</Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {TIME_FILTERS.map((f) => {
            const isSelected = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setFilter(f.id as any)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Podium for Top 3 */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Calculating rankings...</Text>
        </View>
      ) : players.length > 0 ? (
        <View style={styles.podiumContainer}>
          {/* Rank 2 (Silver) */}
          <View style={[styles.podiumCol, styles.podiumRank2]}>
            <View style={[styles.avatarCircle, { borderColor: '#CBD5E1' }]}>
              <Text style={styles.avatarEmoji}>🥈</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top2?.ffPlayerName || top2?.username || 'Challenger'}
            </Text>
            <Text style={styles.podiumUid}>UID: {top2?.ffUid || '---'}</Text>
            <Text style={styles.podiumPrize}>৳ {top2?.totalWon || '0'}</Text>
            <View style={[styles.podiumBlock, { height: 75, backgroundColor: '#202736' }]}>
              <Text style={styles.podiumBlockNum}>#2</Text>
            </View>
          </View>

          {/* Rank 1 (Gold - Center & Elevated) */}
          <View style={[styles.podiumCol, styles.podiumRank1]}>
            <Text style={styles.crownEmoji}>👑</Text>
            <View style={[styles.avatarCircle, { borderColor: Colors.gold, width: 62, height: 62 }]}>
              <Text style={styles.avatarEmojiGold}>🥇</Text>
            </View>
            <Text style={[styles.podiumName, { color: Colors.gold }]} numberOfLines={1}>
              {top1?.ffPlayerName || top1?.username || 'Champion'}
            </Text>
            <Text style={styles.podiumUid}>UID: {top1?.ffUid || '---'}</Text>
            <Text style={[styles.podiumPrize, { color: Colors.yellow, fontSize: 13 }]}>
              ৳ {top1?.totalWon || '0'}
            </Text>
            <View style={[styles.podiumBlock, { height: 95, backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: Colors.gold, borderWidth: 1 }]}>
              <Text style={[styles.podiumBlockNum, { color: Colors.gold }]}>#1</Text>
            </View>
          </View>

          {/* Rank 3 (Bronze) */}
          <View style={[styles.podiumCol, styles.podiumRank3]}>
            <View style={[styles.avatarCircle, { borderColor: '#CD7F32' }]}>
              <Text style={styles.avatarEmoji}>🥉</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top3?.ffPlayerName || top3?.username || 'Warrior'}
            </Text>
            <Text style={styles.podiumUid}>UID: {top3?.ffUid || '---'}</Text>
            <Text style={styles.podiumPrize}>৳ {top3?.totalWon || '0'}</Text>
            <View style={[styles.podiumBlock, { height: 60, backgroundColor: '#1C212E' }]}>
              <Text style={styles.podiumBlockNum}>#3</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Ranks 4+ List */}
      <View style={styles.listContainer}>
        <Text style={styles.listHeaderTitle}>OVERALL LEADERBOARD STANDINGS</Text>
        {players.length === 0 && !isLoading ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No Rankings Yet</Text>
            <Text style={styles.emptySub}>Join matches and win to claim your spot on the podium!</Text>
          </View>
        ) : (
          (restPlayers.length > 0 ? restPlayers : players).map((player, idx) => {
            const rank = restPlayers.length > 0 ? idx + 4 : idx + 1;
            return (
              <View key={player.id || idx} style={styles.playerRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNum}>#{rank}</Text>
                </View>

                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{player.ffPlayerName || player.username}</Text>
                  <Text style={styles.playerUid}>FF UID: {player.ffUid}</Text>
                </View>

                <View style={styles.earningsBox}>
                  <Text style={styles.earningsLabel}>TOTAL EARNINGS</Text>
                  <Text style={styles.earningsAmount}>৳ {player.totalWon}</Text>
                </View>
              </View>
            );
          })
        )}
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
  header: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTag: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 10.5,
    marginTop: 2,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 90, 0, 0.2)',
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  filterTextActive: {
    color: Colors.primary,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#0F1218',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  podiumRank1: {
    marginHorizontal: 4,
  },
  podiumRank2: {},
  podiumRank3: {},
  crownEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardElevated,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  avatarEmojiGold: {
    fontSize: 28,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    maxWidth: 90,
  },
  podiumUid: {
    color: Colors.textMuted,
    fontSize: 8.5,
    marginTop: 1,
  },
  podiumPrize: {
    color: Colors.yellow,
    fontSize: 11.5,
    fontWeight: '900',
    marginVertical: 4,
  },
  podiumBlock: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBlockNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  listHeaderTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  emptyBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 30,
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
    textAlign: 'center',
    marginTop: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankNum: {
    color: Colors.yellow,
    fontSize: 12,
    fontWeight: '900',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  playerUid: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  earningsBox: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    color: Colors.textMuted,
    fontSize: 7.5,
    fontWeight: '800',
  },
  earningsAmount: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 1,
  },
});
