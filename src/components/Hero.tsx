import React, { useEffect, useState } from 'react';
import { Linkedin, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const words = ['Researcher', 'Data Scientist', 'Bioinformatician', 'AI/LLM/ML Engineer', 'Father', 'Biostatistician'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="about" className="relative bg-white dark:bg-gray-900 overflow-hidden py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                className="h-48 w-48 rounded-full object-cover shadow-lg"
                src="/assets/images/profile.png"
                alt="Dr Raktim Mondol - AI/ML Engineer, Data Scientist & Bioinformatics Researcher"
                loading="eager"
                width="192"
                height="192"
              />
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
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
            <Link
              to="/thoughts"
              className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
            >
              <Feather className="w-4 h-4 mr-1.5" />
              Thoughts<sup className="text-xs">blog</sup>
            </Link>
          </div>

          <div className="max-w-2xl text-center sm:text-left">
            <h1 className="text-4xl tracking-tight font-bold text-gray-900 dark:text-white sm:text-5xl">
              <span className="block">Dr Raktim <strong>Mondol</strong></span>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start mt-2">
                <span className="text-2xl sm:text-3xl dark:text-gray-200">I'm</span>
                <div className="words-wrapper mt-2 sm:mt-0">
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




