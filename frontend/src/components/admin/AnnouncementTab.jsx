import { useState } from 'react';
import { useAnnouncement } from '../../context/AnnouncementContext';

export default function AnnouncementTab({ handleSendToTelegram, showToast }) {
  const { announcement, publishAnnouncement } = useAnnouncement();
  const [annInput, setAnnInput] = useState(announcement || '');

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
    <div className="max-w-4xl mx-auto glass-panel-light dark:glass-panel rounded-24 p-6 md:p-8 border border-outline-variant/20 space-y-6 animate-fade-in text-left">
      {/* Header & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-1">
            Editor Pengumuman Pengelola
          </h3>
          <p className="text-xs text-subtext leading-relaxed">
            Teks pengumuman akan langsung disiarkan sebagai banner peringatan resmi di bagian atas seluruh halaman website pengunjung.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase shrink-0 self-start sm:self-center ${
            announcement
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-500/20 text-slate-700 dark:text-slate-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              announcement ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
            }`}
          />
          {announcement ? 'Aktif di Website' : 'Tidak Ada Pengumuman'}
        </span>
      </div>

      {/* Current Active Announcement (if any) */}
      {announcement && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 flex items-start gap-3.5">
          <span className="material-symbols-outlined text-amber-500 text-xl shrink-0 mt-0.5">
            campaign
          </span>
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pengumuman Sedang Tayang:
            </div>
            <p className="text-sm font-medium text-on-surface leading-relaxed">
              {announcement}
            </p>
          </div>
        </div>
      )}

      {/* Form Editor */}
      <form onSubmit={handleAnnounceSubmit} className="space-y-5">
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
                className="text-xs px-3.5 py-1.5 rounded-xl border border-outline-variant/30 bg-white/40 dark:bg-white/5 hover:bg-primary/10 hover:text-primary dark:hover:text-secondary-fixed transition-colors cursor-pointer text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 min-w-[200px] bg-[#0F4C81] text-white py-3 px-6 rounded-full hover:bg-primary font-body-md font-semibold transition-colors cursor-pointer text-center text-sm shadow-md"
          >
            {announcement ? 'Perbarui Pengumuman' : 'Terbitkan Pengumuman'}
          </button>
          {announcement && (
            <button
              type="button"
              onClick={handleClearAnnounce}
              className="px-6 border border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 py-3 rounded-full font-body-md font-semibold transition-colors cursor-pointer text-center text-sm"
            >
              Matikan Pengumuman
            </button>
          )}
        </div>
      </form>

      {/* Broadcast to Telegram Hermes (if announcement is active) */}
      {announcement && (
        <div className="pt-4 border-t border-outline-variant/20">
          <div className="p-4 rounded-2xl border border-[#229ED9]/30 bg-[#229ED9]/5 dark:bg-[#229ED9]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
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
            </div>
            <button
              type="button"
              onClick={() => handleSendToTelegram('announcement', announcement)}
              className="shrink-0 flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1d8bcb] text-white py-2.5 px-5 rounded-full font-body-md text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
              </svg>
              <span>Siarkan ke Hermes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
