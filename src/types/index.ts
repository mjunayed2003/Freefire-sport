export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'FINANCE_MANAGER' | 'TOURNAMENT_MANAGER' | 'MODERATOR';

export interface Wallet {
  id: string;
  balance: number;
  totalDeposited: number;
  totalWon: number;
  totalEntryFees: number;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  ffPlayerName: string;
  ffUid: string;
  mobileNumber: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  wallet?: Wallet;
}

export type GameMode = 'SOLO' | 'DUO' | 'SQUAD';
export type TournamentStatus = 'REGISTRATION_OPEN' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface Tournament {
  id: string;
  title: string;
  bannerImage: string;
  description: string;
  gameMode: GameMode;
  mapName: string;
  entryFee: number;
  prizePool: number;
  winnerPrize: number;
  runnerUpPrize: number;
  thirdPlacePrize: number;
  perKillPrize: number;
  totalSlots: number;
  remainingSlots: number;
  matchDate: string;
  matchTime: string;
  registrationDeadline: string;
  status: TournamentStatus;
  winnerTeam?: string | null;
  roomId?: string | null;
  roomPassword?: string | null;
  isRoomCredentialsPublished?: boolean;
  isUserJoined?: boolean;
  rules?: string;
  _count?: {
    participants: number;
  };
}

export interface DepositRequest {
  id: string;
  amount: number;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string | null;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export interface LeaderboardPlayer {
  id: string;
  rank: number;
  username: string;
  ffPlayerName: string;
  ffUid: string;
  totalWon: number;
  matchesPlayed?: number;
  kills?: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'IMPORTANT' | 'TOURNAMENT' | 'UPDATE' | 'MAINTENANCE' | 'WINNER_ANNOUNCEMENT';
  publishDate: string;
  isPinned: boolean;
}

export interface PublicSettings {
  site_name: string;
  bkash_number: string;
  support_whatsapp: string;
  support_telegram: string;
  youtube_live_url: string;
  facebook_live_url: string;
  notice_text: string;
  min_deposit?: string;
  max_deposit?: string;
}
