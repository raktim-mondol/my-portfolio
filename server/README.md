# Portfolio Backend Server

This backend server provides transformer model services for Raktim's portfolio, including embedding generation and vector search capabilities.

## Features

- 🤖 **Transformer Models**: Server-side Hugging Face transformers for fast embedding generation
- 🔍 **Hybrid Search**: Combines vector search with BM25 for optimal results
- 💾 **Intelligent Caching**: Redis-like caching for embeddings and search results
- 🚀 **High Performance**: Optimized for speed with batch processing support
- 🔒 **Security**: Rate limiting, CORS, and security headers
- 📊 **Monitoring**: Health checks and performance metrics

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Download Models (Optional - will auto-download on first use)
```bash
npm run install-models
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Production Server
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Generate Single Embedding
```
POST /api/embeddings
{
  "text": "Your text here",
  "useCache": true
}
```

### Generate Batch Embeddings
```
POST /api/embeddings/batch
{
  "texts": ["text1", "text2", "text3"],
  "useCache": true
}
```

### Vector Search
```
POST /api/search
{
  "query": "search query",
  "topK": 5,
  "searchType": "hybrid" // "vector", "bm25", or "hybrid"
}
```

### Knowledge Base Stats
```
GET /api/knowledge-stats
```

### Cache Management
```
GET /api/cache/stats
DELETE /api/cache/clear
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS
- `DEEPSEEK_API_KEY`: API key for LLM responses
- `EMBEDDING_MODEL`: Hugging Face model name
- `MODEL_CACHE_DIR`: Local model cache directory

### Model Configuration

The server uses `Xenova/all-MiniLM-L6-v2` by default, which provides:
- 384-dimensional embeddings
- Fast inference speed
- Good multilingual support
- Compact model size (~90MB)

## Performance Optimizations

### Caching Strategy
- **Embeddings**: Cached for 24 hours
- **Search Results**: Cached for 1 hour
- **Models**: Cached locally on disk

### Batch Processing
- Support for up to 50 texts per batch request
- Automatic batching for optimal GPU utilization
- Parallel processing where possible

### Memory Management
- Automatic garbage collection
- Model memory optimization
- Request size limits

## Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup
1. Set up environment variables
2. Ensure sufficient disk space for models (~500MB)
3. Configure memory limits (minimum 2GB recommended)

### Production Considerations
- Use PM2 or similar process manager
- Set up proper logging
- Configure reverse proxy (nginx)
- Enable HTTPS
- Set up monitoring and alerts

## Monitoring

### Health Checks
The `/health` endpoint provides:
- Service status
- Model readiness
- System timestamp
- Component health

### Performance Metrics
- Request processing times
- Cache hit rates
- Model inference times
- Memory usage

## Troubleshooting

### Common Issues

1. **Model Download Fails**
   - Check internet connection
   - Verify disk space
   - Try manual download with `npm run install-models`

2. **High Memory Usage**
   - Reduce batch sizes
   - Clear cache regularly
   - Monitor model memory usage

3. **Slow Response Times**
   - Check cache hit rates
   - Optimize batch sizes
   - Consider model quantization

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## API Client Integration

Update your frontend to use the backend API:

```javascript
// Replace direct transformer usage with API calls
const response = await fetch('http://localhost:3001/api/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'your text' })
});
const { embedding } = await response.json();
```