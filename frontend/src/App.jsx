import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AnnouncementBanner from './components/AnnouncementBanner';
import ChatbotWidget from './components/ChatbotWidget';
import { AuthProvider } from './context/AuthContext';
import { AnnouncementProvider } from './context/AnnouncementContext';
import { FeedbackProvider } from './context/FeedbackContext';

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

function App() {
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <FeedbackProvider>
          <Router>
        <div className="min-h-screen flex flex-col bg-background text-on-surface">
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
      </Router>
        </FeedbackProvider>
      </AnnouncementProvider>
    </AuthProvider>
  );
}

export default App;
