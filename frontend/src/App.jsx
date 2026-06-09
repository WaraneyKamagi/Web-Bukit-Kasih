import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Experiences from './pages/Experiences';
import Informasi from './pages/Informasi';
import Sejarah from './pages/Sejarah';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ChatbotWidget from './components/ChatbotWidget';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-on-surface">
          <Navigation />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/informasi" element={<Informasi />} />
              <Route path="/sejarah" element={<Sejarah />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <ChatbotWidget />
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
