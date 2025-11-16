import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Portfolio from './pages/Portfolio';
import ThoughtsPage from './pages/ThoughtsPage';
import ScrollProgress from './components/ScrollProgress';
import { AudioProvider } from './components/AudioContext';
import { ThemeProvider } from './components/ThemeContext';
import RAGtimBot from './components/RAGtimBot';

function ScrollToHashElement() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Remove the # from the hash
      const id = location.hash.replace('#', '');
      // Wait a bit for the page to render
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (location.pathname === '/') {
      // Scroll to top when navigating to home without hash
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <Router>
          <ScrollToHashElement />
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <ScrollProgress />
            <Navbar />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Portfolio />} />
                <Route path="/thoughts" element={<ThoughtsPage />} />
              </Routes>
            </div>
            <RAGtimBot />
          </div>
        </Router>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;
