import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 animate-fade-in"
    >
      <div className="bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col animate-fade-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/20 sticky top-0 bg-surface dark:bg-inverse-surface z-10">
          <h2 className="font-headline-md text-headline-md font-semibold text-primary dark:text-secondary-fixed">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-on-surface"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-8 py-6 flex-1 text-left">
          {children}
        </div>
      </div>
    </div>
  );
}
