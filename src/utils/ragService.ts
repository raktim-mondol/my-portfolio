import OpenAI from 'openai';
import { VectorStore, SearchResult } from './vectorStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class RAGService {
  private openai: OpenAI | null = null;
  private vectorStore: VectorStore;
  private apiKey: string | null = null;

  constructor() {
    this.vectorStore = VectorStore.getInstance();
    this.apiKey = this.getApiKey();
    
    console.log('RAGService initialized');
    console.log('Environment check:', {
      hasViteEnv: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
      envValue: import.meta.env.VITE_DEEPSEEK_API_KEY ? 'Present' : 'Missing',
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    });
    
    if (this.apiKey) {
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
      console.log('OpenAI client initialized successfully');
      
      // Initialize vector store
      this.initializeVectorStore();
    } else {
      console.warn('No valid API key found. RAGtim Bot will be disabled.');
      console.warn('To enable the chatbot, set VITE_DEEPSEEK_API_KEY in your Netlify environment variables.');
    }
  }

  private async initializeVectorStore(): Promise<void> {
    try {
      await this.vectorStore.initialize();
      const stats = this.vectorStore.getSearchStats();
      console.log(`Vector store ready with hybrid search capabilities:`, stats);
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
    }
  }

  private getApiKey(): string | null {
    const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    console.log('Getting API key:', {
      envApiKey: envApiKey ? 'Present' : 'Missing',
      envApiKeyLength: envApiKey?.length || 0,
      envApiKeyType: typeof envApiKey
    });
    
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
    const hasKey = !!this.apiKey;
    console.log('Has valid API key:', hasKey);
    return hasKey;
  }

  private async retrieveRelevantContent(query: string): Promise<SearchResult[]> {
    try {
      // Use hybrid search (vector + TF-IDF) for better retrieval
      const results = await this.vectorStore.search(query, 10); // Get more results for better context
      
      console.log(`Hybrid search completed for query: "${query}"`, {
        totalResults: results.length,
        searchTypes: results.reduce((acc, r) => {
          acc[r.searchType] = (acc[r.searchType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      // Log top results for debugging
      results.slice(0, 5).forEach((result, index) => {
        console.log(`Result ${index + 1}:`, {
          score: result.score.toFixed(4),
          searchType: result.searchType,
          section: result.document.metadata.section,
          type: result.document.metadata.type,
          priority: result.document.metadata.priority,
          contentPreview: result.document.content.substring(0, 100) + '...'
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error in hybrid content retrieval:', error);
      return [];
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    // Take top 8 results for comprehensive context
    const topResults = searchResults.slice(0, 8);
    
    const contextParts = topResults.map((result, index) => {
      const doc = result.document;
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      const searchInfo = result.searchType === 'hybrid' ? '(Vector+Keyword)' : 
                        result.searchType === 'vector' ? '(Semantic)' : '(Keyword)';
      
      return `${section} ${searchInfo}\n${doc.content.trim()}`;
    });

    const context = contextParts.join('\n\n---\n\n');
    
    console.log('Context built:', {
      resultCount: topResults.length,
      contextLength: context.length,
      searchTypeBreakdown: topResults.reduce((acc, r) => {
        acc[r.searchType] = (acc[r.searchType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    return context;
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    console.log('Generating response for query:', userQuery);
    
    if (!this.apiKey || !this.openai) {
      console.error('API key or OpenAI client not available');
      return "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured in your Netlify deployment settings.";
    }

    try {
      // Retrieve relevant content using hybrid search
      const searchResults = await this.retrieveRelevantContent(userQuery);
      const context = this.buildContext(searchResults);

      // Build conversation history for context
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, a knowledgeable assistant that answers questions about Raktim Mondol using advanced hybrid search technology that combines semantic vector search with keyword-based TF-IDF search for comprehensive and accurate information retrieval.

CRITICAL FORMATTING INSTRUCTIONS:
- NEVER use markdown formatting in your responses
- Do NOT use asterisks (*), hashtags (#), backticks (\`), or any other markdown syntax
- Write in plain English text only
- Use simple punctuation like periods, commas, and colons
- For emphasis, use capital letters or repeat words naturally
- When listing items, use simple dashes (-) or numbers (1, 2, 3)
- Write as if you're speaking naturally in a conversation

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

SEARCH TECHNOLOGY:
The context below was retrieved using hybrid search combining:
1. Vector Search: Semantic understanding using embeddings
2. TF-IDF Search: Exact keyword matching and relevance scoring
3. Priority Weighting: Content importance based on document metadata

This ensures you receive the most relevant and comprehensive information about Raktim Mondol.

CONTEXT ABOUT RAKTIM MONDOL:
${context}

Remember to be helpful and provide comprehensive answers based on the rich context provided above, but always respond in plain text without any markdown formatting.`
        }
      ];

      // Add recent conversation history (last 6 messages for better context)
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current user query
      messages.push({
        role: "user",
        content: userQuery
      });

      console.log('Sending request to DeepSeek API with hybrid search context...');

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      });

      console.log('Received response from DeepSeek API');

      return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name
        });
        
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

  // Method to get statistics about the knowledge base
  public async getKnowledgeBaseStats(): Promise<{
    totalDocuments: number;
    documentsByType: Record<string, number>;
    isVectorSearchEnabled: boolean;
    searchCapabilities: string[];
    uniqueTerms: number;
    hasEmbeddings: number;
  }> {
    await this.vectorStore.initialize();
    
    const stats = this.vectorStore.getSearchStats();
    const totalDocuments = this.vectorStore.getDocumentCount();
    const documentsByType: Record<string, number> = {};
    
    ['about', 'education', 'experience', 'skills', 'research', 'publications', 'awards'].forEach(type => {
      documentsByType[type] = this.vectorStore.getDocumentsByType(type as any).length;
    });

    return {
      totalDocuments,
      documentsByType,
      isVectorSearchEnabled: stats.searchCapabilities.includes('Vector Search'),
      searchCapabilities: stats.searchCapabilities,
      uniqueTerms: stats.uniqueTerms,
      hasEmbeddings: stats.hasEmbeddings
    };
  }
}