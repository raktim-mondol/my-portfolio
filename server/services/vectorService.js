const fs = require('fs').promises;
const path = require('path');

class VectorService {
  constructor(transformerService) {
    this.transformerService = transformerService;
    this.documents = [];
    this.ready = false;
    
    // BM25 specific properties
    this.termFrequencies = new Map();
    this.documentFrequency = new Map();
    this.documentLengths = new Map();
    this.averageDocumentLength = 0;
    this.totalDocuments = 0;
    
    // BM25 parameters
    this.k1 = 1.5;
    this.b = 0.75;
  }

  async initialize() {
    try {
      console.log('📚 Loading knowledge base...');
      await this.loadKnowledgeBase();
      
      console.log('🔍 Building search indexes...');
      await this.buildIndexes();
      
      this.ready = true;
      console.log(`✅ Vector service ready with ${this.documents.length} documents`);
    } catch (error) {
      console.error('❌ Failed to initialize vector service:', error);
      throw error;
    }
  }

  async loadKnowledgeBase() {
    this.documents = [];
    
    // Define content sources
    const contentSources = [
      { 
        path: '../public/content/about.md', 
        type: 'about', 
        priority: 10 
      },
      { 
        path: '../public/content/research_details.md', 
        type: 'research', 
        priority: 9 
      },
      { 
        path: '../public/content/publications_detailed.md', 
        type: 'publications', 
        priority: 8 
      },
      { 
        path: '../public/content/skills_expertise.md', 
        type: 'skills', 
        priority: 7 
      },
      { 
        path: '../public/content/experience_detailed.md', 
        type: 'experience', 
        priority: 8 
      },
      { 
        path: '../public/content/statistics.md', 
        type: 'statistics', 
        priority: 9 
      }
    ];

    // Load markdown files
    for (const source of contentSources) {
      try {
        const fullPath = path.resolve(__dirname, source.path);
        const content = await fs.readFile(fullPath, 'utf-8');
        await this.processMarkdownContent(content, source.type, source.priority, source.path);
      } catch (error) {
        console.warn(`⚠️ Could not load ${source.path}:`, error.message);
      }
    }

    // Add structured content
    this.addStructuredContent();
    
    this.totalDocuments = this.documents.length;
    console.log(`📄 Loaded ${this.totalDocuments} documents`);
  }

  async processMarkdownContent(content, type, priority, source) {
    const sections = this.splitIntoSections(content);
    
    for (const section of sections) {
      if (section.content.trim().length > 50) {
        const doc = {
          id: `${source}-${Date.now()}-${Math.random()}`,
          content: section.content,
          metadata: {
            source,
            section: section.title,
            type,
            priority
          }
        };

        // Generate embedding using transformer service
        if (this.transformerService.isReady()) {
          try {
            doc.embedding = await this.transformerService.generateEmbedding(section.content);
          } catch (error) {
            console.warn('Failed to generate embedding for section:', error.message);
          }
        }

        this.documents.push(doc);
      }
    }
  }

  splitIntoSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = { title: '', content: '' };
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  addStructuredContent() {
    // Add the same structured content as in the frontend
    const structuredContent = [
      {
        section: 'Personal Information',
        content: `Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is a researcher, data scientist, bioinformatician, biostatistician, LLM engineer, and father. His research focuses on deep learning-based prognosis and explainability for breast cancer.`,
        type: 'about',
        priority: 10
      },
      {
        section: 'Contact Information',
        content: `Raktim Mondol is located at the School of Computer Science and Engineering, Building K17, UNSW Sydney, NSW 2052. Contact: r.mondol@unsw.edu.au, Phone: +61 412 936 237.`,
        type: 'about',
        priority: 10
      },
      {
        section: 'LLM Research',
        content: `Raktim's research focuses on Large Language Models (LLMs) including training, fine-tuning, and evaluating LLMs using parameter-efficient techniques like LoRA and QLoRA, with applications in retrieval-augmented generation, summarisation, and multi-hop reasoning.`,
        type: 'research',
        priority: 9
      },
      {
        section: 'Programming Languages',
        content: `Raktim is proficient in Python, R, SQL, and LaTeX programming languages.`,
        type: 'skills',
        priority: 7
      }
    ];

    for (const content of structuredContent) {
      const doc = {
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

  async buildIndexes() {
    // Build BM25 index
    this.buildBM25Index();
    
    // Generate embeddings for documents that don't have them
    let embeddingCount = 0;
    for (const doc of this.documents) {
      if (!doc.embedding && this.transformerService.isReady()) {
        try {
          doc.embedding = await this.transformerService.generateEmbedding(doc.content);
          embeddingCount++;
        } catch (error) {
          console.warn(`Failed to generate embedding for document ${doc.id}:`, error.message);
        }
      }
    }
    
    console.log(`🔢 Generated ${embeddingCount} new embeddings`);
  }

  buildBM25Index() {
    this.termFrequencies.clear();
    this.documentFrequency.clear();
    this.documentLengths.clear();
    
    let totalLength = 0;
    
    for (const doc of this.documents) {
      const terms = this.tokenize(doc.content);
      const termFreq = new Map();
      const uniqueTerms = new Set();
      
      for (const term of terms) {
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
        uniqueTerms.add(term);
      }
      
      this.documentLengths.set(doc.id, terms.length);
      this.termFrequencies.set(doc.id, termFreq);
      totalLength += terms.length;
      
      for (const term of uniqueTerms) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
      }
    }
    
    this.averageDocumentLength = totalLength / this.totalDocuments;
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
      .filter(term => !this.isStopWord(term));
  }

  isStopWord(term) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);
    return stopWords.has(term);
  }

  calculateBM25Score(term, docId) {
    const termFreq = this.termFrequencies.get(docId)?.get(term) || 0;
    if (termFreq === 0) return 0;
    
    const docLength = this.documentLengths.get(docId) || 0;
    const docFreq = this.documentFrequency.get(term) || 1;
    
    const idf = Math.log((this.totalDocuments - docFreq + 0.5) / (docFreq + 0.5));
    const numerator = termFreq * (this.k1 + 1);
    const denominator = termFreq + this.k1 * (1 - this.b + this.b * (docLength / this.averageDocumentLength));
    
    return idf * (numerator / denominator);
  }

  cosineSimilarity(a, b) {
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

  async search(query, topK = 5, searchType = 'hybrid') {
    if (!this.ready) {
      throw new Error('Vector service not ready');
    }

    try {
      let results = [];

      if (searchType === 'vector' || searchType === 'hybrid') {
        const vectorResults = await this.vectorSearch(query, topK);
        results = results.concat(vectorResults);
      }

      if (searchType === 'bm25' || searchType === 'hybrid') {
        const bm25Results = await this.bm25Search(query, topK);
        results = results.concat(bm25Results);
      }

      if (searchType === 'hybrid') {
        results = this.combineResults(results, topK);
      } else {
        results.sort((a, b) => b.score - a.score);
        results = results.slice(0, topK);
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async vectorSearch(query, topK) {
    if (!this.transformerService.isReady()) {
      return [];
    }

    try {
      const queryEmbedding = await this.transformerService.generateEmbedding(query);
      const results = [];

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

      results.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (Math.abs(scoreDiff) < 0.05) {
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

  async bm25Search(query, topK) {
    const queryTerms = this.tokenize(query);
    const results = [];

    for (const doc of this.documents) {
      let bm25Score = 0;
      
      for (const term of queryTerms) {
        bm25Score += this.calculateBM25Score(term, doc.id);
      }
      
      if (bm25Score > 0) {
        const priorityBoost = 1 + (doc.metadata.priority / 50);
        const finalScore = bm25Score * priorityBoost;
        
        results.push({ 
          document: doc, 
          score: finalScore,
          searchType: 'bm25'
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  combineResults(results, topK) {
    const combinedMap = new Map();
    
    for (const result of results) {
      const existing = combinedMap.get(result.document.id);
      if (existing) {
        existing.score = (existing.score + result.score) / 2;
        existing.searchType = 'hybrid';
      } else {
        combinedMap.set(result.document.id, { ...result });
      }
    }
    
    const combinedResults = Array.from(combinedMap.values());
    combinedResults.sort((a, b) => b.score - a.score);
    
    return combinedResults.slice(0, topK);
  }

  async getKnowledgeBaseStats() {
    const hasEmbeddings = this.documents.filter(doc => doc.embedding).length;
    const capabilities = [];
    
    if (this.transformerService.isReady() && hasEmbeddings > 0) {
      capabilities.push('Vector Search');
    }
    
    if (this.documentFrequency.size > 0) {
      capabilities.push('BM25 Search');
    }
    
    if (capabilities.length === 2) {
      capabilities.push('Hybrid Search');
    }

    const documentsByType = {};
    for (const doc of this.documents) {
      const type = doc.metadata.type;
      documentsByType[type] = (documentsByType[type] || 0) + 1;
    }

    return {
      totalDocuments: this.documents.length,
      documentsByType,
      uniqueTerms: this.documentFrequency.size,
      hasEmbeddings,
      searchCapabilities: capabilities,
      averageDocLength: Math.round(this.averageDocumentLength),
      bm25Parameters: { k1: this.k1, b: this.b },
      isVectorSearchEnabled: capabilities.includes('Vector Search')
    };
  }

  isReady() {
    return this.ready;
  }
}

module.exports = VectorService;