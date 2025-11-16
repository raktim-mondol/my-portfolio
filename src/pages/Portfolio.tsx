import React from 'react';
import Hero from '../components/Hero';
import Education from '../components/Education';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Research from '../components/Research';
import Publications from '../components/Publications';
import Awards from '../components/Awards';
import Contact from '../components/Contact';

const Portfolio: React.FC = () => {
  return (
    <>
      <Hero />
      <Education />
      <Experience />
      <Skills />
      <Research />
      <Publications />
      <Awards />
      <Contact />
    </>
  );
};

export default Portfolio;
