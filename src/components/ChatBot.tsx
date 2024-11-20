import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

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

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="zapier-interfaces"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
      script.type = 'module';
      script.async = true;
      
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  // Custom chat button that appears before the Zapier chat loads
  if (!isScriptLoaded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          className="flex items-center justify-center w-12 h-12 bg-[#94c973] text-white rounded-full shadow-lg hover:bg-[#7fb95e] transition-colors"
          aria-label="Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50">
      <zapier-interfaces-chatbot-embed 
        is-popup="true" 
        chatbot-id="cm3p5x7m7006l5z3l37aldbhi"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}
      />
    </div>
  );
}
