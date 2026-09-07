import { useState, useContext, useEffect } from 'react';
import { useAnnouncement } from '../context/AnnouncementContext';

export default function AnnouncementBanner() {
  const { announcement } = useAnnouncement();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state whenever announcement content changes
  useEffect(() => {
    setDismissed(false);
  }, [announcement]);

  if (!announcement || dismissed) return null;

  return (
    <div className="fixed top-20 left-0 w-full z-40 bg-amber-600 dark:bg-amber-700/95 text-white py-2.5 px-6 md:px-12 flex items-center justify-center gap-3 shadow-lg animate-fade-in text-center transition-all duration-300 backdrop-blur-md border-b border-amber-500/30">
      <span className="material-symbols-outlined text-[20px] animate-pulse shrink-0 text-amber-200">warning</span>
      <p className="font-body-md text-xs md:text-sm font-semibold select-none leading-snug">
        <span className="font-bold uppercase tracking-wider text-amber-200 mr-1.5 text-[10px] md:text-[11px] bg-black/25 px-2 py-0.5 rounded-full inline-block">
          Pengumuman Pengelola:
        </span>
        {announcement}
      </p>
      <button 
        onClick={() => setDismissed(true)} 
        className="hover:bg-white/20 transition-colors shrink-0 flex items-center justify-center p-1 rounded-full absolute right-3 md:right-8 cursor-pointer text-white"
        aria-label="Tutup Pengumuman"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
