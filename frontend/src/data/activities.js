import ibadahImg from '../assets/ibadah.png';
import salibImg from '../assets/salib.png';
import reliefImg from '../assets/relief.png';
import belerangImg from '../assets/belerang.png';

export const activities = [
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
