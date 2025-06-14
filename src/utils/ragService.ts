// Import the appropriate service based on deployment preference
import { BackendRAGService } from './backendRagService';
import { NetlifyRAGService } from './netlifyRagService';

// Choose which service to use
const USE_BACKEND_SERVER = import.meta.env.VITE_USE_BACKEND === 'true';

// Export the appropriate service
export const ragService = USE_BACKEND_SERVER 
  ? new BackendRAGService() 
  : new NetlifyRAGService();

// Re-export types for compatibility
export type { ChatMessage } from './backendRagService';