import React from 'react';
import { Menu, X, BookOpen } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDownloadCV = () => {
    const cvUrl = '/assets/raktim-mondol-cv.pdf';
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'raktim-mondol-cv.pdf';
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

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-[#94c973]" />
            <a 
              href="#about"
              className="ml-2 text-xl hover:text-[#94c973] transition-colors"
            >
              Dr. Raktim <strong>Mondol</strong>
            </a>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-700 hover:text-[#94c973] transition"
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
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            {navLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="block px-3 py-2 text-gray-700 hover:text-[#94c973]"
              >
                {link.text}
              </a>
            ))}
            <button 
              onClick={handleDownloadCV}
              className="block w-full text-left px-3 py-2 text-[#94c973] font-medium"
            >
              Download CV
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}