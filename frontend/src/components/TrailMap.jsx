import { useState } from 'react';
import heroBg from '../assets/hero_bukit_kasih.png';
import belerangImg from '../assets/belerang.png';
import reliefImg from '../assets/relief.png';
import salibImg from '../assets/salib.png';
import ibadahImg from '../assets/ibadah.png';

export default function TrailMap() {
  const [activeStep, setActiveStep] = useState(0);

  const checkpoints = [
    {
      title: 'Gerbang Utama & Parkir',
      subtitle: 'Titik Awal Pendakian (~0 mdpl)',
      description: 'Titik awal perjalanan Anda di mana tiket masuk dibeli. Area parkir yang luas dikelilingi oleh pemandangan perbukitan hijau Minahasa. Di sini Anda bisa menyewa tongkat jalan atau beristirahat sebelum memulai pendakian.',
      image: heroBg,
      duration: '0 Menit (Start)',
      difficulty: 'Sangat Mudah',
      tips: 'Gunakan sepatu olahraga yang nyaman dengan sol bergerigi karena jalur anak tangga bisa licin terkena embun dan belerang.',
      icon: 'door_front'
    },
    {
      title: 'Terapi Air Hangat Belerang',
      subtitle: 'Kaki Bukit Belakang',
      description: 'Kolam air hangat alami yang kaya belerang hasil aktivitas vulkanik. Sangat digemari pengunjung untuk merendam kaki yang lelah. Di dekatnya terdapat kawah mendidih alami di mana pengunjung dapat merebus telur mentah secara langsung.',
      image: belerangImg,
      duration: '10 Menit dari Gerbang',
      difficulty: 'Mudah',
      tips: 'Anda bisa membeli telur ayam mentah di warung sekitar seharga Rp 5.000 untuk merebusnya langsung di dalam jaring kawah panas alami.',
      icon: 'hot_tub'
    },
    {
      title: 'Tebing Relief Toar Lumimuut',
      subtitle: 'Tebing Belerang Terjal',
      description: 'Dinding bukit batu belerang yang diukir membentuk wajah relief raksasa leluhur legendaris suku Minahasa, Toar dan Lumimuut. Karya seni pahat ini berdiri megah di lereng yang terus mengeluarkan asap belerang alami.',
      image: reliefImg,
      duration: '25 Menit (Anak Tangga Ke-500)',
      difficulty: 'Sedang',
      tips: 'Uap belerang di sini cukup pekat. Pengguna dengan masalah pernapasan disarankan membawa masker kain penutup hidung.',
      icon: 'sculpture'
    },
    {
      title: 'Monumen Salib Kasih',
      subtitle: 'Puncak Bukit Pertama',
      description: 'Sebuah monumen salib putih megah setinggi 22 meter yang berdiri kokoh di puncak bukit pertama. Lokasi ini menawarkan pemandangan panorama lembah Kanonang dan pegunungan Minahasa yang spektakuler.',
      image: salibImg,
      duration: '45 Menit (Anak Tangga Ke-1.200)',
      difficulty: 'Cukup Berat',
      tips: 'Lokasi yang sangat bagus untuk mengambil foto panorama sudut tinggi (high-angle) dengan latar belakang perbukitan hijau.',
      icon: 'token'
    },
    {
      title: 'Puncak Lima Rumah Ibadah',
      subtitle: 'Puncak Tertinggi Bukit Kasih',
      description: 'Simbol toleransi sejati di mana lima tempat ibadah dari agama Kristen, Katolik, Islam, Buddha, dan Hindu berdiri berdampingan secara harmonis di satu puncak melingkar. Tempat yang penuh kedamaian spiritual.',
      image: ibadahImg,
      duration: '60 Menit (Anak Tangga Ke-2.400)',
      difficulty: 'Berat',
      tips: 'Suhu di puncak bisa sangat dingin dan berkabut terutama setelah pukul 15:00 WITA. Disarankan membawa jaket atau pakaian hangat.',
      icon: 'diversity_3'
    }
  ];

  return (
    <section 
      id="trail-map"
      className="py-24 bg-surface-container-low/30 dark:bg-inverse-surface/10 px-margin-mobile md:px-margin-desktop transition-colors duration-300"
    >
      <div className="max-w-container-max mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps text-primary dark:text-secondary-container tracking-widest uppercase mb-4 block">
            Petualangan 2.400 Tangga
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Panduan Rute & Jalur Interaktif
          </h2>
          <p className="font-body-lg text-body-lg text-subtext max-w-2xl mx-auto">
            Jelajahi setiap pos penting dari rute melingkar Bukit Kasih Kanonang sebelum Anda memulai pendakian langsung.
          </p>
        </div>

        {/* Interactive Stepper Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Stepper Indicator */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative pl-6 md:pl-8 border-l border-outline-variant/50 space-y-6 text-left">
              {checkpoints.map((cp, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div 
                    key={cp.title}
                    onClick={() => setActiveStep(idx)}
                    className="relative cursor-pointer group"
                  >
                    {/* Active/Inactive Circle */}
                    <div className={`absolute -left-[39px] md:-left-[47px] top-1 w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary border-primary text-white scale-110 shadow-md shadow-primary/20 dark:bg-secondary dark:border-secondary dark:text-on-secondary' 
                        : 'bg-white border-outline-variant/60 text-outline group-hover:border-primary/50 group-hover:text-primary dark:bg-inverse-surface'
                    }`}>
                      <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                        {cp.icon}
                      </span>
                    </div>

                    {/* Step Content summary */}
                    <div className="pl-4">
                      <span className={`font-label-caps text-label-caps tracking-wider block text-xs mb-1 ${
                        isActive ? 'text-primary dark:text-secondary-container font-semibold' : 'text-subtext'
                      }`}>
                        POS 0{idx + 1}
                      </span>
                      <h3 className={`font-headline-md text-headline-md leading-tight transition-colors ${
                        isActive ? 'text-on-surface font-semibold' : 'text-on-surface-variant group-hover:text-primary dark:group-hover:text-secondary-fixed'
                      }`}>
                        {cp.title}
                      </h3>
                      <p className="font-body-md text-body-md text-subtext text-sm mt-1 line-clamp-1">
                        {cp.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Active Detail Panel */}
          <div className="lg:col-span-7">
            <div className="glass-panel-light dark:glass-panel bg-white/70 dark:bg-black/20 rounded-[32px] p-6 md:p-8 shadow-xl border border-white/50 dark:border-white/10 overflow-hidden flex flex-col md:flex-row gap-8 min-h-[420px] transition-all duration-500 scale-100">
              
              {/* Checkpoint Image */}
              <div className="w-full md:w-1/2 h-64 md:h-auto rounded-[20px] overflow-hidden relative shadow-inner shrink-0 bg-surface-variant">
                <img 
                  alt={checkpoints[activeStep].title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                  src={checkpoints[activeStep].image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Float Badge */}
                <div className="absolute bottom-4 left-4 bg-primary/80 dark:bg-secondary/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white font-label-caps text-[10px] tracking-wider uppercase">
                  {checkpoints[activeStep].duration}
                </div>
              </div>

              {/* Checkpoint Text Details */}
              <div className="flex-1 flex flex-col text-left">
                <span className="font-label-caps text-label-caps text-primary dark:text-secondary-container tracking-wider text-xs uppercase mb-1">
                  Detail Pos Wisata
                </span>
                <h4 className="font-headline-lg text-headline-lg text-on-surface leading-tight font-semibold mb-3">
                  {checkpoints[activeStep].title}
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-white/80 leading-relaxed mb-6 flex-1 text-sm">
                  {checkpoints[activeStep].description}
                </p>

                {/* Additional Metadata Card */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                  <div>
                    <span className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-1">Tingkat Kesulitan</span>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary dark:text-secondary-fixed">fitness_center</span>
                      <span className="font-body-md text-body-md text-on-surface text-sm font-semibold">{checkpoints[activeStep].difficulty}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-label-caps text-subtext uppercase tracking-wider mb-1">Tips Praktis</span>
                    <p className="font-body-md text-body-md text-on-surface text-xs leading-snug">{checkpoints[activeStep].tips}</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
