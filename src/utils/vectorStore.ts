import { pipeline, env } from '@xenova/transformers';

// Configure transformers to allow remote model downloads
env.allowRemoteModels = true;
env.allowLocalModels = true;

export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    section?: string;
    type: 'education' | 'experience' | 'skills' | 'research' | 'publications' | 'awards' | 'contact' | 'about' | 'detailed';
    priority: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: Document;
  score: number;
}

export class VectorStore {
  private static instance: VectorStore;
  private documents: Document[] = [];
  private embedder: any = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing vector store...');
      
      // Initialize the embedding model - this will now download from HuggingFace if needed
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // Load and process all content
      await this.loadContent();
      
      this.isInitialized = true;
      console.log(`Vector store initialized with ${this.documents.length} documents`);
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      // Fallback to keyword search if embedding fails
      await this.loadContent();
      this.isInitialized = true;
    }
  }

  private async loadContent(): Promise<void> {
    // Load content from markdown files
    const contentFiles = [
      { path: '/content/about.md', type: 'about' as const, priority: 10 },
      { path: '/content/research_details.md', type: 'research' as const, priority: 9 },
      { path: '/content/publications_detailed.md', type: 'publications' as const, priority: 8 },
      { path: '/content/skills_expertise.md', type: 'skills' as const, priority: 7 },
      { path: '/content/experience_detailed.md', type: 'experience' as const, priority: 8 }
    ];

    for (const file of contentFiles) {
      try {
        const response = await fetch(file.path);
        if (response.ok) {
          const content = await response.text();
          await this.processMarkdownContent(content, file.type, file.priority, file.path);
        }
      } catch (error) {
        console.warn(`Failed to load ${file.path}:`, error);
      }
    }

    // Add existing scraped content as fallback
    this.addScrapedContent();
  }

  private async processMarkdownContent(content: string, type: Document['metadata']['type'], priority: number, source: string): Promise<void> {
    // Split content into sections based on headers
    const sections = this.splitIntoSections(content);
    
    for (const section of sections) {
      if (section.content.trim().length > 50) { // Only process substantial content
        const doc: Document = {
          id: `${source}-${Date.now()}-${Math.random()}`,
          content: section.content,
          metadata: {
            source,
            section: section.title,
            type,
            priority
          }
        };

        // Generate embedding if embedder is available
        if (this.embedder) {
          try {
            const embedding = await this.generateEmbedding(section.content);
            doc.embedding = embedding;
          } catch (error) {
            console.warn('Failed to generate embedding for section:', error);
          }
        }

        this.documents.push(doc);
      }
    }
  }

  private splitIntoSections(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    const lines = content.split('\n');
    let currentSection = { title: '', content: '' };
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        // Start new section
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embedder) {
      throw new Error('Embedder not initialized');
    }

    const result = await this.embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  }

  private addScrapedContent(): void {
    // Fallback content from the original scraper
    const scrapedContent = [
      {
        section: 'About',
        content: `Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is a researcher, data scientist, bioinformatician, LLM engineer, and father. His research focuses on deep learning-based prognosis and explainability for breast cancer. He is located at the School of Computer Science and Engineering, Building K17, UNSW Sydney, NSW 2052. Contact: r.mondol@unsw.edu.au, Phone: +61 412 936 237.`,
        type: 'about' as const,
        priority: 10
      },
      {
        section: 'Education',
        content: `Raktim Mondol is pursuing a PhD in Computer Science & Engineering at UNSW Sydney (2021-2025 Expected). His thesis is on "Deep Learning Based Prognosis and Explainability for Breast Cancer". He completed his MS by Research in Computer Science & Bioinformatics at RMIT University (2017-2019) with High Distinction. His master's thesis was "Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations". He has a Bachelor's degree in Electrical and Electronic Engineering from BRAC University (2013) with High Distinction.`,
        type: 'education' as const,
        priority: 9
      }
    ];

    for (const content of scrapedContent) {
      const doc: Document = {
        id: `scraped-${Date.now()}-${Math.random()}`,
        content: content.content,
        metadata: {
          source: 'scraped-content',
          section: content.section,
          type: content.type,
          priority: content.priority
        }
      };
      this.documents.push(doc);
    }
  }

  public async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If embeddings are available, use vector search
    if (this.embedder && this.documents.some(doc => doc.embedding)) {
      return this.vectorSearch(query, topK);
    }

    // Fallback to keyword search
    return this.keywordSearch(query, topK);
  }

  private async vectorSearch(query: string, topK: number): Promise<SearchResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const results: SearchResult[] = [];

      for (const doc of this.documents) {
        if (doc.embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
          results.push({ document: doc, score: similarity });
        }
      }

      // Sort by similarity score and priority
      results.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) < 0.1) {
          // If scores are close, prioritize by metadata priority
          return b.document.metadata.priority - a.document.metadata.priority;
        }
        return scoreDiff;
      });

      return results.slice(0, topK);
    } catch (error) {
      console.error('Vector search failed, falling back to keyword search:', error);
      return this.keywordSearch(query, topK);
    }
  }

  private keywordSearch(query: string, topK: number): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    for (const doc of this.documents) {
      const content = doc.content.toLowerCase();
      let score = 0;

      // Calculate TF-IDF-like score
      for (const term of queryTerms) {
        const termCount = (content.match(new RegExp(term, 'g')) || []).length;
        if (termCount > 0) {
          score += termCount * Math.log(this.documents.length / (this.documents.filter(d => 
            d.content.toLowerCase().includes(term)).length + 1));
        }
      }

      // Boost score based on metadata priority
      score *= (doc.metadata.priority / 10);

      if (score > 0) {
        results.push({ document: doc, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public getDocumentCount(): number {
    return this.documents.length;
  }

  public getDocumentsByType(type: Document['metadata']['type']): Document[] {
    return this.documents.filter(doc => doc.metadata.type === type);
  }
}