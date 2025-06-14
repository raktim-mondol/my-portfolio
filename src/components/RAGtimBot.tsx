import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Shield, AlertCircle, Database, BarChart3, Search, Zap, Target, Server } from 'lucide-react';
import { BackendRAGService, ChatMessage } from '../utils/backendRagService';
import toast from 'react-hot-toast';

export default function RAGtimBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragService] = useState(() => new BackendRAGService());
  const [showStats, setShowStats] = useState(false);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check backend status and add initial welcome message
    checkBackendStatus();
  }, [ragService]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const checkBackendStatus = async () => {
    try {
      const stats = await ragService.getKnowledgeBaseStats();
      const isBackendAvailable = stats.backendEnabled !== false && !stats.error;
      
      setBackendStatus(isBackendAvailable ? 'available' : 'unavailable');
      
      if (ragService.hasApiKey()) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: isBackendAvailable 
            ? "Hello! I'm RAGtim Bot, your enhanced AI assistant powered by a high-performance backend transformer service. I use advanced hybrid search technology combining semantic vector search with BM25 ranking, all processed on a dedicated backend server for optimal speed and accuracy. I can provide detailed information about Raktim Mondol's education, research, publications, skills, experience, and more. What would you like to know?"
            : "Hello! I'm RAGtim Bot. The backend transformer service is currently unavailable, so I'm running in basic mode. I can still answer questions about Raktim Mondol, but with limited search capabilities. What would you like to know?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "⚠️ The chatbot is currently unavailable. The API key needs to be configured in the Netlify environment variables. Please contact the site administrator.",
          timestamp: new Date()
        };
        setMessages([errorMessage]);
      }
    } catch (error) {
      console.error('Failed to check backend status:', error);
      setBackendStatus('unavailable');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadKnowledgeStats = async () => {
    try {
      const stats = await ragService.getKnowledgeBaseStats();
      setKnowledgeStats(stats);
    } catch (error) {
      console.error('Failed to load knowledge base stats:', error);
    }
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

  const toggleStats = async () => {
    if (!showStats && !knowledgeStats) {
      await loadKnowledgeStats();
    }
    setShowStats(!showStats);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasApiKey = ragService.hasApiKey();
  const isBackendAvailable = backendStatus === 'available';

  const getStatusColor = () => {
    if (!hasApiKey) return 'bg-red-500 hover:bg-red-600';
    if (backendStatus === 'checking') return 'bg-yellow-500 hover:bg-yellow-600';
    if (isBackendAvailable) return 'bg-[#94c973] hover:bg-[#7fb95e]';
    return 'bg-orange-500 hover:bg-orange-600';
  };

  const getStatusIcon = () => {
    if (!hasApiKey) return '⚠️';
    if (backendStatus === 'checking') return '⏳';
    if (isBackendAvailable) return '🚀';
    return '⚡';
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`${getStatusColor()} text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-110 group relative`}
            aria-label="Open RAGtim Bot"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-2 -left-3 text-xl z-10" style={{
              animation: hasApiKey && isBackendAvailable ? 'bounce 1s infinite, flash 2s infinite' : 'none'
            }}>
              <span>{getStatusIcon()}</span>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 ${getStatusColor()} text-white rounded-t-lg`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                {isBackendAvailable ? <Server className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="font-semibold flex items-center">
                  RAGtim Bot
                  {hasApiKey ? (
                    isBackendAvailable ? (
                      <Shield className="h-3 w-3 ml-1" title="Backend Transformer Service Active" />
                    ) : (
                      <AlertCircle className="h-3 w-3 ml-1" title="Backend unavailable - basic mode" />
                    )
                  ) : (
                    <AlertCircle className="h-3 w-3 ml-1" title="Configuration needed" />
                  )}
                </h3>
                <p className="text-xs opacity-90">
                  {!hasApiKey ? 'Configuration needed' :
                   backendStatus === 'checking' ? 'Checking backend...' :
                   isBackendAvailable ? 'Backend: Vector + BM25' : 'Backend: Unavailable'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasApiKey && (
                <button
                  onClick={toggleStats}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-xs px-2 py-1"
                  title="Knowledge base stats"
                >
                  <BarChart3 className="h-3 w-3" />
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

          {/* Knowledge Base Stats */}
          {showStats && knowledgeStats && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {isBackendAvailable ? 'Backend Transformer Service' : 'Basic Search System'}
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Documents: {knowledgeStats.totalDocuments}</div>
                <div>Unique Terms: {knowledgeStats.uniqueTerms}</div>
                <div>Embeddings: {knowledgeStats.hasEmbeddings}</div>
                <div>Avg Doc Length: {knowledgeStats.averageDocLength} words</div>
                {isBackendAvailable && (
                  <>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      BM25: k1={knowledgeStats.bm25Parameters?.k1}, b={knowledgeStats.bm25Parameters?.b}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Backend: {knowledgeStats.backendUrl || 'Active'}
                    </div>
                  </>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {knowledgeStats.searchCapabilities?.map((capability: string) => (
                    <span key={capability} className={`px-2 py-1 rounded text-xs ${
                      capability.includes('Backend') ? 'bg-green-100 text-green-700' :
                      capability.includes('Vector') ? 'bg-[#94c973]/20 text-[#94c973]' :
                      'bg-gray-100 text-gray-600'
                    }`}>
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
                {hasApiKey ? (
                  <>
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {isBackendAvailable 
                        ? 'Advanced backend RAG system ready! Ask me anything about Raktim Mondol.'
                        : 'Basic search mode active. Ask me about Raktim Mondol.'}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                      {isBackendAvailable 
                        ? 'Powered by backend Vector + BM25 search for precise answers.'
                        : 'Backend transformer service unavailable - using fallback mode.'}
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-500" />
                    <p className="text-sm">The chatbot is currently unavailable.</p>
                    <p className="text-xs mt-2 opacity-70">API key needs to be configured in Netlify environment variables.</p>
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

      <style jsx>{`
        @keyframes flash {
          0%, 50% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}