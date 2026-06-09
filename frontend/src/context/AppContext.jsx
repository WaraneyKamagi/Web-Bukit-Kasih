/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

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
  const mapReviews = (data) => data.map(r => ({ ...r, id: r.ID || r.id }));
  const mapInquiries = (data) => data.map(i => ({ ...i, id: i.ID || i.id }));

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

  // Load active announcement
  useEffect(() => {
    fetch('/api/announcements/active')
      .then(res => res.json())
      .then(data => {
        setAnnouncement(data.announcement || null);
      })
      .catch(err => console.error('Gagal mengambil pengumuman:', err));
  }, []);

  // Load reviews
  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(mapReviews(data));
        }
      })
      .catch(err => console.error('Gagal mengambil ulasan:', err));
  }, []);

  // Load profile and inquiries when token changes
  useEffect(() => {
    if (!token) {
      setInquiries([]);
      return;
    }

    // Verify token and fetch profile
    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Sesi kedaluwarsa');
      }
      return res.json();
    })
    .then(profile => {
      setUser(profile);
      // Fetch inquiries
      const url = profile.role === 'Pengelola' 
        ? '/api/inquiries' 
        : `/api/inquiries/user/${profile.email}`;
      
      return fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    })
    .then(res => {
      if (res && res.ok) {
        return res.json();
      }
      return [];
    })
    .then(data => {
      if (Array.isArray(data)) {
        setInquiries(mapInquiries(data));
      }
    })
    .catch(err => {
      console.error('Otorisasi gagal, membersihkan sesi:', err);
      logout();
    });
  }, [token]);

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
      return { success: false, error: 'Koneksi ke server gagal' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bukit_kasih_user');
    localStorage.removeItem('bukit_kasih_token');
    setInquiries([]);
  };

  // Announcement Operations
  const publishAnnouncement = (text) => {
    fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memperbarui pengumuman');
      return res.json();
    })
    .then(data => {
      setAnnouncement(data.announcement || null);
    })
    .catch(err => console.error(err));
  };

  // Review Operations
  const addReview = (activityId, author, rating, text) => {
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId, author, rating, text })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal menambahkan ulasan');
      return res.json();
    })
    .then(newReview => {
      setReviews(prev => [ { ...newReview, id: newReview.ID }, ...prev]);
    })
    .catch(err => console.error(err));
  };

  const deleteReview = (reviewId) => {
    fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal menghapus ulasan');
      setReviews(prev => prev.filter(r => r.ID !== reviewId && r.id !== reviewId));
    })
    .catch(err => console.error(err));
  };

  // Inquiry Operations
  const addInquiry = (name, email, message) => {
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal mengirim pesan');
      return res.json();
    })
    .then(newInq => {
      setInquiries(prev => [ { ...newInq, id: newInq.ID }, ...prev]);
    })
    .catch(err => console.error(err));
  };

  const replyInquiry = (inquiryId, replyText) => {
    fetch(`/api/inquiries/${inquiryId}/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reply: replyText })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal mengirim balasan');
      return res.json();
    })
    .then(updatedInq => {
      setInquiries(prev => prev.map(inq => {
        if (inq.id === inquiryId || inq.ID === inquiryId) {
          return { ...updatedInq, id: updatedInq.ID };
        }
        return inq;
      }));
    })
    .catch(err => console.error(err));
  };

  return (
    <AppContext.Provider value={{
      user,
      announcement,
      inquiries,
      reviews,
      login,
      logout,
      publishAnnouncement,
      addReview,
      deleteReview,
      addInquiry,
      replyInquiry
    }}>
      {children}
    </AppContext.Provider>
  );
}
