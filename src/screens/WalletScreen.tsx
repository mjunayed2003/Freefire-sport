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
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DepositRequest, WalletTransaction } from '../types';

interface WalletScreenProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAuth: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAuth,
}) => {
  const { user, wallet, isAuthenticated, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposits' | 'transactions'>('deposits');
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadWalletData();
    }
  }, [isAuthenticated, activeTab]);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      await refreshProfile();
      if (activeTab === 'deposits') {
        const res = await api.getMyDeposits();
        if (res.success && res.data?.deposits) {
          setDeposits(res.data.deposits);
        }
      } else {
        const res = await api.getTransactions();
        if (res.success && res.data?.transactions) {
          setTransactions(res.data.transactions);
        }
      }
    } catch (e) {
      console.log('Error loading wallet data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authPromptContainer}>
        <Text style={styles.authPromptIcon}>🔐</Text>
        <Text style={styles.authPromptTitle}>Sign in to Access Wallet</Text>
        <Text style={styles.authPromptDesc}>
          Deposit instantly via bKash/Nagad, check your prize balance, and withdraw winnings directly to your mobile banking account.
        </Text>
        <TouchableOpacity style={styles.authLoginBtn} onPress={onOpenAuth} activeOpacity={0.85}>
          <Text style={styles.authLoginBtnText}>LOGIN / REGISTER NOW</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const balance = wallet?.balance ?? 0;
  const totalDeposited = wallet?.totalDeposited ?? 0;
  const totalWon = wallet?.totalWon ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Glowing Cyber Wallet Card */}
      <View style={styles.walletCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardBrandRow}>
            <Text style={styles.flameEmoji}>🔥</Text>
            <Text style={styles.cardBrandText}>FREE FIRE ESPORTS WALLET</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>INSTANT 24/7 🟢</Text>
          </View>
        </View>

        <Text style={styles.balanceTitle}>AVAILABLE BALANCE</Text>
        <Text style={styles.balanceValue}>৳ {balance.toFixed(2)}</Text>

        {/* Stats Row */}
        <View style={styles.cardStatsRow}>
          <View style={styles.cardStatBox}>
            <Text style={styles.cardStatLabel}>TOTAL WON</Text>
            <Text style={styles.cardStatWon}>৳ {totalWon.toFixed(2)}</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStatBox}>
            <Text style={styles.cardStatLabel}>TOTAL DEPOSITED</Text>
            <Text style={styles.cardStatDep}>৳ {totalDeposited.toFixed(2)}</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity style={styles.depositBtn} onPress={onOpenDeposit} activeOpacity={0.85}>
            <Text style={styles.btnEmoji}>💳</Text>
            <Text style={styles.depositBtnText}>ADD MONEY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawBtn} onPress={onOpenWithdraw} activeOpacity={0.85}>
            <Text style={styles.btnEmoji}>💸</Text>
            <Text style={styles.withdrawBtnText}>WITHDRAW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* History Tabs */}
      <View style={styles.historyTabsRow}>
        <TouchableOpacity
          style={[styles.historyTab, activeTab === 'deposits' && styles.historyTabActive]}
          onPress={() => setActiveTab('deposits')}
        >
          <Text style={[styles.historyTabText, activeTab === 'deposits' && styles.historyTabTextActive]}>
            DEPOSIT REQUESTS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.historyTab, activeTab === 'transactions' && styles.historyTabActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.historyTabText, activeTab === 'transactions' && styles.historyTabTextActive]}>
            TRANSACTIONS LOG
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Body */}
      <View style={styles.historyContent}>
        {isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loaderText}>Fetching history...</Text>
          </View>
        ) : activeTab === 'deposits' ? (
          deposits.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No Deposit Requests</Text>
              <Text style={styles.emptyDesc}>When you submit bKash or Nagad deposits, their verification status will show here.</Text>
            </View>
          ) : (
            deposits.map((dep) => {
              const isApproved = dep.status === 'APPROVED';
              const isRejected = dep.status === 'REJECTED';
              return (
                <View key={dep.id} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View style={styles.methodPill}>
                      <Text style={styles.methodPillText}>{dep.paymentMethod}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        isApproved
                          ? styles.statusApproved
                          : isRejected
                          ? styles.statusRejected
                          : styles.statusPending,
                      ]}
                    >
                      <Text style={styles.statusPillText}>{dep.status}</Text>
                    </View>
                  </View>

                  <View style={styles.historyRow}>
                    <Text style={styles.historyAmount}>৳ {dep.amount}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(dep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <Text style={styles.trxIdText}>TrxID: {dep.transactionId}</Text>
                  {dep.adminNotes ? (
                    <Text style={styles.notesText}>Note: {dep.adminNotes}</Text>
                  ) : null}
                </View>
              );
            })
          )
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyDesc}>Entry fee deductions and prize winnings will be logged here with receipts.</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.historyCard}>
              <View style={styles.historyCardHeader}>
                <Text style={styles.txType}>{tx.type}</Text>
                <Text
                  style={[
                    styles.txAmount,
                    tx.amount > 0 ? styles.txAmountPositive : styles.txAmountNegative,
                  ]}
                >
                  {tx.amount > 0 ? `+৳ ${tx.amount}` : `-৳ ${Math.abs(tx.amount)}`}
                </Text>
              </View>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txDate}>
                {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))
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
  authPromptContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  authPromptIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  authPromptTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  authPromptDesc: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  authLoginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  authLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  walletCard: {
    backgroundColor: '#151922',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 90, 0, 0.4)',
    borderRadius: 18,
    padding: 16,
    margin: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flameEmoji: {
    fontSize: 16,
  },
  cardBrandText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '800',
  },
  balanceTitle: {
    color: Colors.textMuted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginVertical: 4,
  },
  cardStatsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  cardStatBox: {
    flex: 1,
  },
  cardStatLabel: {
    color: Colors.textMuted,
    fontSize: 7.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardStatWon: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  cardStatDep: {
    color: Colors.yellow,
    fontSize: 14,
    fontWeight: '900',
  },
  cardStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  depositBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  withdrawBtn: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  withdrawBtnText: {
    color: Colors.yellow,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnEmoji: {
    fontSize: 14,
  },
  historyTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  historyTab: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  historyTabActive: {
    backgroundColor: 'rgba(255, 90, 0, 0.15)',
    borderColor: Colors.primary,
  },
  historyTabText: {
    color: Colors.textMuted,
    fontSize: 10.5,
    fontWeight: '800',
  },
  historyTabTextActive: {
    color: Colors.primary,
  },
  historyContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  loaderBox: {
    padding: 30,
    alignItems: 'center',
  },
  loaderText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  emptyBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
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
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  methodPill: {
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  methodPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  historyAmount: {
    color: Colors.yellow,
    fontSize: 16,
    fontWeight: '900',
  },
  historyDate: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  trxIdText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  notesText: {
    color: Colors.danger,
    fontSize: 9.5,
    marginTop: 4,
  },
  txType: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  txAmountPositive: {
    color: Colors.success,
  },
  txAmountNegative: {
    color: Colors.danger,
  },
  txDesc: {
    color: '#E2E8F0',
    fontSize: 11.5,
    marginVertical: 4,
  },
  txDate: {
    color: Colors.textMuted,
    fontSize: 9.5,
  },
});
