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
      console.log(`Vector store ready with ${this.vectorStore.getDocumentCount()} documents`);
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
      // Use vector search for better retrieval
      const results = await this.vectorStore.search(query, 5);
      console.log(`Retrieved ${results.length} relevant documents for query: "${query}"`);
      
      // Log search results for debugging
      results.forEach((result, index) => {
        console.log(`Result ${index + 1}:`, {
          score: result.score,
          section: result.document.metadata.section,
          type: result.document.metadata.type,
          contentPreview: result.document.content.substring(0, 100) + '...'
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error in content retrieval:', error);
      return [];
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const contextParts = searchResults.map((result, index) => {
      const doc = result.document;
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      return `${section}\n${doc.content.trim()}`;
    });

    return contextParts.join('\n\n---\n\n');
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    console.log('Generating response for query:', userQuery);
    
    if (!this.apiKey || !this.openai) {
      console.error('API key or OpenAI client not available');
      return "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured in your Netlify deployment settings.";
    }

    try {
      // Retrieve relevant content using vector search
      const searchResults = await this.retrieveRelevantContent(userQuery);
      const context = this.buildContext(searchResults);

      console.log('Context built from search results:', {
        resultCount: searchResults.length,
        contextLength: context.length
      });

      // Build conversation history for context
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, a knowledgeable assistant that answers questions about Raktim Mondol based on comprehensive information from his portfolio and detailed content files.

IMPORTANT INSTRUCTIONS:
- Always answer based on the provided context about Raktim Mondol
- Be conversational, friendly, and professional
- Provide detailed and informative responses when relevant information is available
- If asked about something not in the context, politely say you don't have that specific information
- You can refer to Raktim in first person (as "I") or third person, whichever feels more natural
- If someone asks general questions like "hello" or "how are you", respond as Raktim's representative
- When discussing technical topics, provide appropriate level of detail
- Include specific examples, achievements, or details when available in the context

CONTEXT ABOUT RAKTIM MONDOL:
${context}

Remember to be helpful and provide comprehensive answers based on the rich context provided above.`
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

      console.log('Sending request to DeepSeek API...');

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 800,
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
  }> {
    await this.vectorStore.initialize();
    
    const totalDocuments = this.vectorStore.getDocumentCount();
    const documentsByType: Record<string, number> = {};
    
    ['about', 'education', 'experience', 'skills', 'research', 'publications', 'awards'].forEach(type => {
      documentsByType[type] = this.vectorStore.getDocumentsByType(type as any).length;
    });

    return {
      totalDocuments,
      documentsByType,
      isVectorSearchEnabled: true
    };
  }
}