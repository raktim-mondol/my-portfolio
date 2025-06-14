const { pipeline, env } = require('@xenova/transformers');

// Configure transformers for server environment
env.allowRemoteModels = true;
env.allowLocalModels = true;
env.cacheDir = './models'; // Local model cache directory
env.backends.onnx.wasm.wasmOnly = true; // Use WASM backend instead of native addons

class TransformerService {
  constructor() {
    this.embedder = null;
    this.ready = false;
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
  }

  async initialize() {
    try {
      console.log(`📥 Loading embedding model: ${this.modelName}`);
      
      // Initialize the embedding pipeline
      this.embedder = await pipeline('feature-extraction', this.modelName, {
        cache_dir: './models',
        local_files_only: false, // Allow downloading if not cached
        revision: 'main'
      });
      
      console.log('✅ Embedding model loaded successfully');
      
      // Test the model with a simple embedding
      const testEmbedding = await this.generateEmbedding('test');
      console.log(`🧪 Model test successful - embedding dimension: ${testEmbedding.length}`);
      
      this.ready = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize transformer service:', error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    if (!this.ready || !this.embedder) {
      throw new Error('Transformer service not ready');
    }

    try {
      // Clean and prepare text
      const cleanText = text.trim().substring(0, 512); // Limit text length
      
      if (!cleanText) {
        throw new Error('Empty text provided');
      }

      // Generate embedding
      const result = await this.embedder(cleanText, { 
        pooling: 'mean', 
        normalize: true 
      });
      
      // Convert to regular array
      const embedding = Array.from(result.data);
      
      if (!embedding || embedding.length === 0) {
        throw new Error('Failed to generate valid embedding');
      }

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  async generateBatchEmbeddings(texts) {
    if (!this.ready || !this.embedder) {
      throw new Error('Transformer service not ready');
    }

    const embeddings = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Error generating embedding for text: ${text.substring(0, 50)}...`, error);
        embeddings.push(null);
      }
    }

    return embeddings;
  }

  isReady() {
    return this.ready && this.embedder !== null;
  }

  getModelInfo() {
    return {
      modelName: this.modelName,
      ready: this.ready,
      embeddingDimension: this.ready ? 384 : null // all-MiniLM-L6-v2 produces 384-dim embeddings
    };
  }
}

module.exports = TransformerService;