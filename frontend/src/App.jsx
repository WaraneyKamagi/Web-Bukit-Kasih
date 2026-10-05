import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AnnouncementBanner from './components/AnnouncementBanner';
import ChatbotWidget from './components/ChatbotWidget';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnnouncementProvider } from './context/AnnouncementContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { BookmarkProvider } from './context/BookmarkContext';
import useIdleTimer from './hooks/useIdleTimer';

// Route-based Code Splitting & Lazy Loading
const Home = lazy(() => import('./pages/Home'));
const Experiences = lazy(() => import('./pages/Experiences'));
const Informasi = lazy(() => import('./pages/Informasi'));
const Sejarah = lazy(() => import('./pages/Sejarah'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-body-md text-secondary/70">Memuat halaman...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [showIdleNotice, setShowIdleNotice] = useState(false);
  const navigate = useNavigate();

  const handleIdle = useCallback(() => {
    if (user) {
      logout();
      setShowIdleNotice(true);
      navigate('/');
    }
  }, [user, logout, navigate]);

  // 30 minutes idle timeout (OWASP A7, A8)
  useIdleTimer({
    onIdle: handleIdle,
    timeout: 30 * 60 * 1000,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {showIdleNotice && (
        <div className="bg-amber-600/95 text-white px-4 py-3 text-center text-sm font-medium sticky top-0 z-50 flex items-center justify-center gap-3 shadow-md backdrop-blur-md">
          <span>⚠️ Sesi Anda telah berakhir secara otomatis demi keamanan karena tidak ada aktivitas selama 30 menit. Silakan masuk kembali.</span>
          <button
            onClick={() => setShowIdleNotice(false)}
            className="ml-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition"
          >
            Tutup
          </button>
        </div>
      )}
      <Navigation />
      <AnnouncementBanner />
      <div className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/informasi" element={<Informasi />} />
            <Route path="/sejarah" element={<Sejarah />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </div>
      <ChatbotWidget />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <FeedbackProvider>
          <BookmarkProvider>
            <Router>
              <AppContent />
            </Router>
          </BookmarkProvider>
        </FeedbackProvider>
      </AnnouncementProvider>
    </AuthProvider>
  );
}

export default App;
