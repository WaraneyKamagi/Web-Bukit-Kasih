import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';

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

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bukit_kasih_user');
    localStorage.removeItem('bukit_kasih_token');
  }, []);

  // Fetch profile when token changes
  useEffect(() => {
    if (!token) return;

    async function loadUserSession() {
      try {
        const profileRes = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Sesi kedaluwarsa');
        const profile = await profileRes.json();
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Email atau password salah!' };
      localStorage.setItem('bukit_kasih_token', data.token);
      localStorage.setItem('bukit_kasih_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Koneksi ke server gagal' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registrasi gagal' };
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Koneksi ke server gagal' };
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
