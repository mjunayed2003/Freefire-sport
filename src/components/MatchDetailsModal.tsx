import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Tournament } from '../types';

interface MatchDetailsModalProps {
  visible: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onJoinMatch: (t: Tournament) => void;
}

const getImageSource = (bannerUrl?: string) => {
  if (bannerUrl?.includes('image2')) return require('../assets/images/image2.png');
  if (bannerUrl?.includes('image3')) return require('../assets/images/image3.png');
  if (bannerUrl?.includes('image4')) return require('../assets/images/image4.png');
  return require('../assets/images/image.png');
};

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  visible,
  tournament,
  onClose,
  onJoinMatch,
}) => {
  const insets = useSafeAreaInsets();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!tournament) return null;

  const handleCopy = (field: string, text: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    Alert.alert('Copied! 📋', `${field} (${text}) copied to clipboard. Paste in Free Fire Custom Room!`);
  };

  const isJoined = tournament.isUserJoined;
  const hasCredentials = tournament.roomId && tournament.roomPassword;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTag}>TOURNAMENT BRIEFING</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {tournament.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Banner preview */}
            <View style={styles.bannerContainer}>
              <Image source={getImageSource(tournament.bannerImage)} style={styles.bannerImage} resizeMode="cover" />
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerBadgeRow}>
                <View style={styles.modeBadge}>
                  <Text style={styles.modeText}>{tournament.gameMode}</Text>
                </View>
                <View style={styles.mapBadge}>
                  <Text style={styles.mapText}>🗺️ {tournament.mapName}</Text>
                </View>
              </View>
            </View>

            {/* Room Credentials Card (High Priority if Registered) */}
            {isJoined ? (
              <View style={styles.credentialsBox}>
                <View style={styles.credentialsHeader}>
                  <Text style={styles.credentialsTitle}>🔑 CUSTOM ROOM CREDENTIALS</Text>
                  <View style={styles.liveIndicator}>
                    <Text style={styles.liveIndicatorText}>
                      {hasCredentials ? 'RELEASED 🟢' : 'RELEASING SOON ⏳'}
                    </Text>
                  </View>
                </View>

                {hasCredentials ? (
                  <View style={styles.credentialsGrid}>
                    {/* Room ID */}
                    <View style={styles.credRow}>
                      <View>
                        <Text style={styles.credLabel}>ROOM ID</Text>
                        <Text style={styles.credValue}>{tournament.roomId}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopy('Room ID', tournament.roomId!)}
                      >
                        <Text style={styles.copyBtnText}>
                          {copiedField === 'Room ID' ? 'COPIED ✓' : 'COPY 📋'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Room Password */}
                    <View style={styles.credRow}>
                      <View>
                        <Text style={styles.credLabel}>ROOM PASSWORD</Text>
                        <Text style={styles.credValue}>{tournament.roomPassword}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopy('Password', tournament.roomPassword!)}
                      >
                        <Text style={styles.copyBtnText}>
                          {copiedField === 'Password' ? 'COPIED ✓' : 'COPY 📋'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.credHint}>
                      👉 Open Free Fire ➔ Custom ➔ Join Room ➔ Enter Room ID & Password to take your slot!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.waitingCredentials}>
                    <Text style={styles.waitingText}>
                      Room ID & Password will be released 10-15 minutes before the match start time ({tournament.matchTime}). Keep this page open or check back shortly.
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            {/* Prize Pool Breakdown */}
            <Text style={styles.sectionTitle}>🏆 PRIZE DISTRIBUTION</Text>
            <View style={styles.prizeGrid}>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeRank}>🥇 1st Place</Text>
                <Text style={styles.prizeMoney}>৳ {tournament.winnerPrize}</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeRank}>🥈 2nd Place</Text>
                <Text style={styles.prizeMoney}>৳ {tournament.runnerUpPrize}</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeRank}>🥉 3rd Place</Text>
                <Text style={styles.prizeMoney}>৳ {tournament.thirdPlacePrize}</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeRank}>🎯 Per Kill</Text>
                <Text style={styles.killMoney}>৳ {tournament.perKillPrize}</Text>
              </View>
            </View>

            {/* Match Schedule & Rules */}
            <Text style={styles.sectionTitle}>📜 MATCH RULES & GUIDELINES</Text>
            <View style={styles.rulesBox}>
              <Text style={styles.ruleItem}>• Level 50+ Free Fire account required for verified participation.</Text>
              <Text style={styles.ruleItem}>• Strictly mobile devices only. PC Emulators are prohibited.</Text>
              <Text style={styles.ruleItem}>• Teaming up with opponents results in permanent ban and zero prize.</Text>
              <Text style={styles.ruleItem}>• Take a screenshot of your match result and kill count for instant verification.</Text>
              <Text style={styles.ruleItem}>• Prize money is automatically credited to your in-app wallet within 15 minutes of match conclusion.</Text>
            </View>

            {/* Action Button */}
            {!isJoined && tournament.status === 'REGISTRATION_OPEN' && (
              <TouchableOpacity
                style={styles.joinActionBtn}
                onPress={() => {
                  onClose();
                  onJoinMatch(tournament);
                }}
              >
                <Text style={styles.joinActionText}>
                  JOIN TOURNAMENT (৳ {tournament.entryFee === 0 ? 'FREE' : tournament.entryFee})
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
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
  bannerContainer: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
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
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 13, 17, 0.65)',
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  modeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
  mapBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  credentialsBox: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: Colors.cyan,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  credentialsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  credentialsTitle: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveIndicatorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  credentialsGrid: {
    gap: 8,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  credLabel: {
    color: Colors.textMuted,
    fontSize: 8.5,
    fontWeight: '800',
  },
  credValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  copyBtn: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#0B0D11',
    fontSize: 10.5,
    fontWeight: '900',
  },
  credHint: {
    color: Colors.yellow,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 4,
  },
  waitingCredentials: {
    padding: 8,
  },
  waitingText: {
    color: Colors.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionTitle: {
    color: Colors.yellow,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  prizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  prizeItem: {
    width: '48%',
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  prizeRank: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  prizeMoney: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  killMoney: {
    color: Colors.cyan,
    fontSize: 14,
    fontWeight: '900',
  },
  rulesBox: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  ruleItem: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  joinActionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
