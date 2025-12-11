import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Set user data
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },

      // Login
      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user } = response.data;
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          return { success: false, message };
        }
      },

      // Register
      register: async (userData) => {
        try {
          const response = await api.post('/auth/register', userData);
          const { user } = response.data;
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          return { success: false, message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Get current user
      getMe: async () => {
        try {
          set({ isLoading: true });
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        try {
          const response = await api.put('/users/profile', profileData);
          set({ user: response.data.user });
          return { success: true, message: response.data.message };
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          return { success: false, message };
        }
      },

      // Check if username is available
      checkUsername: async (username) => {
        try {
          const response = await api.get(`/auth/check-username/${username}`);
          return response.data.available;
        } catch (error) {
          return false;
        }
      },

      // Check if email is available
      checkEmail: async (email) => {
        try {
          const response = await api.get(`/auth/check-email/${email}`);
          return response.data.available;
        } catch (error) {
          return false;
        }
      },

      // Initialize auth state
      initialize: async () => {
        const state = get();
        if (state.user) {
          await state.getMe();
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'thinkify-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
