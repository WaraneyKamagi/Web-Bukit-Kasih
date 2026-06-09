import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

// Import image assets for bookmarks display
import ibadahImg from '../assets/ibadah.png';
import salibImg from '../assets/salib.png';
import reliefImg from '../assets/relief.png';
import belerangImg from '../assets/belerang.png';

// Keep activities list reference for mapping bookmarks
const activitiesReference = [
  {
    id: 'act1',
    title: 'Ziarah Harmoni Kebersamaan',
    location: 'Puncak Bukit Kasih',
    image: ibadahImg,
    hours: 'Buka Setiap Hari | 08:00 - 18:00 WITA',
    description: 'Merenungkan nilai-nilai kedamaian, persatuan, dan toleransi beragama di lima tempat ibadah resmi yang berdiri berdampingan secara harmonis di atas puncak tertinggi Bukit Kasih.',
    difficulty: 'Tinggi (~2.400 anak tangga)',
    tips: 'Kenakan pakaian sopan saat berkunjung. Anda dipersilakan masuk dan berdoa sesuai dengan keyakinan masing-masing.'
  },
  {
    id: 'act2',
    title: 'Mendaki Tangga Seribu',
    location: 'Tangga Kasih, Bukit Kasih',
    image: salibImg,
    hours: 'Akses 24 Jam',
    description: 'Uji fisik Anda dengan mendaki jalur melingkar tangga beton yang mengelilingi perbukitan belerang. Menyuguhkan pemandangan menakjubkan dari ketinggian.',
    difficulty: 'Sedang-Tinggi (2.400 anak tangga)',
    tips: 'Bawa botol minum isi ulang untuk menjaga hidrasi. Ada beberapa pos perhentian (gazebo) untuk beristirahat di sepanjang tangga.'
  },
  {
    id: 'act3',
    title: 'Terapi Air Belerang Alami',
    location: 'Kawah Belerang, Lembah',
    image: belerangImg,
    hours: 'Buka Setiap Hari | 08:00 - 17:30 WITA',
    description: 'Rendam kaki Anda di kolam air hangat alami yang kaya mineral belerang langsung dari kawah gunung. Sangat berkhasiat meringankan kelelahan otot kaki setelah berjalan jauh.',
    difficulty: 'Mudah (Di kaki bukit dekat gerbang masuk)',
    tips: 'Bawa handuk kecil sendiri dari rumah. Tarif rendam kaki sangat terjangkau dan langsung dibayarkan ke pengelola lokal.'
  },
  {
    id: 'act4',
    title: 'Relief Sejarah Toar Lumimuut',
    location: 'Dinding Bukit Belerang',
    image: reliefImg,
    hours: 'Buka Setiap Hari | 08:00 - 18:00 WITA',
    description: 'Menyaksikan dan mempelajari legenda nenek moyang suku Minahasa, Toar dan Lumimuut, yang dipahat dengan rapi di lereng tebing bukit belerang vulkanik.',
    difficulty: 'Sedang (Sekitar 500 anak tangga)',
    tips: 'Aroma belerang di sini bisa cukup menyengat saat angin berembus. Bawa masker jika Anda sensitif terhadap aroma belerang.'
  },
  {
    id: 'act5',
    title: 'Kuliner Kopi & Biapong Kawangkoan',
    location: 'Sekitar Kawasan Wisata',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByW9AKaOIs_Raw1bhXbrdRmOG_4Q_86r_uwDXQEQFQDmquCtEJ8g9RGZxVC_gMRoDdutKjjryd40NjKjiW1Z8ZWtSUSghZ6o7Ws7CaAnCFVmfrrWBawrLSZpGaNqbjk3TyyYskEgXWWuTODR4BtPvCID6iGnywmV6em3m9Tg_TkqbsI5fig6wtli7Nbi5092GtEkjTXJr0iI22fMujfuiyKjEpHU_otz70kcByZfh3STRtBua5yET8bVBDuRfmPW9V7v0QJAbq4bk',
    hours: 'Warung Buka 07:00 - 20:00 WITA',
    description: 'Menikmati kelezatan legendaris Kopi Susu Kawangkoan tradisional berpadu dengan Biapong (Bakpao khas Minahasa) hangat yang manis atau gurih setelah puas menjelajah bukit.',
    difficulty: 'Sangat Mudah',
    tips: 'Biapong temo (isi kacang merah) dan biapong daging sangat lezat disajikan selagi hangat bersama kopi susu lokal.'
  },
  {
    id: 'act6',
    title: 'Rebus Telur Kawah Belerang',
    location: 'Kawah Panas Bumi, Lembah',
    image: belerangImg,
    hours: 'Buka Setiap Hari | 08:00 - 17:00 WITA',
    description: 'Rasakan pengalaman menyenangkan merebus telur mentah secara langsung di dalam aliran air kawah panas bumi belerang yang mendidih secara alami.',
    difficulty: 'Mudah',
    tips: 'Pedagang lokal menjual telur ayam mentah lengkap dengan wadah jaring kecilnya. Cukup celupkan selama 5-10 menit untuk mendapatkan telur rebus belerang setengah matang yang lezat.'
  },
  {
    id: 'act7',
    title: 'Foto Pakaian Adat Minahasa',
    location: 'Pintu Masuk & Spot Foto Utama',
    image: reliefImg,
    hours: 'Tersedia 08:30 - 17:30 WITA',
    description: 'Kenakan pakaian adat kebesaran suku Minahasa dan berfotolah dengan latar belakang pemandangan tebing belerang yang eksotis dan berasap kabut.',
    difficulty: 'Sangat Mudah',
    tips: 'Jasa foto cetak kilat lokal tersedia dengan harga terjangkau. Hasil foto biasanya dicetak langsung dan dapat dibawa pulang sebagai cinderamata.'
  }
];

export default function Profile() {
  const { user, inquiries } = useContext(AppContext);
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
  const bookmarkedActivities = activitiesReference.filter(act => 
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
