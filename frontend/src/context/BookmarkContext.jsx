import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { bookmarkService } from '../services/api';

export const BookmarkContext = createContext();

export const useBookmark = () => useContext(BookmarkContext);

export function BookmarkProvider({ children }) {
  const { token, user } = useAuth();
  
  const getStorageKey = useCallback(() => {
    return user && user.email ? `bukit_kasih_bookmarks_${user.email}` : 'bukit_kasih_bookmarks_guest';
  }, [user]);

  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Initialize and switch localStorage when user changes
  useEffect(() => {
    const key = getStorageKey();
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      } else {
        setBookmarkedIds([]);
      }
    } catch (e) {
      console.warn("Storage access blocked.");
      setBookmarkedIds([]);
    }
  }, [getStorageKey]);

  // Fetch bookmarks from API when user logs in
  const fetchBookmarks = useCallback(async () => {
    if (!token || !user) return;
    try {
      const data = await bookmarkService.getAll();
      if (Array.isArray(data)) {
        setBookmarkedIds(data);
        try {
          localStorage.setItem(getStorageKey(), JSON.stringify(data));
        } catch (e) {}
      }
    } catch (error) {
      console.error("Gagal mengambil bookmark dari server:", error);
    }
  }, [token, user, getStorageKey]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = async (id, title) => {
    const key = getStorageKey();
    const isCurrentlyBookmarked = bookmarkedIds.includes(id);
    
    // 1. Optimistic UI update
    const updatedBookmarks = isCurrentlyBookmarked 
      ? bookmarkedIds.filter(item => item !== id)
      : [...bookmarkedIds, id];
      
    setBookmarkedIds(updatedBookmarks);
    try {
      localStorage.setItem(key, JSON.stringify(updatedBookmarks));
    } catch (e) {}

    // 2. Sync with backend if logged in
    if (user && token) {
      try {
        await bookmarkService.toggle(id);
      } catch (error) {
        console.error("Gagal menyinkronkan bookmark dengan server:", error);
        
        // REVERT state on error (Rollback)
        setBookmarkedIds(bookmarkedIds);
        try {
          localStorage.setItem(key, JSON.stringify(bookmarkedIds));
        } catch (e) {}
        
        throw new Error('Koneksi terputus atau terjadi kesalahan server. Gagal menyimpan rencana perjalanan.');
      }
    }
    
    return !isCurrentlyBookmarked; // Return true if added, false if removed
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark, fetchBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
}
