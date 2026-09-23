import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const BookmarkContext = createContext();

export const useBookmark = () => useContext(BookmarkContext);

export function BookmarkProvider({ children }) {
  const { token, user } = useAuth();
  
  // Initialize with localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch bookmarks from API when user logs in
  const fetchBookmarks = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await fetch('/api/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // data should be an array of activity IDs
        if (Array.isArray(data)) {
          setBookmarkedIds(data);
          localStorage.setItem('bukit_kasih_bookmarks', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Gagal mengambil bookmark dari server:", error);
    }
  }, [token, user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = async (id, title) => {
    // Optimistic UI update
    let updatedBookmarks;
    if (bookmarkedIds.includes(id)) {
      updatedBookmarks = bookmarkedIds.filter(item => item !== id);
    } else {
      updatedBookmarks = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updatedBookmarks);
    localStorage.setItem('bukit_kasih_bookmarks', JSON.stringify(updatedBookmarks));

    // Sync with backend if logged in
    if (user && token) {
      try {
        await fetch('/api/bookmarks/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ activityId: id, title: title })
        });
      } catch (error) {
        console.error("Gagal menyinkronkan bookmark dengan server:", error);
        // Revert on error if desired, but for now we keep the optimistic update
      }
    }
    
    return !bookmarkedIds.includes(id); // Return true if added, false if removed
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark, fetchBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
}
