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
  searchType: 'vector' | 'keyword';
}

export class NetlifyRAGService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = this.getApiKey();
    
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

  private async searchNetlifyFunction(query: string, topK: number = 5): Promise<SearchResult[]> {
    try {
      const response = await fetch('/.netlify/functions/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, topK }),
      });

      if (!response.ok) {
        throw new Error(`Netlify function search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Netlify function search error:', error);
      throw error;
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    const contextParts = searchResults.map((result) => {
      const doc = result.document;
      const searchInfo = result.searchType === 'vector' ? '(Semantic)' : '(Keyword)';
      
      return `[${doc.metadata.type}] ${searchInfo}\n${doc.content.trim()}`;
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
      // Search using Netlify function
      const searchResults = await this.searchNetlifyFunction(userQuery, 5);
      const context = this.buildContext(searchResults);

      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, powered by Netlify Functions with transformer-based search. Answer questions about Raktim Mondol using the provided context.

CRITICAL: Never use markdown formatting. Write in plain text only.

CONTEXT ABOUT RAKTIM MONDOL:
${context}

Provide helpful, conversational responses based on the context above.`
        }
      ];

      // Add conversation history
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
        max_tokens: 800,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      return this.stripMarkdown(response);
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }

  public async getKnowledgeBaseStats(): Promise<any> {
    return {
      totalDocuments: 4,
      searchCapabilities: ['Netlify Functions', 'Transformer Search'],
      isVectorSearchEnabled: true,
      backendType: 'Netlify Functions'
    };
  }
}