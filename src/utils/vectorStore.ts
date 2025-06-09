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
  searchType: 'vector' | 'bm25' | 'hybrid';
}

export class VectorStore {
  private static instance: VectorStore;
  private documents: Document[] = [];
  private embedder: any = null;
  private isInitialized = false;
  
  // BM25 specific properties
  private termFrequencies: Map<string, Map<string, number>> = new Map(); // docId -> term -> frequency
  private documentFrequency: Map<string, number> = new Map(); // term -> number of docs containing term
  private documentLengths: Map<string, number> = new Map(); // docId -> document length
  private averageDocumentLength = 0;
  private totalDocuments = 0;
  
  // BM25 parameters
  private readonly k1 = 1.5; // Controls term frequency saturation
  private readonly b = 0.75; // Controls document length normalization

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
      // Initialize the embedding model - this will now download from HuggingFace if needed
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // Load and process all content
      await this.loadContent();
      
      // Build BM25 index
      this.buildBM25Index();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      // Fallback to keyword search if embedding fails
      await this.loadContent();
      this.buildBM25Index();
      this.isInitialized = true;
    }
  }

  private async loadContent(): Promise<void> {
    // Clear existing documents
    this.documents = [];
    
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

    // Add structured content for better coverage
    this.addStructuredContent();
    
    this.totalDocuments = this.documents.length;
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

  private addStructuredContent(): void {
    // About content
    const aboutContent = [
      {
        section: 'Personal Information',
        content: `Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is a researcher, data scientist, bioinformatician, LLM engineer, and father. His research focuses on deep learning-based prognosis and explainability for breast cancer.`,
        type: 'about' as const,
        priority: 10
      },
      {
        section: 'Contact Information',
        content: `Raktim Mondol is located at the School of Computer Science and Engineering, Building K17, UNSW Sydney, NSW 2052. Contact: r.mondol@unsw.edu.au, Phone: +61 412 936 237.`,
        type: 'about' as const,
        priority: 10
      },
      {
        section: 'Professional Summary',
        content: `Raktim is an experienced data scientist and programmer with deep expertise in artificial intelligence, generative AI (GenAI) techniques and large language models (LLMs), bioinformatics, computer vision, and high-performance computing. His research and professional background is centered on analyzing large-scale image and biomedical datasets, developing novel deep learning models, and conducting advanced statistical analyses.`,
        type: 'about' as const,
        priority: 10
      }
    ];

    // Education content
    const educationContent = [
      {
        section: 'PhD Education',
        content: `Raktim Mondol is pursuing a PhD in Computer Science & Engineering at UNSW Sydney (2021-2025 Expected). His thesis is on "Deep Learning Based Prognosis and Explainability for Breast Cancer". He completed his MS by Research in Computer Science & Bioinformatics at RMIT University (2017-2019) with High Distinction. His master's thesis was "Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations".`,
        type: 'education' as const,
        priority: 9
      }
    ];

    // Experience content
    const experienceContent = [
      {
        section: 'Current Position',
        content: `Raktim Mondol has been working as a Casual Academic at UNSW since July 2021, conducting laboratory and tutorial classes for Computer Vision, Neural Networks and Deep Learning, and Artificial Intelligence courses.`,
        type: 'experience' as const,
        priority: 8
      },
      {
        section: 'Teaching Assistant Role',
        content: `Previously, he was a Teaching Assistant at RMIT University (July 2017 - Oct 2019), conducting laboratory classes for Electronics, Software Engineering Design, Engineering Computing, and Introduction to Embedded Systems.`,
        type: 'experience' as const,
        priority: 8
      },
      {
        section: 'Lecturer Position',
        content: `He worked as a full-time Lecturer at World University of Bangladesh (Sep 2013 - Dec 2016), teaching Electrical Circuit I & II, Engineering Materials, Electronics I & II, Digital Logic Design, and supervising student projects and thesis.`,
        type: 'experience' as const,
        priority: 8
      }
    ];

    // Skills content
    const skillsContent = [
      {
        section: 'Programming Languages',
        content: `Raktim is proficient in Python, R, SQL, and LaTeX programming languages.`,
        type: 'skills' as const,
        priority: 7
      },
      {
        section: 'Deep Learning Frameworks',
        content: `He has expertise in TensorFlow and PyTorch deep learning frameworks.`,
        type: 'skills' as const,
        priority: 7
      },
      {
        section: 'Cloud Computing',
        content: `Raktim has experience with distributed and cloud computing platforms including AWS, GCP, and GALAXY.`,
        type: 'skills' as const,
        priority: 7
      },
      {
        section: 'LLM and Generative AI',
        content: `He has expertise in Hugging Face Transformers, LoRA/QLoRA (PEFT), LangChain, OpenAI API/Gemini Pro, GPTQ/GGUF, Prompt Engineering, Agent Development Kit, and RAG Pipelines.`,
        type: 'skills' as const,
        priority: 7
      },
      {
        section: 'Vector Search and Retrieval',
        content: `Raktim is skilled in FAISS, BM25/Elasticsearch, ChromaDB/Weaviate, and Milvus for vector search and retrieval systems.`,
        type: 'skills' as const,
        priority: 7
      }
    ];

    // Research content
    const researchContent = [
      {
        section: 'LLM Research',
        content: `Raktim's research focuses on Large Language Models (LLMs) including training, fine-tuning, and evaluating LLMs using parameter-efficient techniques like LoRA and QLoRA, with applications in retrieval-augmented generation, summarisation, and multi-hop reasoning.`,
        type: 'research' as const,
        priority: 9
      },
      {
        section: 'Agentic AI Research',
        content: `He works on Agentic AI & Multi-Agent Systems, designing autonomous, tool-using agents for reasoning, planning, and collaboration using frameworks like the Agent Development Kit.`,
        type: 'research' as const,
        priority: 9
      },
      {
        section: 'RAG Research',
        content: `His expertise includes Retrieval-Augmented Generation (RAG), building hybrid search and generation pipelines integrating semantic and keyword-based retrieval.`,
        type: 'research' as const,
        priority: 9
      }
    ];

    // Publications content
    const publicationsContent = [
      {
        section: 'BioFusionNet Publication',
        content: `"BioFusionNet: Deep Learning-Based Survival Risk Stratification in ER+ Breast Cancer Through Multifeature and Multimodal Data Fusion" published in IEEE Journal of Biomedical and Health Informatics (2024).`,
        type: 'publications' as const,
        priority: 8
      },
      {
        section: 'hist2RNA Publication',
        content: `"hist2RNA: An Efficient Deep Learning Architecture to Predict Gene Expression from Breast Cancer Histopathology Images" published in Cancers journal (2023).`,
        type: 'publications' as const,
        priority: 8
      },
      {
        section: 'AFExNet Publication',
        content: `"AFExNet: An Adversarial Autoencoder for Differentiating Breast Cancer Sub-types and Extracting Biologically Relevant Genes" published in IEEE/ACM Transactions on Computational Biology and Bioinformatics (2021).`,
        type: 'publications' as const,
        priority: 8
      }
    ];

    // Awards content (currently empty, but structure for future)
    const awardsContent = [
      // Will be populated when awards data is available
    ];

    // Add all structured content
    const allContent = [
      ...aboutContent,
      ...educationContent,
      ...experienceContent,
      ...skillsContent,
      ...researchContent,
      ...publicationsContent,
      ...awardsContent
    ];

    for (const content of allContent) {
      const doc: Document = {
        id: `structured-${Date.now()}-${Math.random()}`,
        content: content.content,
        metadata: {
          source: 'structured-content',
          section: content.section,
          type: content.type,
          priority: content.priority
        }
      };
      this.documents.push(doc);
    }
  }

  private buildBM25Index(): void {
    // Reset indexes
    this.termFrequencies.clear();
    this.documentFrequency.clear();
    this.documentLengths.clear();
    
    let totalLength = 0;
    
    // First pass: calculate term frequencies and document lengths
    for (const doc of this.documents) {
      const terms = this.tokenize(doc.content);
      const termFreq = new Map<string, number>();
      const uniqueTerms = new Set<string>();
      
      // Calculate term frequencies for this document
      for (const term of terms) {
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
        uniqueTerms.add(term);
      }
      
      // Store document length and term frequencies
      this.documentLengths.set(doc.id, terms.length);
      this.termFrequencies.set(doc.id, termFreq);
      totalLength += terms.length;
      
      // Update document frequencies (number of documents containing each term)
      for (const term of uniqueTerms) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
      }
    }
    
    // Calculate average document length
    this.averageDocumentLength = totalLength / this.totalDocuments;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2) // Filter out very short terms
      .filter(term => !this.isStopWord(term));
  }

  private isStopWord(term: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'from', 'up', 'out', 'down', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ]);
    return stopWords.has(term);
  }

  /**
   * Calculate BM25 score for a term in a document
   * BM25(qi, D) = IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * |D| / avgdl))
   */
  private calculateBM25Score(term: string, docId: string): number {
    const termFreq = this.termFrequencies.get(docId)?.get(term) || 0;
    if (termFreq === 0) return 0;
    
    const docLength = this.documentLengths.get(docId) || 0;
    const docFreq = this.documentFrequency.get(term) || 1;
    
    // Calculate IDF: log((N - df + 0.5) / (df + 0.5))
    const idf = Math.log((this.totalDocuments - docFreq + 0.5) / (docFreq + 0.5));
    
    // Calculate term frequency component
    const numerator = termFreq * (this.k1 + 1);
    const denominator = termFreq + this.k1 * (1 - this.b + this.b * (docLength / this.averageDocumentLength));
    
    return idf * (numerator / denominator);
  }

  public async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get results from both search methods
      const vectorResults = await this.vectorSearch(query, topK);
      const bm25Results = await this.bm25Search(query, topK);

      // Combine and deduplicate results
      const hybridResults = this.combineResults(vectorResults, bm25Results, topK);

      return hybridResults;
    } catch (error) {
      console.error('Error in hybrid search:', error);
      // Fallback to BM25 only if vector search fails
      try {
        const bm25Results = await this.bm25Search(query, topK);
        return bm25Results;
      } catch (bm25Error) {
        console.error('BM25 search also failed:', bm25Error);
        return [];
      }
    }
  }

  private async vectorSearch(query: string, topK: number): Promise<SearchResult[]> {
    if (!this.embedder) {
      return [];
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const results: SearchResult[] = [];

      for (const doc of this.documents) {
        if (doc.embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
          results.push({ 
            document: doc, 
            score: similarity,
            searchType: 'vector'
          });
        }
      }

      // Sort by similarity score and priority
      results.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) < 0.05) {
          // If scores are close, prioritize by metadata priority
          return b.document.metadata.priority - a.document.metadata.priority;
        }
        return scoreDiff;
      });

      return results.slice(0, topK);
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }

  private async bm25Search(query: string, topK: number): Promise<SearchResult[]> {
    const queryTerms = this.tokenize(query);
    const results: SearchResult[] = [];

    for (const doc of this.documents) {
      let bm25Score = 0;
      
      // Calculate BM25 score for each query term
      for (const term of queryTerms) {
        bm25Score += this.calculateBM25Score(term, doc.id);
      }
      
      if (bm25Score > 0) {
        // Apply priority boost (smaller boost than before to maintain BM25 effectiveness)
        const priorityBoost = 1 + (doc.metadata.priority / 50); // Reduced from /20 to /50
        const finalScore = bm25Score * priorityBoost;
        
        results.push({ 
          document: doc, 
          score: finalScore,
          searchType: 'bm25'
        });
      }
    }

    // Sort by BM25 score (descending)
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, topK);
  }

  private combineResults(vectorResults: SearchResult[], bm25Results: SearchResult[], topK: number): SearchResult[] {
    const combinedMap = new Map<string, SearchResult>();
    
    // Ensure we have valid arrays
    const safeVectorResults = Array.isArray(vectorResults) ? vectorResults : [];
    const safeBM25Results = Array.isArray(bm25Results) ? bm25Results : [];
    
    // Normalize scores to [0, 1] range for fair combination
    const maxVectorScore = safeVectorResults.length > 0 ? Math.max(...safeVectorResults.map(r => r.score)) : 1;
    const maxBM25Score = safeBM25Results.length > 0 ? Math.max(...safeBM25Results.map(r => r.score)) : 1;
    
    // Add vector results with normalization and weight
    for (const result of safeVectorResults) {
      const normalizedScore = result.score / maxVectorScore;
      const weightedScore = normalizedScore * 0.6; // 60% weight for vector search
      
      combinedMap.set(result.document.id, {
        ...result,
        score: weightedScore,
        searchType: 'vector'
      });
    }
    
    // Add BM25 results with normalization and weight
    for (const result of safeBM25Results) {
      const normalizedScore = result.score / maxBM25Score;
      const weightedScore = normalizedScore * 0.8; // 80% weight for BM25 search
      
      const existing = combinedMap.get(result.document.id);
      if (existing) {
        // Combine scores if document appears in both results
        const combinedScore = (existing.score + weightedScore) / 2;
        existing.score = combinedScore;
        existing.searchType = 'hybrid';
      } else {
        combinedMap.set(result.document.id, {
          ...result,
          score: weightedScore,
          searchType: 'bm25'
        });
      }
    }
    
    // Convert to array and sort
    const combinedResults = Array.from(combinedMap.values());
    
    // Final sorting with slight priority boost
    combinedResults.sort((a, b) => {
      const priorityBoostA = a.document.metadata.priority / 200; // Very small boost
      const priorityBoostB = b.document.metadata.priority / 200;
      
      const finalScoreA = a.score + priorityBoostA;
      const finalScoreB = b.score + priorityBoostB;
      
      return finalScoreB - finalScoreA;
    });
    
    return combinedResults.slice(0, topK);
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

  public getDocumentTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const doc of this.documents) {
      const type = doc.metadata.type;
      distribution[type] = (distribution[type] || 0) + 1;
    }
    return distribution;
  }

  public getSearchStats(): {
    totalDocuments: number;
    uniqueTerms: number;
    hasEmbeddings: number;
    searchCapabilities: string[];
    averageDocLength: number;
    bm25Parameters: { k1: number; b: number };
  } {
    const hasEmbeddings = this.documents.filter(doc => doc.embedding).length;
    const capabilities = [];
    
    if (this.embedder && hasEmbeddings > 0) {
      capabilities.push('Vector Search');
    }
    
    if (this.documentFrequency.size > 0) {
      capabilities.push('BM25 Search');
    }
    
    if (capabilities.length === 2) {
      capabilities.push('Hybrid Search');
    }

    return {
      totalDocuments: this.documents.length,
      uniqueTerms: this.documentFrequency.size,
      hasEmbeddings,
      searchCapabilities: capabilities,
      averageDocLength: Math.round(this.averageDocumentLength),
      bm25Parameters: { k1: this.k1, b: this.b }
    };
  }
}