const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');

async function downloadModels() {
  console.log('🚀 Starting model download...');
  
  // Create models directory
  const modelsDir = path.join(__dirname, '..', 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
    console.log('📁 Created models directory');
  }

  try {
    // Download embedding model
    console.log('📥 Downloading embedding model: Xenova/all-MiniLM-L6-v2');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      cache_dir: modelsDir,
      local_files_only: false
    });
    
    // Test the model
    console.log('🧪 Testing model...');
    const testResult = await embedder('Hello world', { pooling: 'mean', normalize: true });
    console.log(`✅ Model test successful - embedding dimension: ${testResult.data.length}`);
    
    console.log('🎉 All models downloaded successfully!');
    console.log(`📍 Models cached in: ${modelsDir}`);
    
  } catch (error) {
    console.error('❌ Error downloading models:', error);
    process.exit(1);
  }
}

downloadModels();