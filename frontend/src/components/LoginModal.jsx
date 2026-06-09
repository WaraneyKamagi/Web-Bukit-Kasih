import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.success) {
      handleClose();
    } else {
      setError(res.error);
    }
  };

  const handleQuickFill = (role) => {
    setEmail(role === 'wisatawan' ? 'wisatawan@gmail.com' : 'pengelola@bukitkasih.com');
    setPassword(role === 'wisatawan' ? 'password' : 'admin');
    setError('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-[28px] shadow-2xl w-full max-w-md p-8 animate-fade-up relative">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 text-on-surface transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary dark:text-secondary-fixed mb-1">Masuk ke Sistem</h2>
          <p className="text-subtext dark:text-slate-400 text-sm">Akses fitur pariwisata Bukit Kasih Kanonang</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-body-md text-xs text-left flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-label-caps text-subtext dark:text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full p-3 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface"
            />
          </div>
          
          <div>
            <label className="block text-xs font-label-caps text-subtext dark:text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-outline-variant/40 bg-white dark:bg-black/10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm text-on-surface"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#0F4C81] text-white py-3 rounded-full hover:bg-primary font-body-md font-semibold transition-colors shadow-sm cursor-pointer mt-4"
          >
            Masuk
          </button>
        </form>

        {/* Quick Fill Helper for Mock Testing */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20">
          <span className="block text-center text-xs text-subtext dark:text-slate-400 mb-3 font-semibold">Gunakan Akun Simulasi Uji Coba:</span>
          <div className="flex gap-3">
            <button 
              onClick={() => handleQuickFill('wisatawan')}
              className="flex-1 py-2 px-3 border border-primary/20 dark:border-primary/40 text-primary dark:text-secondary-fixed hover:bg-primary/5 rounded-xl font-body-md text-xs font-medium transition-colors cursor-pointer"
            >
              Wisatawan
            </button>
            <button 
              onClick={() => handleQuickFill('pengelola')}
              className="flex-1 py-2 px-3 border border-amber-500/20 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 rounded-xl font-body-md text-xs font-medium transition-colors cursor-pointer"
            >
              Pengelola (Admin)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
