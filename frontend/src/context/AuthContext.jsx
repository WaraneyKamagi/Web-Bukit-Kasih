import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('bukit_kasih_token') || null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('bukit_kasih_user', JSON.stringify(user));
    else localStorage.removeItem('bukit_kasih_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('bukit_kasih_token', token);
    else localStorage.removeItem('bukit_kasih_token');
  }, [token]);

  const logout = useCallback(async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('bukit_kasih_user');
      localStorage.removeItem('bukit_kasih_token');
    }
  }, []);

  // Fetch profile when token changes
  useEffect(() => {
    if (!token) return;

    async function loadUserSession() {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Otorisasi gagal, membersihkan sesi:', err);
        logout();
      }
    }
    loadUserSession();
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('bukit_kasih_token', data.token);
      localStorage.setItem('bukit_kasih_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Koneksi ke server gagal' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const data = await authService.register({ name, email, password });
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: err.message || 'Registrasi gagal' };
    }
  }, []);

  const value = useMemo(() => ({
    user, token, login, logout, register
  }), [user, token, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
