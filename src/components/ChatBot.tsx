import React, { useEffect, useState } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadChatbot = async () => {
      try {
        // Check if script is already loaded
        if (!document.querySelector('script[src*="zapier-interfaces"]')) {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
          script.async = true;

          // Create a promise to wait for script load
          const loadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });

          document.head.appendChild(script);
          await loadPromise;
        }

        // Add a small delay to ensure Web Component is registered
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load chatbot:', error);
      }
    };

    loadChatbot();

    // Cleanup function
    return () => {
      const script = document.querySelector('script[src*="zapier-interfaces"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <zapier-interfaces-chatbot-embed 
        is-popup="true" 
        chatbot-id="cm3p5x7m7006l5z3l37aldbhi"
      />
    </div>
  );
}
