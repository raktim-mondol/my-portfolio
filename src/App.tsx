import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Education from './components/Education';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Research from './components/Research';
import Publications from './components/Publications';
import Awards from './components/Awards';
import Contact from './components/Contact';
import ScrollProgress from './components/ScrollProgress';
import ChatBot from './components/ChatBot';
import { AudioProvider } from './components/AudioContext';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <ScrollProgress />
          <Navbar />
          <div className="pt-16">
            <Hero />
            <Education />
            <Experience />
            <Skills />
            <Research />
            <Publications />
            <Awards />
            <Contact />
          </div>
          <ChatBot />
        </div>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;
