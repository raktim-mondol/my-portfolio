// Import the appropriate service based on deployment preference
import { BackendRAGService } from './backendRagService';
import { NetlifyRAGService } from './netlifyRagService';
import { HuggingFaceRAGService } from './huggingFaceRagService';
import { HybridRAGService } from './hybridRagService';

// Choose which service to use based on environment variables
const USE_HYBRID = import.meta.env.VITE_USE_HYBRID === 'true';
const USE_BACKEND_SERVER = import.meta.env.VITE_USE_BACKEND === 'true';
const USE_HUGGING_FACE = import.meta.env.VITE_USE_HUGGING_FACE === 'true';

// Export the appropriate service
export const ragService = USE_HYBRID
  ? new HybridRAGService()
  : USE_HUGGING_FACE 
    ? new HuggingFaceRAGService()
    : USE_BACKEND_SERVER 
      ? new BackendRAGService() 
      : new NetlifyRAGService();

// Re-export types for compatibility
export type { ChatMessage } from './backendRagService';