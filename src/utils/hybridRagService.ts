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
    };
  };
  score: number;
  searchType: 'semantic';
}

export class HybridRAGService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;
  private huggingFaceUrl: string;

  constructor() {
    this.apiKey = this.getApiKey();
    this.huggingFaceUrl = 'https://raktimhugging-ragtim-bot.hf.space';
    
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

  private async searchHuggingFaceTransformers(query: string, topK: number = 5): Promise<SearchResult[]> {
    try {
      // Call Hugging Face Space API for search only
      const response = await fetch(`${this.huggingFaceUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: topK,
          search_only: true // Flag to indicate we only want search results, not generated response
        }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Hugging Face results to our format
      return data.results?.map((result: any) => ({
        document: {
          id: result.id || Math.random().toString(),
          content: result.content,
          metadata: {
            type: result.metadata?.type || 'general',
            priority: result.metadata?.priority || 5
          }
        },
        score: result.score,
        searchType: 'semantic' as const
      })) || [];
    } catch (error) {
      console.error('Hugging Face search error:', error);
      throw error;
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const topResults = searchResults.slice(0, 6); // Use top 6 results for rich context
    
    const contextParts = topResults.map((result, index) => {
      const doc = result.document;
      const section = `[${doc.metadata.type}]`;
      const relevanceScore = `(Relevance: ${(result.score * 100).toFixed(1)}%)`;
      
      return `${section} ${relevanceScore}\n${doc.content.trim()}`;
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
      return "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured.";
    }

    try {
      // Step 1: Use Hugging Face transformers for semantic search
      console.log('🔍 Searching with Hugging Face transformers...');
      const searchResults = await this.searchHuggingFaceTransformers(userQuery, 8);
      
      if (searchResults.length === 0) {
        return "I don't have specific information about that topic. Could you please ask something else about Raktim Mondol's research, experience, or expertise?";
      }

      // Step 2: Build context from search results
      const context = this.buildContext(searchResults);
      console.log('📄 Context built from', searchResults.length, 'relevant documents');

      // Step 3: Use DeepSeek for response generation
      console.log('🧠 Generating response with DeepSeek...');
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, an intelligent assistant that answers questions about Raktim Mondol using a hybrid AI system:

🔍 SEARCH TECHNOLOGY:
- Hugging Face Transformers provide GPU-accelerated semantic search
- DeepSeek LLM generates natural, conversational responses
- This hybrid approach combines the best of both worlds

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
The following information was retrieved using Hugging Face transformers with semantic similarity search. Each section shows the relevance score and content type:

${context}

Remember to provide comprehensive answers based on this rich context, but always respond in plain text without any markdown formatting whatsoever.`
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
          return "The search service is currently unavailable. Please try again later.";
        }
        
        if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('Authentication')) {
          return "The API key appears to be invalid or missing. Please contact the site administrator to configure the VITE_DEEPSEEK_API_KEY environment variable.";
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
      // Get stats from Hugging Face Space
      const response = await fetch(`${this.huggingFaceUrl}/api/stats`);
      
      if (response.ok) {
        const stats = await response.json();
        return {
          ...stats,
          searchProvider: 'Hugging Face Transformers',
          responseProvider: 'DeepSeek LLM',
          architecture: 'Hybrid RAG System',
          searchCapabilities: ['GPU-Accelerated Semantic Search', 'Transformer Embeddings', 'DeepSeek Response Generation'],
          isHybridSystem: true
        };
      }
    } catch (error) {
      console.warn('Could not fetch stats from Hugging Face:', error);
    }

    // Fallback stats
    return {
      totalDocuments: 13,
      searchProvider: 'Hugging Face Transformers',
      responseProvider: 'DeepSeek LLM',
      architecture: 'Hybrid RAG System',
      searchCapabilities: ['GPU-Accelerated Semantic Search', 'Transformer Embeddings', 'DeepSeek Response Generation'],
      isHybridSystem: true,
      modelName: 'sentence-transformers/all-MiniLM-L6-v2',
      embeddingDimension: 384
    };
  }
}