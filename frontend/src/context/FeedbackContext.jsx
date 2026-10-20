import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { reviewService, inquiryService } from '../services/api';

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
        const data = await reviewService.getAll();
        if (Array.isArray(data)) setReviews(mapReviews(data));
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
        const data = user.role === 'Pengelola'
          ? await inquiryService.getAll()
          : await inquiryService.getByUser(user.email);

        if (Array.isArray(data)) setInquiries(mapInquiries(data));
      } catch (err) {
        console.error('Gagal mengambil inquiry:', err);
      }
    }

    fetchInquiries();
  }, [token, user, mapInquiries]);

  const addReview = useCallback(async (activityId, author, rating, text) => {
    try {
      const newReview = await reviewService.create({ activityId, author, rating, text });
      setReviews((prev) => [{ ...newReview, id: newReview.ID || newReview.id }, ...prev]);
    } catch (err) {
      console.error('Add review error:', err);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      await reviewService.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r.ID !== reviewId && r.id !== reviewId));
    } catch (err) {
      console.error('Delete review error:', err);
    }
  }, []);

  const addInquiry = useCallback(async (name, email, message) => {
    try {
      const newInq = await inquiryService.create({ name, email, message });
      setInquiries((prev) => [{ ...newInq, id: newInq.ID || newInq.id }, ...prev]);
    } catch (err) {
      console.error('Add inquiry error:', err);
    }
  }, []);

  const replyInquiry = useCallback(async (inquiryId, replyText) => {
    try {
      const updatedInq = await inquiryService.reply(inquiryId, replyText);
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
  }, []);

  const updateReviewStatus = useCallback(async (reviewId, newStatus) => {
    try {
      const res = await reviewService.updateStatus(reviewId, newStatus);
      const updated = res.review || { id: reviewId, status: newStatus };
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === reviewId || r.ID === reviewId) {
            return { ...r, ...updated, id: updated.id || updated.ID || reviewId, status: newStatus };
          }
          return r;
        })
      );
      return true;
    } catch (err) {
      console.error('Update review status error:', err);
      throw err;
    }
  }, []);

  const value = useMemo(() => ({
    inquiries, reviews, addReview, updateReviewStatus, deleteReview, addInquiry, replyInquiry
  }), [inquiries, reviews, addReview, updateReviewStatus, deleteReview, addInquiry, replyInquiry]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
