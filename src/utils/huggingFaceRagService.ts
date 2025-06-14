export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class HuggingFaceRAGService {
  private spaceUrl: string;
  private apiUrl: string;

  constructor() {
    this.spaceUrl = 'https://raktimhugging-ragtim-bot.hf.space';
    this.apiUrl = `${this.spaceUrl}/api/predict`;
  }

  public hasApiKey(): boolean {
    return true; // Hugging Face Space doesn't need API key
  }

  private async queryHuggingFaceSpace(message: string, history: any[] = []): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [message, history],
          fn_index: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Extract the response from Hugging Face format
      if (result.data && result.data[0] && result.data[0].length > 0) {
        const lastMessage = result.data[0][result.data[0].length - 1];
        return lastMessage[1] || "I apologize, but I couldn't generate a response.";
      }
      
      throw new Error('Invalid response format from Hugging Face Space');
    } catch (error) {
      console.error('Hugging Face Space query error:', error);
      throw error;
    }
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Convert conversation history to Hugging Face format
      const history = conversationHistory.map(msg => [
        msg.role === 'user' ? msg.content : '',
        msg.role === 'assistant' ? msg.content : ''
      ]).filter(pair => pair[0] || pair[1]);

      const response = await this.queryHuggingFaceSpace(userQuery, history);
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. Please check your internet connection and try again.";
        }
        
        if (error.message.includes('Hugging Face')) {
          return "The Hugging Face Space is currently unavailable. Please try again later.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
    }
  }

  public async getKnowledgeBaseStats(): Promise<any> {
    return {
      totalDocuments: 13,
      searchCapabilities: ['Hugging Face Transformers', 'Semantic Search', 'GPU Accelerated'],
      isVectorSearchEnabled: true,
      backendType: 'Hugging Face Space',
      modelName: 'sentence-transformers/all-MiniLM-L6-v2',
      embeddingDimension: 384
    };
  }
}