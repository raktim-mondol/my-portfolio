import OpenAI from 'openai';
import { Client } from '@gradio/client';

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
      type: string;
      priority: number;
      section?: string;
      source?: string;
    };
  };
  score: number;
  searchType: 'hybrid' | 'vector' | 'bm25';
  vector_score?: number;
  bm25_score?: number;
}

export class HybridRAGService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;
  private huggingFaceUrl: string;
  private gradioClient: any = null;

  constructor() {
    this.apiKey = this.getApiKey();
    this.huggingFaceUrl = import.meta.env.VITE_HUGGING_FACE_SPACE_URL || 'https://raktimhugging-ragtim-bot.hf.space';
    
    if (this.apiKey) {
      try {
        this.openai = new OpenAI({
          baseURL: 'https://api.deepseek.com',
          apiKey: this.apiKey,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        // Silent fallback
      }
    }
  }

  private getApiKey(): string | null {
    const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    if (envApiKey && 
        typeof envApiKey === 'string' && 
        envApiKey.trim().length > 0 &&
        !envApiKey.includes('placeholder') &&
        !envApiKey.includes('your_actual') &&
        !envApiKey.includes('your_deepseek_api_key_here') &&
        !envApiKey.includes('sk-your-actual-deepseek-api-key-here')) {
      return envApiKey.trim();
    }
    
    return null;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private async initializeGradioClient(): Promise<any> {
    if (this.gradioClient) {
      return this.gradioClient;
    }

    try {
      this.gradioClient = await Client.connect(this.huggingFaceUrl);
      return this.gradioClient;
    } catch (error) {
      throw error;
    }
  }

  private async checkHuggingFaceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.huggingFaceUrl}/`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private extractContentFromResult(result: any, index: number): { content: string; hasValidContent: boolean } {
    let content = '';
    
    // Try multiple strategies to extract content
    if (result.document?.content) {
      content = result.document.content;
    } else if (result.document?.text) {
      content = result.document.text;
    } else if (result.content) {
      content = result.content;
    } else if (result.text) {
      content = result.text;
    } else if (typeof result === 'string' && result.trim().length > 0) {
      content = result;
    } else if (result.data?.content) {
      content = result.data.content;
    } else {
      // Check for any string property that looks like content
      const stringProps = Object.keys(result).filter(key => 
        typeof result[key] === 'string' && 
        result[key].length > 20 && 
        !key.includes('id') && 
        !key.includes('type')
      );
      
      if (stringProps.length > 0) {
        content = result[stringProps[0]];
      }
    }
    
    const hasValidContent = content && typeof content === 'string' && content.trim().length > 10;
    
    return { content: content.trim(), hasValidContent };
  }

  private async searchHuggingFaceHybrid(query: string, topK: number = 8): Promise<SearchResult[]> {
    try {
      const client = await this.initializeGradioClient();
      
      const result = await client.predict("/search_api", {
        query: query,
        top_k: topK,
        search_type: "hybrid",
        vector_weight: 0.6,
        bm25_weight: 0.4
      });
      
      // Extract data from Gradio response
      let searchData = null;
      if (result && result.data) {
        searchData = result.data;
      } else {
        searchData = result;
      }
      
      // Parse the results
      let results = [];
      
      if (searchData && searchData.results && Array.isArray(searchData.results)) {
        results = searchData.results;
      } else if (Array.isArray(searchData)) {
        results = searchData;
      } else if (searchData && typeof searchData === 'object') {
        if (searchData.results) {
          results = searchData.results;
        } else {
          results = [searchData];
        }
      } else {
        return [];
      }
      
      // Transform results to our format with improved content extraction
      const transformedResults = results.map((result: any, index: number) => {
        const { content, hasValidContent } = this.extractContentFromResult(result, index);
        
        if (!hasValidContent) {
          return null;
        }
        
        const metadata = result.document?.metadata || result.metadata || {};
        
        let score = 0;
        if (typeof result.score === 'number') {
          score = result.score;
        } else if (typeof result.similarity === 'number') {
          score = result.similarity;
        }
        
        let searchType = 'hybrid';
        if (result.search_type) {
          searchType = result.search_type;
        } else if (result.searchType) {
          searchType = result.searchType;
        }
        
        return {
          document: {
            id: result.document?.id || result.id || `result-${index}-${Date.now()}`,
            content: content,
            metadata: {
              type: metadata.type || 'general',
              priority: metadata.priority || 5,
              section: metadata.section || 'Search Result',
              source: metadata.source || 'hugging-face-search'
            }
          },
          score: score,
          searchType: searchType as 'hybrid' | 'vector' | 'bm25',
          vector_score: result.vector_score,
          bm25_score: result.bm25_score
        };
      }).filter(result => result !== null);
      
      return transformedResults;
    } catch (error) {
      throw error;
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const topResults = searchResults.slice(0, 6);
    
    const contextParts = topResults.map((result, index) => {
      const doc = result.document;
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      
      let searchInfo = '';
      if (result.searchType === 'hybrid' && result.vector_score !== undefined && result.bm25_score !== undefined) {
        searchInfo = `(Hybrid: V=${(result.vector_score * 100).toFixed(1)}%, K=${(result.bm25_score * 100).toFixed(1)}%)`;
      } else {
        searchInfo = `(${result.searchType.toUpperCase()}: ${(result.score * 100).toFixed(1)}%)`;
      }
      
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
      return "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured with your actual DeepSeek API key.";
    }

    try {
      const isHFHealthy = await this.checkHuggingFaceHealth();
      
      if (!isHFHealthy) {
        return "The Hugging Face Space is currently starting up or unavailable. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
      }

      const searchResults = await this.searchHuggingFaceHybrid(userQuery, 8);
      
      if (searchResults.length === 0) {
        return "I don't have specific information about that topic in my knowledge base. Could you please ask something else about Raktim Mondol's research, experience, or expertise?";
      }

      const context = this.buildContext(searchResults);

      const systemMessage = `You are RAGtim Bot, an advanced AI assistant powered by a cutting-edge hybrid search system:

🔥 HYBRID SEARCH TECHNOLOGY:
- Hugging Face Transformers: GPU-accelerated semantic vector search using sentence-transformers/all-MiniLM-L6-v2
- BM25 Keyword Search: Advanced TF-IDF ranking with term frequency and document length normalization  
- Intelligent Fusion: Weighted combination (60% vector + 40% BM25) for optimal relevance
- DeepSeek LLM: Natural language generation for conversational responses

This hybrid approach combines the best of both worlds - semantic understanding AND exact keyword matching.

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

RESPONSE GUIDELINES:
- Always answer based on the provided context about Raktim Mondol
- Be conversational, friendly, and professional
- Provide detailed and informative responses when relevant information is available
- If asked about something not in the context, politely say you don't have that specific information
- You can refer to Raktim in first person (as "I") or third person, whichever feels more natural
- Include specific examples, achievements, or details when available in the context
- Synthesize information from multiple sources when relevant
- Use natural language flow without any special formatting whatsoever

HYBRID SEARCH CONTEXT:
The following information was retrieved using our advanced hybrid search system. Each section shows the search method and relevance scores:

${context}

Remember to provide comprehensive answers based on this rich context from our hybrid search system, but always respond in plain text without any markdown formatting whatsoever.`;

      const messages: any[] = [
        {
          role: "system",
          content: systemMessage
        }
      ];

      const recentHistory = conversationHistory.slice(-4);
      recentHistory.forEach(msg => {
        const cleanContent = msg.role === 'assistant' ? this.stripMarkdown(msg.content) : msg.content;
        messages.push({
          role: msg.role,
          content: cleanContent
        });
      });

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
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('Client')) {
          return "The Hugging Face Space is currently starting up or the API endpoints are not ready yet. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
        }
        
        if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('Authentication')) {
          return "The DeepSeek API key appears to be invalid or missing. Please contact the site administrator to configure the VITE_DEEPSEEK_API_KEY environment variable with a valid DeepSeek API key.";
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. Please check your internet connection and try again.";
        }
        
        if (error.message.includes('AbortError')) {
          return "Request timed out. The Hugging Face Space may be slow to respond. Please try again in a moment.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties with the hybrid search system. Please try again later.";
    }
  }

  public async getKnowledgeBaseStats(): Promise<any> {
    try {
      const client = await this.initializeGradioClient();
      const result = await client.predict("/get_stats_api", {});
      
      let stats = null;
      if (result && result.data) {
        stats = result.data;
      } else {
        stats = result;
      }
      
      return {
        ...stats,
        searchProvider: 'Hugging Face Transformers',
        responseProvider: 'DeepSeek LLM',
        architecture: 'Hybrid RAG System',
        searchCapabilities: [
          'GPU-Accelerated Vector Search', 
          'BM25 Keyword Search', 
          'Hybrid Fusion (Vector + BM25)',
          'Transformer Embeddings',
          'DeepSeek Response Generation'
        ],
        isHybridSystem: true,
        hybridWeights: {
          vector: 0.6,
          bm25: 0.4
        }
      };
    } catch (error) {
      return {
        totalDocuments: 64,
        searchProvider: 'Hugging Face Transformers',
        responseProvider: 'DeepSeek LLM',
        architecture: 'Hybrid RAG System',
        searchCapabilities: [
          'GPU-Accelerated Vector Search', 
          'BM25 Keyword Search', 
          'Hybrid Fusion (Vector + BM25)',
          'Transformer Embeddings',
          'DeepSeek Response Generation'
        ],
        isHybridSystem: true,
        modelName: 'sentence-transformers/all-MiniLM-L6-v2',
        embeddingDimension: 384,
        hybridWeights: {
          vector: 0.6,
          bm25: 0.4
        }
      };
    }
  }
}