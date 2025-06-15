import OpenAI from 'openai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SearchResult {
  document: {
    id: string;
    content: string;
    metadata: {
      source: string;
      section?: string;
      type: string;
      priority: number;
    };
  };
  score: number;
  searchType: 'vector' | 'bm25' | 'hybrid';
}

export class BackendRAGService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;
  private backendUrl: string;

  constructor() {
    this.apiKey = this.getApiKey();
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    if (this.apiKey) {
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  private getApiKey(): string | null {
    const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (envApiKey && 
        typeof envApiKey === 'string' && 
        envApiKey.trim().length > 0 &&
        !envApiKey.includes('placeholder') &&
        !envApiKey.includes('your_actual') &&
        !envApiKey.includes('your_deepseek_api_key_here')) {
      return envApiKey.trim();
    }
    
    return null;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const health = await response.json();
        return health.status === 'healthy' && health.services?.transformer && health.services?.vector;
      }
      return false;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  private async searchBackend(query: string, topK: number = 10): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.backendUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          topK,
          searchType: 'hybrid'
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Backend search error:', error);
      throw error;
    }
  }

  private async retrieveRelevantContent(query: string): Promise<SearchResult[]> {
    try {
      // Check if backend is available
      const isBackendHealthy = await this.checkBackendHealth();
      
      if (!isBackendHealthy) {
        throw new Error('Backend service is not available');
      }

      // Use backend search
      const results = await this.searchBackend(query, 10);
      return results;
    } catch (error) {
      console.error('Error in backend content retrieval:', error);
      throw error;
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const topResults = searchResults.slice(0, 8);
    
    const contextParts = topResults.map((result, index) => {
      const doc = result.document;
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      const searchInfo = result.searchType === 'hybrid' ? '(Vector+BM25)' : 
                        result.searchType === 'vector' ? '(Semantic)' : '(BM25)';
      
      return `${section} ${searchInfo}\n${doc.content.trim()}`;
    });

    return contextParts.join('\n\n---\n\n');
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '- ')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey || !this.openai) {
      return "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured in your Netlify deployment settings.";
    }

    try {
      // Check backend availability first
      const isBackendHealthy = await this.checkBackendHealth();
      
      if (!isBackendHealthy) {
        return "The backend search service is currently unavailable. Please try again later or contact the administrator.";
      }

      // Retrieve relevant content using backend search
      const searchResults = await this.retrieveRelevantContent(userQuery);
      const context = this.buildContext(searchResults);

      // Build conversation history for context
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, a knowledgeable assistant that answers questions about Raktim Mondol using advanced hybrid search technology powered by a backend transformer service that combines semantic vector search with BM25 ranking for comprehensive and accurate information retrieval.

CRITICAL FORMATTING INSTRUCTIONS - ABSOLUTELY NO MARKDOWN:
- NEVER use any markdown formatting in your responses under any circumstances
- Do NOT use asterisks (*), hashtags (#), backticks (\`), underscores (_), or any other markdown syntax
- Do NOT use **bold**, *italic*, __underline__, or any other markdown formatting
- Write in plain English text only using simple punctuation like periods, commas, and colons
- For emphasis, use capital letters or repeat words naturally (e.g., "VERY important" or "really really good")
- When listing items, use simple dashes (-) or numbers (1, 2, 3) followed by a space
- Write as if you're speaking naturally in a conversation
- Do NOT format titles, headings, or any text with special characters
- Keep all text as plain, readable sentences without any special formatting
- Even if previous messages in the conversation used markdown, you must NEVER use markdown
- This rule applies to ALL responses, including follow-up questions and continued conversations

RESPONSE GUIDELINES:
- Always answer based on the provided context about Raktim Mondol
- Be conversational, friendly, and professional
- Provide detailed and informative responses when relevant information is available
- If asked about something not in the context, politely say you don't have that specific information
- You can refer to Raktim in first person (as "I") or third person, whichever feels more natural
- If someone asks general questions like "hello" or "how are you", respond as Raktim's representative
- When discussing technical topics, provide appropriate level of detail
- Include specific examples, achievements, or details when available in the context
- Synthesize information from multiple sources when relevant
- Use natural language flow without any special formatting whatsoever

BACKEND SEARCH TECHNOLOGY:
The context below was retrieved using an advanced backend transformer service with hybrid search combining:
1. Vector Search: Semantic understanding using transformer embeddings (Xenova/all-MiniLM-L6-v2) for conceptual similarity
2. BM25 Search: Advanced keyword ranking with term frequency and document length normalization
3. Intelligent Caching: Server-side caching for optimal performance
4. Priority Weighting: Content importance based on document metadata and relevance scores

This backend-powered dual approach ensures you receive the most relevant and comprehensive information about Raktim Mondol with superior performance and accuracy.

CONTEXT ABOUT RAKTIM MONDOL:
${context}

Remember to be helpful and provide comprehensive answers based on the rich context provided above, but always respond in plain text without any markdown formatting whatsoever, regardless of how previous messages were formatted.`
        }
      ];

      // Add recent conversation history
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        const cleanContent = msg.role === 'assistant' ? this.stripMarkdown(msg.content) : msg.content;
        messages.push({
          role: msg.role,
          content: cleanContent
        });
      });

      // Add current user query
      messages.push({
        role: "user",
        content: userQuery
      });

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      
      return this.stripMarkdown(response);
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Backend service is not available')) {
          return "The backend search service is currently unavailable. The system is falling back to basic responses. Please try again later for full search capabilities.";
        }
        
        if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('Authentication')) {
          return "The API key appears to be invalid or missing. Please contact the site administrator to configure the VITE_DEEPSEEK_API_KEY environment variable in Netlify.";
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. Please check your internet connection and try again.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
    }
  }

  public async getKnowledgeBaseStats(): Promise<any> {
    try {
      const isBackendHealthy = await this.checkBackendHealth();
      
      if (!isBackendHealthy) {
        return {
          totalDocuments: 0,
          documentsByType: {},
          isVectorSearchEnabled: false,
          searchCapabilities: ['Backend Unavailable'],
          uniqueTerms: 0,
          hasEmbeddings: 0,
          averageDocLength: 0,
          bm25Parameters: { k1: 1.5, b: 0.75 }
        };
      }

      const response = await fetch(`${this.backendUrl}/api/knowledge-stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge base stats');
      }

      const stats = await response.json();
      
      // Add backend-specific information
      return {
        ...stats,
        backendEnabled: true,
        backendUrl: this.backendUrl,
        searchCapabilities: [...stats.searchCapabilities, 'Backend Powered']
      };
    } catch (error) {
      console.error('Failed to load knowledge base stats:', error);
      return {
        totalDocuments: 0,
        documentsByType: {},
        isVectorSearchEnabled: false,
        searchCapabilities: ['Backend Error'],
        uniqueTerms: 0,
        hasEmbeddings: 0,
        averageDocLength: 0,
        bm25Parameters: { k1: 1.5, b: 0.75 },
        backendEnabled: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}