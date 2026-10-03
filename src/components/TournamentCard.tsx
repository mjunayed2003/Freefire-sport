import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Tournament } from '../types';

interface TournamentCardProps {
  tournament: Tournament;
  onJoin: (tournament: Tournament) => void;
  onViewDetails: (tournament: Tournament) => void;
}

const getImageSource = (bannerUrl: string) => {
  if (bannerUrl?.includes('image2')) {
    return require('../assets/images/image2.png');
  } else if (bannerUrl?.includes('image3')) {
    return require('../assets/images/image3.png');
  } else if (bannerUrl?.includes('image4')) {
    return require('../assets/images/image4.png');
  } else {
    return require('../assets/images/image.png');
  }
};

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoin,
  onViewDetails,
}) => {
  const isJoined = tournament.isUserJoined;
  const isCompleted = tournament.status === 'COMPLETED';
  const isLive = tournament.status === 'LIVE';
  const isOpen = tournament.status === 'REGISTRATION_OPEN';

  const joinedSlots = tournament.totalSlots - (tournament.remainingSlots ?? 0);
  const slotPercentage = Math.min(100, Math.round((joinedSlots / (tournament.totalSlots || 48)) * 100));

  return (
    <View style={styles.card}>
      {/* Banner Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource(tournament.bannerImage)}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Top Badges */}
        <View style={styles.badgeRow}>
          {/* Game Mode */}
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{tournament.gameMode}</Text>
          </View>

          {/* Map Name */}
          <View style={styles.mapBadge}>
            <Text style={styles.mapBadgeText}>🗺️ {tournament.mapName}</Text>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              isCompleted
                ? styles.statusCompleted
                : isLive
                ? styles.statusLive
                : styles.statusOpen,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isCompleted
                  ? { backgroundColor: '#9CA3AF' }
                  : isLive
                  ? { backgroundColor: '#EF4444' }
                  : { backgroundColor: '#10B981' },
              ]}
            />
            <Text style={styles.statusText}>
              {isCompleted ? 'COMPLETED' : isLive ? 'LIVE NOW' : 'OPEN'}
            </Text>
          </View>
        </View>

        {/* Schedule Strip */}
        <View style={styles.scheduleStrip}>
          <Text style={styles.scheduleText}>
            📅 {tournament.matchDate} at {tournament.matchTime}
          </Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {tournament.title}
        </Text>

        {/* Prize Pool & Financial Highlights */}
        <View style={styles.statsGrid}>
          {/* Prize Pool */}
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PRIZE POOL</Text>
            <Text style={styles.prizeValue}>৳ {tournament.prizePool}</Text>
          </View>

          {/* Winner Prize */}
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>1ST WINNER</Text>
            <Text style={styles.winnerValue}>৳ {tournament.winnerPrize}</Text>
          </View>

          {/* Per Kill */}
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PER KILL</Text>
            <Text style={styles.perKillValue}>৳ {tournament.perKillPrize}</Text>
          </View>

          {/* Entry Fee */}
          <View style={[styles.statBox, styles.entryBox]}>
            <Text style={styles.statLabel}>ENTRY FEE</Text>
            <Text style={styles.entryValue}>
              {tournament.entryFee === 0 ? 'FREE' : `৳ ${tournament.entryFee}`}
            </Text>
          </View>
        </View>

        {/* Slot Progress Bar */}
        <View style={styles.slotsContainer}>
          <View style={styles.slotsHeader}>
            <Text style={styles.slotsLabel}>SLOTS FILLED</Text>
            <Text style={styles.slotsCount}>
              {joinedSlots}/{tournament.totalSlots} Players ({slotPercentage}%)
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${slotPercentage}%` },
                slotPercentage > 85 ? { backgroundColor: Colors.danger } : {},
              ]}
            />
          </View>
        </View>

        {/* Winner Announcement if Completed */}
        {isCompleted && tournament.winnerTeam && (
          <View style={styles.winnerBanner}>
            <Text style={styles.trophyIcon}>👑</Text>
            <Text style={styles.winnerText} numberOfLines={1}>
              Winner: {tournament.winnerTeam}
            </Text>
          </View>
        )}

        {/* Action Button */}
        {isJoined ? (
          <TouchableOpacity
            style={styles.roomCodeButton}
            onPress={() => onViewDetails(tournament)}
            activeOpacity={0.85}
          >
            <Text style={styles.roomCodeIcon}>🔑</Text>
            <Text style={styles.roomCodeButtonText}>VIEW ROOM ID & PASSWORD</Text>
          </TouchableOpacity>
        ) : isOpen ? (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoin(tournament)}
            activeOpacity={0.85}
          >
            <Text style={styles.joinButtonText}>
              JOIN NOW • {tournament.entryFee === 0 ? 'FREE' : `৳ ${tournament.entryFee}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => onViewDetails(tournament)}
            activeOpacity={0.85}
          >
            <Text style={styles.detailsButtonText}>VIEW MATCH DETAILS</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F1218',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 13, 17, 0.65)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 6,
  },
  modeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  mapBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBadgeText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
  },
  statusBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusOpen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  statusLive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  statusCompleted: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6B7280',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scheduleStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(19, 23, 32, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  scheduleText: {
    color: Colors.yellow,
    fontSize: 10.5,
    fontWeight: '700',
  },
  body: {
    padding: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 7.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  prizeValue: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  winnerValue: {
    color: Colors.yellow,
    fontSize: 12,
    fontWeight: '800',
  },
  perKillValue: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '800',
  },
  entryBox: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  entryValue: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  slotsContainer: {
    marginBottom: 10,
  },
  slotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  slotsLabel: {
    color: Colors.textMuted,
    fontSize: 8.5,
    fontWeight: '700',
  },
  slotsCount: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#1E2535',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
    gap: 6,
  },
  trophyIcon: {
    fontSize: 12,
  },
  winnerText: {
    color: Colors.gold,
    fontSize: 10.5,
    fontWeight: '800',
    flex: 1,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  roomCodeButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.cyan,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  roomCodeIcon: {
    fontSize: 13,
  },
  roomCodeButtonText: {
    color: Colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  detailsButton: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
});
