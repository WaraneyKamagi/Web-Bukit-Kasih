import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Toast from '../components/Toast';
import heroBg from '../assets/hero_bukit_kasih.png';
import belerangImg from '../assets/belerang.png';
import ibadahImg from '../assets/ibadah.png';
import reliefImg from '../assets/relief.png';

export default function Informasi() {
  const { addInquiry } = useContext(AppContext);
  const [inquiry, setInquiry] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addInquiry(inquiry.name, inquiry.email, inquiry.message);
    setToastMessage(`Terima kasih ${inquiry.name}, pesan Anda berhasil dikirim!`);
    setIsToastOpen(true);
    setInquiry({ name: '', email: '', message: '' });
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[600px] w-full flex flex-col items-center justify-center mt-20">
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            alt="Bukit Belerang di Bukit Kasih" 
            className="w-full h-full object-cover" 
            src={heroBg}
          />
          <div className="absolute inset-0 bg-primary/20"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <span className="font-label-caps text-label-caps text-white bg-primary/30 px-4 py-1.5 rounded-full mb-4 border border-white/20 backdrop-blur-sm tracking-wider uppercase inline-block">
            Panduan & Fasilitas Wisata
          </span>
          <h1 className="font-display-xl text-display-xl text-white mb-4 drop-shadow-lg hidden md:block">Informasi Pengunjung</h1>
          <h1 className="font-display-xl-mobile text-display-xl-mobile text-white mb-2 drop-shadow-lg md:hidden">Informasi Pengunjung</h1>
          <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">Segala hal yang perlu Anda ketahui sebelum berkunjung ke Bukit Kasih Kanonang.</p>
        </div>
      </section>

      {/* Quick Info Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 -mt-24 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel-light p-6 rounded-24 shadow-lg text-left">
            <span className="material-symbols-outlined text-[36px] text-primary mb-4">schedule</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Jam Operasional</h3>
            <p className="font-body-md text-body-md text-subtext">Setiap Hari<br />08:00 - 18:00 WITA</p>
          </div>
          <div className="glass-panel-light p-6 rounded-24 shadow-lg text-left">
            <span className="material-symbols-outlined text-[36px] text-primary mb-4">payments</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Tiket Masuk</h3>
            <p className="font-body-md text-body-md text-subtext">Rp 5.000 / orang<br />(Belum termasuk parkir)</p>
          </div>
          <div className="glass-panel-light p-6 rounded-24 shadow-lg text-left">
            <span className="material-symbols-outlined text-[36px] text-primary mb-4">local_parking</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Biaya Parkir</h3>
            <p className="font-body-md text-body-md text-subtext">Motor: Rp 3.000<br />Mobil: Rp 5.000</p>
          </div>
          <div className="glass-panel-light p-6 rounded-24 shadow-lg text-left">
            <span className="material-symbols-outlined text-[36px] text-primary mb-4">explore</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Lokasi Utama</h3>
            <p className="font-body-md text-body-md text-subtext">Kanonang, Kawangkoan<br />Kab. Minahasa, Sulut</p>
          </div>
        </div>
      </section>

      {/* Facilities & Culinary Bento Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 text-left">
        <div className="mb-12">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-2 block">Lokal & Otentik</span>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Fasilitas & Kuliner Sekitar</h2>
          <p className="font-body-md text-body-md text-subtext mt-1">Dukung komunitas lokal dengan menikmati sajian kuliner khas dan membeli kerajinan tangan setempat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Card 1: Kuliner Kawangkoan */}
          <div className="md:col-span-8 group relative rounded-24 overflow-hidden h-[400px] shadow-sm">
            <img 
              alt="Kuliner khas Minahasa di Kawangkoan" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByW9AKaOIs_Raw1bhXbrdRmOG_4Q_86r_uwDXQEQFQDmquCtEJ8g9RGZxVC_gMRoDdutKjjryd40NjKjiW1Z8ZWtSUSghZ6o7Ws7CaAnCFVmfrrWBawrLSZpGaNqbjk3TyyYskEgXWWuTODR4BtPvCID6iGnywmV6em3m9Tg_TkqbsI5fig6wtli7Nbi5092GtEkjTXJr0iI22fMujfuiyKjEpHU_otz70kcByZfh3STRtBua5yET8bVBDuRfmPW9V7v0QJAbq4bk"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <span className="bg-accent-gold/90 text-on-surface px-3 py-1 rounded-full font-label-caps text-label-caps tracking-widest uppercase mb-2 inline-block">Wajib Coba</span>
              <h3 className="font-headline-lg text-headline-lg mb-2">Kuliner & Kopi Kawangkoan</h3>
              <p className="font-body-md text-body-md text-white/90 max-w-xl">
                Nikmati Kopi Kawangkoan legendaris berpadu dengan Biapong (Bakpao khas Minahasa) hangat dan kacang garing Kawangkoan di warung tradisional sekitar bukit.
              </p>
            </div>
          </div>

          {/* Card 2: Rebus Telur */}
          <div className="md:col-span-4 group relative rounded-24 overflow-hidden h-[400px] shadow-sm">
            <img 
              alt="Merebus telur langsung di kawah belerang" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={belerangImg}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="font-headline-md text-headline-md mb-2">Rebus Telur Belerang</h3>
              <p className="font-body-md text-body-md text-white/90">
                Rasakan keunikan merebus telur mentah secara langsung di dalam air kawah belerang yang mendidih alami.
              </p>
            </div>
          </div>

          {/* Card 3: Kerajinan Tangan */}
          <div className="md:col-span-4 group relative rounded-24 overflow-hidden h-[400px] shadow-sm">
            <img 
              alt="Kerajinan tangan kayu Minahasa" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={reliefImg}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="font-headline-md text-headline-md mb-2">Oleh-oleh & Souvenir</h3>
              <p className="font-body-md text-body-md text-white/90">
                Temukan aneka kerajinan tangan khas dari kayu, tempurung kelapa, serta anyaman tradisional Minahasa di lapak souvenir.
              </p>
            </div>
          </div>

          {/* Card 4: Sewa Pakaian Adat */}
          <div className="md:col-span-8 group relative rounded-24 overflow-hidden h-[400px] shadow-sm">
            <img 
              alt="Foto pakaian adat Minahasa" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={ibadahImg}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h3 className="font-headline-lg text-headline-lg mb-2">Penyewaan Baju Adat & Jasa Foto</h3>
              <p className="font-body-md text-body-md text-white/90 max-w-xl">
                Kenakan pakaian adat Minahasa dan berfoto dengan latar pemandangan bukit yang berkabut. Warga lokal menyediakan penyewaan baju dan jasa foto cetak kilat.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Visitor Tips Section */}
      <section className="bg-surface-container-low py-20 text-left">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-4 block">Tips Kunjungan</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Persiapan Sebelum Mendaki</h2>
            <p className="font-body-lg text-body-lg text-subtext mb-8">
              Mengingat area wisata ini menanjak dan memiliki suhu udara yang sejuk, berikut adalah beberapa tips praktis agar perjalanan Anda tetap nyaman:
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="material-symbols-outlined text-primary mr-3 mt-1">check_circle</span>
                <p className="font-body-md text-body-md text-on-surface"><strong>Gunakan Sepatu yang Nyaman:</strong> Anda akan mendaki sekitar 2.400 anak tangga. Hindari sandal tipis atau sepatu hak tinggi.</p>
              </div>
              <div className="flex items-start">
                <span className="material-symbols-outlined text-primary mr-3 mt-1">check_circle</span>
                <p className="font-body-md text-body-md text-on-surface"><strong>Bawa Pakaian Hangat:</strong> Lokasi bukit berada di ketinggian ~800 mdpl. Cuaca bisa menjadi dingin dan berkabut terutama di sore hari.</p>
              </div>
              <div className="flex items-start">
                <span className="material-symbols-outlined text-primary mr-3 mt-1">check_circle</span>
                <p className="font-body-md text-body-md text-on-surface"><strong>Bawa Botol Minum:</strong> Jaga hidrasi Anda selama pendakian. Tersedia warung kecil di sepanjang jalan, namun membawa air minum sendiri sangat disarankan.</p>
              </div>
            </div>
          </div>

          {/* Form Hubungi Kami */}
          <div className="md:w-1/2 w-full glass-panel-light p-8 rounded-24 shadow-md border border-white/60">
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Ada Pertanyaan?</h3>
            <p className="font-body-md text-body-md text-subtext mb-6">Kirimkan pesan Anda untuk informasi rute jalan, kunjungan kelompok besar, atau pemanduan khusus.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-caps text-label-caps text-subtext mb-1 text-xs">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={inquiry.name}
                  onChange={(e) => setInquiry(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-subtext mb-1 text-xs">Email</label>
                <input 
                  type="email" 
                  required
                  value={inquiry.email}
                  onChange={(e) => setInquiry(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-subtext mb-1 text-xs">Pesan Anda</label>
                <textarea 
                  rows="3"
                  required
                  value={inquiry.message}
                  onChange={(e) => setInquiry(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md"
                  placeholder="Ketik pertanyaan Anda di sini..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-[#0F4C81] text-white py-3 rounded-full hover:bg-primary font-body-md font-medium transition-colors shadow-sm">
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </section>
      {isToastOpen && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setIsToastOpen(false)}
        />
      )}
    </main>
  );
}
