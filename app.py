import gradio as gr
import json
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import os
from typing import List, Dict, Any
import time
import requests
import re

# Configure device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

class RAGtimBot:
    def __init__(self):
        self.embedder = None
        self.knowledge_base = []
        self.embeddings = []
        self.initialize_models()
        self.load_markdown_knowledge_base()
        
    def initialize_models(self):
        """Initialize the embedding model"""
        try:
            print("Loading embedding model...")
            self.embedder = pipeline(
                'feature-extraction', 
                'sentence-transformers/all-MiniLM-L6-v2',
                device=0 if device == "cuda" else -1
            )
            print("✅ Embedding model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading embedding model: {e}")
            raise e
    
    def load_markdown_knowledge_base(self):
        """Load knowledge base from markdown files"""
        print("Loading knowledge base from markdown files...")
        
        # Reset knowledge base
        self.knowledge_base = []
        
        # Load all markdown files
        markdown_files = [
            'about.md',
            'research_details.md', 
            'publications_detailed.md',
            'skills_expertise.md',
            'experience_detailed.md',
            'statistics.md'
        ]
        
        for filename in markdown_files:
            try:
                if os.path.exists(filename):
                    with open(filename, 'r', encoding='utf-8') as f:
                        content = f.read()
                    self.process_markdown_file(content, filename)
                    print(f"✅ Loaded {filename}")
                else:
                    print(f"⚠️ File not found: {filename}")
            except Exception as e:
                print(f"❌ Error loading {filename}: {e}")
        
        # Generate embeddings for knowledge base
        print("Generating embeddings for knowledge base...")
        self.embeddings = []
        for doc in self.knowledge_base:
            try:
                embedding = self.embedder(doc["content"], return_tensors="pt")
                # Convert to numpy and flatten
                embedding_np = embedding[0].mean(dim=0).detach().cpu().numpy()
                self.embeddings.append(embedding_np)
            except Exception as e:
                print(f"Error generating embedding for doc {doc['id']}: {e}")
                # Fallback to zero embedding
                self.embeddings.append(np.zeros(384))
        
        print(f"✅ Knowledge base loaded with {len(self.knowledge_base)} documents")
    
    def process_markdown_file(self, content: str, filename: str):
        """Process a markdown file and extract sections"""
        # Determine file type and priority
        file_type_map = {
            'about.md': ('about', 10),
            'research_details.md': ('research', 9),
            'publications_detailed.md': ('publications', 8),
            'skills_expertise.md': ('skills', 7),
            'experience_detailed.md': ('experience', 8),
            'statistics.md': ('statistics', 9)
        }
        
        file_type, priority = file_type_map.get(filename, ('general', 5))
        
        # Split content into sections
        sections = self.split_markdown_into_sections(content)
        
        for section in sections:
            if len(section['content'].strip()) > 100:  # Only process substantial content
                doc = {
                    "id": f"{filename}_{section['title']}_{len(self.knowledge_base)}",
                    "content": section['content'],
                    "metadata": {
                        "type": file_type,
                        "priority": priority,
                        "section": section['title'],
                        "source": filename
                    }
                }
                self.knowledge_base.append(doc)
    
    def split_markdown_into_sections(self, content: str) -> List[Dict[str, str]]:
        """Split markdown content into sections based on headers"""
        sections = []
        lines = content.split('\n')
        current_section = {'title': 'Introduction', 'content': ''}
        
        for line in lines:
            # Check if line is a header
            if line.startswith('#'):
                # Save previous section if it has content
                if current_section['content'].strip():
                    sections.append(current_section.copy())
                
                # Start new section
                header_level = len(line) - len(line.lstrip('#'))
                title = line.lstrip('#').strip()
                current_section = {
                    'title': title,
                    'content': line + '\n'
                }
            else:
                current_section['content'] += line + '\n'
        
        # Add the last section
        if current_section['content'].strip():
            sections.append(current_section)
        
        return sections
    
    def cosine_similarity(self, a, b):
        """Calculate cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def search_knowledge_base(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search the knowledge base using semantic similarity"""
        try:
            # Generate query embedding
            query_embedding = self.embedder(query, return_tensors="pt")
            query_vector = query_embedding[0].mean(dim=0).detach().cpu().numpy()
            
            # Calculate similarities
            similarities = []
            for i, doc_embedding in enumerate(self.embeddings):
                similarity = self.cosine_similarity(query_vector, doc_embedding)
                similarities.append({
                    "id": self.knowledge_base[i]["id"],
                    "content": self.knowledge_base[i]["content"],
                    "metadata": self.knowledge_base[i]["metadata"],
                    "score": float(similarity),
                    "index": i
                })
            
            # Sort by similarity and priority
            similarities.sort(key=lambda x: (x["score"], x["metadata"]["priority"]), reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            print(f"Error in search: {e}")
            # Fallback to keyword search
            return self.keyword_search(query, top_k)
    
    def keyword_search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Fallback keyword search"""
        query_terms = query.lower().split()
        results = []
        
        for i, doc in enumerate(self.knowledge_base):
            content_lower = doc["content"].lower()
            score = sum(content_lower.count(term) for term in query_terms)
            
            # Add priority boost
            priority_boost = doc["metadata"]["priority"] / 10
            final_score = score + priority_boost
            
            if score > 0:
                results.append({
                    "id": doc["id"],
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                    "score": final_score,
                    "index": i
                })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

# Initialize the bot
print("Initializing RAGtim Bot with markdown knowledge base...")
bot = RAGtimBot()

def search_only_api(query, top_k=5):
    """API endpoint for search-only functionality"""
    try:
        results = bot.search_knowledge_base(query, top_k)
        return {
            "results": results,
            "query": query,
            "top_k": top_k,
            "search_type": "semantic",
            "total_documents": len(bot.knowledge_base)
        }
    except Exception as e:
        print(f"Error in search API: {e}")
        return {"error": str(e), "results": []}

def get_stats_api():
    """API endpoint for knowledge base statistics"""
    # Calculate document distribution by type
    doc_types = {}
    sections_by_file = {}
    
    for doc in bot.knowledge_base:
        doc_type = doc["metadata"]["type"]
        source_file = doc["metadata"]["source"]
        
        doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
        sections_by_file[source_file] = sections_by_file.get(source_file, 0) + 1
    
    return {
        "total_documents": len(bot.knowledge_base),
        "document_types": doc_types,
        "sections_by_file": sections_by_file,
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_dimension": 384,
        "search_capabilities": ["Semantic Search", "GPU Accelerated", "Transformer Embeddings", "Markdown Knowledge Base"],
        "backend_type": "Hugging Face Space",
        "knowledge_sources": list(sections_by_file.keys())
    }

def chat_interface(message, history):
    """Chat interface with markdown knowledge base"""
    if not message.strip():
        return "Please ask me something about Raktim Mondol! I have comprehensive information loaded from his complete portfolio markdown files."
    
    try:
        # Search knowledge base
        search_results = bot.search_knowledge_base(message, top_k=6)
        
        if search_results:
            # Build comprehensive response
            response_parts = []
            response_parts.append(f"Based on my markdown knowledge base (found {len(search_results)} relevant sections):\n")
            
            # Use the best match as primary response
            best_match = search_results[0]
            response_parts.append(f"**Primary Answer** (Relevance: {best_match['score']:.2f}):")
            response_parts.append(f"Source: {best_match['metadata']['source']} - {best_match['metadata']['section']}")
            response_parts.append(f"{best_match['content']}\n")
            
            # Add additional context if available
            if len(search_results) > 1:
                response_parts.append("**Additional Context:**")
                for i, result in enumerate(search_results[1:3], 1):  # Show up to 2 additional results
                    section_info = f"{result['metadata']['source']} - {result['metadata']['section']}"
                    response_parts.append(f"{i}. {section_info} (Relevance: {result['score']:.2f})")
                    # Add a brief excerpt
                    excerpt = result['content'][:200] + "..." if len(result['content']) > 200 else result['content']
                    response_parts.append(f"   {excerpt}\n")
            
            response_parts.append("\n[Note: This response is generated from your complete markdown knowledge base. In hybrid mode, DeepSeek LLM would generate more natural responses using this context.]")
            
            return "\n".join(response_parts)
        else:
            return "I don't have specific information about that topic in my markdown knowledge base. Could you please ask something else about Raktim Mondol?"
        
    except Exception as e:
        print(f"Error in chat interface: {e}")
        return "I'm sorry, I encountered an error while processing your question. Please try again."

# Create Gradio interface
print("Creating Gradio interface...")

# Custom CSS for better styling
css = """
.gradio-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.chat-message {
    padding: 10px;
    margin: 5px 0;
    border-radius: 10px;
}
"""

# Create the main chat interface
iface = gr.ChatInterface(
    fn=chat_interface,
    title="🤖 RAGtim Bot - Markdown Knowledge Base",
    description=f"""
    **Complete Markdown Knowledge Base**: This Hugging Face Space loads all markdown files from Raktim Mondol's portfolio with **{len(bot.knowledge_base)} knowledge sections**.
    
    **Loaded Markdown Files:**
    - 📄 **about.md** - Personal information, contact details, professional summary
    - 🔬 **research_details.md** - Detailed research projects, methodologies, current work
    - 📚 **publications_detailed.md** - Complete publication details, technical contributions
    - 💻 **skills_expertise.md** - Comprehensive technical skills, tools, frameworks
    - 💼 **experience_detailed.md** - Professional experience, teaching, research roles
    - 📊 **statistics.md** - Statistical methods, biostatistics expertise, methodologies
    
    **Search Capabilities:**
    - 🔍 Semantic similarity search using transformers
    - 🚀 GPU-accelerated embeddings with priority ranking
    - 📊 Relevance scoring across all markdown content
    - 🎯 Section-level granular search within each file
    
    **API Endpoints:**
    - `/api/search` - Search across complete markdown knowledge base
    - `/api/stats` - Detailed statistics about loaded content
    
    **Ask me anything about Raktim Mondol:**
    - Research projects, methodologies, and innovations
    - Publications with technical details and impact
    - Technical skills, programming expertise, and tools
    - Educational background and academic achievements
    - Professional experience and teaching roles
    - Statistical methods and biostatistics applications
    - Awards, recognition, and professional development
    - Contact information and collaboration opportunities
    
    **Note**: This demo shows search results from the complete markdown knowledge base. In hybrid mode, these results are passed to DeepSeek LLM for natural response generation.
    """,
    examples=[
        "What is Raktim's research about?",
        "Tell me about BioFusionNet in detail",
        "What are his LLM and RAG expertise?",
        "Describe his statistical methods and biostatistics work",
        "What programming languages and frameworks does he use?",
        "Tell me about his educational background",
        "What is his current position at UNSW?",
        "How can I contact Raktim for collaboration?",
        "What awards and recognition has he received?",
        "Explain his multimodal AI research",
        "What is hist2RNA and its impact?",
        "Tell me about his teaching experience"
    ],
    css=css,
    theme=gr.themes.Soft(
        primary_hue="green",
        secondary_hue="blue",
        neutral_hue="slate"
    ),
    chatbot=gr.Chatbot(
        height=600,
        show_label=False,
        container=True,
        bubble_full_width=False
    ),
    textbox=gr.Textbox(
        placeholder="Ask me anything about Raktim Mondol's research, skills, experience, publications...",
        container=False,
        scale=7
    ),
    submit_btn="Search Knowledge Base",
    retry_btn="🔄 Retry",
    undo_btn="↩️ Undo",
    clear_btn="🗑️ Clear"
)

# Create API interface for search-only functionality
search_api = gr.Interface(
    fn=search_only_api,
    inputs=[
        gr.Textbox(label="Search Query", placeholder="Enter your search query about Raktim Mondol..."),
        gr.Slider(minimum=1, maximum=15, value=5, step=1, label="Top K Results")
    ],
    outputs=gr.JSON(label="Markdown Knowledge Base Search Results"),
    title="🔍 Markdown Knowledge Base Search API",
    description="Direct access to semantic search across all loaded markdown files"
)

stats_api = gr.Interface(
    fn=get_stats_api,
    inputs=[],
    outputs=gr.JSON(label="Markdown Knowledge Base Statistics"),
    title="📊 Knowledge Base Stats",
    description="Detailed statistics about the loaded markdown knowledge base"
)

# Combine interfaces
demo = gr.TabbedInterface(
    [iface, search_api, stats_api],
    ["💬 Markdown Chat", "🔍 Search API", "📊 Stats API"],
    title="🤖 RAGtim Bot - Complete Markdown Knowledge Base"
)

if __name__ == "__main__":
    print("🚀 Launching RAGtim Bot with Markdown Knowledge Base...")
    print(f"📚 Loaded {len(bot.knowledge_base)} sections from markdown files")
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )