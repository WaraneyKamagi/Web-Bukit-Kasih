import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Toast from '../components/Toast';
import { copyToClipboard } from '../utils/clipboard';

export default function AdminDashboard() {
  const {
    user,
    announcement,
    inquiries,
    reviews,
    publishAnnouncement,
    deleteReview,
    replyInquiry
  } = useContext(AppContext);

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

  if (!user || user.role !== 'Pengelola') return null;

  const handleSendToTelegram = async (type, contentText, author = '') => {
    if (!contentText || !contentText.trim()) {
      showToast('Pesan tidak boleh kosong!', 'error');
      return;
    }

    let text = '';
    if (type === 'announcement') {
      text = `Halo @HermesBK_Bot, tolong buat postingan Instagram untuk pengumuman berikut:\n\n"${contentText}"`;
    } else if (type === 'review') {
      text = `Halo @HermesBK_Bot, tolong buat postingan Instagram promosi berdasarkan ulasan dari ${author}:\n\n"${contentText}"`;
    } else {
      text = `Halo @HermesBK_Bot, tolong buat postingan Instagram kustom berikut:\n\n"${contentText}"`;
    }

    const success = await copyToClipboard(text);
    if (success) {
      showToast('Pesan disalin! Membuka chat bot Hermes...', 'success');
    } else {
      showToast('Gagal menyalin otomatis, silakan salin secara manual.', 'error');
    }

    // Redirect to Telegram app using native protocol handler
    window.location.href = 'tg://resolve?domain=HermesBK_Bot';
  };

  const handleAnnounceSubmit = (e) => {
    e.preventDefault();
    publishAnnouncement(annInput);
    showToast('Pengumuman penting berhasil diperbarui!', 'success');
  };

  const handleClearAnnounce = () => {
    publishAnnouncement('');
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

  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'Menunggu Balasan').length;

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
          <div className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl px-4 py-2 text-sm text-subtext dark:text-slate-300">
            Masuk sebagai:{' '}
            <span className="font-semibold text-primary dark:text-secondary-fixed">{user.name}</span>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-outline-variant/30 overflow-x-auto hide-scrollbar mb-8 gap-2">
          {['ringkasan', 'pengumuman', 'ulasan', 'pesan'].map((tab) => {
            const label =
              tab === 'ringkasan'
                ? 'Ringkasan'
                : tab === 'pengumuman'
                ? 'Kelola Pengumuman'
                : tab === 'ulasan'
                ? 'Moderasi Ulasan'
                : 'Pesan Masuk';
            const icon =
              tab === 'ringkasan'
                ? 'dashboard'
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
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-body-md text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary dark:border-secondary dark:text-secondary-fixed'
                    : 'border-transparent text-subtext hover:text-on-surface hover:border-outline-variant/50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span>{label}</span>
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
                      Total Responden
                    </span>
                    <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">
                      groups
                    </span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">152</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Uji coba simulasi aktif
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
                  <span className="block text-xs text-subtext mt-2">Memerlukan balasan admin</span>
                </div>

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
                  <span className="block text-xs text-subtext mt-2">Ulasan dari wisatawan</span>
                </div>

                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">
                      Objek Terfavorit
                    </span>
                    <span className="material-symbols-outlined text-accent-gold text-2xl">thumb_up</span>
                  </div>
                  <span className="text-lg font-bold text-on-surface truncate block">
                    Lima Rumah Ibadah
                  </span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Sering di-bookmark
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

                {/* Telegram Custom Message Card */}
                <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-[#229ED9] bg-[#229ED9]/10 w-fit px-3 py-1 rounded-xl">
                      <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Hermes Agent</span>
                    </div>
                    <h4 className="text-base font-bold text-on-surface mb-2">
                      Kirim Pesan Kustom ke Hermes
                    </h4>
                    <p className="text-xs text-subtext leading-relaxed mb-4">
                      Kirim perintah atau ide postingan kustom langsung ke Telegram HP Admin.
                    </p>
                    <input
                      type="text"
                      value={customTelegramMsg}
                      onChange={(e) => setCustomTelegramMsg(e.target.value)}
                      placeholder="Tulis pesan kustom..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-4"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customTelegramMsg.trim()) {
                          handleSendToTelegram('custom', customTelegramMsg);
                          setCustomTelegramMsg('');
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customTelegramMsg.trim()) {
                        handleSendToTelegram('custom', customTelegramMsg);
                        setCustomTelegramMsg('');
                      } else {
                        showToast('Silakan isi pesan kustom terlebih dahulu!', 'error');
                      }
                    }}
                    className="self-start px-5 py-2 bg-[#229ED9] hover:bg-[#1d8bcb] text-white rounded-full font-body-md text-xs font-bold cursor-pointer transition-colors border-none"
                  >
                    Kirim Pesan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENT */}
          {activeTab === 'pengumuman' && (
            <div className="glass-panel-light dark:glass-panel rounded-24 p-8 border border-outline-variant/20 max-w-xl">
              <h3 className="text-lg font-bold text-on-surface mb-2">Terbitkan Pengumuman Penting</h3>
              <p className="text-sm text-subtext mb-6">
                Pengumuman akan langsung muncul sebagai banner peringatan merah di atas halaman Beranda untuk semua pengunjung.
              </p>

              <form onSubmit={handleAnnounceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-2">
                    Teks Pengumuman
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={annInput}
                    onChange={(e) => setAnnInput(e.target.value)}
                    placeholder="Contoh: Jalur Tangga Seribu ditutup sementara mulai pukul 13:00 karena curah hujan tinggi dan uap belerang tebal."
                    className="w-full p-4 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#0F4C81] text-white py-3 rounded-full hover:bg-primary font-body-md font-semibold transition-colors cursor-pointer text-center"
                  >
                    Perbarui Pengumuman
                  </button>
                  {announcement && (
                    <button
                      type="button"
                      onClick={handleClearAnnounce}
                      className="px-6 border border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 py-3 rounded-full font-body-md font-semibold transition-colors cursor-pointer text-center"
                    >
                      Matikan
                    </button>
                  )}
                </div>
              </form>

              {announcement && (
                <div className="mt-8 border-t border-outline-variant/30 pt-6">
                  <h4 className="text-sm font-bold text-on-surface mb-2 font-body-lg">
                    Promosikan ke Media Sosial
                  </h4>
                  <p className="text-xs text-subtext mb-4">
                    Kirim konten pengumuman aktif ini langsung ke Telegram HP Admin untuk diposting oleh Hermes.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSendToTelegram('announcement', announcement)}
                    className="flex items-center gap-2 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] px-5 py-2.5 rounded-full font-body-md text-xs font-bold transition-all cursor-pointer border-none"
                  >
                    <svg className="w-[16px] h-[16px] fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.77 4.57-1.09 6.27-.14.72-.4 1.1-.66 1.13-.57.06-1 .36-1.55.72-.86.56-1.35.9-2.18 1.45-1 .63-.35.97.22 1.56 1.48 1.53 2.73 2.78 4.2 3.82.26.18.51.27.75.27.27 0 .42-.15.48-.44.13-.6 1.43-6.75 1.54-7.85.01-.1-.02-.2-.08-.28s-.17-.11-.27-.08c-.46.1-3.66 1.44-7.46 3.01l-4.7-1.46c-.95-.3-1.01-1.01.2-1.47 7.9-3.43 13.16-5.71 15.79-6.85.83-.34 1.4-.41 1.73-.2.33.2.39.67.26 1.34z" />
                    </svg>
                    Kirim ke Telegram Hermes
                  </button>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-3 font-medium">
                    *Catatan: Pastikan Anda menggunakan akun Telegram dengan User ID yang terdaftar di bot Hermes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MODERATE REVIEWS */}
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

          {/* TAB 4: MESSAGES & INQUIRIES */}
          {activeTab === 'pesan' && (
            <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface mb-6">Pesan & Pertanyaan Masuk</h3>
              <div className="space-y-6">
                {inquiries.length > 0 ? (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className={`p-6 border rounded-2xl flex flex-col gap-4 text-left transition-colors ${
                        inq.status === 'Menunggu Balasan'
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
                          className={`px-3 py-1 rounded-full font-bold uppercase text-[9px] ${
                            inq.status === 'Menunggu Balasan'
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
