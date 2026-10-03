import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Wallet } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateLocalWallet: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const bootstrapAuth = async () => {
    try {
      await api.init();
      const savedToken = api.getToken();
      if (savedToken) {
        setToken(savedToken);
        const res = await api.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          if (res.data.user.wallet) {
            setWallet(res.data.user.wallet);
          }
        } else {
          // Fallback to locally cached user
          const cachedUser = await AsyncStorage.getItem('@ff_user');
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            setUser(parsed);
            if (parsed.wallet) setWallet(parsed.wallet);
          }
        }
      }
    } catch (e) {
      console.log('Bootstrap auth error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, pass);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.user.wallet) {
          setWallet(res.data.user.wallet);
        }
        if (res.data.token) {
          setToken(res.data.token);
        }
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.user.wallet) {
          setWallet(res.data.user.wallet);
        }
        if (res.data.token) {
          setToken(res.data.token);
        }
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setWallet(null);
      setToken(null);
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  const refreshProfile = async () => {
    if (!token && !api.getToken()) return;
    try {
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        if (res.data.user.wallet) {
          setWallet(res.data.user.wallet);
        }
        await AsyncStorage.setItem('@ff_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.log('Error refreshing profile:', e);
    }
  };

  const updateLocalWallet = (newBalance: number) => {
    if (wallet) {
      setWallet({ ...wallet, balance: newBalance });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
        updateLocalWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
