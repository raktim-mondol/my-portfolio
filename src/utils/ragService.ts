import OpenAI from 'openai';
import { VectorStore, SearchResult } from './vectorStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class RAGService {
  private openai: OpenAI | null = null;
  private vectorStore: VectorStore;
  private apiKey: string | null = null;

  constructor() {
    this.vectorStore = VectorStore.getInstance();
    this.apiKey = this.getApiKey();
    
    if (this.apiKey) {
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      });
      
      // Initialize vector store
      this.initializeVectorStore();
    }
  }

  private async initializeVectorStore(): Promise<void> {
    try {
      await this.vectorStore.initialize();
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
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

  private async retrieveRelevantContent(query: string): Promise<SearchResult[]> {
    try {
      // Use hybrid search (vector + BM25) for better retrieval
      const results = await this.vectorStore.search(query, 10); // Get more results for better context
      return results;
    } catch (error) {
      console.error('Error in hybrid content retrieval:', error);
      return [];
    }
  }

  private buildContext(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return "No specific information found. Please provide general information about Raktim Mondol based on your knowledge.";
    }

    // Take top 8 results for comprehensive context
    const topResults = searchResults.slice(0, 8);
    
    const contextParts = topResults.map((result, index) => {
      const doc = result.document;
      const section = doc.metadata.section ? `[${doc.metadata.section}]` : `[${doc.metadata.type}]`;
      const searchInfo = result.searchType === 'hybrid' ? '(Vector+BM25)' : 
                        result.searchType === 'vector' ? '(Semantic)' : '(BM25)';
      
      return `${section} ${searchInfo}\n${doc.content.trim()}`;
    });

    const context = contextParts.join('\n\n---\n\n');
    return context;
  }

  // Helper function to strip markdown formatting from text
  private stripMarkdown(text: string): string {
    return text
      // Remove bold and italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '- ')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  public async generateResponse(userQuery: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey || !this.openai) {
      return "The chatbot is currently unavailable. Please ensure the VITE_DEEPSEEK_API_KEY environment variable is properly configured in your Netlify deployment settings.";
    }

    try {
      // Retrieve relevant content using hybrid search
      const searchResults = await this.retrieveRelevantContent(userQuery);
      const context = this.buildContext(searchResults);

      // Build conversation history for context
      const messages: any[] = [
        {
          role: "system",
          content: `You are RAGtim Bot, a knowledgeable assistant that answers questions about Raktim Mondol using advanced hybrid search technology that combines semantic vector search with BM25 ranking for comprehensive and accurate information retrieval.

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
- Even if previous messages in the conversation used markdown, you must NEVER use markdown
- This rule applies to ALL responses, including follow-up questions and continued conversations

RESPONSE GUIDELINES:
- Always answer based on the provided context about Raktim Mondol
- Be conversational, friendly, and professional
- Provide detailed and informative responses when relevant information is available
- If asked about something not in the context, politely say you don't have that specific information
- You can refer to Raktim in first person (as "I") or third person, whichever feels more natural
- If someone asks general questions like "hello" or "how are you", respond as Raktim's representative
- When discussing technical topics, provide appropriate level of detail
- Include specific examples, achievements, or details when available in the context
- Synthesize information from multiple sources when relevant
- Use natural language flow without any special formatting whatsoever

SEARCH TECHNOLOGY:
The context below was retrieved using advanced hybrid search combining:
1. Vector Search: Semantic understanding using transformer embeddings for conceptual similarity
2. BM25 Search: Advanced keyword ranking with term frequency and document length normalization
3. Priority Weighting: Content importance based on document metadata and relevance scores

This dual approach ensures you receive the most relevant and comprehensive information about Raktim Mondol, capturing both semantic meaning and exact keyword matches.

CONTEXT ABOUT RAKTIM MONDOL:
${context}

Remember to be helpful and provide comprehensive answers based on the rich context provided above, but always respond in plain text without any markdown formatting whatsoever, regardless of how previous messages were formatted.`
        }
      ];

      // Add recent conversation history (last 6 messages for better context)
      // Strip markdown from previous responses to prevent markdown contamination
      const recentHistory = conversationHistory.slice(-6);
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

      const completion = await this.openai.chat.completions.create({
        messages,
        model: "deepseek-chat",
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
      
      // As an extra safety measure, strip any markdown that might have slipped through
      return this.stripMarkdown(response);
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('Authentication')) {
          return "The API key appears to be invalid or missing. Please contact the site administrator to configure the VITE_DEEPSEEK_API_KEY environment variable in Netlify.";
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return "Network error occurred. Please check your internet connection and try again.";
        }
      }
      
      return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
    }
  }

  // Method to get statistics about the knowledge base
  public async getKnowledgeBaseStats(): Promise<{
    totalDocuments: number;
    documentsByType: Record<string, number>;
    isVectorSearchEnabled: boolean;
    searchCapabilities: string[];
    uniqueTerms: number;
    hasEmbeddings: number;
    averageDocLength: number;
    bm25Parameters: { k1: number; b: number };
  }> {
    await this.vectorStore.initialize();
    
    const stats = this.vectorStore.getSearchStats();
    const totalDocuments = this.vectorStore.getDocumentCount();
    const documentsByType = this.vectorStore.getDocumentTypeDistribution();

    return {
      totalDocuments,
      documentsByType,
      isVectorSearchEnabled: stats.searchCapabilities.includes('Vector Search'),
      searchCapabilities: stats.searchCapabilities,
      uniqueTerms: stats.uniqueTerms,
      hasEmbeddings: stats.hasEmbeddings,
      averageDocLength: stats.averageDocLength,
      bm25Parameters: stats.bm25Parameters
    };
  }
}