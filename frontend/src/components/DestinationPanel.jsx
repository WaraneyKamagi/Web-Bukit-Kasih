import { useRef, useEffect, useState } from 'react';
import TravelCard from './TravelCard';
import Modal from './Modal';
import { destinations } from '../data/destinations';

export default function DestinationPanel() {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    const currentSection = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  const handleCardClick = (cat) => {
    setSelectedCat(cat);
    setIsModalOpen(true);
  };

  return (
    <section 
      id="destinations"
      ref={sectionRef}
      className={`py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal ${
        isActive ? 'active' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl text-left">
          <span className="font-label-caps text-label-caps text-primary dark:text-secondary-fixed tracking-widest uppercase mb-4 block">Landmark Utama</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Jelajahi Setiap Sudut Keindahan</h2>
        </div>
        <div className="max-w-md text-left">
          <p className="font-body-md text-body-md text-subtext dark:text-slate-400">
            Bukit Kasih menyimpan keindahan alam vulkanik yang dipadukan dengan nilai-nilai kerohanian dan budaya leluhur Minahasa yang tak lekang oleh waktu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((cat) => (
          <TravelCard 
            key={cat.title}
            title={cat.title}
            image={cat.image}
            altText={cat.altText}
            onClick={() => handleCardClick(cat)}
          />
        ))}
      </div>

      {/* Modal Detail Tengara */}
      {selectedCat && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={selectedCat.title}
        >
          <div className="flex flex-col gap-6">
            {/* Modal Image banner */}
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
              <img 
                src={selectedCat.image} 
                alt={selectedCat.altText} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Modal Descriptions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary dark:text-secondary-fixed-dim">
                {selectedCat.details.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 leading-relaxed">
                {selectedCat.details.text}
              </p>
              
              {/* Highlight Metas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary dark:text-secondary-fixed">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="font-semibold">Jam Operasional</span>
                  </div>
                  <p className="text-subtext dark:text-slate-400">{selectedCat.details.hours}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary dark:text-secondary-fixed">
                    <span className="material-symbols-outlined text-[18px]">hiking</span>
                    <span className="font-semibold">Tingkat Pendakian</span>
                  </div>
                  <p className="text-subtext dark:text-slate-400">{selectedCat.details.difficulty}</p>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl p-5 mt-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary dark:text-secondary-fixed-dim mt-0.5">tips_and_updates</span>
                  <div className="text-left">
                    <h4 className="font-bold text-primary dark:text-secondary-fixed-dim text-sm mb-1">Tips Berkunjung:</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300 text-xs leading-relaxed">
                      {selectedCat.details.tips}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
