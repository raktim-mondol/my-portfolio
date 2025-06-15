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

  private async initializeGradioClient(): Promise<any> {
    if (this.gradioClient) {
      return this.gradioClient;
    }

    try {
      console.log('🔌 Initializing Gradio client for:', this.huggingFaceUrl);
      this.gradioClient = await Client.connect(this.huggingFaceUrl);
      console.log('✅ Gradio client connected successfully');
      return this.gradioClient;
    } catch (error) {
      console.error('❌ Failed to initialize Gradio client:', error);
      throw error;
    }
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

  private async searchHuggingFaceHybrid(query: string, topK: number = 10): Promise<SearchResult[]> {
    try {
      console.log('🔍 Starting Hugging Face hybrid search...');
      console.log('- Query:', query);
      console.log('- Top K:', topK);
      console.log('- URL:', this.huggingFaceUrl);
      
      // Initialize Gradio client
      const client = await this.initializeGradioClient();
      
      console.log('🔍 Calling search API via Gradio client...');
      
      // Use the correct API name from your Gradio space
      const result = await client.predict("/search_api", {
        query: query,
        top_k: topK,
        search_type: "hybrid",
        vector_weight: 0.6,
        bm25_weight: 0.4
      });

      console.log('📊 Raw Gradio result:', result);
      
      // Extract data from Gradio response - it might be nested
      let searchData = null;
      if (result && result.data) {
        searchData = result.data;
      } else {
        searchData = result;
      }
      
      console.log('📊 Extracted search data:', searchData);
      
      // Parse the results - handle different possible response formats
      let results = [];
      
      if (searchData && searchData.results && Array.isArray(searchData.results)) {
        results = searchData.results;
        console.log('📊 Found results array with length:', results.length);
      } else if (Array.isArray(searchData)) {
        console.log('📊 Search data is directly an array with length:', searchData.length);
        
        // Check if this is a wrapped API response (array containing the API response object)
        if (searchData.length === 1 && searchData[0] && typeof searchData[0] === 'object' && searchData[0].results) {
          console.log('📊 Found wrapped API response, extracting results array');
          results = searchData[0].results;
          console.log('📊 Extracted results array from wrapped response, length:', results.length);
        } else {
          // This is directly an array of search results
          results = searchData;
          console.log('📊 Using search data directly as results array');
        }
      } else if (searchData && typeof searchData === 'object') {
        // Check if the data itself contains results
        if (searchData.results && Array.isArray(searchData.results)) {
          results = searchData.results;
          console.log('📊 Found nested results array with length:', results.length);
        } else {
          // This is likely the wrong path - the entire response object is being treated as a single result
          console.warn('⚠️ Search data is an object but does not contain a results array');
          console.warn('⚠️ Search data keys:', Object.keys(searchData));
          console.warn('⚠️ This might be the API response wrapper, not individual results');
          
          // Don't treat the entire API response as a single result
          console.log('📊 Skipping API response wrapper, no valid results found');
          return [];
        }
      } else {
        console.warn('⚠️ Unexpected search data format:', searchData);
        return [];
      }
      
      console.log('📊 Extracted results array:', results);
      
      // Validate that we have actual search results, not API response objects
      if (results.length > 0) {
        const firstResult = results[0];
        console.log('📊 First result structure:', firstResult);
        console.log('📊 First result keys:', Object.keys(firstResult));
        
        // Check if this looks like a search result (should have document property) or API response
        if (!firstResult.document && !firstResult.content && !firstResult.text) {
          console.warn('⚠️ Results array contains objects that don\'t look like search results');
          console.warn('⚠️ First result:', firstResult);
          return [];
        }
      }
      
      // Transform results to our format with better error handling
      const transformedResults = results.map((result: any, index: number) => {
        console.log(`📊 Processing result ${index}:`, result);
        console.log(`📊 Result keys:`, Object.keys(result));
        console.log(`📊 Result.document:`, result.document);
        console.log(`📊 Result.document keys:`, result.document ? Object.keys(result.document) : 'No document property');
        
        // Handle different possible result structures
        let document = null;
        let content = '';
        let metadata: any = {};
        let score = 0;
        let searchType = 'hybrid';
        
        // Try to extract document information - improved logic
        if (result.document && typeof result.document === 'object') {
          // Standard format: result has a document property
          document = result.document;
          console.log(`📊 Document found:`, document);
          console.log(`📊 Document keys:`, Object.keys(document));
          
          // Try multiple ways to get content
          content = document.content || document.text || document.body || '';
          metadata = document.metadata || {};
          
          console.log(`📊 Extracted content length:`, content.length);
          console.log(`📊 Content preview:`, content.substring(0, 100));
          
        } else if (result.content || result.text) {
          // Direct content in result
          content = result.content || result.text;
          metadata = result.metadata || {};
          console.log(`📊 Direct content found, length:`, content.length);
          
          // Create a document structure
          document = {
            id: result.id || `result-${index}-${Date.now()}`,
            content: content,
            metadata: metadata
          };
        } else {
          // Check if result has nested structure we haven't handled
          console.log(`📊 Checking alternative structures for result ${index}:`, Object.keys(result));
          console.log(`📊 Full result structure:`, JSON.stringify(result, null, 2));
          
          // Try to find content in various possible locations
          const possibleContent = result.doc?.content || 
                                 result.doc?.text || 
                                 result.data?.content || 
                                 result.data?.text ||
                                 result.text ||
                                 result.content ||
                                 result.document?.content ||
                                 result.document?.text;
          
          if (possibleContent && typeof possibleContent === 'string' && possibleContent.trim().length > 0) {
            content = possibleContent;
            metadata = result.metadata || result.doc?.metadata || result.data?.metadata || result.document?.metadata || {};
            document = {
              id: result.id || result.doc?.id || result.document?.id || `result-${index}-${Date.now()}`,
              content: content,
              metadata: metadata
            };
            console.log(`📊 Alternative content found, length:`, content.length);
          } else {
            // Last resort - only warn if we truly can't extract meaningful content
            console.warn('⚠️ Could not extract proper content from result:', result);
            console.warn('⚠️ Available properties:', Object.keys(result));
            console.warn('⚠️ Document property:', result.document);
            
            // Use JSON string as fallback, but mark it clearly
            content = `[Raw data: ${JSON.stringify(result).substring(0, 200)}...]`;
            document = {
              id: `fallback-${index}-${Date.now()}`,
              content: content,
              metadata: { type: 'raw', priority: 1, section: 'Raw Data' }
            };
          }
        }
        
        // Extract score
        if (typeof result.score === 'number') {
          score = result.score;
        } else if (typeof result.similarity === 'number') {
          score = result.similarity;
        } else if (typeof result.relevance === 'number') {
          score = result.relevance;
        }
        
        // Extract search type
        if (result.search_type) {
          searchType = result.search_type;
        } else if (result.searchType) {
          searchType = result.searchType;
        } else if (result.type) {
          searchType = result.type;
        }
        
        // Create a properly formatted result
        const transformedResult = {
          document: {
            id: document?.id || `result-${index}-${Date.now()}`,
            content: content,
            metadata: {
              type: metadata.type || 'general',
              priority: metadata.priority || 5,
              section: metadata.section || 'Unknown Section',
              source: metadata.source || 'hugging-face-search'
            }
          },
          score: score,
          searchType: searchType as 'hybrid' | 'vector' | 'bm25',
          vector_score: result.vector_score,
          bm25_score: result.bm25_score
        };
        
        console.log(`📊 Transformed result ${index}:`, {
          hasContent: !!transformedResult.document.content,
          contentLength: transformedResult.document.content.length,
          score: transformedResult.score,
          searchType: transformedResult.searchType,
          isRawData: transformedResult.document.content.startsWith('[Raw data:')
        });
        
        return transformedResult;
      });
      
      console.log(`✅ Processed ${transformedResults.length} search results`);
      
      // Filter out results with no meaningful content (but keep raw data as last resort)
      const validResults = transformedResults.filter((result: SearchResult) => {
        const hasContent = result.document.content && result.document.content.trim().length > 0;
        const isNotJustRawData = !result.document.content.startsWith('[Raw data:');
        return hasContent && (isNotJustRawData || transformedResults.length === 1); // Keep raw data only if it's the only result
      });
      
      console.log(`✅ Valid results with meaningful content: ${validResults.length}`);
      
      // If we have no valid results but had some transformed results, return the raw data ones
      if (validResults.length === 0 && transformedResults.length > 0) {
        console.log('⚠️ No meaningful content found, returning raw data results as fallback');
        return transformedResults.slice(0, 3); // Limit to 3 raw results
      }
      
      return validResults;
    } catch (error) {
      console.error('❌ Hugging Face hybrid search error:', error);
      throw error;
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    console.log('📄 Building context from search results...');
    console.log('📄 Number of search results:', searchResults.length);
    
    if (searchResults.length === 0) {
      console.log('📄 No search results to build context from');
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    // Use all available results (up to 10) instead of limiting to 6
    const topResults = searchResults.slice(0, 10);
    console.log(`📄 Using top ${topResults.length} results for context`);
    
    // Rough token estimation: 1 token ≈ 4 characters for English text
    const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
    
    // Reserve tokens for system prompt structure (approximately 2000 tokens)
    const maxContextTokens = 58000; // Leave 2000 tokens for system prompt structure
    let currentTokens = 0;
    
    const contextParts: string[] = [];
    
    for (let index = 0; index < topResults.length; index++) {
      const result = topResults[index];
      const doc = result.document;
      
      console.log(`📄 Processing context part ${index}:`, {
        hasContent: !!doc.content,
        contentLength: doc.content?.length || 0,
        section: doc.metadata.section,
        type: doc.metadata.type
      });
      
      // Validate content exists and is meaningful
      if (!doc.content || doc.content.trim().length === 0) {
        console.warn(`⚠️ Context part ${index} has no content, skipping`);
        continue;
      }
      
      if (doc.content.startsWith('[Raw data:')) {
        console.warn(`⚠️ Context part ${index} contains raw data, skipping`);
        continue;
      }
      
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      
      let searchInfo = '';
      if (result.searchType === 'hybrid' && result.vector_score !== undefined && result.bm25_score !== undefined) {
        searchInfo = `(Hybrid: V=${(result.vector_score * 100).toFixed(1)}%, K=${(result.bm25_score * 100).toFixed(1)}%)`;
      } else {
        searchInfo = `(${result.searchType.toUpperCase()}: ${(result.score * 100).toFixed(1)}%)`;
      }
      
      let contextPart = `${section} ${searchInfo}\n${doc.content.trim()}`;
      const partTokens = estimateTokens(contextPart);
      
      // Check if adding this part would exceed token limit
      if (currentTokens + partTokens > maxContextTokens) {
        console.log(`📄 Token limit would be exceeded with part ${index} (${partTokens} tokens). Current: ${currentTokens}, Max: ${maxContextTokens}`);
        
        // Try to truncate the content to fit
        const availableTokens = maxContextTokens - currentTokens;
        const availableChars = availableTokens * 4; // Convert back to characters
        const headerLength = `${section} ${searchInfo}\n`.length;
        
        if (availableChars > headerLength + 100) { // Ensure at least 100 chars for content
          const truncatedContent = doc.content.trim().substring(0, availableChars - headerLength - 20) + '...';
          contextPart = `${section} ${searchInfo}\n${truncatedContent}`;
          const truncatedTokens = estimateTokens(contextPart);
          
          console.log(`📄 Truncated part ${index} to ${truncatedTokens} tokens`);
          contextParts.push(contextPart);
          currentTokens += truncatedTokens;
        } else {
          console.log(`📄 Not enough space for part ${index}, stopping here`);
        }
        break;
      }
      
      console.log(`📄 Context part ${index} length: ${contextPart.length} chars, ~${partTokens} tokens`);
      contextParts.push(contextPart);
      currentTokens += partTokens;
    }

    if (contextParts.length === 0) {
      console.warn('⚠️ No valid context parts found after filtering');
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const fullContext = contextParts.join('\n\n---\n\n');
    const finalTokens = estimateTokens(fullContext);
    
    console.log('📄 Full context built successfully:');
    console.log('📄 - Valid context parts:', contextParts.length);
    console.log('📄 - Full context length:', fullContext.length, 'characters');
    console.log('📄 - Estimated tokens:', finalTokens);
    console.log('📄 - Context preview:', fullContext.substring(0, 200) + '...');
    
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
      const searchResults = await this.searchHuggingFaceHybrid(userQuery, 10);
      
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
        
        if (error.message.includes('connect') || error.message.includes('Client')) {
          return "The Hugging Face Space is currently starting up or unavailable. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
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
      
      // Initialize Gradio client
      const client = await this.initializeGradioClient();
      
      console.log('📊 Calling stats API via Gradio client...');
      
      // Use the correct API name for stats
      const result = await client.predict("/get_stats_api", {});
      
      console.log('📊 Stats result received:', result);
      
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
      console.warn('⚠️ Could not fetch stats from Hugging Face:', error);
      
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
}