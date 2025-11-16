// Import the simple LLM service (no RAG, no backend required)
import { SimpleLLMService } from './simpleLlmService';

console.log('🔧 Service Configuration:');
console.log('- Using SimpleLLMService (Direct LLM, no RAG/backend required)');

// Export the SimpleLLMService - all knowledge embedded in system prompt
export const ragService = new SimpleLLMService();

console.log('✅ Service initialized:', ragService.constructor.name);

// Re-export types for compatibility
export type { ChatMessage } from './simpleLlmService';