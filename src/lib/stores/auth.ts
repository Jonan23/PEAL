import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { api, authApi } from "$lib/api";
import type { User } from "$lib/api/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasSeenOnboarding: boolean;
}

function createAuthStore() {
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    hasSeenOnboarding: false,
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);
  let initialized = false;
  let initializationPromise: Promise<void> | null = null;

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

  function hasSeenOnboarding(): boolean {
    if (!browser) return false;
    return localStorage.getItem("hasSeenOnboarding") === "true";
  }

  function markOnboardingSeen() {
    if (browser) {
      localStorage.setItem("hasSeenOnboarding", "true");
    }
    update((state) => ({ ...state, hasSeenOnboarding: true }));
  }

  return {
    subscribe,

    async initialize() {
      if (initialized) {
        return;
      }

      if (initializationPromise) {
        await initializationPromise;
        return;
      }

      initializationPromise = (async () => {
        const accessToken = browser
          ? localStorage.getItem("accessToken")
          : null;
        const refreshToken = browser
          ? localStorage.getItem("refreshToken")
          : null;
        const onboardingSeen = hasSeenOnboarding();

        if (accessToken && refreshToken) {
          try {
            const response = await authApi.getMe();
            setUser(response.user);
            update((state) => ({
              ...state,
              hasSeenOnboarding: onboardingSeen,
            }));
          } catch {
            this.logout();
          }
        } else if (accessToken && !refreshToken) {
          api.clearAuthTokens();
          setUser(null);
          update((state) => ({
            ...state,
            hasSeenOnboarding: onboardingSeen,
          }));
        } else {
          update((state) => ({
            ...state,
            isLoading: false,
            hasSeenOnboarding: onboardingSeen,
          }));
        }
        initialized = true;
      })();

      try {
        await initializationPromise;
      } finally {
        initializationPromise = null;
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

    async googleAuth(idToken: string, role?: "woman" | "sponsor") {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await authApi.google(idToken, role);
        api.setAuthTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Google sign-in failed";
        update((state) => ({ ...state, isLoading: false, error: message }));
        return { success: false, error: message };
      }
    },

    async logout() {
      try {
        const refreshToken = browser
          ? localStorage.getItem("refreshToken") || undefined
          : undefined;
        await authApi.logout(refreshToken);
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

    markOnboardingSeen,
  };
}

export const authStore = createAuthStore();
