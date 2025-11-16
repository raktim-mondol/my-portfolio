import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Portfolio from './pages/Portfolio';
import ThoughtsPage from './pages/ThoughtsPage';
import ScrollProgress from './components/ScrollProgress';
import { AudioProvider } from './components/AudioContext';
import { ThemeProvider } from './components/ThemeContext';
import RAGtimBot from './components/RAGtimBot';

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <Router>
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
