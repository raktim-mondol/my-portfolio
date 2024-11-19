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
import { AudioProvider } from './components/AudioContext';

function App() {
  return (
    <AudioProvider>
      <div className="min-h-screen bg-white">
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
      </div>
    </AudioProvider>
  );
}

export default App;
