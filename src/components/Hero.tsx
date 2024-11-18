import React, { useEffect, useState } from 'react';
import { Linkedin } from 'lucide-react';

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const words = ['Researcher', 'Data Scientist', 'Bioinformatician', 'Computational Biologist', 'Engineer'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="about" className="relative bg-white overflow-hidden py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
          <div className="relative">
            <img
              className="h-48 w-48 rounded-full object-cover shadow-lg"
              src="/assets/images/profile.jpg"
              alt="Raktim Mondol"
            />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center bg-white px-4 py-2 rounded-full shadow-md">
              <a 
                href="https://www.linkedin.com/in/rmondol/"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#94c973] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="max-w-2xl text-center sm:text-left">
            <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl">
              <span className="block">Raktim <strong>Mondol</strong></span>
              <div className="flex items-center justify-center sm:justify-start mt-2 flex-nowrap">
                <span className="text-2xl sm:text-3xl whitespace-nowrap">I'm a</span>
                <div className="words-wrapper">
                  {words.map((word, index) => (
                    <span
                      key={word}
                      className={`word ${index === activeIndex ? 'active' : ''} ${
                        index === (activeIndex - 1 + words.length) % words.length ? 'exit' : ''
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </h1>
            
            <div className="mt-6">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#94c973] hover:bg-[#7fb95e] transition-colors"
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
