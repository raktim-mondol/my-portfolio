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
  }

  public hasApiKey(): boolean {
    return true;
  }

  private async initializeGradioClient(): Promise<any> {
    if (this.gradioClient) {
      return this.gradioClient;
    }

    try {
      this.gradioClient = await Client.connect(this.spaceUrl);
      return this.gradioClient;
    } catch (error) {
      throw error;
    }
  }

  private async checkSpaceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.spaceUrl}/`, {
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

  private async queryHuggingFaceChat(message: string): Promise<string> {
    try {
      const client = await this.initializeGradioClient();
      
      const result = await client.predict("/chat", {
        message: message
      });
      
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
      throw error;
    }
  }

  private async queryHuggingFaceSearch(query: string, topK: number = 5): Promise<any> {
    try {
      const client = await this.initializeGradioClient();
      
      const result = await client.predict("/search_api", {
        query: query,
        top_k: topK,
        search_type: "hybrid",
        vector_weight: 0.6,
        bm25_weight: 0.4
      });
      
      if (result && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      throw error;
    }
  }

  private async queryHuggingFaceStats(): Promise<any> {
    try {
      const client = await this.initializeGradioClient();
      const result = await client.predict("/get_stats_api", {});
      
      if (result && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      throw error;
    }
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      const isHealthy = await this.checkSpaceHealth();
      if (!isHealthy) {
        return "The Hugging Face Space is currently starting up. Free Hugging Face Spaces go to sleep after inactivity and take 30-60 seconds to wake up. Please wait a moment and try again.";
      }

      const response = await this.queryHuggingFaceChat(userQuery);
      return response;
    } catch (error) {
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

  public async searchKnowledgeBase(query: string, topK: number = 5): Promise<any> {
    try {
      return await this.queryHuggingFaceSearch(query, topK);
    } catch (error) {
      return { results: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}