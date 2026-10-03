import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tournament, User, DepositRequest, WalletTransaction, LeaderboardPlayer, Notice, PublicSettings } from '../types';

// Default host based on environment
// Physical phone uses localhost:3000 via adb reverse tcp:3000 tcp:3000
const DEFAULT_HOST = 'http://localhost:3000';

const STORAGE_KEYS = {
  TOKEN: '@ff_token',
  USER: '@ff_user',
  BASE_URL: '@ff_base_url',
};

class ApiService {
  private baseUrl: string = DEFAULT_HOST;
  private token: string | null = null;

  constructor() {
    this.init();
  }

  async init() {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEYS.BASE_URL);
      if (savedUrl) {
        this.baseUrl = savedUrl;
      }
      this.token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (e) {
      console.log('Error initializing API service:', e);
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async setBaseUrl(url: string) {
    this.baseUrl = url.trim().replace(/\/$/, '');
    await AsyncStorage.setItem(STORAGE_KEYS.BASE_URL, this.baseUrl);
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: json.error || json.message || `Request failed with status ${response.status}`,
        };
      }

      return { success: true, data: json };
    } catch (error: any) {
      console.warn(`API Error [${endpoint}]:`, error.message);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Connection timed out. Check backend server.' : error.message || 'Network request failed',
      };
    }
  }

  // Auth Endpoints
  async login(identifier: string, password: string) {
    const res = await this.request<{ success: boolean; token?: string; user?: User; error?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername: identifier, password }),
    });

    if (res.success && res.data?.token) {
      await this.setToken(res.data.token);
      if (res.data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
      }
    }
    return res;
  }

  async register(userData: {
    fullName: string;
    username: string;
    email: string;
    ffPlayerName: string;
    ffUid: string;
    mobileNumber: string;
    password: string;
  }) {
    const res = await this.request<{ success: boolean; token?: string; user?: User; error?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (res.success && res.data?.token) {
      await this.setToken(res.data.token);
      if (res.data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
      }
    }
    return res;
  }

  async getMe() {
    return await this.request<{ user: User }>('/api/auth/me');
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    await this.setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Tournaments Endpoints
  async getTournaments(params?: { mode?: string; status?: string; filter?: string }) {
    const query = new URLSearchParams();
    if (params?.mode && params.mode !== 'ALL') query.append('mode', params.mode);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.filter) query.append('filter', params.filter);

    const queryString = query.toString();
    const endpoint = `/api/tournaments${queryString ? `?${queryString}` : ''}`;
    return await this.request<{ tournaments: Tournament[] }>(endpoint);
  }

  async getTournamentDetails(id: string) {
    return await this.request<{ tournament: Tournament }>(`/api/tournaments/${id}`);
  }

  async joinTournament(id: string, teamData: {
    teamName?: string;
    player1Name: string;
    player1Uid: string;
    player2Name?: string;
    player2Uid?: string;
    player3Name?: string;
    player3Uid?: string;
    player4Name?: string;
    player4Uid?: string;
  }) {
    return await this.request<{ success: boolean; message?: string }>(`/api/tournaments/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  // Wallet & Deposits
  async submitDeposit(data: { amount: number; paymentMethod: string; senderNumber: string; transactionId: string }) {
    return await this.request<{ success: boolean; message?: string }>('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyDeposits() {
    return await this.request<{ deposits: DepositRequest[] }>('/api/wallet/my-deposits');
  }

  async submitWithdraw(data: { amount: number; paymentMethod: string; accountNumber: string }) {
    return await this.request<{ success: boolean; message?: string }>('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(type?: string) {
    const endpoint = `/api/wallet/transactions${type && type !== 'ALL' ? `?type=${type}` : ''}`;
    return await this.request<{ transactions: WalletTransaction[] }>(endpoint);
  }

  // Leaderboard & Settings & Notices
  async getLeaderboard(filter: 'all' | 'weekly' | 'monthly' = 'all') {
    return await this.request<{ leaderboard: LeaderboardPlayer[] }>(`/api/leaderboard?filter=${filter}`);
  }

  async getNotices() {
    return await this.request<{ notices: Notice[] }>('/api/notices');
  }

  async getSettings() {
    return await this.request<{ settings: PublicSettings }>('/api/settings');
  }

  // Live Chat Support
  async getChatMessages(sessionId: string) {
    return await this.request<{ messages: any[] }>(`/api/chat?sessionId=${sessionId}`);
  }

  async sendChatMessage(sessionId: string, message: string, senderName?: string) {
    return await this.request<{ reply?: string; messages?: any[] }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, senderName }),
    });
  }
}

export const api = new ApiService();
