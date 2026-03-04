import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserRole } from '@/data/mockData';
import type { BusinessType } from '@/data/businessTypes';

interface User {
  email: string;
  role: UserRole;
  name: string;
  gymId?: string;
  phone?: string;
  businessType?: BusinessType;
  businessName?: string;
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, phone: string, password: string) => boolean;
  logout: () => void;
  completeOnboarding: (businessType: BusinessType, businessName: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  'admin@gymflow.com': { email: 'admin@gymflow.com', password: 'admin123', role: 'admin', name: 'Admin User', onboardingComplete: true },
  'owner@gymflow.com': { email: 'owner@gymflow.com', password: 'owner123', role: 'gym_owner', name: 'Rahul Sharma', gymId: '1', businessType: 'gym', businessName: 'FitZone Gym', onboardingComplete: true },
  'yoga@gymflow.com': { email: 'yoga@gymflow.com', password: 'yoga123', role: 'gym_owner', name: 'Priya Patel', gymId: '2', businessType: 'yoga', businessName: 'Serene Yoga Studio', onboardingComplete: true },
  'dance@gymflow.com': { email: 'dance@gymflow.com', password: 'dance123', role: 'gym_owner', name: 'Ananya Joshi', gymId: '7', businessType: 'dance', businessName: 'Rhythm Dance Academy', onboardingComplete: true },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gymflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email: string, password: string) => {
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      localStorage.setItem('gymflow_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((name: string, email: string, phone: string, _password: string) => {
    if (MOCK_USERS[email]) return false;
    const newUser: User = {
      email,
      role: 'gym_owner',
      name,
      phone,
      gymId: String(Date.now()),
      onboardingComplete: false,
    };
    setUser(newUser);
    localStorage.setItem('gymflow_user', JSON.stringify(newUser));
    return true;
  }, []);

  const completeOnboarding = useCallback((businessType: BusinessType, businessName: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, businessType, businessName, onboardingComplete: true };
      localStorage.setItem('gymflow_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('gymflow_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, completeOnboarding, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
