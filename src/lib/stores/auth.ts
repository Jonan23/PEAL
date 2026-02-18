import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { api, authApi } from "$lib/api";
import type { User } from "$lib/api/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function createAuthStore() {
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);

  function loadUserFromStorage(): User | null {
    if (!browser) return null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  function setUser(user: User | null) {
    if (browser && user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else if (browser && !user) {
      localStorage.removeItem("user");
    }
    update((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }));
  }

  return {
    subscribe,

    async initialize() {
      const storedUser = loadUserFromStorage();
      const accessToken = browser ? localStorage.getItem("accessToken") : null;

      if (accessToken && storedUser) {
        try {
          const response = await authApi.getMe();
          setUser(response.user);
        } catch {
          this.logout();
        }
      } else {
        update((state) => ({ ...state, isLoading: false }));
      }
    },

    async login(email: string, password: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await authApi.login(email, password);
        api.setAuthTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        update((state) => ({ ...state, isLoading: false, error: message }));
        return { success: false, error: message };
      }
    },

    async register(data: {
      email: string;
      password: string;
      name: string;
      role: string;
      skills?: string[];
      bio?: string;
      location?: string;
    }) {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await authApi.register(data);
        api.setAuthTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Registration failed";
        update((state) => ({ ...state, isLoading: false, error: message }));
        return { success: false, error: message };
      }
    },

    async logout() {
      try {
        await authApi.logout();
      } catch {
        // Ignore logout errors
      }
      api.clearAuthTokens();
      setUser(null);
    },

    async refreshUser() {
      try {
        const response = await authApi.getMe();
        setUser(response.user);
        return response.user;
      } catch {
        this.logout();
        return null;
      }
    },

    setError(error: string | null) {
      update((state) => ({ ...state, error }));
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const authStore = createAuthStore();
