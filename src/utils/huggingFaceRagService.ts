import { Client } from '@gradio/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class HuggingFaceRAGService {
  private spaceUrl: string;
  private gradioClient: any = null;

  constructor() {
    this.spaceUrl = import.meta.env.VITE_HUGGING_FACE_SPACE_URL || 'https://raktimhugging-ragtim-bot.hf.space';
    console.log('🤗 HuggingFaceRAGService initialized with URL:', this.spaceUrl);
  }

  public hasApiKey(): boolean {
    return true; // Hugging Face Space doesn't need API key
  }

  private async initializeGradioClient(): Promise<any> {
    if (this.gradioClient) {
      return this.gradioClient;
    }

    try {
      console.log('🔌 Initializing Gradio client for:', this.spaceUrl);
      this.gradioClient = await Client.connect(this.spaceUrl);
      console.log('✅ Gradio client connected successfully');
      return this.gradioClient;
    } catch (error) {
      console.error('❌ Failed to initialize Gradio client:', error);
      throw error;
    }
  }

  private async checkSpaceHealth(): Promise<boolean> {
    try {
      console.log('🏥 Checking Hugging Face Space health...');
      
      const response = await fetch(`${this.spaceUrl}/`, {
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

  private async queryHuggingFaceChat(message: string): Promise<string> {
    try {
      console.log('🤗 Querying HF chat with message:', message);
      
      // Initialize Gradio client
      const client = await this.initializeGradioClient();
      
      console.log('🤗 Calling chat API via Gradio client...');
      
      // Use the correct API name from your Gradio space - assuming it's the main chat interface
      const result = await client.predict("/chat", {
        message: message
      });

      console.log('🤗 Chat response received:', result);
      
      // Extract response from Gradio result
      if (result && result.data) {
        if (typeof result.data === 'string') {
          return result.data;
        } else if (Array.isArray(result.data) && result.data[0]) {
          return result.data[0];
        }
      }
      
      if (typeof result === 'string') {
        return result;
      }
      
      throw new Error('Invalid response format from Hugging Face Space');
    } catch (error) {
      console.error('❌ Hugging Face chat query error:', error);
      throw error;
    }
  }

  private async queryHuggingFaceSearch(query: string, topK: number = 5): Promise<any> {
    try {
      console.log('🔍 Querying HF search:', { query, topK });
      
      // Initialize Gradio client
      const client = await this.initializeGradioClient();
      
      console.log('🔍 Calling search API via Gradio client...');
      
      // Use the correct API name for search
      const result = await client.predict("/search_api", {
        query: query,
        top_k: topK,
        search_type: "hybrid",
        vector_weight: 0.6,
        bm25_weight: 0.4
      });

      console.log('🔍 Search results received:', result);
      
      // Extract data from Gradio response
      if (result && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error('❌ Hugging Face search query error:', error);
      throw error;
    }
  }

  private async queryHuggingFaceStats(): Promise<any> {
    try {
      console.log('📊 Querying HF stats...');
      
      // Initialize Gradio client
      const client = await this.initializeGradioClient();
      
      console.log('📊 Calling stats API via Gradio client...');
      
      // Use the correct API name for stats
      const result = await client.predict("/get_stats_api", {});
      
      console.log('📊 Stats received:', result);
      
      // Extract data from Gradio response
      if (result && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error('❌ Hugging Face stats query error:', error);
      throw error;
    }
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      console.log('🚀 Generating response via HF Space...');
      console.log('- Query:', userQuery);
      console.log('- History length:', conversationHistory.length);

      // Check if space is healthy first
      const isHealthy = await this.checkSpaceHealth();
      if (!isHealthy) {
        return "The Hugging Face Space is currently starting up. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
      }

      // Use the chat interface
      const response = await this.queryHuggingFaceChat(userQuery);
      
      return response;
    } catch (error) {
      console.error('❌ Error generating response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('connect') || error.message.includes('Client')) {
          return "The Hugging Face Space is currently starting up or unavailable. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. The Hugging Face Space might be starting up. Please wait 30-60 seconds and try again.";
        }
        
        if (error.message.includes('API error') || error.message.includes('404') || error.message.includes('500')) {
          return "The Hugging Face Space is currently starting up or the API endpoints are not ready yet. Free spaces go to sleep after inactivity. Please wait a moment and try again.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties. The Hugging Face Space may be starting up. Please try again in a moment.";
    }
  }

  public async getKnowledgeBaseStats(): Promise<any> {
    try {
      const stats = await this.queryHuggingFaceStats();
      
      return {
        ...stats,
        searchCapabilities: [
          'Hugging Face Transformers', 
          'Hybrid Search (Vector + BM25)',
          'Semantic Search', 
          'GPU Accelerated'
        ],
        isVectorSearchEnabled: true,
        backendType: 'Hugging Face Space',
        modelName: 'sentence-transformers/all-MiniLM-L6-v2',
        embeddingDimension: 384,
        architecture: 'Gradio Client Integration'
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      
      return {
        totalDocuments: 64,
        searchCapabilities: ['Hugging Face Space (Starting Up)'],
        isVectorSearchEnabled: true,
        backendType: 'Hugging Face Space',
        modelName: 'sentence-transformers/all-MiniLM-L6-v2',
        embeddingDimension: 384,
        architecture: 'Gradio Client Integration',
        status: 'starting'
      };
    }
  }

  // Additional method for direct search access
  public async searchKnowledgeBase(query: string, topK: number = 5): Promise<any> {
    try {
      return await this.queryHuggingFaceSearch(query, topK);
    } catch (error) {
      console.error('❌ Error searching knowledge base:', error);
      return { results: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}