import { useState } from 'react';
import { useAnnouncement } from '../../context/AnnouncementContext';
import {
  sendBrowserNotification,
  playNotificationChime,
  requestNotificationPermission
} from '../../utils/notification';

export default function AnnouncementTab({ handleSendToTelegram, showToast }) {
  const { announcement, publishAnnouncement } = useAnnouncement();
  const [annInput, setAnnInput] = useState(announcement || '');

  const handleTestPushNotification = async () => {
    const perm = await requestNotificationPermission();
    const testText =
      annInput.trim() ||
      announcement ||
      'Jalur Tangga Seribu ditutup sementara mulai pukul 13:00 karena curah hujan tinggi.';

    if (perm === 'granted') {
      sendBrowserNotification('⚠️ [Uji Coba] Peringatan Pengelola Bukit Kasih', testText);
      playNotificationChime();
      showToast('Push Notifikasi berhasil diuji coba di layar Anda!', 'success');
    } else {
      showToast('Izin notifikasi browser belum aktif. Silakan izinkan notifikasi pada browser Anda.', 'error');
    }
  };

  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    const res = await publishAnnouncement(annInput);
    if (res?.success) {
      showToast('Pengumuman berhasil diterbitkan & Realtime Push Notifikasi disiarkan ke semua wisatawan!', 'success');
    } else {
      showToast('Pengumuman penting berhasil diperbarui!', 'success');
    }
  };

  const handleClearAnnounce = async () => {
    await publishAnnouncement('');
    setAnnInput('');
    showToast('Pengumuman penting berhasil dinonaktifkan.', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Editor & Presets */}
      <div className="lg:col-span-7 glass-panel-light dark:glass-panel rounded-24 p-6 md:p-8 border border-outline-variant/20 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-1">
            Editor Pengumuman Pengelola
          </h3>
          <p className="text-xs text-subtext leading-relaxed">
            Teks pengumuman akan langsung disiarkan sebagai banner peringatan resmi di bagian atas seluruh halaman website pengunjung.
          </p>
        </div>

        <form onSubmit={handleAnnounceSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-2 font-semibold">
              Teks Pengumuman
            </label>
            <textarea
              rows="4"
              required
              value={annInput}
              onChange={(e) => setAnnInput(e.target.value)}
              placeholder="Ketik teks pengumuman di sini... (Contoh: Jalur Tangga Seribu ditutup sementara karena hujan deras dan uap belerang tebal)."
              className="w-full p-4 rounded-xl border border-outline-variant/50 dark:border-outline-variant/40 bg-white dark:bg-black/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface shadow-inner placeholder:text-subtext/60"
            />
          </div>

          {/* Quick Presets for Admin */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-subtext uppercase tracking-wider block">
              Template Cepat:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: 'Cuaca Ekstrem',
                  text: 'Pemberitahuan: Jalur Tangga Seribu ditutup sementara akibat curah hujan tinggi dan uap belerang tebal. Harap berhati-hati.'
                },
                {
                  label: 'Perbaikan Jalur',
                  text: 'Informasi: Sedang dilakukan perbaikan fasilitas di Pos 3 (Tebing Relief). Pengunjung dimohon berhati-hati melintas.'
                },
                {
                  label: 'Operasional Normal',
                  text: 'Pemberitahuan: Seluruh jalur pendakian dan kolam air hangat belerang Bukit Kasih beroperasi normal hari ini. Selamat berwisata!'
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAnnInput(preset.text)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-outline-variant/30 bg-white/40 dark:bg-white/5 hover:bg-primary/10 hover:text-primary dark:hover:text-secondary-fixed transition-colors cursor-pointer text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#0F4C81] text-white py-3 rounded-full hover:bg-primary font-body-md font-semibold transition-colors cursor-pointer text-center text-sm shadow-md"
            >
              {announcement ? 'Perbarui Pengumuman' : 'Terbitkan Pengumuman'}
            </button>
            {announcement && (
              <button
                type="button"
                onClick={handleClearAnnounce}
                className="px-6 border border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 py-3 rounded-full font-body-md font-semibold transition-colors cursor-pointer text-center text-sm"
              >
                Matikan
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Column: Real-time Live Preview & Hermes Broadcast */}
      <div className="lg:col-span-5 space-y-6">
        {/* Live Preview Card */}
        <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-lg">
                visibility
              </span>
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                Live Banner Simulation
              </h4>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${announcement
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-500/20 text-slate-700 dark:text-slate-400'
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${announcement ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                  }`}
              />
              {announcement ? 'Aktif di Website' : 'Tidak Ada Pengumuman'}
            </span>
          </div>

          <p className="text-xs text-subtext leading-relaxed">
            Simulasi pratinjau langsung bagaimana banner peringatan terlihat oleh wisatawan di bagian atas halaman web:
          </p>

          {/* Mock Browser Top Banner Window */}
          <div className="rounded-xl overflow-hidden border border-outline-variant/30 shadow-md bg-white dark:bg-black/60">
            <div className="bg-slate-100 dark:bg-neutral-800 px-3 py-1.5 border-b border-outline-variant/20 flex items-center gap-1.5 text-[10px] text-subtext">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[9px] opacity-70">https://bukitkasih.com</span>
            </div>

            {/* Rendered Live Banner Simulation */}
            <div className="bg-amber-600 dark:bg-amber-700/95 text-white p-3 flex items-start sm:items-center justify-between gap-2.5 text-left transition-all">
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-base text-amber-200 animate-pulse shrink-0">
                  warning
                </span>
                <p className="text-[11px] leading-snug font-medium">
                  <span className="font-bold text-amber-200 uppercase tracking-wider mr-1 text-[9px] bg-black/25 px-1.5 py-0.5 rounded">
                    Pengumuman:
                  </span>
                  {annInput.trim() ||
                    announcement ||
                    '(Ketik teks di sebelah kiri untuk melihat simulasi banner...)'}
                </p>
              </div>
              <span className="material-symbols-outlined text-sm text-white/70 hover:text-white shrink-0">
                close
              </span>
            </div>

            {/* Fake Hero Page Slice */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-900/80 text-center text-xs text-subtext border-t border-outline-variant/10">
              <p className="font-semibold text-on-surface text-xs">BUKIT KASIH KANONANG</p>
              <p className="text-[10px] text-subtext mt-0.5">Halaman Beranda Wisatawan</p>
            </div>
          </div>

          {/* Test Push Notification Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestPushNotification}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary dark:text-secondary-fixed dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold cursor-pointer transition-all border border-primary/20 dark:border-white/10 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              <span>Uji Coba Push Notifikasi di Layar</span>
            </button>
            <p className="text-[10px] text-subtext text-center mt-1.5">
              Memunculkan simulasi notifikasi asli Windows/HP dan nada dering peringatan.
            </p>
          </div>
        </div>

        {/* Broadcast to Telegram Hermes Card */}
        {announcement && (
          <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 space-y-3 text-left">
            <div className="flex items-center gap-2 text-[#229ED9]">
              <svg className="w-[16px] h-[16px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
              </svg>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Broadcast Media Sosial (Hermes)
              </h4>
            </div>
            <p className="text-xs text-subtext leading-relaxed">
              Kirim pengumuman aktif ini langsung ke Telegram HP Admin untuk dibuatkan postingan media sosial oleh bot Hermes.
            </p>
            <button
              type="button"
              onClick={() => handleSendToTelegram('announcement', announcement)}
              className="w-full flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1d8bcb] text-white py-2.5 px-4 rounded-full font-body-md text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
              </svg>
              <span>Siarkan ke Telegram Hermes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
