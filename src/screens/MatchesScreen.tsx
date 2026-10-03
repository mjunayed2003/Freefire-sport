import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { TournamentCard } from '../components/TournamentCard';
import { Tournament } from '../types';
import { api } from '../services/api';

interface MatchesScreenProps {
  onJoinMatch: (t: Tournament) => void;
  onViewMatchDetails: (t: Tournament) => void;
}

const MODES = ['ALL', 'SOLO', 'DUO', 'SQUAD'];
const STATUSES = [
  { id: 'ALL', label: 'All Matches' },
  { id: 'REGISTRATION_OPEN', label: 'Open' },
  { id: 'LIVE', label: 'Live' },
  { id: 'COMPLETED', label: 'Completed' },
];

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  onJoinMatch,
  onViewMatchDetails,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, [selectedMode, selectedStatus]);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTournaments({
        mode: selectedMode,
        status: selectedStatus,
      });
      if (res.success && res.data?.tournaments) {
        setTournaments(res.data.tournaments);
      }
    } catch (e) {
      console.log('Error fetching tournaments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.mapName.toLowerCase().includes(q) ||
      t.gameMode.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Header & Search Bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>TOURNAMENT LOBBY</Text>
        <Text style={styles.pageSubtitle}>Select match format and join custom room</Text>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search map or title (Bermuda, Kalahari...)"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Mode Filter Chips */}
        <View style={styles.filterRow}>
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedMode(mode)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Status Tabs */}
        <View style={styles.statusRow}>
          {STATUSES.map((st) => {
            const isSelected = selectedStatus === st.id;
            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.statusTab, isSelected && styles.statusTabActive]}
                onPress={() => setSelectedStatus(st.id)}
              >
                <Text style={[styles.statusTabText, isSelected && styles.statusTabTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tournaments FlatList */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Filtering matches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TournamentCard
              tournament={item}
              onJoin={onJoinMatch}
              onViewDetails={onViewMatchDetails}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎮</Text>
              <Text style={styles.emptyTitle}>No Matches Found</Text>
              <Text style={styles.emptyDesc}>
                There are no tournaments matching your selected filters. Try switching modes or status tabs.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    color: Colors.textMuted,
    fontSize: 10.5,
    marginTop: 2,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    padding: 0,
  },
  clearSearch: {
    color: Colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    backgroundColor: '#0F1218',
    borderRadius: 6,
    padding: 2,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 4,
  },
  statusTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusTabText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTabTextActive: {
    color: Colors.yellow,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  loaderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
});
