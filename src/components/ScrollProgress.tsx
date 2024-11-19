import React, { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = `${scrollPx / winHeightPx * 100}%`;
      
      setScrollProgress(scrollPx / winHeightPx * 100);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initialize progress on mount

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-700 z-[9999]">
      <div 
        className="h-full bg-[#94c973] transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}