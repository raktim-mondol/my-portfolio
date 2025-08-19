import React, { useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNameActive, setIsNameActive] = useState(false);

  const handleDownloadCV = () => {
    const cvUrl = '/assets/docs/raktim_cv.pdf';
    window.open(cvUrl, '_blank');
  };

  const navLinks = [
    { href: "#education", text: "Education" },
    { href: "#experience", text: "Experience" },
    { href: "#skills", text: "Skills" },
    { href: "#research", text: "Research" },
    { href: "#publications", text: "Publications" },
    { href: "#awards", text: "Awards" }
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNameActive(true);
    
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    requestAnimationFrame(() => {
      setIsNameActive(false);
    });
    
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-[#94c973]" />
            <a 
              href="#about"
              className={`ml-2 text-xl text-gray-900 dark:text-white hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors ${
                isNameActive ? 'text-[#94c973] dark:text-[#94c973]' : ''
              }`}
              onClick={handleNameClick}
            >
              Dr. <strong>Raktim</strong>
            </a>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 dark:text-gray-300 hover:text-[#94c973] dark:hover:text-[#94c973] transition"
                onClick={handleLinkClick}
              >
                {link.text}
              </a>
            ))}
            <ThemeToggle />
            <button 
              onClick={handleDownloadCV}
              className="bg-[#94c973] text-white px-4 py-2 rounded-md hover:bg-[#7fb95e] transition"
            >
              Download CV
            </button>
          </div>

          {/* Tablet layout - shows all links with medium font size */}
          <div className="hidden md:lg:hidden md:flex items-center space-x-3">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 dark:text-gray-300 hover:text-[#94c973] dark:hover:text-[#94c973] transition text-sm px-1"
                onClick={handleLinkClick}
              >
                {link.text}
              </a>
            ))}
            <ThemeToggle />
            <button 
              onClick={handleDownloadCV}
              className="bg-[#94c973] text-white px-3 py-1.5 rounded-md hover:bg-[#7fb95e] transition text-sm"
            >
              CV
            </button>
          </div>

          {/* Mobile only - hamburger menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-700 dark:text-gray-300 hover:text-[#94c973] transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute w-full bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
                onClick={handleLinkClick}
              >
                {link.text}
              </a>
            ))}
            <button 
              onClick={() => {
                handleDownloadCV();
                handleLinkClick();
              }}
              className="block w-full text-left px-3 py-2 text-[#94c973] font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Download CV
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
