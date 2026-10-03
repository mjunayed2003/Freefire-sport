import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';

import { Colors } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { BottomTabBar, TabType } from './src/components/BottomTabBar';

import { HomeScreen } from './src/screens/HomeScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

import { JoinModal } from './src/components/JoinModal';
import { DepositModal } from './src/components/DepositModal';
import { WithdrawModal } from './src/components/WithdrawModal';
import { SupportChatModal } from './src/components/SupportChatModal';
import { AuthModal } from './src/components/AuthModal';
import { MatchDetailsModal } from './src/components/MatchDetailsModal';
import { Tournament } from './src/types';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modal states
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [matchDetailsVisible, setMatchDetailsVisible] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const handleOpenJoin = (tournament: Tournament) => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }
    setSelectedTournament(tournament);
    setJoinModalVisible(true);
  };

  const handleOpenDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setMatchDetailsVisible(true);
  };

  const handleOpenDeposit = () => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }
    setDepositModalVisible(true);
  };

  const handleOpenWithdraw = () => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }
    setWithdrawModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* Global Header */}
      <Header
        onOpenWallet={handleOpenDeposit}
        onOpenAuth={() => setAuthModalVisible(true)}
        onOpenSupport={() => setSupportModalVisible(true)}
      />

      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && (
          <HomeScreen
            onSelectTab={setCurrentTab}
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenSupport={() => setSupportModalVisible(true)}
            onJoinMatch={handleOpenJoin}
            onViewMatchDetails={handleOpenDetails}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesScreen
            onJoinMatch={handleOpenJoin}
            onViewMatchDetails={handleOpenDetails}
          />
        )}

        {currentTab === 'wallet' && (
          <WalletScreen
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenAuth={() => setAuthModalVisible(true)}
          />
        )}

        {currentTab === 'leaderboard' && <LeaderboardScreen />}

        {currentTab === 'profile' && (
          <ProfileScreen
            onOpenAuth={() => setAuthModalVisible(true)}
            onOpenSupport={() => setSupportModalVisible(true)}
          />
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <BottomTabBar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Global Modals */}
      <JoinModal
        visible={joinModalVisible}
        tournament={selectedTournament}
        onClose={() => setJoinModalVisible(false)}
        onSuccess={() => {
          setJoinModalVisible(false);
          setCurrentTab('matches');
        }}
        onOpenDeposit={() => {
          setJoinModalVisible(false);
          setDepositModalVisible(true);
        }}
      />

      <DepositModal
        visible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        onSuccess={() => {
          setDepositModalVisible(false);
          setCurrentTab('wallet');
        }}
      />

      <WithdrawModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        onSuccess={() => {
          setWithdrawModalVisible(false);
          setCurrentTab('wallet');
        }}
      />

      <SupportChatModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
      />

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={() => setAuthModalVisible(false)}
      />

      <MatchDetailsModal
        visible={matchDetailsVisible}
        tournament={selectedTournament}
        onClose={() => setMatchDetailsVisible(false)}
        onJoinMatch={handleOpenJoin}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={styles.root}>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
