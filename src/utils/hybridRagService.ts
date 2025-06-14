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
    console.log('🔧 HybridRAGService Constructor Starting...');
    
    this.apiKey = this.getApiKey();
    this.huggingFaceUrl = import.meta.env.VITE_HUGGING_FACE_SPACE_URL || 'https://raktimhugging-ragtim-bot.hf.space';
    
    console.log('🔧 HybridRAGService Constructor:');
    console.log('- API Key present:', !!this.apiKey);
    console.log('- API Key length:', this.apiKey?.length || 0);
    console.log('- Hugging Face URL:', this.huggingFaceUrl);
    
    if (this.apiKey) {
      try {
        this.openai = new OpenAI({
          baseURL: 'https://api.deepseek.com',
          apiKey: this.apiKey,
          dangerouslyAllowBrowser: true
        });
        console.log('✅ OpenAI client initialized for DeepSeek');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client:', error);
      }
    } else {
      console.log('❌ No valid API key found - OpenAI client not initialized');
    }
  }

  private getApiKey(): string | null {
    const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    console.log('🔑 API Key Check:');
    console.log('- Raw env value exists:', !!envApiKey);
    console.log('- Type:', typeof envApiKey);
    console.log('- Length:', envApiKey?.length || 0);
    console.log('- Starts with sk-:', envApiKey?.startsWith?.('sk-') || false);
    
    if (envApiKey && 
        typeof envApiKey === 'string' && 
        envApiKey.trim().length > 0 &&
        !envApiKey.includes('placeholder') &&
        !envApiKey.includes('your_actual') &&
        !envApiKey.includes('your_deepseek_api_key_here') &&
        !envApiKey.includes('sk-your-actual-deepseek-api-key-here')) {
      console.log('✅ Valid API key found');
      return envApiKey.trim();
    }
    
    console.log('❌ Invalid or missing API key');
    console.log('- Contains placeholder text:', envApiKey?.includes('placeholder') || envApiKey?.includes('your_actual'));
    return null;
  }

  public hasApiKey(): boolean {
    const hasKey = !!this.apiKey;
    console.log('🔑 hasApiKey() called, result:', hasKey);
    return hasKey;
  }

  private async checkHuggingFaceHealth(): Promise<boolean> {
    try {
      console.log('🏥 Checking Hugging Face Space health...');
      
      // Try to access the main page first
      const response = await fetch(`${this.huggingFaceUrl}/`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      console.log('🏥 Health check response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Hugging Face health check failed:', error);
      return false;
    }
  }

  private async searchHuggingFaceHybrid(query: string, topK: number = 8): Promise<SearchResult[]> {
    try {
      console.log('🔍 Starting Hugging Face hybrid search...');
      console.log('- Query:', query);
      console.log('- Top K:', topK);
      console.log('- URL:', this.huggingFaceUrl);
      
      // Try the direct API endpoint that your Space exposes
      const searchUrl = `${this.huggingFaceUrl}/api/search`;
      console.log('🔍 Calling search API:', searchUrl);
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          top_k: topK,
          search_type: 'hybrid',
          vector_weight: 0.6,
          bm25_weight: 0.4
        }),
      });

      console.log('🔍 Search response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Hugging Face search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Search data received:', data);
      
      // Transform results to our format
      const results = data.results?.map((result: any, index: number) => {
        console.log(`📊 Processing result ${index}:`, {
          hasDocument: !!result.document,
          hasContent: !!result.document?.content,
          score: result.score,
          searchType: result.search_type
        });
        
        return {
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
        };
      }) || [];
      
      console.log(`✅ Processed ${results.length} search results`);
      return results;
    } catch (error) {
      console.error('❌ Hugging Face hybrid search error:', error);
      throw error;
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    console.log('📄 Building context from search results...');
    
    if (searchResults.length === 0) {
      console.log('📄 No search results to build context from');
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const topResults = searchResults.slice(0, 6);
    console.log(`📄 Using top ${topResults.length} results for context`);
    
    const contextParts = topResults.map((result, index) => {
      const doc = result.document;
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      
      let searchInfo = '';
      if (result.searchType === 'hybrid' && result.vector_score !== undefined && result.bm25_score !== undefined) {
        searchInfo = `(Hybrid: V=${(result.vector_score * 100).toFixed(1)}%, K=${(result.bm25_score * 100).toFixed(1)}%)`;
      } else {
        searchInfo = `(${result.searchType.toUpperCase()}: ${(result.score * 100).toFixed(1)}%)`;
      }
      
      const contextPart = `${section} ${searchInfo}\n${doc.content.trim()}`;
      console.log(`📄 Context part ${index} length:`, contextPart.length);
      
      return contextPart;
    });

    const fullContext = contextParts.join('\n\n---\n\n');
    console.log('📄 Full context length:', fullContext.length);
    
    return fullContext;
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
    console.log('🚀 Starting hybrid response generation...');
    console.log('- User query:', userQuery);
    console.log('- Has API key:', !!this.apiKey);
    console.log('- Has OpenAI client:', !!this.openai);
    console.log('- Conversation history length:', conversationHistory.length);
    
    if (!this.apiKey || !this.openai) {
      const errorMsg = "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured with your actual DeepSeek API key.";
      console.log('❌ Missing API key or OpenAI client:', errorMsg);
      return errorMsg;
    }

    try {
      // Step 1: Check if Hugging Face Space is available
      console.log('🏥 Step 1: Checking Hugging Face Space availability...');
      const isHFHealthy = await this.checkHuggingFaceHealth();
      
      if (!isHFHealthy) {
        return "The Hugging Face Space is currently starting up or unavailable. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
      }

      // Step 2: Use Hugging Face for hybrid search
      console.log('🔥 Step 2: Performing hybrid search with Hugging Face...');
      const searchResults = await this.searchHuggingFaceHybrid(userQuery, 8);
      
      if (searchResults.length === 0) {
        const errorMsg = "I don't have specific information about that topic in my knowledge base. Could you please ask something else about Raktim Mondol's research, experience, or expertise?";
        console.log('⚠️ No search results:', errorMsg);
        return errorMsg;
      }
      console.log(`✅ Got ${searchResults.length} search results`);

      // Step 3: Build rich context from hybrid search results
      console.log('📄 Step 3: Building context from search results...');
      const context = this.buildContext(searchResults);
      console.log(`📄 Context built from ${searchResults.length} hybrid search results`);

      // Step 4: Use DeepSeek for natural response generation
      console.log('🧠 Step 4: Generating natural response with DeepSeek LLM...');
      
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

      console.log('🧠 Sending request to DeepSeek...');
      console.log('- Messages count:', messages.length);
      console.log('- System message length:', messages[0].content.length);
      console.log('- User query:', userQuery);

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      });

      console.log('✅ DeepSeek response received');
      console.log('- Response choices:', completion.choices?.length || 0);
      console.log('- First choice content length:', completion.choices[0]?.message?.content?.length || 0);
      
      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      
      const finalResponse = this.stripMarkdown(response);
      console.log('✅ Final response prepared, length:', finalResponse.length);
      
      return finalResponse;
    } catch (error) {
      console.error('❌ Error in hybrid RAG service:', error);
      
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5)
        });
        
        if (error.message.includes('search API') || error.message.includes('404')) {
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
      console.log('📊 Getting knowledge base stats from Hugging Face...');
      
      // Try the direct stats API endpoint
      const statsUrl = `${this.huggingFaceUrl}/api/stats`;
      console.log('📊 Calling stats API:', statsUrl);
      
      const response = await fetch(statsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const stats = await response.json();
        console.log('📊 HF Stats received:', stats);
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
      } else {
        console.warn('⚠️ Stats API returned:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch stats from Hugging Face:', error);
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