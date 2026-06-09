import { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

// Import Assets
import heroBg from '../assets/hero_bukit_kasih.png';
import ibadahImg from '../assets/ibadah.png';
import salibImg from '../assets/salib.png';
import reliefImg from '../assets/relief.png';
import belerangImg from '../assets/belerang.png';

const activities = [
  {
    id: 'act1',
    title: 'Ziarah Harmoni Kebersamaan',
    location: 'Puncak Bukit Kasih, Kanonang',
    description: 'Merenungkan nilai-nilai kedamaian, persatuan, dan toleransi beragama di lima tempat ibadah resmi yang berdiri berdampingan secara harmonis di atas puncak tertinggi Bukit Kasih.',
    image: ibadahImg,
    categories: ['Ziarah'],
    hours: 'Buka Setiap Hari | 08:00 - 18:00 WITA',
    meta: 'Ziarah Utama',
    isFav: true,
    difficulty: 'Tinggi (Jalur menanjak 2.400 anak tangga)',
    tips: 'Kenakan pakaian sopan saat berkunjung. Anda dipersilakan masuk dan berdoa sesuai dengan keyakinan masing-masing.'
  },
  {
    id: 'act2',
    title: 'Mendaki Tangga Seribu',
    location: 'Tangga Kasih, Bukit Kasih',
    description: 'Uji fisik Anda dengan mendaki jalur melingkar tangga beton yang mengelilingi perbukitan belerang. Menyuguhkan pemandangan menakjubkan dari ketinggian.',
    image: salibImg,
    categories: ['Ziarah', 'Rekreasi'],
    hours: 'Akses 24 Jam (Disarankan siang hari)',
    meta: 'Kegiatan Fisik',
    isFav: false,
    difficulty: 'Sedang-Tinggi (2.400 anak tangga)',
    tips: 'Bawa botol minum isi ulang untuk menjaga hidrasi. Ada beberapa pos perhentian (gazebo) untuk beristirahat di sepanjang tangga.'
  },
  {
    id: 'act3',
    title: 'Terapi Air Belerang Alami',
    location: 'Kawah Belerang, Lembah Bukit',
    description: 'Rendam kaki Anda di kolam air hangat alami yang kaya mineral belerang langsung dari kawah gunung. Sangat berkhasiat meringankan kelelahan otot kaki setelah berjalan jauh.',
    image: belerangImg,
    categories: ['Rekreasi'],
    hours: 'Buka Setiap Hari | 08:00 - 17:30 WITA',
    meta: 'Terapi Kesehatan',
    isFav: true,
    difficulty: 'Mudah (Di kaki bukit dekat gerbang masuk)',
    tips: 'Bawa handuk kecil sendiri dari rumah. Tarif rendam kaki sangat terjangkau dan langsung dibayarkan ke pengelola lokal.'
  },
  {
    id: 'act4',
    title: 'Relief Sejarah Toar Lumimuut',
    location: 'Dinding Bukit Belerang',
    description: 'Menyaksikan dan mempelajari legenda nenek moyang suku Minahasa, Toar dan Lumimuut, yang dipahat dengan rapi di lereng tebing bukit belerang vulkanik.',
    image: reliefImg,
    categories: ['Budaya'],
    hours: 'Buka Setiap Hari | 08:00 - 18:00 WITA',
    meta: 'Edukasi Budaya',
    isFav: false,
    difficulty: 'Sedang (Sekitar 500 anak tangga)',
    tips: 'Aroma belerang di sini bisa cukup menyengat saat angin berembus. Bawa masker jika Anda sensitif terhadap aroma belerang.'
  },
  {
    id: 'act5',
    title: 'Kuliner Kopi & Biapong Kawangkoan',
    location: 'Sekitar Kawasan Wisata',
    description: 'Menikmati kelezatan legendaris Kopi Susu Kawangkoan tradisional berpadu dengan Biapong (Bakpao khas Minahasa) hangat yang manis atau gurih setelah puas menjelajah bukit.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByW9AKaOIs_Raw1bhXbrdRmOG_4Q_86r_uwDXQEQFQDmquCtEJ8g9RGZxVC_gMRoDdutKjjryd40NjKjiW1Z8ZWtSUSghZ6o7Ws7CaAnCFVmfrrWBawrLSZpGaNqbjk3TyyYskEgXWWuTODR4BtPvCID6iGnywmV6em3m9Tg_TkqbsI5fig6wtli7Nbi5092GtEkjTXJr0iI22fMujfuiyKjEpHU_otz70kcByZfh3STRtBua5yET8bVBDuRfmPW9V7v0QJAbq4bk',
    categories: ['Kuliner'],
    hours: 'Warung Buka 07:00 - 20:00 WITA',
    meta: 'Kuliner Khas',
    isFav: true,
    difficulty: 'Sangat Mudah (Di warung-warung sekitar)',
    tips: 'Biapong temo (isi kacang merah) dan biapong daging sangat lezat disajikan selagi hangat bersama kopi susu lokal.'
  },
  {
    id: 'act6',
    title: 'Rebus Telur Kawah Belerang',
    location: 'Kawah Panas Bumi, Lembah',
    description: 'Rasakan pengalaman menyenangkan merebus telur mentah secara langsung di dalam aliran air kawah panas bumi belerang yang mendidih secara alami.',
    image: belerangImg,
    categories: ['Rekreasi', 'Kuliner'],
    hours: 'Buka Setiap Hari | 08:00 - 17:00 WITA',
    meta: 'Aktivitas Unik',
    isFav: false,
    difficulty: 'Mudah',
    tips: 'Pedagang lokal menjual telur ayam mentah lengkap dengan wadah jaring kecilnya. Cukup celupkan selama 5-10 menit untuk mendapatkan telur rebus belerang setengah matang yang lezat.'
  },
  {
    id: 'act7',
    title: 'Foto Pakaian Adat Minahasa',
    location: 'Pintu Masuk & Spot Foto Utama',
    description: 'Kenakan pakaian adat kebesaran suku Minahasa dan berfotolah dengan latar belakang pemandangan tebing belerang yang eksotis dan berasap kabut.',
    image: reliefImg,
    categories: ['Budaya'],
    hours: 'Tersedia 08:30 - 17:30 WITA',
    meta: 'Kenangan Lokal',
    isFav: false,
    difficulty: 'Sangat Mudah',
    tips: 'Jasa foto cetak kilat lokal tersedia dengan harga terjangkau. Hasil foto biasanya dicetak langsung dan dapat dibawa pulang sebagai cinderamata.'
  }
];

const testimonials = [
  {
    text: "Melihat lima tempat ibadah berdampingan di puncak bukit memberikan kedamaian spiritual yang luar biasa. Keramahtamahan warga lokal serta terapi air belerang hangatnya membuat perjalanan ziarah ini tidak terlupakan.",
    author: "Budi Santoso",
    role: "Wisatawan Domestik (Jakarta)"
  },
  {
    text: "Suasana di puncak lima rumah ibadah sangat menenteramkan jiwa. Keberagaman dan kedamaian terasa nyata di sini. Pemandangannya juga sangat indah meski harus naik tangga cukup tinggi. Perjuangan mendaki terbayar lunas!",
    author: "Maria S. Kaunang",
    role: "Wisatawan Religi (Manado)"
  },
  {
    text: "Sangat menikmati kolam terapi air belerang setelah mendaki tangga seribu. Telur rebus belerangnya unik dan kopi Kawangkoannya mantap sekali. Warga lokal sangat ramah membantu kami selama pendakian.",
    author: "Christian W.",
    role: "Wisatawan Lokal (Tomohon)"
  }
];

export default function Experiences() {
  const [activeFilter, setActiveFilter] = useState('Ziarah');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isToastOpen, setIsToastOpen] = useState(false);
  
  // Modal Details State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Global Context & Review Forms State
  const { reviews, addReview, user } = useContext(AppContext);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState('');

  // Bookmark State
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('bukit_kasih_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Testimonials State
  const [activeSlide, setActiveSlide] = useState(0);

  const sectionRef = useRef(null);
  const testimonialRef = useRef(null);
  const [sectionActive, setSectionActive] = useState(false);
  const [testimonialActive, setTestimonialActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('bukit_kasih_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const currentSection = sectionRef.current;
    const currentTestimonial = testimonialRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target === currentSection && entry.isIntersecting) {
            setSectionActive(true);
          }
          if (entry.target === currentTestimonial && entry.isIntersecting) {
            setTestimonialActive(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (currentSection) observer.observe(currentSection);
    if (currentTestimonial) observer.observe(currentTestimonial);

    return () => {
      if (currentSection) observer.unobserve(currentSection);
      if (currentTestimonial) observer.unobserve(currentTestimonial);
    };
  }, []);

  // Auto-slide Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewTextInput.trim()) return;
    addReview(selectedActivity.id, user.name, ratingInput, reviewTextInput);
    showToast('Ulasan Anda berhasil ditambahkan!', 'success');
    setReviewTextInput('');
    setRatingInput(5);
  };

  const toggleBookmark = (id, title, e) => {
    e.stopPropagation(); // Prevent modal opening when bookmark is clicked
    if (bookmarks.includes(id)) {
      setBookmarks(prev => prev.filter(item => item !== id));
      showToast(`Aktivitas "${title}" dihapus dari rencana perjalanan.`, 'info');
    } else {
      setBookmarks(prev => [...prev, id]);
      showToast(`Aktivitas "${title}" ditambahkan ke rencana perjalanan!`, 'success');
    }
  };

  const filters = ['Ziarah', 'Rekreasi', 'Budaya', 'Kuliner'];

  // Filter activities based on selection
  const filteredActivities = activities.filter(act => 
    act.categories.includes(activeFilter)
  );

  const handleCardClick = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handlePrevTestimonial = () => {
    setActiveSlide(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextTestimonial = () => {
    setActiveSlide(prev => (prev + 1) % testimonials.length);
  };

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Tempat ibadah di puncak Bukit Kasih" 
            className="w-full h-full object-cover object-center scale-105" 
            src={ibadahImg}
          />
          <div className="absolute inset-0 bg-primary/25 mix-blend-multiply"></div>
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <span className="font-label-caps text-label-caps text-white tracking-[0.2em] uppercase mb-4 block drop-shadow-md">
            Pengalaman Spiritual & Alam
          </span>
          <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-white mb-6 drop-shadow-lg leading-tight">
            Aktivitas & Pengalaman Ziarah
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mx-auto mb-10 drop-shadow">
            Rasakan kebersamaan dalam toleransi dan keindahan spiritual di tengah alam Minahasa yang sejuk dan berkabut.
          </p>
          
          {/* Floating Filter Bar */}
          <div className="glass-panel rounded-24 p-2 inline-flex items-center mx-auto shadow-lg max-w-full overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 px-2">
              {filters.map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2.5 font-body-md text-body-md rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    activeFilter === filter 
                      ? 'text-primary dark:text-white font-semibold bg-white/30 dark:bg-white/10 shadow-sm' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experiences Grid */}
      <section 
        ref={sectionRef}
        className={`max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 reveal ${
          sectionActive ? 'active' : ''
        }`}
      >
        <div className="mb-16 flex justify-between items-end">
          <div className="text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">Aktivitas Kategori: {activeFilter}</h2>
            <p className="font-body-lg text-body-lg text-subtext dark:text-slate-400">Rekomendasi kegiatan menarik dan berkesan selama kunjungan Anda.</p>
          </div>
        </div>

        {/* Bento Grid Layout (Dynamic based on filter) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[400px] transition-all duration-500">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => {
              const isBookmarked = bookmarks.includes(act.id);
              // Handle layout span based on item index or custom settings
              const spanClass = act.gridSpan || (filteredActivities.length === 1 ? 'md:col-span-12' : 'md:col-span-6');
              
              return (
                <article 
                  key={act.id}
                  onClick={() => handleCardClick(act)}
                  className={`${spanClass} group relative rounded-24 overflow-hidden shadow-md cursor-pointer border border-outline-variant/10`}
                >
                  <img 
                    alt={act.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={act.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                  
                  {/* Content overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white text-left">
                    <div className="mb-auto flex justify-between items-start">
                      <span className="bg-primary/90 dark:bg-primary-container backdrop-blur-md px-3 py-1 rounded-full font-label-caps text-[10px] tracking-widest uppercase text-white dark:text-on-primary-container">
                        {act.meta}
                      </span>
                      <button 
                        onClick={(e) => toggleBookmark(act.id, act.title, e)}
                        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/90 dark:hover:bg-white/20 transition-all cursor-pointer group/btn active:scale-95 shadow-sm"
                        aria-label="Bookmark"
                      >
                        <span className={`material-symbols-outlined text-white transition-colors ${
                          isBookmarked ? 'text-accent-gold fill-1' : 'group-hover/btn:text-accent-gold'
                        }`} style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                          {isBookmarked ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>
                    </div>
                    
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2 text-white/80 font-body-md text-sm">
                        <span className="material-symbols-outlined text-[18px] text-accent-gold">location_on</span>
                        <span>{act.location}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
                        {act.title}
                      </h3>
                      <p className="font-body-md text-body-md text-white/80 line-clamp-2 max-w-xl mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-xs md:text-sm">
                        {act.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="text-xs text-white/70 font-medium">
                          {act.hours}
                        </div>
                        <button className="bg-white dark:bg-surface-bright text-primary px-5 py-2 rounded-full font-body-md text-xs font-semibold hover:bg-slate-100 transition-colors shadow-sm cursor-pointer">
                          Selengkapnya
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-12 flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-white/5 rounded-24">
              <span className="material-symbols-outlined text-[48px] text-subtext mb-2">sentiment_dissatisfied</span>
              <p className="text-subtext dark:text-slate-400">Tidak ada aktivitas ditemukan untuk kategori ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonial Section */}
      <section 
        ref={testimonialRef}
        className={`relative w-full py-24 overflow-hidden reveal ${
          testimonialActive ? 'active' : ''
        }`}
      >
        <div className="absolute inset-0 z-0">
          <img 
            alt="Pemandangan perbukitan Minahasa" 
            className="w-full h-full object-cover" 
            src={heroBg}
          />
          <div className="absolute inset-0 bg-primary-container/20 dark:bg-black/60 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <div className="glass-panel-light rounded-24 p-8 md:p-16 shadow-xl border border-white/40 relative">
            
            {/* Absolute navigation arrows on testimonial */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
              <button 
                onClick={handlePrevTestimonial}
                className="w-10 h-10 rounded-full bg-white/70 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 flex items-center justify-center shadow-md text-primary dark:text-white transition-colors cursor-pointer pointer-events-auto active:scale-95"
                aria-label="Testimonial Sebelumnya"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button 
                onClick={handleNextTestimonial}
                className="w-10 h-10 rounded-full bg-white/70 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 flex items-center justify-center shadow-md text-primary dark:text-white transition-colors cursor-pointer pointer-events-auto active:scale-95"
                aria-label="Testimonial Berikutnya"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            <span className="material-symbols-outlined text-[48px] text-primary/40 dark:text-secondary-fixed-dim/40 mb-4 select-none">
              format_quote
            </span>

            {/* Carousel Active Slide */}
            <div className="min-h-[160px] flex flex-col justify-center transition-all duration-500">
              <p className="font-headline-md text-headline-md text-primary dark:text-secondary-fixed mb-8 leading-relaxed italic text-lg md:text-xl">
                "{testimonials[activeSlide].text}"
              </p>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden mb-3 border-2 border-white dark:border-slate-800 shadow-sm bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-2xl select-none">
                    account_circle
                  </span>
                </div>
                <h4 className="font-bold text-on-surface text-base md:text-lg">
                  {testimonials[activeSlide].author}
                </h4>
                <span className="font-body-md text-body-md text-subtext dark:text-slate-400 text-xs md:text-sm">
                  {testimonials[activeSlide].role}
                </span>
              </div>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2.5 mt-8 z-20">
              {testimonials.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx 
                      ? 'w-8 bg-primary dark:bg-secondary' 
                      : 'w-2 bg-outline-variant hover:bg-primary/50 dark:hover:bg-secondary/50'
                  }`}
                  aria-label={`Pilih Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={selectedActivity.title}
        >
          <div className="flex flex-col gap-6">
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
              <img 
                src={selectedActivity.image} 
                alt={selectedActivity.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent-gold">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>{selectedActivity.location}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 leading-relaxed">
                {selectedActivity.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary dark:text-secondary-fixed text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>Jadwal Operasional</span>
                  </div>
                  <p className="text-subtext dark:text-slate-400 text-xs">{selectedActivity.hours}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary dark:text-secondary-fixed text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">fitness_center</span>
                    <span>Tingkat Kesulitan</span>
                  </div>
                  <p className="text-subtext dark:text-slate-400 text-xs">{selectedActivity.difficulty}</p>
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl p-5 mt-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary dark:text-secondary-fixed-dim mt-0.5">tips_and_updates</span>
                  <div className="text-left">
                    <h4 className="font-bold text-primary dark:text-secondary-fixed-dim text-sm mb-1">Tips Pendakian:</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-xs leading-relaxed">
                      {selectedActivity.tips}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="border-t border-outline-variant/20 pt-6 mt-6">
                <h4 className="font-bold text-on-surface text-base mb-4 flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-primary dark:text-secondary-fixed text-[20px]">rate_review</span>
                  <span>Ulasan Pengunjung ({reviews.filter(r => r.activityId === selectedActivity.id).length})</span>
                </h4>
                
                {/* List of reviews */}
                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                  {reviews.filter(r => r.activityId === selectedActivity.id).length > 0 ? (
                    reviews.filter(r => r.activityId === selectedActivity.id).map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-outline-variant/15 bg-slate-50/30 dark:bg-white/5 space-y-1 text-left">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-on-surface">{rev.author}</span>
                          <span className="text-subtext text-[10px]">{rev.date}</span>
                        </div>
                        <div className="flex text-accent-gold text-[12px] gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                          ))}
                        </div>
                        <p className="text-on-surface-variant dark:text-slate-350 text-xs leading-relaxed">
                          "{rev.text}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-subtext dark:text-slate-400 italic text-left">Belum ada ulasan untuk aktivitas ini. Jadilah yang pertama!</p>
                  )}
                </div>

                {/* Add review form */}
                {user ? (
                  user.role === 'Wisatawan' ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-3 pt-4 border-t border-outline-variant/10 text-left">
                      <h5 className="text-xs font-bold text-on-surface">Tulis Ulasan Anda:</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-subtext">Rating:</span>
                        <div className="flex text-accent-gold cursor-pointer select-none">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              onClick={() => setRatingInput(star)}
                              className="material-symbols-outlined text-[18px] hover:scale-110 transition-transform"
                              style={{ fontVariationSettings: star <= ratingInput ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          required
                          value={reviewTextInput}
                          onChange={(e) => setReviewTextInput(e.target.value)}
                          placeholder="Tulis ulasan pengalaman Anda..."
                          className="flex-grow p-2.5 rounded-xl border border-outline-variant bg-white dark:bg-black/10 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button 
                          type="submit" 
                          className="bg-[#0F4C81] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary transition-colors cursor-pointer shrink-0"
                        >
                          Kirim
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-white/5 border border-outline-variant/15 rounded-xl text-left">
                      <p className="text-xs text-subtext dark:text-slate-400 italic">Akun pengelola tidak dapat memberikan ulasan pariwisata.</p>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-white/5 border border-outline-variant/15 rounded-xl text-left">
                    <p className="text-xs text-subtext dark:text-slate-400">
                      Silakan **login sebagai Wisatawan** untuk dapat menulis ulasan mengenai aktivitas ini.
                    </p>
                  </div>
                )}
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
