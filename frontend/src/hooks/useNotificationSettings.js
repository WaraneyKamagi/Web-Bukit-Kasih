import { useState } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationChime
} from '../utils/notification';

export function useNotificationSettings() {
  const [notifPerm, setNotifPerm] = useState(() => getNotificationPermission());

  const handleToggleNotification = async () => {
    if (notifPerm === 'granted') {
      sendBrowserNotification(
        '🔔 Notifikasi Bukit Kasih Aktif',
        'Anda akan menerima pemberitahuan langsung saat ada pengumuman darurat atau cuaca.'
      );
      playNotificationChime();
    } else {
      const res = await requestNotificationPermission();
      setNotifPerm(res);
      if (res === 'granted') {
        sendBrowserNotification(
          '✅ Notifikasi Berhasil Diaktifkan',
          'Terima kasih! Anda akan menerima update penting pengelola secara instan.'
        );
        playNotificationChime();
      }
    }
  };

  return { notifPerm, handleToggleNotification };
}
