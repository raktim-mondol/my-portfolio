import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Shield, AlertCircle } from 'lucide-react';
import { RAGService, ChatMessage } from '../utils/ragService';
import toast from 'react-hot-toast';

export default function RAGtimBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragService] = useState(() => new RAGService());
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Debug environment variables
    const envDebug = {
      hasViteEnv: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
      envKeys: Object.keys(import.meta.env),
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    };
    
    console.log('Environment debug info:', envDebug);
    setDebugInfo(JSON.stringify(envDebug, null, 2));
    
    // Add initial welcome message
    if (ragService.hasApiKey()) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm RAGtim Bot, your AI assistant for learning about Raktim Mondol. I can answer questions about his education, research, publications, skills, and more. What would you like to know?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "⚠️ The chatbot is currently unavailable due to missing API configuration. Please contact the site administrator.",
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  }, [ragService]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!ragService.hasApiKey()) {
      toast.error('The chatbot is currently unavailable. Please contact the site administrator.');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ragService.generateResponse(userMessage.content, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared!');
  };

  const showDebugInfo = () => {
    toast(
      <div className="text-xs">
        <strong>Debug Info:</strong>
        <pre className="mt-1 text-xs overflow-auto max-h-32">{debugInfo}</pre>
      </div>,
      { duration: 10000 }
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasApiKey = ragService.hasApiKey();

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`${
              hasApiKey 
                ? 'bg-[#94c973] hover:bg-[#7fb95e]' 
                : 'bg-red-500 hover:bg-red-600'
            } text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group`}
            aria-label="Open RAGtim Bot"
          >
            {hasApiKey ? (
              <MessageCircle className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
            <div className={`absolute -top-2 -left-2 ${
              hasApiKey ? 'bg-green-500' : 'bg-red-500'
            } text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse`}>
              {hasApiKey ? 'AI' : '!'}
            </div>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${
            hasApiKey ? 'bg-[#94c973]' : 'bg-red-500'
          } text-white rounded-t-lg`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                {hasApiKey ? (
                  <MessageCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="font-semibold flex items-center">
                  RAGtim Bot
                  {hasApiKey ? (
                    <Shield className="h-3 w-3 ml-1\" title="Securely configured" />
                  ) : (
                    <AlertCircle className="h-3 w-3 ml-1\" title="Configuration issue" />
                  )}
                </h3>
                <p className="text-xs opacity-90">
                  {hasApiKey ? 'Ask me about Raktim Mondol' : 'Configuration needed'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={showDebugInfo}
                className="p-1 hover:bg-white/20 rounded transition-colors text-xs px-2 py-1"
                title="Debug info"
              >
                Debug
              </button>
              <button
                onClick={clearChat}
                className="p-1 hover:bg-white/20 rounded transition-colors text-xs px-2 py-1"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {hasApiKey ? (
                  <>
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Start a conversation! Ask me anything about Raktim Mondol.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-500" />
                    <p className="text-sm">The chatbot is currently unavailable. Please contact the site administrator.</p>
                    <p className="text-xs mt-2 opacity-70">Environment variable VITE_DEEPSEEK_API_KEY not found.</p>
                  </>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#94c973] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70 ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={hasApiKey ? "Ask about Raktim's research, skills, experience..." : "Chatbot unavailable"}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                disabled={isLoading || !hasApiKey}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || !hasApiKey}
                className="px-3 py-2 bg-[#94c973] text-white rounded-lg hover:bg-[#7fb95e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}