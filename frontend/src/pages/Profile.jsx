import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { activities } from '../data/activities';

export default function Profile() {
  const { user } = useAuth();
  const { inquiries } = useFeedback();
  const navigate = useNavigate();
  
  // Local Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Modal State
  const [selectedAct, setSelectedAct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Route Guard
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  };

  if (!user) return null;

  const handleRemoveBookmark = (id, title, e) => {
    e.stopPropagation(); // Avoid opening modal
    const updated = bookmarkedIds.filter(item => item !== id);
    setBookmarkedIds(updated);
    localStorage.setItem('bukit_kasih_bookmarks', JSON.stringify(updated));
    
    // Dispatch event to update other pages (like Experiences) if open
    window.dispatchEvent(new Event('storage'));
    showToast(`"${title}" dihapus dari rencana perjalanan.`, 'info');
  };

  const handleCardClick = (act) => {
    setSelectedAct(act);
    setIsModalOpen(true);
  };

  // Filter bookmarks data
  const bookmarkedActivities = activities.filter((act) =>
    bookmarkedIds.includes(act.id)
  );

  // Filter user inquiries
  const userInquiries = inquiries.filter(inq => 
    inq.email.toLowerCase() === user.email.toLowerCase()
  );

  return (
    <main className="pt-28 min-h-screen pb-20 px-margin-mobile md:px-margin-desktop bg-surface dark:bg-background transition-colors duration-300">
      <div className="max-w-container-max mx-auto text-left">
        
        {/* Profile Header */}
        <div className="glass-panel-light dark:glass-panel border border-outline-variant/20 rounded-[28px] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 mb-10 shadow-sm">
          <div className="w-20 h-20 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-4xl select-none">person</span>
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
            <p className="text-sm text-subtext dark:text-slate-400">{user.email}</p>
            <span className="inline-block bg-primary/10 dark:bg-white/10 text-primary dark:text-secondary-fixed font-label-caps text-[10px] tracking-wider uppercase px-3.5 py-1 rounded-full font-bold">
              Anggota: {user.role}
            </span>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Travel Plans (Bookmarks) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/25">
              <span className="material-symbols-outlined text-primary dark:text-secondary-fixed">bookmark</span>
              <h2 className="text-xl font-bold text-on-surface">Rencana Perjalanan Saya</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarkedActivities.length > 0 ? (
                bookmarkedActivities.map((act) => (
                  <div 
                    key={act.id}
                    onClick={() => handleCardClick(act)}
                    className="group border border-outline-variant/20 bg-white/50 dark:bg-black/10 hover:bg-white dark:hover:bg-white/5 rounded-24 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col h-[280px]"
                  >
                    <div className="h-32 bg-slate-200 overflow-hidden relative">
                      <img 
                        src={act.image} 
                        alt={act.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <button 
                        onClick={(e) => handleRemoveBookmark(act.id, act.title, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus Bookmark"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between text-left">
                      <div>
                        <h3 className="font-bold text-on-surface text-sm line-clamp-1 mb-1">{act.title}</h3>
                        <p className="text-xs text-subtext dark:text-slate-400 line-clamp-3 leading-relaxed">{act.description}</p>
                      </div>
                      <div className="text-[10px] font-semibold text-primary dark:text-secondary-fixed flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        <span>{act.hours.split('|')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center p-12 border border-dashed border-outline-variant/30 rounded-24 bg-white/30 dark:bg-black/5">
                  <span className="material-symbols-outlined text-4xl text-subtext mb-2">bookmark_border</span>
                  <p className="text-sm text-subtext dark:text-slate-400">Rencana perjalanan Anda masih kosong.</p>
                  <button 
                    onClick={() => navigate('/experiences')}
                    className="mt-4 text-xs font-semibold text-primary dark:text-secondary-fixed border border-primary dark:border-secondary px-4 py-2 rounded-full hover:bg-primary/5 dark:hover:bg-secondary/5 cursor-pointer transition-colors"
                  >
                    Cari Aktivitas Wisata
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right: Question History */}
          <section className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/25">
              <span className="material-symbols-outlined text-primary dark:text-secondary-fixed">mail</span>
              <h2 className="text-xl font-bold text-on-surface">Riwayat Pertanyaan Saya</h2>
            </div>

            <div className="space-y-4">
              {userInquiries.length > 0 ? (
                userInquiries.map((inq) => (
                  <div 
                    key={inq.id}
                    className="p-5 border border-outline-variant/20 bg-white/40 dark:bg-black/5 rounded-2xl text-left space-y-3 shadow-inner"
                  >
                    <div className="flex justify-between items-center text-[10px] pb-2 border-b border-outline-variant/10">
                      <span className="text-subtext">{inq.date}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        inq.status === 'Menunggu Balasan' 
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' 
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-subtext uppercase tracking-wider block">Pertanyaan Anda:</span>
                      <p className="text-on-surface-variant dark:text-slate-300 text-xs leading-relaxed">{inq.message}</p>
                    </div>

                    {inq.reply ? (
                      <div className="p-3 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-primary dark:text-secondary-fixed uppercase tracking-wider block">Tanggapan Pengelola:</span>
                        <p className="text-on-surface dark:text-slate-200 text-xs leading-relaxed italic">"{inq.reply}"</p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 italic">
                        <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                        <span>Menunggu tanggapan resmi dari pengelola...</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-outline-variant/30 rounded-24 bg-white/30 dark:bg-black/5 text-center">
                  <span className="material-symbols-outlined text-3xl text-subtext mb-2">chat_bubble_outline</span>
                  <p className="text-xs text-subtext dark:text-slate-400">Anda belum pernah mengirimkan pertanyaan.</p>
                  <button 
                    onClick={() => navigate('/informasi')}
                    className="mt-3 text-[10px] font-semibold text-primary dark:text-secondary-fixed border border-primary dark:border-secondary px-3.5 py-1.5 rounded-full hover:bg-primary/5 dark:hover:bg-secondary/5 cursor-pointer transition-colors"
                  >
                    Tanya Panduan Wisata
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>

      </div>

      {/* Activity Detail Modal */}
      {selectedAct && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={selectedAct.title}
        >
          <div className="flex flex-col gap-6">
            <div className="w-full h-60 rounded-2xl overflow-hidden shadow-inner">
              <img 
                src={selectedAct.image} 
                alt={selectedAct.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 leading-relaxed text-sm">
                {selectedAct.description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20 text-xs">
                <div>
                  <span className="font-bold text-subtext uppercase block mb-1">Jam Operasional</span>
                  <p className="text-on-surface">{selectedAct.hours}</p>
                </div>
                <div>
                  <span className="font-bold text-subtext uppercase block mb-1">Tingkat Kesulitan</span>
                  <p className="text-on-surface">{selectedAct.difficulty}</p>
                </div>
              </div>
              <div className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-xl p-4 mt-2">
                <h4 className="font-bold text-primary dark:text-secondary-fixed-dim text-xs mb-1 text-left">Tips Khusus:</h4>
                <p className="text-on-surface-variant dark:text-slate-350 text-xs leading-relaxed text-left">
                  {selectedAct.tips}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
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
