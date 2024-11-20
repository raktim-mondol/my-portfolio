import React, { useEffect, useState, useRef } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';

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
  const [isChatbotReady, setIsChatbotReady] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(true);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

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
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  const checkChatbotRendered = () => {
    // Check if the chatbot iframe is rendered
    const chatbotFrame = document.querySelector('iframe[src*="zapier"]');
    if (chatbotFrame) {
      setIsChatbotReady(true);
      setShowLoadingMessage(false);
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    }
  };

  const loadChatbotScript = async () => {
    try {
      // Check if script is already loaded
      if (document.querySelector('script[src*="zapier-interfaces"]')) {
        setIsScriptLoaded(true);
        // Start checking for chatbot render
        checkInterval.current = setInterval(checkChatbotRendered, 100);
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
        // Start checking for chatbot render
        checkInterval.current = setInterval(checkChatbotRendered, 100);
      };
      script.onerror = (error) => {
        console.error('Failed to load chatbot script:', error);
        setShowLoadingMessage(false);
      };

      // Append script to document head
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading chatbot:', error);
      setShowLoadingMessage(false);
    }
  };

  // Loading indicator
  const LoadingIndicator = () => (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 z-50">
      {showLoadingMessage && (
        <div className="bg-white dark:bg-gray-800 py-2 px-4 rounded-full shadow-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <span>Loading chatbot</span>
          <span className="flex gap-0.5">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg flex items-center justify-center">
        <MessageSquare className="w-6 h-6 text-[#94c973]" />
        <Loader2 className="w-6 h-6 text-[#94c973] animate-spin absolute" />
      </div>
    </div>
  );

  return (
    <>
      {!isChatbotReady && <LoadingIndicator />}
      <div className={`transition-opacity duration-300 ${isChatbotReady ? 'opacity-100' : 'opacity-0'}`}>
        <zapier-interfaces-chatbot-embed 
          is-popup="true" 
          chatbot-id="cm3p5x7m7006l5z3l37aldbhi"
        />
      </div>
    </>
  );
}
