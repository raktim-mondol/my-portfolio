const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();

const TransformerService = require('./services/transformerService');
const VectorService = require('./services/vectorService');

const app = express();
const PORT = process.env.PORT || 3001;

// Cache for embeddings and search results (24 hours TTL)
const cache = new NodeCache({ stdTTL: 86400 });

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'https://mondol.me'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize services
let transformerService;
let vectorService;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      transformer: transformerService ? transformerService.isReady() : false,
      vector: vectorService ? vectorService.isReady() : false
    }
  });
});

// Generate embeddings endpoint
app.post('/api/embeddings', async (req, res) => {
  try {
    const { text, useCache = true } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: 'Text too long (max 10000 characters)' });
    }

    // Check cache first
    const cacheKey = `embedding:${Buffer.from(text).toString('base64')}`;
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json({ 
          embedding: cached, 
          cached: true,
          processingTime: 0
        });
      }
    }

    const startTime = Date.now();
    const embedding = await transformerService.generateEmbedding(text);
    const processingTime = Date.now() - startTime;

    // Cache the result
    if (useCache) {
      cache.set(cacheKey, embedding);
    }

    res.json({ 
      embedding, 
      cached: false,
      processingTime
    });
  } catch (error) {
    console.error('Error generating embedding:', error);
    res.status(500).json({ 
      error: 'Failed to generate embedding',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Batch embeddings endpoint
app.post('/api/embeddings/batch', async (req, res) => {
  try {
    const { texts, useCache = true } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Texts must be a non-empty array' });
    }

    if (texts.length > 50) {
      return res.status(400).json({ error: 'Too many texts (max 50)' });
    }

    const startTime = Date.now();
    const results = [];
    
    for (const text of texts) {
      if (typeof text !== 'string') {
        results.push({ error: 'Invalid text type' });
        continue;
      }

      const cacheKey = `embedding:${Buffer.from(text).toString('base64')}`;
      let embedding;
      let cached = false;

      if (useCache) {
        embedding = cache.get(cacheKey);
        if (embedding) {
          cached = true;
        }
      }

      if (!embedding) {
        embedding = await transformerService.generateEmbedding(text);
        if (useCache) {
          cache.set(cacheKey, embedding);
        }
      }

      results.push({ embedding, cached });
    }

    const processingTime = Date.now() - startTime;

    res.json({ 
      results,
      totalProcessingTime: processingTime,
      totalTexts: texts.length
    });
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    res.status(500).json({ 
      error: 'Failed to generate batch embeddings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Vector search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, topK = 5, searchType = 'hybrid' } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const cacheKey = `search:${searchType}:${topK}:${Buffer.from(query).toString('base64')}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json({ 
        ...cached, 
        cached: true 
      });
    }

    const startTime = Date.now();
    const results = await vectorService.search(query, topK, searchType);
    const processingTime = Date.now() - startTime;

    const response = {
      results,
      query,
      topK,
      searchType,
      processingTime,
      cached: false
    };

    // Cache search results for 1 hour
    cache.set(cacheKey, response, 3600);

    res.json(response);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ 
      error: 'Failed to perform search',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Knowledge base stats endpoint
app.get('/api/knowledge-stats', async (req, res) => {
  try {
    const stats = await vectorService.getKnowledgeBaseStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting knowledge base stats:', error);
    res.status(500).json({ 
      error: 'Failed to get knowledge base stats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json({
    keys: cache.keys().length,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hits / (stats.hits + stats.misses) || 0
  });
});

app.delete('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('🚀 Starting backend server...');
    
    // Initialize transformer service
    console.log('📦 Initializing transformer service...');
    transformerService = new TransformerService();
    await transformerService.initialize();
    console.log('✅ Transformer service ready');
    
    // Initialize vector service
    console.log('🔍 Initializing vector service...');
    vectorService = new VectorService(transformerService);
    await vectorService.initialize();
    console.log('✅ Vector service ready');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🌟 Backend server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

startServer();