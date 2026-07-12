import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser } from '@/types/auth';

interface AuthStore extends AuthState {
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Tokens live in localStorage (not in the persisted zustand slice), so seed the
// initial in-memory state from there. This keeps the user signed in across a
// full page refresh — ProtectedRoute reads accessToken from this store.
const initialToken =
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const initialRefresh =
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: initialToken,
      refreshToken: initialRefresh,
      isAuthenticated: Boolean(initialToken),
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
