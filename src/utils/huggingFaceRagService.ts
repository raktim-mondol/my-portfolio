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
      
      // Try different possible chat endpoints
      const possibleEndpoints = [
        `${this.spaceUrl}/api/predict`,
        `${this.spaceUrl}/run/chat`,
        `${this.spaceUrl}/api/chat`,
        `${this.spaceUrl}/gradio_api/call/chat`
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('🤗 Trying chat endpoint:', endpoint);
          
          let requestBody;
          if (endpoint.includes('/api/predict')) {
            requestBody = JSON.stringify({
              fn_index: 0, // Assuming chat is the first function (index 0)
              data: [message]
            });
          } else if (endpoint.includes('/run/chat')) {
            requestBody = JSON.stringify({
              data: [message]
            });
          } else {
            requestBody = JSON.stringify({
              message: message
            });
          }
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: requestBody,
          });

          if (response.ok) {
            const data = await response.json();
            console.log('🤗 Chat response received:', data);
            
            // Try to extract response from different possible formats
            if (data.data && Array.isArray(data.data) && data.data[0]) {
              return data.data[0];
            } else if (data.response) {
              return data.response;
            } else if (data.message) {
              return data.message;
            } else if (typeof data === 'string') {
              return data;
            }
          }
        } catch (error) {
          console.log(`❌ Chat endpoint ${endpoint} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All chat endpoints failed');
    } catch (error) {
      console.error('❌ Hugging Face chat query error:', error);
      throw error;
    }
  }

  private async queryHuggingFaceSearch(query: string, topK: number = 5): Promise<any> {
    try {
      console.log('🔍 Querying HF search:', { query, topK });
      
      // Try different possible search endpoints
      const possibleEndpoints = [
        `${this.spaceUrl}/api/predict`,
        `${this.spaceUrl}/run/search`,
        `${this.spaceUrl}/api/search`,
        `${this.spaceUrl}/gradio_api/call/search`
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('🔍 Trying search endpoint:', endpoint);
          
          let requestBody;
          if (endpoint.includes('/api/predict')) {
            requestBody = JSON.stringify({
              fn_index: 1, // Assuming search is the second function (index 1)
              data: [query, topK, "hybrid", 0.6, 0.4]
            });
          } else if (endpoint.includes('/run/search')) {
            requestBody = JSON.stringify({
              data: [query, topK, "hybrid", 0.6, 0.4]
            });
          } else {
            requestBody = JSON.stringify({
              query: query,
              top_k: topK,
              search_type: 'hybrid',
              vector_weight: 0.6,
              bm25_weight: 0.4
            });
          }
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: requestBody,
          });

          if (response.ok) {
            const data = await response.json();
            console.log('🔍 Search results received:', data);
            
            // Try to extract results from different possible formats
            if (data.data && Array.isArray(data.data) && data.data[0]) {
              return data.data[0];
            } else if (data.results) {
              return data;
            } else {
              return data;
            }
          }
        } catch (error) {
          console.log(`❌ Search endpoint ${endpoint} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All search endpoints failed');
    } catch (error) {
      console.error('❌ Hugging Face search query error:', error);
      throw error;
    }
  }

  private async queryHuggingFaceStats(): Promise<any> {
    try {
      console.log('📊 Querying HF stats...');
      
      // Try different possible stats endpoints
      const possibleEndpoints = [
        `${this.spaceUrl}/api/predict`,
        `${this.spaceUrl}/run/stats`,
        `${this.spaceUrl}/api/stats`,
        `${this.spaceUrl}/gradio_api/call/stats`
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('📊 Trying stats endpoint:', endpoint);
          
          let requestBody;
          if (endpoint.includes('/api/predict')) {
            requestBody = JSON.stringify({
              fn_index: 2, // Assuming stats is the third function (index 2)
              data: []
            });
          } else if (endpoint.includes('/run/stats')) {
            requestBody = JSON.stringify({
              data: []
            });
          } else {
            requestBody = JSON.stringify({});
          }
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: requestBody,
          });

          if (response.ok) {
            const data = await response.json();
            console.log('📊 Stats received:', data);
            
            // Try to extract stats from different possible formats
            if (data.data && Array.isArray(data.data) && data.data[0]) {
              return data.data[0];
            } else if (data.stats) {
              return data.stats;
            } else {
              return data;
            }
          }
        } catch (error) {
          console.log(`❌ Stats endpoint ${endpoint} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All stats endpoints failed');
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