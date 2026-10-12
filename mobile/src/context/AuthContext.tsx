import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

export const DEMO_USER: UserProfile = {
  id: "usr-demo-01",
  name: "Alex Mercer",
  email: "demo@pulseband.io",
  role: "PATIENT",
  age: 29,
  gender: "Male",
  height_cm: 178,
  weight_kg: 72,
  resting_hr_bpm: 64,
  max_hr_bpm: 185,
  emergency_contact: {
    name: "Dr. Sarah Jenkins",
    phone: "+1 (555) 349-2810",
    relationship: "Physician / Caregiver",
    auto_notify: true
  }
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: () => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pulseband_user');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
      return DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pulseband_token') || 'demo-jwt-token-xyz';
    } catch {
      return 'demo-jwt-token-xyz';
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pulseband_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pulseband_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('pulseband_token', token);
    } else {
      localStorage.removeItem('pulseband_token');
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          ...DEMO_USER,
          id: data.user_id,
          name: data.name || email.split('@')[0],
          email: data.email
        };
        setUser(profile);
        setToken(data.access_token);
        return { success: true };
      }
    } catch {
      // Backend not running, accept demo credentials
    }

    if (email.toLowerCase() === "demo@pulseband.io" && pass === "pulseband123") {
      setUser(DEMO_USER);
      setToken("demo-jwt-token-xyz");
      return { success: true };
    }

    if (email.trim() && pass.length >= 4) {
      const genericUser: UserProfile = {
        ...DEMO_USER,
        id: "usr-" + Math.floor(Math.random() * 10000),
        name: email.split('@')[0].toUpperCase(),
        email: email
      };
      setUser(genericUser);
      setToken("custom-jwt-token");
      return { success: true };
    }

    return { success: false, error: "Invalid credentials. Use demo@pulseband.io / pulseband123 or any valid email." };
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          ...DEMO_USER,
          id: data.user_id,
          name: data.name,
          email: data.email
        };
        setUser(profile);
        setToken(data.access_token);
        return { success: true };
      }
    } catch {
      // Fallback
    }

    const newUser: UserProfile = {
      ...DEMO_USER,
      id: "usr-" + Date.now(),
      name,
      email
    };
    setUser(newUser);
    setToken("custom-token-" + Date.now());
    return { success: true };
  };

  const loginWithGoogle = async (googleEmail = "alex.mercer.health@gmail.com", googleName = "Alex Mercer") => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: "mock-google-id-token" })
      });
      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          ...DEMO_USER,
          id: String(data.user_id || "goog-usr-01"),
          name: data.name || googleName,
          email: data.email || googleEmail,
          auth_provider: "google"
        };
        setUser(profile);
        setToken(data.access_token || "goog-jwt-token");
        return { success: true };
      }
    } catch {
      // Backend not running or network fallback
    }

    const googleUser: UserProfile = {
      ...DEMO_USER,
      id: "goog-usr-01",
      name: googleName,
      email: googleEmail,
      auth_provider: "google"
    };
    setUser(googleUser);
    setToken("goog-oauth2-token-" + Date.now());
    return { success: true };
  };

  const quickDemoLogin = () => {
    setUser(DEMO_USER);
    setToken("demo-jwt-token-xyz");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pulseband_user');
    localStorage.removeItem('pulseband_token');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        quickDemoLogin,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};