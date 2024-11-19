import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNameActive, setIsNameActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
      setIsNameActive(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDownloadCV = () => {
    const cvUrl = '/assets/docs/raktim_cv.pdf';
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'raktim_cv.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navLinks = [
    { href: "#about", text: "About" },
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
    
    // Show active state
    setIsNameActive(true);
    
    // Immediately schedule the color release
    requestAnimationFrame(() => {
      setIsNameActive(false);
    });

    // Handle navigation
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm transition-all duration-200 ${isOpen ? 'bg-white' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-[#94c973]" />
            <a 
              href="#about"
              className={`ml-2 text-xl transition-colors ${isNameActive ? 'text-[#94c973]' : 'hover:text-[#94c973]'}`}
              onClick={handleNameClick}
            >
              Raktim <strong>Mondol</strong>
            </a>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 hover:text-[#94c973] transition"
                onClick={handleLinkClick}
              >
                {link.text}
              </a>
            ))}
            <button 
              onClick={handleDownloadCV}
              className="bg-[#94c973] text-white px-4 py-2 rounded-md hover:bg-[#7fb95e] transition"
            >
              Download CV
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-700 hover:text-[#94c973] transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="block px-3 py-2 text-gray-700 hover:text-[#94c973] transition-colors"
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
              className="block w-full text-left px-3 py-2 text-[#94c973] font-medium hover:bg-gray-50 transition-colors"
            >
              Download CV
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
