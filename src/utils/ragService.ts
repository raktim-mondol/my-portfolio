import OpenAI from 'openai';
import { WebsiteScraper, ScrapedContent } from './websiteScraper';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class RAGService {
  private openai: OpenAI | null = null;
  private scraper: WebsiteScraper;
  private apiKey: string | null = null;

  constructor() {
    this.scraper = WebsiteScraper.getInstance();
    this.apiKey = this.getApiKey();
    
    console.log('RAGService initialized');
    console.log('Environment check:', {
      hasViteEnv: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
      envValue: import.meta.env.VITE_DEEPSEEK_API_KEY ? 'Present' : 'Missing',
      envValueLength: import.meta.env.VITE_DEEPSEEK_API_KEY?.length || 0,
      envValueTrimmed: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim().length || 0,
      allEnvKeys: Object.keys(import.meta.env)
    });
    
    if (this.apiKey) {
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
      console.log('OpenAI client initialized successfully');
    } else {
      console.error('No valid API key found. Please check your environment variables.');
      console.error('API key validation details:', {
        rawValue: import.meta.env.VITE_DEEPSEEK_API_KEY,
        isString: typeof import.meta.env.VITE_DEEPSEEK_API_KEY === 'string',
        length: import.meta.env.VITE_DEEPSEEK_API_KEY?.length,
        trimmedLength: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim().length
      });
    }
  }

  private getApiKey(): string | null {
    // Get API key from environment variables (Netlify)
    const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    
    console.log('Getting API key:', {
      envApiKey: envApiKey ? 'Present' : 'Missing',
      envApiKeyLength: envApiKey?.length || 0,
      envApiKeyType: typeof envApiKey,
      envApiKeyTrimmed: envApiKey?.trim().length || 0
    });
    
    // Validate that the API key is not just empty or whitespace
    if (envApiKey && typeof envApiKey === 'string' && envApiKey.trim().length > 0) {
      return envApiKey.trim();
    }
    
    return null;
  }

  public hasApiKey(): boolean {
    const hasKey = !!this.apiKey;
    console.log('Has API key:', hasKey);
    return hasKey;
  }

  private retrieveRelevantContent(query: string): ScrapedContent[] {
    // Simple keyword-based retrieval
    const relevantContent = this.scraper.searchContent(query);
    
    // Return top 3 most relevant sections
    return relevantContent.slice(0, 3);
  }

  private buildContext(relevantContent: ScrapedContent[]): string {
    if (relevantContent.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol.";
    }

    return relevantContent
      .map(content => `${content.section}: ${content.content}`)
      .join('\n\n');
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    console.log('Generating response for query:', userQuery);
    
    if (!this.apiKey || !this.openai) {
      console.error('API key or OpenAI client not available');
      return "The chatbot is currently unavailable. API key not configured properly. Please contact the site administrator.";
    }

    try {
      // Retrieve relevant content
      const relevantContent = this.retrieveRelevantContent(userQuery);
      const context = this.buildContext(relevantContent);

      console.log('Retrieved relevant content:', relevantContent.length, 'sections');

      // Build conversation history for context
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, a helpful assistant that answers questions about Raktim Mondol based on his portfolio website. 

IMPORTANT INSTRUCTIONS:
- Always answer based on the provided context about Raktim Mondol
- Be conversational, friendly, and professional
- If asked about something not in the context, politely say you don't have that specific information
- Keep responses concise but informative
- You can refer to Raktim in first person (as "I") or third person, whichever feels more natural
- If someone asks general questions like "hello" or "how are you", respond as Raktim's representative

Context about Raktim Mondol:
${context}`
        }
      ];

      // Add recent conversation history (last 4 messages for context)
      const recentHistory = conversationHistory.slice(-4);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current user query
      messages.push({
        role: "user",
        content: userQuery
      });

      console.log('Sending request to DeepSeek API...');

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 500,
        temperature: 0.7
      });

      console.log('Received response from DeepSeek API');

      return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        if (error.message.includes('API key') || error.message.includes('401')) {
          return "There seems to be an issue with the API key configuration. Please contact the site administrator.";
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. Please check your internet connection and try again.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
    }
  }
}