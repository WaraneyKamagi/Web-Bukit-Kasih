import { createContext, useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { sendBrowserNotification, playNotificationChime } from '../utils/notification';
import { useAuth } from './AuthContext';

export const AnnouncementContext = createContext();

export const useAnnouncement = () => useContext(AnnouncementContext);

export function AnnouncementProvider({ children }) {
  const [announcement, setAnnouncement] = useState(null);
  const realtimeChannelRef = useRef(null);
  const { token } = useAuth();

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

  useEffect(() => {
    let localChannel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      localChannel = new BroadcastChannel('bukit_kasih_announcements_channel');
      localChannel.onmessage = (event) => {
        const newText = event.data?.text || null;
        setAnnouncement(newText);
        if (newText) {
          sendBrowserNotification('⚠️ Peringatan Pengelola Bukit Kasih', newText);
          playNotificationChime();
        }
      };
    }

    const channel = supabase.channel('bukit-kasih-announcements', {
      config: { broadcast: { self: true } }
    })
      .on('broadcast', { event: 'announcement_update' }, (payload) => {
        const newText = payload?.payload?.text || null;
        setAnnouncement(newText);
        if (newText) {
          sendBrowserNotification('⚠️ Peringatan Pengelola Bukit Kasih', newText);
          playNotificationChime();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload) => {
        if (payload?.new?.is_active) {
          const newText = payload.new.text;
          setAnnouncement(newText);
          sendBrowserNotification('⚠️ Peringatan Pengelola Bukit Kasih', newText);
          playNotificationChime();
        } else if (payload?.new && !payload.new.is_active) {
          setAnnouncement(null);
        }
      })
      .subscribe((status) => console.log('📡 Supabase Realtime connection status:', status));

    realtimeChannelRef.current = channel;
    return () => {
      if (localChannel) localChannel.close();
      supabase.removeChannel(channel);
    };
  }, []);

  const publishAnnouncement = useCallback(async (text) => {
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
      const updatedText = data.announcement || null;
      setAnnouncement(updatedText);

      if (updatedText) {
        sendBrowserNotification('⚠️ Peringatan Pengelola Bukit Kasih', updatedText);
        playNotificationChime();
      }

      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const localBc = new BroadcastChannel('bukit_kasih_announcements_channel');
          localBc.postMessage({ text: updatedText, is_active: !!updatedText });
          localBc.close();
        }
      } catch (bcErr) {}

      try {
        if (realtimeChannelRef.current) {
          await realtimeChannelRef.current.send({
            type: 'broadcast',
            event: 'announcement_update',
            payload: { text: updatedText, is_active: !!updatedText }
          });
        }
      } catch (realtimeErr) {}

      return { success: true, announcement: updatedText };
    } catch (err) {
      console.error('Publish announcement error:', err);
      return { success: false, error: err.message };
    }
  }, [token]);

  const value = useMemo(() => ({
    announcement, publishAnnouncement
  }), [announcement, publishAnnouncement]);

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}
