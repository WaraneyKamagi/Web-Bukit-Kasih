import { useState } from 'react';
import Toast from './Toast';
import heroBg from '../assets/hero_bukit_kasih.png';

export default function HeroSection() {
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleScroll = (direction) => {
    if (direction === 'down') {
      const element = document.getElementById('destinations');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({
          top: window.innerHeight * 0.9,
          behavior: 'smooth'
        });
      }
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleTagClick = (tag) => {
    setToastMessage(`Menuju ke informasi landmark: ${tag}`);
    setIsToastOpen(true);

    // Smooth scroll to the corresponding section after a brief delay
    setTimeout(() => {
      const targetId = (tag === 'Kawah Belerang' || tag === 'Tangga Seribu') ? 'trail-map' : 'destinations';
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const tags = ['Rumah Ibadah', 'Salib Kasih', 'Relief Leluhur', 'Kawah Belerang', 'Tangga Seribu'];

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Pemandangan indah Bukit Kasih Kanonang"
          className="w-full h-full object-cover"
          src={heroBg}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-primary-container/10 to-background"></div>
      </div>

      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center mt-12 md:mt-20">
        <span className="font-label-caps text-label-caps text-on-primary bg-primary/30 px-4 py-1.5 rounded-full mb-6 border border-white/20 backdrop-blur-sm tracking-wider uppercase animate-fade-up delay-100">
          Wisata Religi & Alam
        </span>

        <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-on-primary mb-6 max-w-4xl drop-shadow-lg leading-tight animate-fade-up delay-200">
          Menemukan Kedamaian di Bukit Kasih
        </h1>

        <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mb-12 drop-shadow animate-fade-up delay-250">
          Destinasi harmoni kerukunan beragama dan pesona alam vulkanik legendaris di tanah Minahasa, Sulawesi Utara.
        </p>

        {/* Destination Tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 text-white/90 font-body-md text-body-md animate-fade-up delay-300">
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-4 py-2 rounded-full border border-white/20 glass-panel hover:bg-white/30 hover:-translate-y-1 hover:shadow-lg cursor-pointer transition-all duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll Indicator (Left Floating) */}
      <div className="absolute left-8 bottom-12 hidden md:flex flex-col items-center gap-4 z-10 text-white animate-fade-up delay-300">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleScroll('up')}
            className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300 group"
            aria-label="Scroll Up"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-y-1 transition-transform">north</span>
          </button>
          <button
            onClick={() => handleScroll('down')}
            className="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300 group"
            aria-label="Scroll Down"
          >
            <span className="material-symbols-outlined text-sm group-hover:translate-y-1 transition-transform">south</span>
          </button>
        </div>
        <span className="font-label-caps text-label-caps rotate-90 origin-left mt-8 tracking-widest text-white/80">SCROLL</span>
      </div>
      {isToastOpen && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setIsToastOpen(false)}
        />
      )}
    </section>
  );
}
