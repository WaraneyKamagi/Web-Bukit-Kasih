import { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import LoginModal from './LoginModal';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  // Dark Mode State
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Aktivitas & Ziarah', path: '/experiences' },
    { name: 'Informasi Wisata', path: '/informasi' },
    { name: 'Sejarah & Filosofi', path: '/sejarah' },
  ];

  const getLinkClass = (isActive) => {
    const base = "font-body-md text-body-md transition-all duration-300 px-4 py-2 rounded-DEFAULT";
    if (isActive) {
      return `${base} text-primary border-b-2 border-primary pb-1 bg-white/20 dark:bg-white/5`;
    }
    return `${base} text-on-surface-variant hover:text-primary dark:hover:text-secondary-fixed hover:bg-white/40 dark:hover:bg-white/5 hover:backdrop-blur-2xl`;
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-white/90 dark:bg-black/80 shadow-[0_40px_40px_-10px_rgba(15,76,129,0.08)]' 
          : 'bg-surface-glass dark:bg-black/30 shadow-[0_40px_40px_-10px_rgba(15,76,129,0.08)]'
      }`}>
        <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <NavLink to="/" className="font-headline-md text-headline-md font-semibold tracking-tight text-primary dark:text-secondary-fixed-dim">
            BUKIT KASIH
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path} 
                className={({ isActive }) => getLinkClass(isActive)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/30 bg-white/10 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-primary dark:text-secondary-fixed-dim transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[20px] select-none">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <a 
              href="https://www.google.com/maps/search/?api=1&query=Bukit+Kasih+Kanonang" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:inline-block bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container px-5 py-2 rounded-full font-body-md text-xs hover:bg-primary/90 dark:hover:bg-primary-container/80 transition-colors shadow-sm"
            >
              Peta Lokasi
            </a>

            {/* Authentication State Buttons */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 bg-white/15 dark:bg-white/5 border border-outline-variant/30 px-4 py-2 rounded-full font-body-md text-sm text-primary dark:text-secondary-fixed-dim hover:bg-white/20 transition-all cursor-pointer select-none"
                >
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-inverse-surface border border-outline-variant/30 rounded-2xl p-2 shadow-xl animate-fade-up z-50 text-left">
                    <div className="px-3 py-1.5 border-b border-outline-variant/20 text-[10px] font-semibold text-subtext dark:text-slate-400">
                      Peran: {user.role}
                    </div>
                    {user.role === 'Pengelola' ? (
                      <NavLink 
                        to="/admin" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-surface-container-low dark:hover:bg-white/5 text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        <span>Dashboard Admin</span>
                      </NavLink>
                    ) : (
                      <NavLink 
                        to="/profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-surface-container-low dark:hover:bg-white/5 text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>Profil Saya</span>
                      </NavLink>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-red-500/10 text-red-600 dark:text-red-400 cursor-pointer text-left font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container px-5 py-2 rounded-full font-body-md text-xs font-semibold hover:bg-primary/90 dark:hover:bg-primary-container/85 transition-colors shadow-sm cursor-pointer"
              >
                Masuk
              </button>
            )}

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-primary dark:text-secondary-fixed-dim p-2 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined select-none">
                {isOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-lg border-b border-outline-variant/30 py-4 px-margin-mobile flex flex-col gap-3 shadow-lg absolute w-full left-0 top-20 animate-fade-up z-50 text-left">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `block w-full py-2.5 px-4 rounded-xl text-left font-body-md text-sm ${
                    isActive ? 'bg-primary-container/20 text-primary font-semibold dark:text-secondary-fixed-dim' : 'text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user ? (
              <>
                <div className="border-t border-outline-variant/20 my-2 pt-2"></div>
                {user.role === 'Pengelola' ? (
                  <NavLink 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 px-4 rounded-xl text-left font-body-md text-sm text-on-surface hover:bg-surface-container-low dark:hover:bg-white/5"
                  >
                    Dashboard Admin
                  </NavLink>
                ) : (
                  <NavLink 
                    to="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 px-4 rounded-xl text-left font-body-md text-sm text-on-surface hover:bg-surface-container-low dark:hover:bg-white/5"
                  >
                    Profil Saya
                  </NavLink>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-4 rounded-xl font-body-md text-sm text-red-600 dark:text-red-400 font-semibold hover:bg-red-500/10 cursor-pointer"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-outline-variant/20 my-2 pt-2"></div>
                <button 
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full text-left py-2.5 px-4 rounded-xl font-body-md text-sm text-primary dark:text-secondary-fixed font-semibold hover:bg-primary-container/10 cursor-pointer"
                >
                  Masuk Akun
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Login Modal Integration */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
}
