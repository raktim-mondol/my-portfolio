import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Shield, AlertCircle, Database, BarChart3, Search, Zap, Target, ExternalLink, Bot, Cpu, Brain } from 'lucide-react';
import { ragService } from '../utils/ragService';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function RAGtimBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check which system is being used
  const isUsingHybrid = import.meta.env.VITE_USE_HYBRID === 'true';
  const isUsingHuggingFace = import.meta.env.VITE_USE_HUGGING_FACE === 'true';
  const isUsingBackend = import.meta.env.VITE_USE_BACKEND === 'true';

  console.log('🤖 RAGtimBot Component:');
  console.log('- isUsingHybrid:', isUsingHybrid);
  console.log('- isUsingHuggingFace:', isUsingHuggingFace);
  console.log('- isUsingBackend:', isUsingBackend);
  console.log('- ragService has API key:', ragService.hasApiKey());

  const getSystemInfo = () => {
    if (isUsingHybrid) {
      return {
        name: 'Hybrid RAG',
        description: 'Advanced AI Assistant',
        icon: '🔥',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    } else if (isUsingHuggingFace) {
      return {
        name: 'HuggingFace',
        description: 'AI Assistant',
        icon: '🤗',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    } else if (isUsingBackend) {
      return {
        name: 'Backend Server',
        description: 'AI Assistant',
        icon: '🖥️',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    } else {
      return {
        name: 'Netlify Functions',
        description: 'AI Assistant',
        icon: '⚡',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    }
  };

  const systemInfo = getSystemInfo();

  useEffect(() => {
    // Add initial welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: isUsingHybrid
        ? "Hello! I'm RAGtim Bot powered by a cutting-edge hybrid system! I use advanced semantic search and AI language models for natural response generation. This gives you the best of both worlds - fast, accurate search with intelligent conversational responses. Ask me anything about Raktim Mondol!"
        : isUsingHuggingFace 
          ? "Hello! I'm RAGtim Bot, an AI assistant trained on Raktim Mondol's portfolio! I can answer questions about his research, publications, skills, experience, and more. What would you like to know?"
          : ragService.hasApiKey()
            ? "Hello! I'm RAGtim Bot, your enhanced AI assistant powered by advanced hybrid search technology. I combine semantic vector search with BM25 ranking to provide comprehensive and accurate answers about Raktim Mondol. I can provide detailed information about his education, research, publications, skills, experience, and more. What would you like to know?"
            : "⚠️ The chatbot is currently unavailable. The API key needs to be configured in the Netlify environment variables. Please contact the site administrator.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [isUsingHybrid, isUsingHuggingFace]);

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

  const loadKnowledgeStats = async () => {
    try {
      console.log('📊 Loading knowledge stats...');
      const stats = await ragService.getKnowledgeBaseStats();
      console.log('📊 Stats loaded:', stats);
      setKnowledgeStats(stats);
    } catch (error) {
      console.error('❌ Failed to load knowledge base stats:', error);
      toast.error('Failed to load system statistics');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log('💬 Sending message:', inputMessage);

    if (!isUsingHuggingFace && !ragService.hasApiKey()) {
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

    // Show loading toast for Hugging Face Space
    let loadingToast: string | undefined;

    try {
      console.log('🚀 Generating response...');
      const response = await ragService.generateResponse(userMessage.content, messages);
      console.log('✅ Response received:', response.substring(0, 100) + '...');
      
      // Dismiss loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Dismiss loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Gradio') || error.message.includes('Space')) {
          errorMessage = 'Hugging Face Space is starting up. Please wait 30-60 seconds and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      toast.error(errorMessage);
      
      const errorResponseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. The Hugging Face Space may be starting up. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponseMessage]);
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
  };

  const toggleStats = async () => {
    if (!showStats && !knowledgeStats) {
      await loadKnowledgeStats();
    }
    setShowStats(!showStats);
  };

  const openHuggingFaceSpace = () => {
    window.open('https://huggingface.co/spaces/raktimhugging/ragtim-bot', '_blank');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasApiKey = ragService.hasApiKey();
  const isAvailable = isUsingHuggingFace || hasApiKey;

  console.log('🔍 Component state:');
  console.log('- hasApiKey:', hasApiKey);
  console.log('- isAvailable:', isAvailable);
  console.log('- messages count:', messages.length);

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(true)}
              className={`${systemInfo.color} text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-110 group relative`}
              aria-label="Open RAGtim Bot"
            >
              <MessageCircle className="h-6 w-6" />
              <div className="absolute -top-2 -left-3 text-xl z-10" style={{
                animation: isAvailable ? 'bounce 1s infinite, flash 2s infinite' : 'none'
              }}>
                <span>{systemInfo.icon}</span>
              </div>
            </button>
            
            {/* System indicator */}
            <div className="absolute -top-12 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {systemInfo.name}
            </div>
            
            {/* Hugging Face Option Button */}
            {!isUsingHuggingFace && !isUsingHybrid && (
              <button
                onClick={openHuggingFaceSpace}
                className="absolute -top-16 right-0 bg-[#94c973] hover:bg-[#7fb95e] text-white rounded-xl px-3 py-2 shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium flex items-center gap-2"
                title="Try Hybrid System on Hugging Face"
              >
                <span>🔥</span>
                <span>Hybrid</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${systemInfo.color} text-white rounded-t-lg`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative">
                <MessageCircle className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 text-xs">
                  <span>{systemInfo.icon}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold flex items-center">
                  RAGtim Bot
                </h3>
                <p className="text-xs opacity-90">
                  {systemInfo.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAvailable && (
                <button
                  onClick={toggleStats}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-xs px-2 py-1"
                  title="System stats"
                >
                  <BarChart3 className="h-3 w-3" />
                </button>
              )}
              {!isUsingHuggingFace && !isUsingHybrid && (
                <button
                  onClick={openHuggingFaceSpace}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-xs px-2 py-1"
                  title="Try Hybrid System"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
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

          {/* System Stats */}
          {showStats && knowledgeStats && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {knowledgeStats.architecture || systemInfo.name}
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {knowledgeStats.totalDocuments && <div>Documents: {knowledgeStats.totalDocuments}</div>}
                {knowledgeStats.modelName && (
                  <div className="text-xs text-[#94c973] dark:text-[#94c973]">
                    Model: {knowledgeStats.modelName}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {knowledgeStats.searchCapabilities?.map((capability: string) => (
                    <span key={capability} className="bg-[#94c973]/10 text-[#94c973] dark:bg-[#94c973]/20 dark:text-[#94c973] px-2 py-1 rounded text-xs">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {isAvailable ? (
                  <>
                    <div className={`h-12 w-12 mx-auto mb-4 rounded-full ${systemInfo.color} flex items-center justify-center text-white text-2xl`}>
                      {systemInfo.icon}
                    </div>
                    <p className="text-sm">
                      {isUsingHybrid 
                        ? 'Hybrid RAG system ready! Advanced search with intelligent AI responses.'
                        : isUsingHuggingFace 
                          ? 'AI Assistant ready! Ask me anything about Raktim Mondol.'
                          : 'Advanced RAG system ready! Ask me anything about Raktim Mondol.'
                      }
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                      Powered by advanced AI technology for precise answers.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-500" />
                    <p className="text-sm">The chatbot is currently unavailable.</p>
                    <p className="text-xs mt-2 opacity-70">API key needs to be configured.</p>
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
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? `${systemInfo.color} text-white`
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-custom"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-custom" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-custom" style={{ animationDelay: '0.3s' }}></div>
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
                placeholder={isAvailable ? "Ask about Raktim's research, skills, experience..." : "Chatbot unavailable"}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94c973] focus:border-[#94c973] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                disabled={isLoading || !isAvailable}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || !isAvailable}
                className={`px-3 py-2 ${systemInfo.color} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flash {
          0%, 50% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }
        
        .animate-bounce-custom {
          animation: bounce-custom 1.2s infinite;
        }
        
        @keyframes bounce-custom {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </>
  );
}