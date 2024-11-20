import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'zapier-interfaces-chatbot-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'is-popup'?: string;
        'chatbot-id': string;
      };
    }
  }
}

export default function ChatBot() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load script only when component is in viewport
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadChatbotScript();
        observer.disconnect();
      }
    });

    // Start observing the document body
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  const loadChatbotScript = async () => {
    try {
      // Check if script is already loaded
      if (document.querySelector('script[src*="zapier-interfaces"]')) {
        setIsScriptLoaded(true);
        return;
      }

      // Create script element with performance attributes
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
      script.async = true;
      script.defer = true;

      // Add loading and error handlers
      script.onload = () => {
        setIsScriptLoaded(true);
        setTimeout(() => setIsVisible(true), 100);
      };
      script.onerror = (error) => {
        console.error('Failed to load chatbot script:', error);
      };

      // Append script to document head
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading chatbot:', error);
    }
  };

  // Early return if script is not loaded
  if (!isScriptLoaded) {
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
        <Loader2 className="w-6 h-6 text-[#94c973] animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <zapier-interfaces-chatbot-embed 
        is-popup="true" 
        chatbot-id="cm3p5x7m7006l5z3l37aldbhi"
      />
    </div>
  );
}
