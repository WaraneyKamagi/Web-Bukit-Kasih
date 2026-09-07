import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const FeedbackContext = createContext();

export const useFeedback = () => useContext(FeedbackContext);

export function FeedbackProvider({ children }) {
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { token, user } = useAuth();

  const mapReviews = useCallback((data) => data.map((r) => ({ ...r, id: r.ID || r.id })), []);
  const mapInquiries = useCallback((data) => data.map((i) => ({ ...i, id: i.ID || i.id })), []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setReviews(mapReviews(data));
        }
      } catch (err) {
        console.error('Gagal mengambil ulasan:', err);
      }
    }
    fetchReviews();
  }, [mapReviews]);

  useEffect(() => {
    if (!token || !user) {
      setInquiries([]);
      return;
    }

    async function fetchInquiries() {
      try {
        const url = user.role === 'Pengelola'
          ? '/api/inquiries'
          : `/api/inquiries/user/${user.email}`;

        const inquiriesRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (inquiriesRes.ok) {
          const data = await inquiriesRes.json();
          if (Array.isArray(data)) setInquiries(mapInquiries(data));
        }
      } catch (err) {
        console.error('Gagal mengambil inquiry:', err);
      }
    }

    fetchInquiries();
  }, [token, user, mapInquiries]);

  const addReview = useCallback(async (activityId, author, rating, text) => {
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
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
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
  }, [token]);

  const addInquiry = useCallback(async (name, email, message) => {
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
  }, []);

  const replyInquiry = useCallback(async (inquiryId, replyText) => {
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
  }, [token]);

  const value = useMemo(() => ({
    inquiries, reviews, addReview, deleteReview, addInquiry, replyInquiry
  }), [inquiries, reviews, addReview, deleteReview, addInquiry, replyInquiry]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
