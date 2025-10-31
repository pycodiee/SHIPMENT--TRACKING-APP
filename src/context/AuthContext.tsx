import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AppUser, UserRole } from '@/utils/firebaseApi';

type User = AppUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = authApi.onChange((u) => {
      setUser(u);
      if (u) localStorage.setItem('user', JSON.stringify(u));
      else localStorage.removeItem('user');
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const profile = await authApi.login(email, password);
    // Optional role enforcement during login
    if (role && profile.role !== role) {
      // Keep profile but allow UI to redirect by role
    }
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const profile = await authApi.signup(email, password, name, role);
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
