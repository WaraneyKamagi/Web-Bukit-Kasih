/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialInquiries = [
  {
    id: 'inq1',
    name: 'Budi Santoso',
    email: 'wisatawan@gmail.com',
    message: 'Apakah tangga seribu aman dinaiki anak-anak berusia 7 tahun?',
    status: 'Dijawab',
    reply: 'Secara umum aman jika dalam pengawasan ketat orang tua, namun disarankan untuk berhenti beristirahat di beberapa shelter pos yang tersedia. Jangan dipaksakan mendaki sampai puncak jika anak kelelahan.',
    date: '2026-06-08'
  },
  {
    id: 'inq2',
    name: 'Siti Rahma',
    email: 'siti@yahoo.com',
    message: 'Berapa harga sewa pakaian adat Minahasa dan bagaimana memesan jasa foto cetak kilat?',
    status: 'Menunggu Balasan',
    reply: null,
    date: '2026-06-09'
  }
];

const initialReviews = [
  {
    id: 'rev1',
    activityId: 'act1',
    author: 'Budi Santoso',
    rating: 5,
    text: 'Melihat lima tempat ibadah berdampingan di puncak bukit memberikan kedamaian spiritual yang luar biasa.',
    date: '2026-06-05'
  },
  {
    id: 'rev2',
    activityId: 'act3',
    author: 'Christian W.',
    rating: 4,
    text: 'Sangat menikmati kolam terapi air belerang setelah mendaki tangga seribu. Kaki jadi rileks kembali.',
    date: '2026-06-07'
  }
];

export function AppProvider({ children }) {
  // 1. Session State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_user');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Announcement State
  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem('bukit_kasih_announcement') || null;
  });

  // 3. Inquiries State
  const [inquiries, setInquiries] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_inquiries');
    return saved ? JSON.parse(saved) : initialInquiries;
  });

  // 4. Reviews State
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  // Synchronizers to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('bukit_kasih_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bukit_kasih_user');
    }
  }, [user]);

  useEffect(() => {
    if (announcement) {
      localStorage.setItem('bukit_kasih_announcement', announcement);
    } else {
      localStorage.removeItem('bukit_kasih_announcement');
    }
  }, [announcement]);

  useEffect(() => {
    localStorage.setItem('bukit_kasih_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('bukit_kasih_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Auth Operations
  const login = (email, password) => {
    if (email === 'wisatawan@gmail.com' && password === 'password') {
      const newUser = { email, name: 'Budi Santoso', role: 'Wisatawan' };
      setUser(newUser);
      return { success: true };
    } else if (email === 'pengelola@bukitkasih.com' && password === 'admin') {
      const newUser = { email, name: 'Pak Kanonang (Admin)', role: 'Pengelola' };
      setUser(newUser);
      return { success: true };
    } else {
      return { success: false, error: 'Email atau password salah! Hubungi admin.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Announcement Operations
  const publishAnnouncement = (text) => {
    setAnnouncement(text || null);
  };

  // Review Operations
  const addReview = (activityId, author, rating, text) => {
    const newReview = {
      id: 'rev_' + Date.now(),
      activityId,
      author,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const deleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Inquiry Operations
  const addInquiry = (name, email, message) => {
    const newInquiry = {
      id: 'inq_' + Date.now(),
      name,
      email,
      message,
      status: 'Menunggu Balasan',
      reply: null,
      date: new Date().toISOString().split('T')[0]
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const replyInquiry = (inquiryId, replyText) => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          status: 'Dijawab',
          reply: replyText
        };
      }
      return inq;
    }));
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
