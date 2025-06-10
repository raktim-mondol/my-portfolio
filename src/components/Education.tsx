import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GraduationCap, BookOpen, ExternalLink, X, ZoomIn, ZoomOut, Move, Maximize2, AlertTriangle, Smartphone } from 'lucide-react';
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
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHandTool, setIsHandTool] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isLowMemory: false });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enhanced device detection
  useEffect(() => {
    const detectDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 768;
      const isLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : isMobile;
      
      setDeviceInfo({
        isMobile: isMobile || isSmallScreen,
        isLowMemory
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const openThesisModal = () => {
    // Show warning for mobile devices
    if (deviceInfo.isMobile) {
      setShowMobileWarning(true);
      return;
    }
    
    setIsLoading(true);
    setShowThesisModal(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsHandTool(false);
    setImageLoaded(false);
    setImageError(false);
  };

  const proceedWithMobile = () => {
    setShowMobileWarning(false);
    setIsLoading(true);
    setShowThesisModal(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsHandTool(true); // Enable hand tool by default on mobile
    setImageLoaded(false);
    setImageError(false);
  };

  const closeThesisModal = () => {
    setShowThesisModal(false);
    setShowMobileWarning(false);
    setIsLoading(false);
    setImageLoaded(false);
    setImageError(false);
    
    // Clean up canvas if used
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const createOptimizedImage = useCallback((originalImage: HTMLImageElement) => {
    if (!deviceInfo.isMobile) return originalImage;

    const canvas = canvasRef.current;
    if (!canvas) return originalImage;

    const ctx = canvas.getContext('2d');
    if (!ctx) return originalImage;

    // Calculate optimal size for mobile (max 2048px on any side)
    const maxSize = deviceInfo.isLowMemory ? 1024 : 2048;
    const { naturalWidth, naturalHeight } = originalImage;
    
    let newWidth = naturalWidth;
    let newHeight = naturalHeight;
    
    if (naturalWidth > maxSize || naturalHeight > maxSize) {
      const ratio = Math.min(maxSize / naturalWidth, maxSize / naturalHeight);
      newWidth = naturalWidth * ratio;
      newHeight = naturalHeight * ratio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw optimized image
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
    
    return canvas;
  }, [deviceInfo]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
    
    // Auto-fit to screen on mobile for better initial view
    if (deviceInfo.isMobile) {
      setTimeout(() => {
        handleFitToScreen();
      }, 100);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    const maxZoom = deviceInfo.isMobile ? (deviceInfo.isLowMemory ? 2 : 2.5) : 5;
    setScale(prev => Math.min(prev * 1.2, maxZoom));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleFitToScreen = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;
      
      // Use canvas dimensions if on mobile, otherwise use image dimensions
      let imageWidth, imageHeight;
      
      if (deviceInfo.isMobile && canvasRef.current) {
        imageWidth = canvasRef.current.width;
        imageHeight = canvasRef.current.height;
      } else if (imageRef.current) {
        imageWidth = imageRef.current.naturalWidth;
        imageHeight = imageRef.current.naturalHeight;
      } else {
        return;
      }
      
      if (imageWidth && imageHeight) {
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        const newScale = Math.min(scaleX, scaleY, 1);
        
        setScale(newScale);
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  // Throttled drag functions for better performance
  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (isHandTool) {
      setIsDragging(true);
      setDragStart({
        x: clientX - position.x,
        y: clientY - position.y
      });
    }
  }, [isHandTool, position]);

  const doDrag = useCallback((clientX: number, clientY: number) => {
    if (isDragging && isHandTool) {
      // Throttle updates on mobile for better performance
      if (deviceInfo.isMobile) {
        requestAnimationFrame(() => {
          setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
          });
        });
      } else {
        setPosition({
          x: clientX - dragStart.x,
          y: clientY - dragStart.y
        });
      }
    }
  }, [isDragging, isHandTool, dragStart, deviceInfo.isMobile]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  }, [startDrag]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    doDrag(e.clientX, e.clientY);
  }, [doDrag]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    endDrag();
  }, [endDrag]);

  // Touch event handlers with better performance
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    }
  }, [startDrag]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      doDrag(touch.clientX, touch.clientY);
    }
  }, [doDrag, isDragging]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    endDrag();
  }, [endDrag]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const maxZoom = deviceInfo.isMobile ? (deviceInfo.isLowMemory ? 2 : 2.5) : 5;
    setScale(prev => Math.min(Math.max(prev * delta, 0.1), maxZoom));
  }, [deviceInfo]);

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
                            Thesis {deviceInfo.isMobile && <Smartphone className="inline h-4 w-4 ml-1" />}
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

      {/* Mobile Warning Modal */}
      {showMobileWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <Smartphone className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mobile Device Detected
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                The thesis mind map is a large, detailed image that may cause performance issues on mobile devices.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Recommendations:</strong>
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                  <li>• Use a desktop or tablet for the best experience</li>
                  <li>• Close other apps to free up memory</li>
                  <li>• The image will be optimized for mobile viewing</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeThesisModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithMobile}
                className="flex-1 px-4 py-2 bg-[#94c973] text-white rounded-lg hover:bg-[#7fb95e] transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Thesis Mind Map Modal */}
      {showThesisModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
          onClick={handleBackdropClick}
        >
          <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col ${
            deviceInfo.isMobile ? 'w-full h-full' : 'w-[90vw] h-[90vh]'
          }`}>
            {/* Header with controls */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                PhD Thesis Mind Map
                {deviceInfo.isMobile && (
                  <span className="text-sm text-orange-500 ml-2">(Mobile Optimized)</span>
                )}
              </h3>
              
              {/* Control buttons */}
              <div className="flex items-center space-x-2">
                {!deviceInfo.isMobile && (
                  <>
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
                  </>
                )}
                
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
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ 
                cursor: isHandTool ? (isDragging ? 'grabbing' : 'grab') : 'default',
                touchAction: 'none'
              }}
            >
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#94c973] mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {deviceInfo.isMobile ? 'Optimizing for mobile...' : 'Loading mind map...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center p-8">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Unable to Load Mind Map
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      The mind map image could not be loaded. This might be due to network issues or device limitations.
                    </p>
                    <button
                      onClick={closeThesisModal}
                      className="px-4 py-2 bg-[#94c973] text-white rounded-lg hover:bg-[#7fb95e] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden canvas for mobile optimization */}
              <canvas
                ref={canvasRef}
                className="hidden"
                style={{ display: 'none' }}
              />

              {/* Image */}
              {!imageError && (
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
                    className={`max-w-none select-none ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    draggable={false}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                      maxWidth: deviceInfo.isMobile ? '150%' : 'none',
                      maxHeight: deviceInfo.isMobile ? '150%' : 'none',
                      imageRendering: deviceInfo.isMobile ? 'optimizeSpeed' : 'auto'
                    }}
                  />
                </div>
              )}

              {/* Mobile instructions */}
              {deviceInfo.isMobile && imageLoaded && !imageError && (
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
                  <p className="text-center">
                    {deviceInfo.isLowMemory ? 'Drag to pan • Tap outside to close' : 'Pinch to zoom • Drag to pan • Tap outside to close'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}