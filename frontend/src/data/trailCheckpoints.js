import heroBg from '../assets/hero_bukit_kasih.png';
import belerangImg from '../assets/belerang.png';
import reliefImg from '../assets/relief.png';
import salibImg from '../assets/salib.png';
import ibadahImg from '../assets/ibadah.png';

export const trailCheckpoints = [
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
