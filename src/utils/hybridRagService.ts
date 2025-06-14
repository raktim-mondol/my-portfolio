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

  constructor() {
    this.apiKey = this.getApiKey();
    this.huggingFaceUrl = import.meta.env.VITE_HUGGING_FACE_SPACE_URL || 'https://raktimhugging-ragtim-bot.hf.space';
    
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
        !envApiKey.includes('your_deepseek_api_key_here') &&
        !envApiKey.includes('sk-your-actual-deepseek-api-key-here')) {
      return envApiKey.trim();
    }
    
    return null;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private async checkHuggingFaceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.huggingFaceUrl}/api/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.warn('Hugging Face health check failed:', error);
      return false;
    }
  }

  private async searchHuggingFaceHybrid(query: string, topK: number = 8): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.huggingFaceUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: topK,
          search_type: 'hybrid',
          vector_weight: 0.6,
          bm25_weight: 0.4
        }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face hybrid search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Hugging Face results to our format
      return data.results?.map((result: any) => ({
        document: {
          id: result.document?.id || Math.random().toString(),
          content: result.document?.content || result.content || '',
          metadata: {
            type: result.document?.metadata?.type || 'general',
            priority: result.document?.metadata?.priority || 5,
            section: result.document?.metadata?.section,
            source: result.document?.metadata?.source
          }
        },
        score: result.score || 0,
        searchType: result.search_type || 'hybrid',
        vector_score: result.vector_score,
        bm25_score: result.bm25_score
      })) || [];
    } catch (error) {
      console.error('Hugging Face hybrid search error:', error);
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
      // Step 1: Check if Hugging Face Space is available
      console.log('🔍 Checking Hugging Face Space availability...');
      const isHFHealthy = await this.checkHuggingFaceHealth();
      
      if (!isHFHealthy) {
        return "The hybrid search service is currently unavailable. The Hugging Face Space may be starting up or experiencing issues. Please try again in a moment.";
      }

      // Step 2: Use Hugging Face for hybrid search (Vector + BM25)
      console.log('🔥 Performing hybrid search with Hugging Face transformers...');
      const searchResults = await this.searchHuggingFaceHybrid(userQuery, 8);
      
      if (searchResults.length === 0) {
        return "I don't have specific information about that topic in my knowledge base. Could you please ask something else about Raktim Mondol's research, experience, or expertise?";
      }

      // Step 3: Build rich context from hybrid search results
      const context = this.buildContext(searchResults);
      console.log(`📄 Context built from ${searchResults.length} hybrid search results`);

      // Step 4: Use DeepSeek for natural response generation
      console.log('🧠 Generating natural response with DeepSeek LLM...');
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, an advanced AI assistant powered by a cutting-edge hybrid search system:

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

Remember to provide comprehensive answers based on this rich context from our hybrid search system, but always respond in plain text without any markdown formatting whatsoever.`
        }
      ];

      // Add recent conversation history
      const recentHistory = conversationHistory.slice(-4);
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
      console.error('Error in hybrid RAG service:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Hugging Face')) {
          return "The hybrid search service is currently unavailable. This may be because the Hugging Face Space is starting up or experiencing issues. Please try again in a moment.";
        }
        
        if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('Authentication')) {
          return "The DeepSeek API key appears to be invalid or missing. Please contact the site administrator to configure the VITE_DEEPSEEK_API_KEY environment variable with a valid DeepSeek API key.";
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. Please check your internet connection and try again.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties with the hybrid search system. Please try again later.";
    }
  }

  public async getKnowledgeBaseStats(): Promise<any> {
    try {
      // Get stats from Hugging Face Space
      const response = await fetch(`${this.huggingFaceUrl}/api/stats`);
      
      if (response.ok) {
        const stats = await response.json();
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
      }
    } catch (error) {
      console.warn('Could not fetch stats from Hugging Face:', error);
    }

    // Fallback stats
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