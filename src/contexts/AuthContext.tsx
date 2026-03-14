import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { BusinessType } from "@/data/businessTypes";
import { AUTH_USER_KEY, clearAuthTokens, getAccessToken } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { authApi } from "@/services/api";
import { useAppDispatch } from "@/store/hooks";
import { clearProfile, fetchProfile, setProfile } from "@/store/app.slice";

interface User {
  id: string;
  email: string;
  role: "admin" | "gym_owner";
  name: string;
  gymId?: string | null;
  currentPlanId?: string | null;
  countryCode?: string;
  phone?: string;
  platformType?: BusinessType | null;
  businessType?: BusinessType;
  onboardingComplete?: boolean;
  lastLoginAt?: string | null;
}

type ActionResult = {
  success: boolean;
  message?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<ActionResult>;
  signup: (
    name: string,
    email: string,
    countryCode: string,
    phone: string,
    password: string,
  ) => Promise<ActionResult>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (
    platformType: BusinessType,
    businessName: string,
    details?: {
      ownerName?: string;
      phone?: string;
      city?: string;
      address?: string;
      upiId?: string;
      displayName?: string;
    },
  ) => Promise<ActionResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const canUseStorage = () => typeof window !== "undefined";

const getSavedUser = (): User | null => {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const saveUser = (user: User | null) => {
  if (!canUseStorage()) return;
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const messageFromError = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(getSavedUser);
  const [isInitializing, setIsInitializing] = useState(Boolean(getAccessToken()));

  const setUserAndPersist = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    saveUser(nextUser);
    dispatch(setProfile(nextUser));
  }, [dispatch]);

  const refreshProfile = useCallback(async () => {
    const profile = await dispatch(fetchProfile()).unwrap();
    setUserAndPersist(profile);
  }, [dispatch, setUserAndPersist]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }

    refreshProfile()
      .catch(() => {
        clearAuthTokens();
        setUserAndPersist(null);
      })
      .finally(() => setIsInitializing(false));
  }, [refreshProfile, setUserAndPersist]);

  const login = useCallback(async (email: string, password: string): Promise<ActionResult> => {
    try {
      const nextUser = await authApi.login({ email, password });
      setUserAndPersist(nextUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: messageFromError(error) };
    }
  }, [setUserAndPersist]);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      countryCode: string,
      phone: string,
      password: string,
    ): Promise<ActionResult> => {
      try {
        const nextUser = await authApi.signup({ name, email, countryCode, phone, password });
        setUserAndPersist(nextUser);
        return { success: true };
      } catch (error) {
        return { success: false, message: messageFromError(error) };
      }
    },
    [setUserAndPersist],
  );

  const completeOnboarding = useCallback(
    async (
      platformType: BusinessType,
      businessName: string,
      details?: {
        ownerName?: string;
        phone?: string;
        city?: string;
        address?: string;
        upiId?: string;
        displayName?: string;
      },
    ): Promise<ActionResult> => {
      try {
        const nextUser = await authApi.onboarding({
          platformType,
          businessName,
          ownerName: details?.ownerName || user?.name || "",
          phone: details?.phone || user?.phone || "",
          city: details?.city,
          address: details?.address,
          upiId: details?.upiId,
          displayName: details?.displayName,
        });
        setUserAndPersist(nextUser);
        return { success: true };
      } catch (error) {
        return { success: false, message: messageFromError(error) };
      }
    },
    [setUserAndPersist, user?.name, user?.phone],
  );

  const logout = useCallback(() => {
    clearAuthTokens();
    setUserAndPersist(null);
    dispatch(clearProfile());
  }, [dispatch, setUserAndPersist]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        refreshProfile,
        completeOnboarding,
        isAuthenticated: Boolean(user && getAccessToken()),
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
