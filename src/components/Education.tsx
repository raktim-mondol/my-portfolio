import React, { useState, useRef, useCallback } from 'react';
import { GraduationCap, BookOpen, ExternalLink, X, ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { useTheme } from './ThemeContext';

const education = [
  {
    degree: "PhD in Computer Science & Engineering",
    institution: "UNSW Sydney",
    year: "2021-2025 (Expected)",
    thesis: "Deep Learning Based Prognosis and Explainability for Breast Cancer",
    audioSummary: "/assets/audio/phd_podcast.mp3",
    thesisMindMap: "/assets/images/full_thesis_mind_map_.png",
    logo: {
      light: "/assets/images/unsw-logo.png",
      dark: "/assets/images/unsw-logo-dm.png"
    }
  },
  {
    degree: "MS by Research in Computer Science & Bioinformatics",
    institution: "RMIT University",
    year: "2017-2019",
    thesis: "Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations",
    description: "Graduated with High Distinction",
    certUrl: "https://www.myequals.net/sharelink/78e7c7d7-5a73-4e7c-9711-f163f5dd1604/af0d807a-8392-45be-9104-d26b95f5aa7a",
    thesisUrl: "https://research-repository.rmit.edu.au/articles/thesis/Deep_learning_in_classifying_cancer_subtypes_extracting_relevant_genes_and_identifying_novel_mutations/27589272",
    audioSummary: "/assets/audio/masters-thesis-summary.mp3",
    logo: {
      light: "/assets/images/rmit-logo.png",
      dark: "/assets/images/rmit-logo-dm.png"
    }
  }
];

export default function Education() {
  const { theme } = useTheme();
  const [showThesisModal, setShowThesisModal] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHandTool, setIsHandTool] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openThesisModal = () => {
    setShowThesisModal(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsHandTool(false);
  };

  const closeThesisModal = () => {
    setShowThesisModal(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleFitToScreen = () => {
    if (imageRef.current && containerRef.current) {
      const container = containerRef.current;
      const image = imageRef.current;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight;
      
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isHandTool) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [isHandTool, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && isHandTool) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, isHandTool, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeThesisModal();
    }
  };

  return (
    <>
      <section id="education" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Education</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Academic journey</p>
          </div>

          <div className="mt-12 space-y-8">
            {education.map((edu, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8">
                      <GraduationCap className="w-full h-full text-[#94c973]" />
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                  </div>
                  <div className="flex-shrink-0 w-32 h-16 flex items-center justify-center">
                    <img 
                      src={theme === 'dark' ? edu.logo.dark : edu.logo.light}
                      alt={`${edu.institution} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="ml-12">
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{edu.institution}</p>
                  <p className="text-[#94c973]">{edu.year}</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-[#94c973]" />
                      <h4 className="ml-2 text-lg font-semibold dark:text-white">
                        {index === 0 ? (
                          <button
                            onClick={openThesisModal}
                            className="text-[#94c973] hover:text-[#7fb95e] transition-colors underline cursor-pointer"
                          >
                            Thesis
                          </button>
                        ) : (
                          'Thesis'
                        )}
                      </h4>
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{edu.thesis}</p>
                    {edu.thesisUrl && (
                      <a
                        href={edu.thesisUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-[#94c973] hover:text-[#7fb95e] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Full Thesis
                      </a>
                    )}
                    {edu.audioSummary && (
                      <div className="mt-4">
                        <AudioPlayer src={edu.audioSummary} title="Thesis Summary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    {edu.certUrl && (
                      <a
                        href={edu.certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#94c973] hover:text-[#7fb95e] transition-colors"
                      >
                        View Certification
                      </a>
                    )}
                    <p className="mt-2 text-gray-600 dark:text-gray-400 italic">{edu.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Larger Centered Thesis Mind Map Modal */}
      {showThesisModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col">
            {/* Header with controls */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                PhD Thesis Mind Map
              </h3>
              
              {/* Control buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button
                  onClick={handleFitToScreen}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Fit to Screen"
                >
                  <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button
                  onClick={() => setIsHandTool(!isHandTool)}
                  className={`p-2 rounded-lg transition-colors ${
                    isHandTool 
                      ? 'bg-[#94c973] text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  title="Hand Tool"
                >
                  <Move className="h-5 w-5" />
                </button>
                
                <button
                  onClick={closeThesisModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Image container */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-800"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ cursor: isHandTool ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <img
                  ref={imageRef}
                  src="/assets/images/full_thesis_mind_map_.png"
                  alt="PhD Thesis Mind Map"
                  className="max-w-none select-none"
                  draggable={false}
                  onLoad={handleFitToScreen}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}