import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Settings, Eye, EyeOff, Shield } from 'lucide-react';
import { RAGService, ChatMessage } from '../utils/ragService';
import toast from 'react-hot-toast';

export default function RAGtimBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [ragService] = useState(() => new RAGService());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing API key only if not using environment variable
    if (!ragService.isUsingEnvKey()) {
      const existingKey = localStorage.getItem('deepseek_api_key');
      if (existingKey) {
        setApiKey(existingKey);
      }
    }

    // Add initial welcome message if API key is available
    if (ragService.hasApiKey()) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm RAGtim Bot, your AI assistant for learning about Raktim Mondol. I can answer questions about his education, research, publications, skills, and more. What would you like to know?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
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
      if (ragService.isUsingEnvKey()) {
        toast.error('The chatbot is currently unavailable. Please contact the site administrator.');
      } else {
        toast.error('Please set your DeepSeek API key in settings first.');
        setIsSettingsOpen(true);
      }
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

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key.');
      return;
    }

    ragService.setApiKey(apiKey.trim());
    setIsSettingsOpen(false);
    toast.success('API key saved successfully!');
    
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm RAGtim Bot, your AI assistant for learning about Raktim Mondol. I can answer questions about his education, research, publications, skills, and more. What would you like to know?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared!');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Don't show settings button if using environment API key
  const showSettingsButton = !ragService.isUsingEnvKey();

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#94c973] hover:bg-[#7fb95e] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group"
            aria-label="Open RAGtim Bot"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              AI
            </div>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-[#94c973] text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center">
                  RAGtim Bot
                  {ragService.isUsingEnvKey() && (
                    <Shield className="h-3 w-3 ml-1\" title="Securely configured" />
                  )}
                </h3>
                <p className="text-xs opacity-90">Ask me about Raktim Mondol</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showSettingsButton && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
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
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {ragService.hasApiKey() 
                    ? "Start a conversation! Ask me anything about Raktim Mondol."
                    : ragService.isUsingEnvKey()
                    ? "The chatbot is currently unavailable. Please contact the site administrator."
                    : "Please set your DeepSeek API key in settings to start chatting."
                  }
                </p>
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
                placeholder="Ask about Raktim's research, skills, experience..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                disabled={isLoading || !ragService.hasApiKey()}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || !ragService.hasApiKey()}
                className="px-3 py-2 bg-[#94c973] text-white rounded-lg hover:bg-[#7fb95e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal - Only show if not using environment API key */}
      {isSettingsOpen && showSettingsButton && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">RAGtim Bot Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DeepSeek API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your DeepSeek API key"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get your API key from <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-[#94c973] hover:underline">DeepSeek Platform</a>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 bg-[#94c973] text-white py-2 px-4 rounded-lg hover:bg-[#7fb95e] transition-colors"
                >
                  Save API Key
                </button>
                <button
                  onClick={clearChat}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}