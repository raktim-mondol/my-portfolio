import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Shield, AlertCircle, Database, BarChart3, Search, Zap, Target, ExternalLink, Bot, Cpu, Brain, HelpCircle } from 'lucide-react';
import { ragService } from '../utils/ragService';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Comprehensive list of 50 suggested questions about Raktim Mondol
const SUGGESTED_QUESTIONS = [
  "What is Raktim Mondol's educational background?",
  "What research areas does Raktim specialize in?",
  "Can you tell me about Raktim's PhD research?",
  "What programming languages does Raktim know?",
  "What publications has Raktim authored?",
  "What is Raktim's experience with machine learning?",
  "Tell me about Raktim's work in artificial intelligence",
  "What data science projects has Raktim worked on?",
  "What is Raktim's experience with Python?",
  "What deep learning frameworks does Raktim use?",
  "Tell me about Raktim's research methodology",
  "What conferences has Raktim presented at?",
  "What is Raktim's experience with computer vision?",
  "What natural language processing work has Raktim done?",
  "What awards or recognitions has Raktim received?",
  "What is Raktim's teaching experience?",
  "Tell me about Raktim's industry experience",
  "What collaborative research has Raktim been involved in?",
  "What technical skills does Raktim possess?",
  "What databases and tools does Raktim work with?",
  "Tell me about Raktim's leadership experience",
  "What open source contributions has Raktim made?",
  "What is Raktim's experience with cloud computing?",
  "Tell me about Raktim's software development experience",
  "What web development skills does Raktim have?",
  "What is Raktim's experience with DevOps?",
  "Tell me about Raktim's data visualization work",
  "What statistical analysis experience does Raktim have?",
  "What is Raktim's experience with big data technologies?",
  "Tell me about Raktim's research impact and citations",
  "What mentoring experience does Raktim have?",
  "What interdisciplinary work has Raktim done?",
  "Tell me about Raktim's problem-solving approach",
  "What innovation projects has Raktim led?",
  "What is Raktim's experience with agile methodologies?",
  "Tell me about Raktim's project management skills",
  "What consulting or advisory work has Raktim done?",
  "What is Raktim's experience with research grants?",
  "Tell me about Raktim's technical writing skills",
  "What peer review experience does Raktim have?",
  "What is Raktim's experience with academic collaboration?",
  "Tell me about Raktim's computational research",
  "What algorithms has Raktim developed or implemented?",
  "What is Raktim's experience with version control systems?",
  "Tell me about Raktim's data engineering experience",
  "What is Raktim's experience with model deployment?",
  "Tell me about Raktim's research philosophy",
  "What future research directions is Raktim interested in?",
  "What professional development has Raktim pursued?",
  "How can I contact Raktim Mondol?"
];

export default function RAGtimBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
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

  // Function to get 3 random questions from the list
  const getRandomQuestions = () => {
    const shuffled = [...SUGGESTED_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const getSystemInfo = () => {
    if (isUsingHybrid) {
      return {
        name: 'Hybrid RAG',
        description: 'Advanced AI Assistant',
        icon: '🤖',
        floatingIcon: '⚡',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    } else if (isUsingHuggingFace) {
      return {
        name: 'HuggingFace',
        description: 'AI Assistant',
        icon: '🤗',
        floatingIcon: '⚡',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    } else if (isUsingBackend) {
      return {
        name: 'Backend Server',
        description: 'AI Assistant',
        icon: '🖥️',
        floatingIcon: '⚡',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    } else {
      return {
        name: 'Netlify Functions',
        description: 'AI Assistant',
        icon: '⚡',
        floatingIcon: '⚡',
        color: 'bg-[#94c973] hover:bg-[#7fb95e]'
      };
    }
  };

  const systemInfo = getSystemInfo();

  useEffect(() => {
    // Initialize suggested questions when component mounts
    setSuggestedQuestions(getRandomQuestions());
    
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
    if (isTyping) {
      const interval = setInterval(scrollToBottom, 100);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

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

  const wordTypewriterEffect = async (
    messageId: string,
    fullText: string,
    speed: number = 80 // milliseconds per word
  ) => {
    setIsTyping(true);
    setStreamingMessageId(messageId);
    
    const words = fullText.split(' ');
    
    for (let i = 0; i <= words.length; i++) {
      const partialText = words.slice(0, i).join(' ');
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: partialText }
            : msg
        )
      );
      
      if (i < words.length) {
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    }
    
    setIsTyping(false);
    setStreamingMessageId(null);
  };

  // Handle clicking on suggested questions
  const handleSuggestedQuestion = async (question: string) => {
    setShowSuggestions(false);
    setInputMessage(question);
    
    // Automatically send the question
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('🚀 Generating response for suggested question:', question);
      const response = await ragService.generateResponse(question, messages);
      console.log('✅ Response received:', response.substring(0, 100) + '...');
      
      // Create assistant message with empty content initially
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '', // Start empty for typewriter effect
        timestamp: new Date()
      };

      // Add empty message to chat
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false); // Stop loading indicator
      
      // Start word-by-word typewriter effect
      await wordTypewriterEffect(assistantMessageId, response, 80);

    } catch (error) {
      console.error('❌ Error sending suggested question:', error);
      
      let errorMessage = 'Failed to process question. Please try again.';
      
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
        content: "I apologize, but I encountered an error while processing your question. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponseMessage]);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log('💬 Sending message:', inputMessage);

    if (!isUsingHuggingFace && !ragService.hasApiKey()) {
      toast.error('The chatbot is currently unavailable. Please contact the site administrator.');
      return;
    }

    // Hide suggestions when user sends their own message
    setShowSuggestions(false);

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
      
      // Create assistant message with empty content initially
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '', // Start empty for typewriter effect
        timestamp: new Date()
      };

      // Add empty message to chat
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false); // Stop loading indicator
      
      // Start word-by-word typewriter effect
      await wordTypewriterEffect(assistantMessageId, response, 80);
      

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
    // Reset suggestions when clearing chat
    setShowSuggestions(true);
    setSuggestedQuestions(getRandomQuestions());
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
                <span>{systemInfo.floatingIcon}</span>
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
                <span>🤖</span>
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
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
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

            {/* Suggested Questions */}
            {showSuggestions && isAvailable && messages.length <= 1 && !isLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Suggested Questions</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 ${systemInfo.color} rounded-full flex items-center justify-center text-white text-sm font-medium group-hover:scale-110 transition-transform`}>
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {question}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setSuggestedQuestions(getRandomQuestions())}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center space-x-1 mx-auto"
                  >
                    <Search className="h-3 w-3" />
                    <span>Get different questions</span>
                  </button>
                </div>
              </div>
            )}
            
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