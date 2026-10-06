import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('kamlesh_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('kamlesh_admin_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('kamlesh_admin_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('kamlesh_admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        loading
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
