import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  const colors = {
    success: 'border-emerald-500/20 text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 backdrop-blur-md',
    error: 'border-red-500/20 text-red-800 dark:text-red-400 bg-red-500/10 backdrop-blur-md',
    info: 'border-primary/20 text-primary dark:text-secondary-container bg-primary/10 backdrop-blur-md'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${colors[type]} shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] animate-fade-up max-w-[90vw] md:max-w-md`}>
      <span className="material-symbols-outlined shrink-0 text-xl">{icons[type]}</span>
      <p className="font-body-md text-body-md font-medium select-none leading-snug">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-75 transition-opacity shrink-0 flex items-center justify-center p-1 rounded-full">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
