const { pipeline, env } = require('@xenova/transformers');

// Configure for serverless environment
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.backends.onnx.wasm.wasmOnly = true;

// Simple in-memory cache
const cache = new Map();

// Knowledge base content
const knowledgeBase = [
  {
    id: '1',
    content: `Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is a researcher, data scientist, bioinformatician, biostatistician, LLM engineer, and father. His research focuses on deep learning-based prognosis and explainability for breast cancer.`,
    metadata: { type: 'about', priority: 10 }
  },
  {
    id: '2',
    content: `Raktim's research focuses on Large Language Models (LLMs) including training, fine-tuning, and evaluating LLMs using parameter-efficient techniques like LoRA and QLoRA, with applications in retrieval-augmented generation, summarisation, and multi-hop reasoning.`,
    metadata: { type: 'research', priority: 9 }
  },
  {
    id: '3',
    content: `He has expertise in Generative AI & LLM Toolkits including Hugging Face Transformers, LoRA/QLoRA (PEFT), LangChain, OpenAI API/Gemini Pro, GPTQ/GGUF, Prompt Engineering, Agent Development Kit, and RAG Pipelines.`,
    metadata: { type: 'skills', priority: 7 }
  },
  {
    id: '4',
    content: `Raktim has published "BioFusionNet: Deep Learning-Based Survival Risk Stratification in ER+ Breast Cancer Through Multifeature and Multimodal Data Fusion" in IEEE Journal of Biomedical and Health Informatics (2024).`,
    metadata: { type: 'publications', priority: 8 }
  }
];

let embedder = null;

async function initializeEmbedder() {
  if (!embedder) {
    try {
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        cache_dir: '/tmp/models',
        local_files_only: false
      });
    } catch (error) {
      console.error('Failed to initialize embedder:', error);
      throw error;
    }
  }
  return embedder;
}

function cosineSimilarity(a, b) {
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

function keywordSearch(query, documents) {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const results = [];
  
  for (const doc of documents) {
    const content = doc.content.toLowerCase();
    let score = 0;
    
    for (const term of queryTerms) {
      const matches = (content.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    }
    
    if (score > 0) {
      results.push({ document: doc, score, searchType: 'keyword' });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

exports.handler = async (event, context) => {
  // Set timeout
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { query, topK = 5 } = JSON.parse(event.body);
    
    if (!query) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    // Check cache first
    const cacheKey = `search:${query}:${topK}`;
    if (cache.has(cacheKey)) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...cache.get(cacheKey), 
          cached: true 
        })
      };
    }

    let results = [];

    try {
      // Try vector search first
      const embedderInstance = await initializeEmbedder();
      const queryEmbedding = await embedderInstance(query, { pooling: 'mean', normalize: true });
      const queryVector = Array.from(queryEmbedding.data);
      
      // Generate embeddings for documents if not cached
      for (const doc of knowledgeBase) {
        const embeddingKey = `embedding:${doc.id}`;
        let docEmbedding;
        
        if (cache.has(embeddingKey)) {
          docEmbedding = cache.get(embeddingKey);
        } else {
          const result = await embedderInstance(doc.content, { pooling: 'mean', normalize: true });
          docEmbedding = Array.from(result.data);
          cache.set(embeddingKey, docEmbedding);
        }
        
        const similarity = cosineSimilarity(queryVector, docEmbedding);
        results.push({ document: doc, score: similarity, searchType: 'vector' });
      }
      
      results.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.warn('Vector search failed, falling back to keyword search:', error);
      // Fallback to keyword search
      results = keywordSearch(query, knowledgeBase);
    }

    const finalResults = results.slice(0, topK);
    
    const response = {
      results: finalResults,
      query,
      topK,
      searchType: results[0]?.searchType || 'keyword',
      cached: false
    };

    // Cache the results
    cache.set(cacheKey, response);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Search function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};