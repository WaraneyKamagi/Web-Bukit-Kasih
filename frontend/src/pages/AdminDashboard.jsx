import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Toast from '../components/Toast';

export default function AdminDashboard() {
  const { 
    user, 
    announcement, 
    inquiries, 
    reviews, 
    publishAnnouncement, 
    deleteReview, 
    replyInquiry,
    runInstagramAction
  } = useContext(AppContext);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ringkasan');
  
  // Announcement Input
  const [annInput, setAnnInput] = useState(announcement || '');
  
  // Reply State
  const [selectedInqId, setSelectedInqId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Instagram AI Agent State
  const [isIgModalOpen, setIsIgModalOpen] = useState(false);
  const [igContentType, setIgContentType] = useState('custom'); // 'announcement', 'review', 'custom'
  const [igContentId, setIgContentId] = useState(0);
  const [igCaption, setIgCaption] = useState('');
  const [igPrompt, setIgPrompt] = useState('');
  const [igImageURL, setIgImageURL] = useState('https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleOpenIgModal = (type, id = 0, initialPrompt = '') => {
    setIgContentType(type);
    setIgContentId(id);
    setIgPrompt(initialPrompt);
    setIgCaption('');
    
    if (type === 'announcement') {
      setIgImageURL('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80');
    } else if (type === 'review') {
      setIgImageURL('https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80');
    } else {
      setIgImageURL('https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80');
    }
    
    setIsIgModalOpen(true);
  };

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    const result = await runInstagramAction('generate', igContentType, igContentId, igPrompt);
    setIsGenerating(false);
    if (result.success) {
      setIgCaption(result.data.caption);
      showToast('Caption berhasil dibuat oleh AI Agent!', 'success');
    } else {
      showToast(result.error || 'Gagal membuat caption', 'error');
    }
  };

  const handlePublishInstagram = async (e) => {
    e.preventDefault();
    if (!igCaption.trim()) {
      showToast('Caption tidak boleh kosong', 'error');
      return;
    }
    setIsPublishing(true);
    const result = await runInstagramAction('publish', igContentType, igContentId, '', igCaption, igImageURL);
    setIsPublishing(false);
    if (result.success) {
      showToast(result.data.message || 'Postingan berhasil dipublikasikan!', 'success');
      setIsIgModalOpen(false);
    } else {
      showToast(result.error || 'Gagal memposting ke Instagram', 'error');
    }
  };

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

  const pendingInquiriesCount = inquiries.filter(i => i.status === 'Menunggu Balasan').length;

  return (
    <main className="pt-28 min-h-screen pb-20 px-margin-mobile md:px-margin-desktop bg-surface dark:bg-background transition-colors duration-300">
      <div className="max-w-container-max mx-auto text-left">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <span className="font-label-caps text-label-caps text-primary dark:text-secondary-fixed text-xs tracking-wider uppercase">Panel Pengelola Wisata</span>
            <h1 className="text-3xl font-bold text-on-surface">Dashboard Admin</h1>
          </div>
          <div className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl px-4 py-2 text-sm text-subtext dark:text-slate-300">
            Masuk sebagai: <span className="font-semibold text-primary dark:text-secondary-fixed">{user.name}</span>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-outline-variant/30 overflow-x-auto hide-scrollbar mb-8 gap-2">
          {['ringkasan', 'pengumuman', 'ulasan', 'pesan'].map((tab) => {
            const label = tab === 'ringkasan' ? 'Ringkasan' : 
                          tab === 'pengumuman' ? 'Kelola Pengumuman' : 
                          tab === 'ulasan' ? 'Moderasi Ulasan' : 'Pesan Masuk';
            const icon = tab === 'ringkasan' ? 'dashboard' : 
                         tab === 'pengumuman' ? 'campaign' : 
                         tab === 'ulasan' ? 'rate_review' : 'mail';
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
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">Total Responden</span>
                    <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">groups</span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">152</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Uji coba simulasi aktif</span>
                </div>
                
                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">Pesan Tertunda</span>
                    <span className="material-symbols-outlined text-amber-500 text-2xl">pending_actions</span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">{pendingInquiriesCount}</span>
                  <span className="block text-xs text-subtext mt-2">Memerlukan balasan admin</span>
                </div>

                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">Total Ulasan</span>
                    <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl">reviews</span>
                  </div>
                  <span className="text-3xl font-extrabold text-on-surface">{reviews.length}</span>
                  <span className="block text-xs text-subtext mt-2">Ulasan dari wisatawan</span>
                </div>

                <div className="glass-panel-light dark:glass-panel p-6 rounded-24 shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-subtext uppercase tracking-wider">Objek Terfavorit</span>
                    <span className="material-symbols-outlined text-accent-gold text-2xl">thumb_up</span>
                  </div>
                  <span className="text-lg font-bold text-on-surface truncate block">Lima Rumah Ibadah</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Sering di-bookmark</span>
                </div>
              </div>

              {/* Mock Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Checkpoints Table */}
                <div className="lg:col-span-2 glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20">
                  <h3 className="text-lg font-bold text-on-surface mb-4">Statistik Penanda Objek Wisata (Bookmark)</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Puncak Lima Rumah Ibadah', percent: 85, color: 'bg-primary' },
                      { name: 'Terapi Air Hangat Belerang', percent: 70, color: 'bg-emerald-500' },
                      { name: 'Monumen Salib Kasih', percent: 60, color: 'bg-amber-500' },
                      { name: 'Tebing Relief Toar Lumimuut', percent: 45, color: 'bg-purple-500' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-on-surface">{item.name}</span>
                          <span className="text-subtext">{item.percent}% Wisatawan</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instagram Custom Post Card */}
                <div className="glass-panel-light dark:glass-panel rounded-24 p-6 border border-outline-variant/20 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-3 mb-3 text-[#E1F5FE] bg-[#0F4C81] w-fit px-3 py-1.5 rounded-xl">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">AI Agent Hermes</span>
                    </div>
                    <h4 className="text-base font-bold text-on-surface mb-2">Buat Postingan Instagram Kustom</h4>
                    <p className="text-xs text-subtext leading-relaxed mb-4">
                      Tulis ide atau topik kustom Anda, lalu AI Agent akan menyusun postingan Instagram lengkap dengan tagar dan emoji secara instan.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleOpenIgModal('custom')}
                    className="self-start px-5 py-2.5 bg-[#0F4C81] text-white hover:bg-[#0d416f] rounded-full font-body-md text-xs font-bold cursor-pointer transition-colors border-none"
                  >
                    Tulis Postingan Kustom
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENT */}
          {activeTab === 'pengumuman' && (
            <div className="glass-panel-light dark:glass-panel rounded-24 p-8 border border-outline-variant/20 max-w-xl">
              <h3 className="text-lg font-bold text-on-surface mb-2">Terbitkan Pengumuman Penting</h3>
              <p className="text-sm text-subtext mb-6">Pengumuman akan langsung muncul sebagai banner peringatan merah di atas halaman Beranda untuk semua pengunjung.</p>
              
              <form onSubmit={handleAnnounceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-2">Teks Pengumuman</label>
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
                      className="px-6 border border-red-500/30 text-red-650 hover:bg-red-550/10 dark:text-red-400 py-3 rounded-full font-body-md font-semibold transition-colors cursor-pointer text-center"
                    >
                      Matikan
                    </button>
                  )}
                </div>
              </form>

              {announcement && (
                <div className="mt-8 border-t border-outline-variant/30 pt-6">
                  <h4 className="text-sm font-bold text-on-surface mb-2">Promosikan ke Media Sosial</h4>
                  <p className="text-xs text-subtext mb-4">Bagikan pengumuman aktif ini ke feed Instagram resmi Bukit Kasih via AI Agent (Hermes & Step 3.7 Flash).</p>
                  <button
                    type="button"
                    onClick={() => handleOpenIgModal('announcement', 0, 'Harap tulis pengumuman ini secara formal namun persuasif')}
                    className="flex items-center gap-2 bg-[#E1F5FE] hover:bg-[#B3E5FC] text-[#0288D1] dark:bg-[#0288D1]/10 dark:hover:bg-[#0288D1]/20 dark:text-[#E1F5FE] px-5 py-2.5 rounded-full font-body-md text-xs font-bold transition-all cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span>
                    Bagikan ke Instagram via AI Agent
                  </button>
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
                            <span className="material-symbols-outlined text-[16px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
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
                            onClick={() => handleOpenIgModal('review', rev.id, 'Ubah ulasan positif ini menjadi postingan promosi Instagram')}
                            className="p-2 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                            title="Bagikan Testimoni ke Instagram"
                          >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteReview(rev.id, rev.author)}
                          className="p-2 border border-red-500/20 text-red-650 hover:bg-red-500/10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                          title="Hapus Ulasan"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-subtext dark:text-slate-400 py-6 text-center">Tidak ada ulasan ditemukan untuk dimoderasi.</p>
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
                        <span className={`px-3 py-1 rounded-full font-bold uppercase text-[9px] ${
                          inq.status === 'Menunggu Balasan' 
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' 
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {inq.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-subtext uppercase tracking-wider block">Pertanyaan:</span>
                        <p className="text-on-surface-variant dark:text-slate-200 text-sm leading-relaxed">
                          {inq.message}
                        </p>
                      </div>

                      {/* Display Reply if already answered */}
                      {inq.reply && (
                        <div className="p-4 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-xl space-y-1">
                          <span className="text-xs font-bold text-primary dark:text-secondary-fixed uppercase tracking-wider block">Balasan Admin:</span>
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
                        <form onSubmit={(e) => handleReplySubmit(inq.id, e)} className="space-y-4 border-t border-outline-variant/10 pt-4">
                          <div>
                            <label className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-2">Teks Balasan</label>
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
                  <p className="text-subtext dark:text-slate-400 py-6 text-center">Tidak ada pesan masuk.</p>
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

      {/* Instagram Preview & Publish Modal */}
      {isIgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-outline-variant/30 rounded-32 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-left overflow-y-auto max-h-[90vh] font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0F4C81] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Instagram Copilot (via Hermes)</h3>
                  <p className="text-[10px] text-subtext">Menyusun & Mempublikasikan Konten via Composio</p>
                </div>
              </div>
              <button 
                onClick={() => setIsIgModalOpen(false)}
                className="text-subtext hover:text-on-surface cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Input Details */}
            <div className="space-y-4">
              {/* Type Badge */}
              <div className="flex gap-2 items-center text-xs">
                <span className="font-bold text-subtext uppercase tracking-wider">Sumber Konten:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                  igContentType === 'announcement' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                  igContentType === 'review' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                }`}>
                  {igContentType}
                </span>
              </div>

              {/* Optional Prompt instructions */}
              <div>
                <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1.5">Instruksi Tambahan AI (Opsional)</label>
                <textarea 
                  rows="2"
                  value={igPrompt}
                  onChange={(e) => setIgPrompt(e.target.value)}
                  placeholder="Contoh: Fokuskan pada ajakan ramah, gunakan gaya bahasa santai..."
                  className="w-full p-3.5 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs text-on-surface"
                />
              </div>

              {/* Predefined Image Selectors */}
              <div>
                <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1.5">Pilih Foto Postingan</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Scenic / Umum', url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Rumah Ibadah', url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Relief Tebing', url: 'https://images.unsplash.com/photo-1608958415123-64a51e605d8f?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Monumen Salib', url: 'https://images.unsplash.com/photo-1544865181-a96c6806509f?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Air Hangat', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
                    { label: 'Custom URL', url: 'custom' },
                  ].map((img, idx) => {
                    const isSelected = igImageURL === img.url || (img.url === 'custom' && !['https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1608958415123-64a51e605d8f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544865181-a96c6806509f?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'].includes(igImageURL));
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (img.url === 'custom') {
                            const customUrl = prompt('Masukkan URL gambar publik Anda:');
                            if (customUrl) setIgImageURL(customUrl);
                          } else {
                            setIgImageURL(img.url);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-center truncate transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#0F4C81]/15 border-[#0F4C81] text-[#0F4C81] dark:bg-white/10 dark:border-white dark:text-white' 
                            : 'border-outline-variant/30 text-subtext hover:border-outline-variant/60'
                        }`}
                      >
                        {img.label}
                      </button>
                    );
                  })}
                </div>
                {igImageURL && (
                  <p className="text-[10px] text-subtext mt-2 truncate">
                    URL Gambar: <a href={igImageURL} target="_blank" rel="noreferrer" className="underline hover:text-on-surface">{igImageURL}</a>
                  </p>
                )}
              </div>

              {/* Generate Trigger */}
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={isGenerating}
                className="w-full py-3 bg-[#0F4C81] hover:bg-[#0d416f] disabled:bg-slate-350 dark:disabled:bg-neutral-800 disabled:text-slate-500 text-white rounded-full font-body-md font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    Menyusun Draf Caption via AI...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">magic_button</span>
                    Hasilkan Draf Caption via AI Agent (Step 3.7)
                  </>
                )}
              </button>

              {/* Resulting Caption Editor */}
              {igCaption && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider">Hasil Draf Caption Instagram (Bisa Diedit)</label>
                  <textarea 
                    rows="5"
                    required
                    value={igCaption}
                    onChange={(e) => setIgCaption(e.target.value)}
                    className="w-full p-3 rounded-xl border border-outline-variant/50 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs leading-relaxed text-on-surface"
                  />
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsIgModalOpen(false)}
                className="px-5 py-2.5 border border-outline-variant text-subtext rounded-full font-body-md text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-transparent"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePublishInstagram}
                disabled={isPublishing || !igCaption.trim()}
                className="px-7 py-2.5 bg-emerald-650 hover:bg-emerald-700 disabled:bg-slate-350 dark:disabled:bg-neutral-800 disabled:text-slate-500 text-white rounded-full font-body-md text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer border-none"
              >
                {isPublishing ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    Memposting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Publish ke Instagram
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
