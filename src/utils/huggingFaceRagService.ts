export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class HuggingFaceRAGService {
  private spaceUrl: string;

  constructor() {
    this.spaceUrl = import.meta.env.VITE_HUGGING_FACE_SPACE_URL || 'https://raktimhugging-ragtim-bot.hf.space';
    console.log('🤗 HuggingFaceRAGService initialized with URL:', this.spaceUrl);
  }

  public hasApiKey(): boolean {
    return true; // Hugging Face Space doesn't need API key
  }

  private async callGradioAPI(apiName: string, data: any[]): Promise<any> {
    try {
      console.log(`🤗 Calling Gradio API: ${apiName}`, data);
      
      const response = await fetch(`${this.spaceUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          fn_index: this.getFunctionIndex(apiName)
        }),
      });

      if (!response.ok) {
        throw new Error(`Gradio API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`🤗 Gradio API response for ${apiName}:`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Gradio API call failed for ${apiName}:`, error);
      throw error;
    }
  }

  private getFunctionIndex(apiName: string): number {
    // Map API names to function indices based on the Gradio interface order
    const functionMap: Record<string, number> = {
      'chat': 0,      // First interface (chat)
      'search': 1,    // Second interface (search)
      'stats': 2      // Third interface (stats)
    };
    
    return functionMap[apiName] || 0;
  }

  private async queryHuggingFaceChat(message: string): Promise<string> {
    try {
      console.log('🤗 Querying HF chat with message:', message);
      
      const result = await this.callGradioAPI('chat', [message]);
      
      // Extract the response from Gradio format
      if (result.data && result.data.length > 0) {
        const response = result.data[0];
        console.log('🤗 Chat response received:', response?.substring(0, 100) + '...');
        return response || "I apologize, but I couldn't generate a response.";
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
      
      const result = await this.callGradioAPI('search', [
        query,           // Search query
        topK,           // Top K results
        'hybrid',       // Search type
        0.6,           // Vector weight
        0.4            // BM25 weight
      ]);
      
      if (result.data && result.data.length > 0) {
        const searchResults = result.data[0];
        console.log('🔍 Search results received:', searchResults);
        return searchResults;
      }
      
      return { results: [], query, topK };
    } catch (error) {
      console.error('❌ Hugging Face search query error:', error);
      throw error;
    }
  }

  private async queryHuggingFaceStats(): Promise<any> {
    try {
      console.log('📊 Querying HF stats...');
      
      const result = await this.callGradioAPI('stats', []);
      
      if (result.data && result.data.length > 0) {
        const stats = result.data[0];
        console.log('📊 Stats received:', stats);
        return stats;
      }
      
      return {
        totalDocuments: 0,
        searchCapabilities: ['Hugging Face Space'],
        status: 'unknown'
      };
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

      // For now, we'll use the simple chat interface
      // In the future, we could enhance this to include conversation history
      const response = await this.queryHuggingFaceChat(userQuery);
      
      return response;
    } catch (error) {
      console.error('❌ Error generating response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. The Hugging Face Space might be starting up. Please wait 30-60 seconds and try again.";
        }
        
        if (error.message.includes('Gradio') || error.message.includes('API')) {
          return "The Hugging Face Space is currently starting up or experiencing issues. Free spaces go to sleep after inactivity. Please wait a moment and try again.";
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
        architecture: 'Gradio API Integration'
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
        architecture: 'Gradio API Integration',
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