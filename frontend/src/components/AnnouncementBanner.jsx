import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function AnnouncementBanner() {
  const { announcement } = useContext(AppContext);
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-amber-600 dark:bg-amber-700/90 text-white py-3 px-12 relative z-40 flex items-center justify-center gap-3 shadow-md animate-fade-in w-full text-center transition-colors duration-300">
      <span className="material-symbols-outlined text-[20px] animate-pulse shrink-0">warning</span>
      <p className="font-body-md text-body-md text-xs md:text-sm font-semibold select-none leading-snug">
        Pengumuman Pengelola: {announcement}
      </p>
      <button 
        onClick={() => setDismissed(true)} 
        className="hover:opacity-75 transition-opacity shrink-0 flex items-center justify-center p-1 rounded-full absolute right-4 md:right-8 cursor-pointer"
        aria-label="Tutup Pengumuman"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
