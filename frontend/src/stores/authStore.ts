import { create } from 'zustand';
import { apiClient } from '../lib/api/client';

export type UserRole = 'STUDENT_BUYER' | 'STUDENT_SELLER' | 'COMMERCIAL_BOOKSTORE' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  role: UserRole;
  status: string;
  isStudentVerified: boolean;
  collegeId?: string | null;
  course?: string | null;
  semester?: number | null;
  college?: { id: string; name: string; code: string; city?: string; state?: string } | null;
  sellerId?: string | null;
  sellerStatus?: string | null;
}

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    collegeId?: string | null;
    course?: string | null;
    semester?: number | null;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  fetchMe: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const res: any = await apiClient.get('/auth/me');
      if (res.data?.user) {
        set({
          user: res.data.user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err: any) {
      localStorage.removeItem('access_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res: any = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;
      localStorage.setItem('access_token', accessToken);
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Email or password is incorrect.',
        isLoading: false,
        isAuthenticated: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const res: any = await apiClient.post('/auth/register', data);
      const { user, accessToken } = res.data;
      localStorage.setItem('access_token', accessToken);
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Could not create account. Please check your information and try again.',
        isLoading: false,
        isAuthenticated: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
}));
