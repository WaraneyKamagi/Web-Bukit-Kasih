import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import Toast from '../components/Toast';
import { copyToClipboard } from '../utils/clipboard';

// Import Tab Components
import SummaryTab from '../components/admin/SummaryTab';
import AnnouncementTab from '../components/admin/AnnouncementTab';
import KnowledgeBaseTab from '../components/admin/KnowledgeBaseTab';
import ReviewModerationTab from '../components/admin/ReviewModerationTab';
import InquiriesTab from '../components/admin/InquiriesTab';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { inquiries } = useFeedback();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ringkasan');

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
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-3.5 font-bold transition-all shadow-md"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </main>
    );
  }

  const pendingInquiriesCount = inquiries.filter((inq) => inq.status === 'pending').length;

  return (
    <main className="pt-32 min-h-screen pb-20 px-margin-mobile md:px-margin-desktop bg-surface dark:bg-background">
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">

        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 space-y-2 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary dark:text-secondary-fixed">admin_panel_settings</span>
              <h1 className="text-sm font-label-caps tracking-[0.2em] text-primary dark:text-secondary-fixed">
                Control Panel
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-on-surface">
              Dashboard <span className="text-primary dark:text-secondary-fixed">Pengelola</span>
            </h2>
            <p className="text-sm text-subtext max-w-xl">
              Pusat kendali aktivitas wisatawan, siaran informasi, manajemen ulasan, basis pengetahuan AI, dan penanganan tiket keluhan.
            </p>
          </div>

          <div className="relative z-10 text-left md:text-right">
            <p className="text-xs text-subtext font-semibold uppercase tracking-wider mb-1">
              Admin Aktif
            </p>
            <p className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {user.name}
            </p>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-outline-variant/30 overflow-x-auto hide-scrollbar mb-8 gap-2">
          {['ringkasan', 'hermes', 'pengumuman', 'knowledge', 'ulasan', 'pesan'].map((tab) => {
            const label =
              tab === 'ringkasan'
                ? 'Ringkasan'
                : tab === 'hermes'
                  ? 'Hermes AI Studio'
                  : tab === 'pengumuman'
                    ? 'Kelola Pengumuman'
                    : tab === 'knowledge'
                      ? 'Kelola Pengetahuan'
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
                    : tab === 'knowledge'
                      ? 'library_books'
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
          {activeTab === 'ringkasan' && <SummaryTab />}

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
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENT */}
          {activeTab === 'pengumuman' && (
            <AnnouncementTab handleSendToTelegram={handleSendToTelegram} showToast={showToast} />
          )}

          {/* TAB 3.5: KNOWLEDGE BASE (RAG) */}
          {activeTab === 'knowledge' && <KnowledgeBaseTab showToast={showToast} />}

          {/* TAB 4: MODERATE REVIEWS */}
          {activeTab === 'ulasan' && (
            <ReviewModerationTab handleSendToTelegram={handleSendToTelegram} showToast={showToast} />
          )}

          {/* TAB 5: MESSAGES & INQUIRIES */}
          {activeTab === 'pesan' && <InquiriesTab showToast={showToast} />}
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
