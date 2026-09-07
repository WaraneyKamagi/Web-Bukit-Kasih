import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnnouncement } from '../context/AnnouncementContext';
import { useFeedback } from '../context/FeedbackContext';
import Toast from '../components/Toast';
import { copyToClipboard } from '../utils/clipboard';
import {
  sendBrowserNotification,
  playNotificationChime,
  requestNotificationPermission
} from '../utils/notification';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { announcement, publishAnnouncement } = useAnnouncement();
  const { inquiries, reviews, deleteReview, replyInquiry } = useFeedback();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ringkasan');

  // Announcement Input
  const [annInput, setAnnInput] = useState(announcement || '');

  // Reply State
  const [selectedInqId, setSelectedInqId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Custom Telegram Msg State
  const [customTelegramMsg, setCustomTelegramMsg] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Route Guard
  useEffect(() => {
    if (!user || user.role !== 'Pengelola') {
      navigate('/');
    }
  }, [user, navigate]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  };

  const openTelegramPopup = async (promptText = '') => {
    if (promptText) {
      await copyToClipboard(promptText);
      showToast('Prompt disalin! Silakan tempel (Ctrl+V) di jendela chat Telegram.', 'success');
    } else {
      showToast('Membuka jendela obrolan Telegram Web Hermes...', 'info');
    }

    const width = 540;
    const height = 760;
    const left = Math.max(0, window.screen.width - width - 60);
    const top = 60;

    window.open(
      'https://web.telegram.org/k/#@HermesBKUK_bot',
      'HermesTelegramWebWindow',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );
  };

  if (!user || user.role !== 'Pengelola') {
    return (
      <main className="pt-32 min-h-screen pb-20 px-margin-mobile md:px-margin-desktop bg-surface dark:bg-background flex items-center justify-center text-center">
        <div className="glass-panel-light dark:glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full border border-outline-variant/30 shadow-xl space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Akses Khusus Pengelola</h2>
            <p className="text-xs md:text-sm text-subtext leading-relaxed">
              Halaman Dashboard Admin hanya dapat diakses oleh akun Pengelola Bukit Kasih. Silakan masuk dengan akun Admin Anda.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full font-body-md text-sm font-semibold cursor-pointer transition-colors shadow-md border-none"
            >
              Kembali ke Beranda & Masuk
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleSendToTelegram = async (type, contentText, author = '') => {
    if (!contentText || !contentText.trim()) {
      showToast('Pesan tidak boleh kosong!', 'error');
      return;
    }

    let text = '';
    if (type === 'announcement') {
      text = `Halo @HermesBKUK_bot, tolong buat postingan Instagram untuk pengumuman berikut:\n\n"${contentText}"`;
    } else if (type === 'review') {
      text = `Halo @HermesBKUK_bot, tolong buat postingan Instagram promosi berdasarkan ulasan dari ${author}:\n\n"${contentText}"`;
    } else {
      text = `Halo @HermesBKUK_bot, tolong buat postingan Instagram kustom berikut:\n\n"${contentText}"`;
    }

    const success = await copyToClipboard(text);
    if (success) {
      showToast('Pesan disalin! Membuka chat bot Hermes...', 'success');
    } else {
      showToast('Gagal menyalin otomatis, silakan salin secara manual.', 'error');
    }

    window.location.href = 'tg://resolve?domain=HermesBKUK_bot';
  };

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

  const handleReplySubmit = (inqId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyInquiry(inqId, replyText);
    showToast('Balasan Anda telah dikirim dan dapat dilihat oleh wisatawan.', 'success');
    setReplyText('');
    setSelectedInqId(null);
  };

  const handleDeleteReview = (revId, author) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ulasan dari "${author}"?`)) {
      deleteReview(revId);
      showToast(`Ulasan dari "${author}" berhasil dihapus.`, 'info');
    }
  };

  const pendingInquiriesCount = inquiries.filter(
    (i) => i.status === 'Menquiry Balasan' || i.status === 'Menunggu Balasan'
  ).length;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '5.0';

  const fiveStarReviewsCount = reviews.filter((r) => r.rating === 5).length;

  // Latest Hermes Draft Content for preview card
  const latestHermesDraft = null;

  return (
    <main className="pt-28 min-h-screen pb-20 px-margin-mobile md:px-margin-desktop bg-surface dark:bg-background transition-colors duration-300">
      <div className="max-w-container-max mx-auto text-left">
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <span className="font-label-caps text-label-caps text-primary dark:text-secondary-fixed text-xs tracking-wider uppercase">
              Panel Pengelola Wisata
            </span>
            <h1 className="text-3xl font-bold text-on-surface">Dashboard Admin</h1>
          </div>
          <div className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl px-4 py-2 text-sm text-subtext dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Masuk sebagai: <strong className="text-primary dark:text-secondary-fixed">{user.name}</strong></span>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-outline-variant/30 overflow-x-auto hide-scrollbar mb-8 gap-2">
          {['ringkasan', 'hermes', 'pengumuman', 'ulasan', 'pesan'].map((tab) => {
            const label =
              tab === 'ringkasan'
                ? 'Ringkasan'
                : tab === 'hermes'
                  ? 'Hermes AI Studio'
                  : tab === 'pengumuman'
                    ? 'Kelola Pengumuman'
                    : tab === 'ulasan'
                      ? 'Moderasi Ulasan'
                      : 'Pesan Masuk';
            const icon =
              tab === 'ringkasan'
                ? 'dashboard'
                : tab === 'hermes'
                  ? 'smart_toy'
                  : tab === 'pengumuman'
                    ? 'campaign'
                    : tab === 'ulasan'
                      ? 'rate_review'
                      : 'mail';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-body-md text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? 'border-primary text-primary dark:border-secondary dark:text-secondary-fixed bg-primary/5 dark:bg-white/5 rounded-t-xl'
                    : 'border-transparent text-subtext hover:text-on-surface hover:border-outline-variant/50'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span>{label}</span>
                {tab === 'hermes' && (
                  <span className="bg-[#229ED9] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                    Live
                  </span>
                )}
                {tab === 'pesan' && pendingInquiriesCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {pendingInquiriesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="animate-fade-in">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">
                      Total Ulasan
                    </span>
                    <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">
                      reviews
                    </span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">{reviews.length}</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    ⭐ {avgRating} Rata-rata kepuasan
                  </span>
                </div>

                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">
                      Pesan Tertunda
                    </span>
                    <span className="material-symbols-outlined text-amber-500 text-2xl">
                      pending_actions
                    </span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">{pendingInquiriesCount}</span>
                  <span className="block text-xs text-subtext mt-2">Dari total {inquiries.length} pesan wisatawan</span>
                </div>

                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">
                      Ulasan Bintang 5
                    </span>
                    <span className="material-symbols-outlined text-accent-gold text-2xl">star</span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">{fiveStarReviewsCount}</span>
                  <span className="block text-xs text-subtext mt-2">Kandidat promosi Hermes AI</span>
                </div>

                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">
                      Banner Wisata
                    </span>
                    <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">campaign</span>
                  </div>
                  <span className="text-lg font-bold text-on-surface truncate block">
                    {announcement ? 'Pengumuman Aktif' : 'Normal / Aman'}
                  </span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    {announcement ? 'Push notifikasi tersiar' : 'Jalur beroperasi normal'}
                  </span>
                </div>
              </div>

              {/* Mock Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Checkpoints Table */}
                <div className="lg:col-span-2 glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
                  <h3 className="text-lg font-bold text-on-surface mb-4">
                    Statistik Penanda Objek Wisata (Bookmark)
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Puncak Lima Rumah Ibadah', percent: 85, color: 'bg-primary' },
                      { name: 'Terapi Air Hangat Belerang', percent: 70, color: 'bg-emerald-500' },
                      { name: 'Monumen Salib Kasih', percent: 60, color: 'bg-amber-500' },
                      { name: 'Tebing Relief Toar Lumimuut', percent: 45, color: 'bg-purple-500' }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-on-surface">{item.name}</span>
                          <span className="text-subtext">{item.percent}% Wisatawan</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hermes AI Quick Trigger Card */}
                <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-[#229ED9] bg-[#229ED9]/10 w-fit px-3 py-1 rounded-xl">
                      <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Hermes AI Studio</span>
                    </div>
                    <h4 className="text-base font-bold text-on-surface mb-2">
                      Studio Pemasaran Hermes
                    </h4>
                    <p className="text-xs text-subtext leading-relaxed mb-4">
                      Obrolan langsung dan sinkronisasi sesi dengan bot Telegram @HermesBKUK_bot untuk otomatisasi konten Instagram.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('hermes')}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#229ED9] hover:bg-[#1d8bcb] text-white rounded-full font-body-md text-xs font-bold cursor-pointer transition-colors border-none shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    <span>Buka Hermes Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERMES AI STUDIO (CLEAN CONSOLE CHAT LAUNCHER) */}
          {activeTab === 'hermes' && (
            <div className="max-w-2xl mx-auto animate-fade-in py-4">
              <div className="glass-panel-light dark:glass-panel rounded-3xl p-8 md:p-10 border border-outline-variant/30 shadow-xl space-y-7 text-center relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#229ED9]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Identity & Header */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#229ED9] to-[#0088cc] text-white flex items-center justify-center shadow-lg shadow-[#229ED9]/30">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="text-xl md:text-2xl font-bold text-on-surface">Hermes Marketing AI Console</h3>
                      <span className="inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Gateway
                      </span>
                    </div>
                    <p className="text-xs text-subtext">
                      @HermesBKUK_bot • Agen Pemasaran Otonom Bukit Kasih Kanonang
                    </p>
                  </div>
                </div>

                {/* Description Box */}
                <div className="p-4 rounded-2xl bg-surface/50 dark:bg-black/25 border border-outline-variant/20 text-xs md:text-sm text-subtext leading-relaxed text-left space-y-2">
                  <div className="flex items-center gap-2 text-on-surface font-semibold text-xs">
                    <span className="material-symbols-outlined text-[#229ED9] text-base">forum</span>
                    <span>Sesi Interaksi & Validasi Pemasaran (*Human-in-the-Loop*)</span>
                  </div>
                  <p className="text-subtext">
                    Gunakan jendela pop-up Telegram Web resmi untuk berkomunikasi langsung dengan <strong>Hermes-BukitKasih 🏔️</strong>. Validasi draf promosi, berikan revisi, dan biarkan Hermes mempublikasikan materi ke Instagram via Composio.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openTelegramPopup()}
                    className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#229ED9] hover:bg-[#1d8bcb] text-white rounded-xl font-body-md text-sm font-semibold cursor-pointer transition-all shadow-md shadow-[#229ED9]/25 hover:shadow-lg border-none"
                  >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                    </svg>
                    <span>Buka Obrolan Telegram (Pop-up)</span>
                  </button>

                  <a
                    href="tg://resolve?domain=HermesBKUK_bot"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-outline-variant/40 bg-white/5 hover:bg-white/10 text-on-surface rounded-xl font-body-md text-sm font-semibold no-underline transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary dark:text-secondary-fixed">smartphone</span>
                    <span>Buka Aplikasi Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENT */}
          {activeTab === 'pengumuman' && (
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
                          label: '🌧️ Cuaca Ekstrem',
                          text: 'Pemberitahuan: Jalur Tangga Seribu ditutup sementara akibat curah hujan tinggi dan uap belerang tebal. Harap berhati-hati.'
                        },
                        {
                          label: '⚠️ Perbaikan Jalur',
                          text: 'Informasi: Sedang dilakukan perbaikan fasilitas di Pos 3 (Tebing Relief). Pengunjung dimohon berhati-hati melintas.'
                        },
                        {
                          label: '✅ Operasional Normal',
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
          )}

          {/* TAB 4: MODERATE REVIEWS */}
          {activeTab === 'ulasan' && (
            <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface mb-6">Moderasi Ulasan Wisatawan</h3>
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 border border-outline-variant/20 rounded-2xl flex justify-between items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-on-surface text-sm">{rev.author}</span>
                          <span className="text-xs text-subtext">{rev.date}</span>
                          <span className="flex text-accent-gold text-sm items-center font-bold">
                            <span
                              className="material-symbols-outlined text-[16px] mr-0.5"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            {rev.rating}
                          </span>
                        </div>
                        <p className="text-on-surface-variant dark:text-slate-300 text-sm leading-relaxed text-left">
                          "{rev.text}"
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {rev.rating >= 4 && (
                          <button
                            onClick={() => handleSendToTelegram('review', rev.text, rev.author)}
                            className="p-2 border border-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9]/10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                            title="Kirim Testimoni ke Telegram Hermes"
                          >
                            <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(rev.id, rev.author)}
                          className="p-2 border border-red-500/20 text-red-600 hover:bg-red-500/10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                          title="Hapus Ulasan"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-subtext dark:text-slate-400 py-6 text-center">
                    Tidak ada ulasan ditemukan untuk dimoderasi.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES & INQUIRIES */}
          {activeTab === 'pesan' && (
            <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface mb-6">Pesan & Pertanyaan Masuk</h3>
              <div className="space-y-6">
                {inquiries.length > 0 ? (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className={`p-6 border rounded-2xl flex flex-col gap-4 text-left transition-colors ${inq.status === 'Menunggu Balasan'
                          ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5'
                          : 'border-outline-variant/20'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-outline-variant/10 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-on-surface text-sm">{inq.name}</span>
                          <span className="text-subtext">({inq.email})</span>
                          <span className="text-subtext">{inq.date}</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full font-bold uppercase text-[9px] ${inq.status === 'Menunggu Balasan'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-subtext uppercase tracking-wider block">
                          Pertanyaan:
                        </span>
                        <p className="text-on-surface-variant dark:text-slate-200 text-sm leading-relaxed">
                          {inq.message}
                        </p>
                      </div>

                      {/* Display Reply if already answered */}
                      {inq.reply && (
                        <div className="p-4 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-xl space-y-1">
                          <span className="text-xs font-bold text-primary dark:text-secondary-fixed uppercase tracking-wider block">
                            Balasan Admin:
                          </span>
                          <p className="text-on-surface dark:text-slate-350 text-sm leading-relaxed italic">
                            "{inq.reply}"
                          </p>
                        </div>
                      )}

                      {/* Reply Form Trigger */}
                      {inq.status === 'Menunggu Balasan' && selectedInqId !== inq.id && (
                        <button
                          onClick={() => {
                            setSelectedInqId(inq.id);
                            setReplyText('');
                          }}
                          className="self-start px-5 py-2 border border-primary text-primary hover:bg-primary/5 dark:border-secondary dark:text-secondary-fixed dark:hover:bg-secondary/5 rounded-full font-body-md text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Tulis Balasan
                        </button>
                      )}

                      {/* Reply Form Input */}
                      {selectedInqId === inq.id && (
                        <form
                          onSubmit={(e) => handleReplySubmit(inq.id, e)}
                          className="space-y-4 border-t border-outline-variant/10 pt-4"
                        >
                          <div>
                            <label className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-2">
                              Teks Balasan
                            </label>
                            <textarea
                              rows="2"
                              required
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tulis balasan Anda di sini..."
                              className="w-full p-4 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-full font-body-md text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Kirim Balasan
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedInqId(null)}
                              className="px-6 border border-outline-variant text-subtext py-2.5 rounded-full font-body-md text-xs transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-subtext dark:text-slate-400 py-6 text-center">
                    Tidak ada pesan masuk.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isToastOpen && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setIsToastOpen(false)}
        />
      )}
    </main>
  );
}
