/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Session State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('bukit_kasih_token') || null;
  });

  // 2. Announcement State
  const [announcement, setAnnouncement] = useState(null);

  // 3. Inquiries State
  const [inquiries, setInquiries] = useState([]);

  // 4. Reviews State
  const [reviews, setReviews] = useState([]);

  // Helper to map GORM ID to js id
  const mapReviews = (data) => data.map((r) => ({ ...r, id: r.ID || r.id }));
  const mapInquiries = (data) => data.map((i) => ({ ...i, id: i.ID || i.id }));

  // Synchronizers to LocalStorage for session
  useEffect(() => {
    if (user) {
      localStorage.setItem('bukit_kasih_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bukit_kasih_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bukit_kasih_token', token);
    } else {
      localStorage.removeItem('bukit_kasih_token');
    }
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bukit_kasih_user');
    localStorage.removeItem('bukit_kasih_token');
    setInquiries([]);
  }, []);

  // Load active announcement
  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch('/api/announcements/active');
        if (res.ok) {
          const data = await res.json();
          setAnnouncement(data.announcement || null);
        }
      } catch (err) {
        console.error('Gagal mengambil pengumuman:', err);
      }
    }
    fetchAnnouncement();
  }, []);

  // Load reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setReviews(mapReviews(data));
          }
        }
      } catch (err) {
        console.error('Gagal mengambil ulasan:', err);
      }
    }
    fetchReviews();
  }, []);

  // Load profile and inquiries when token changes
  useEffect(() => {
    if (!token) {
      setInquiries([]);
      return;
    }

    async function loadUserSession() {
      try {
        const profileRes = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileRes.ok) {
          throw new Error('Sesi kedaluwarsa');
        }

        const profile = await profileRes.json();
        setUser(profile);

        const url = profile.role === 'Pengelola'
          ? '/api/inquiries'
          : `/api/inquiries/user/${profile.email}`;

        const inquiriesRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (inquiriesRes.ok) {
          const data = await inquiriesRes.json();
          if (Array.isArray(data)) {
            setInquiries(mapInquiries(data));
          }
        }
      } catch (err) {
        console.error('Otorisasi gagal, membersihkan sesi:', err);
        logout();
      }
    }

    loadUserSession();
  }, [token, logout]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Email atau password salah!' };
      }
      localStorage.setItem('bukit_kasih_token', data.token);
      localStorage.setItem('bukit_kasih_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Koneksi ke server gagal' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registrasi gagal' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Koneksi ke server gagal' };
    }
  };

  // Announcement Operations
  const publishAnnouncement = async (text) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Gagal memperbarui pengumuman');
      const data = await res.json();
      setAnnouncement(data.announcement || null);
    } catch (err) {
      console.error('Publish announcement error:', err);
    }
  };

  // Review Operations
  const addReview = async (activityId, author, rating, text) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, author, rating, text })
      });
      if (!res.ok) throw new Error('Gagal menambahkan ulasan');
      const newReview = await res.json();
      setReviews((prev) => [{ ...newReview, id: newReview.ID || newReview.id }, ...prev]);
    } catch (err) {
      console.error('Add review error:', err);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal menghapus ulasan');
      setReviews((prev) => prev.filter((r) => r.ID !== reviewId && r.id !== reviewId));
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  // Inquiry Operations
  const addInquiry = async (name, email, message) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (!res.ok) throw new Error('Gagal mengirim pesan');
      const newInq = await res.json();
      setInquiries((prev) => [{ ...newInq, id: newInq.ID || newInq.id }, ...prev]);
    } catch (err) {
      console.error('Add inquiry error:', err);
    }
  };

  const replyInquiry = async (inquiryId, replyText) => {
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      if (!res.ok) throw new Error('Gagal mengirim balasan');
      const updatedInq = await res.json();
      setInquiries((prev) =>
        prev.map((inq) => {
          if (inq.id === inquiryId || inq.ID === inquiryId) {
            return { ...updatedInq, id: updatedInq.ID || updatedInq.id };
          }
          return inq;
        })
      );
    } catch (err) {
      console.error('Reply inquiry error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        announcement,
        inquiries,
        reviews,
        login,
        logout,
        register,
        publishAnnouncement,
        addReview,
        deleteReview,
        addInquiry,
        replyInquiry
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
