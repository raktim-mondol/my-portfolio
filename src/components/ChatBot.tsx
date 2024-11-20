import React, { useEffect, useState, useRef } from 'react';
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
  const [showLoadingMessage, setShowLoadingMessage] = useState(true);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);
  const maxAttempts = 50; // 5 seconds maximum wait time

  const checkChatbotRendered = () => {
    attempts.current += 1;
    
    // Check for either the iframe or the chat button
    const chatbotFrame = document.querySelector('iframe[src*="zapier"]');
    const chatButton = document.querySelector('button[data-testid="chat-button"]');
    
    if (chatbotFrame || chatButton || attempts.current >= maxAttempts) {
      setShowLoadingMessage(false);
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    }
  };

  useEffect(() => {
    const loadChatbotScript = async () => {
      try {
        // Check if script is already loaded
        const existingScript = document.querySelector('script[src*="zapier-interfaces"]');
        
        if (existingScript) {
          setIsScriptLoaded(true);
          checkInterval.current = setInterval(checkChatbotRendered, 100);
          return;
        }

        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
        script.async = true;

        script.onload = () => {
          setIsScriptLoaded(true);
          checkInterval.current = setInterval(checkChatbotRendered, 100);
        };

        script.onerror = () => {
          console.error('Failed to load chatbot script');
          setShowLoadingMessage(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading chatbot:', error);
        setShowLoadingMessage(false);
      }
    };

    loadChatbotScript();

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  return (
    <>
      {showLoadingMessage && (
        <div className="fixed bottom-4 right-4" style={{ zIndex: 999999 }}>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-6 h-6 text-gray-600 dark:text-[#94c973] animate-spin" />
          </div>
        </div>
      )}
      <zapier-interfaces-chatbot-embed 
        is-popup="true" 
        chatbot-id="cm3p5x7m7006l5z3l37aldbhi"
        style={{ 
          position: 'fixed',
          bottom: '0',
          right: '0',
          zIndex: 1000000
        }}
      />
    </>
  );
}
