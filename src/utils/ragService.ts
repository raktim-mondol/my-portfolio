import OpenAI from 'openai';
import { WebsiteScraper, ScrapedContent } from './websiteScraper';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class RAGService {
  private openai: OpenAI;
  private scraper: WebsiteScraper;
  private apiKey: string | null = null;

  constructor() {
    this.scraper = WebsiteScraper.getInstance();
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
    // Get API key from environment variables (Netlify)
    const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    return envApiKey || null;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
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
    if (!this.apiKey) {
      return "The chatbot is currently unavailable. Please contact the site administrator.";
    }

    try {
      // Retrieve relevant content
      const relevantContent = this.retrieveRelevantContent(userQuery);
      const context = this.buildContext(relevantContent);

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

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Error generating response:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        return "There seems to be an issue with the API configuration. Please contact the site administrator.";
      }
      return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
    }
  }
}