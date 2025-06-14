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
import math
from collections import defaultdict, Counter

# Configure device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

class HybridSearchRAGBot:
    def __init__(self):
        self.embedder = None
        self.knowledge_base = []
        self.embeddings = []
        
        # BM25 components
        self.term_frequencies = {}  # doc_id -> {term: frequency}
        self.document_frequency = {}  # term -> number of docs containing term
        self.document_lengths = {}  # doc_id -> document length
        self.average_doc_length = 0
        self.total_documents = 0
        
        # BM25 parameters
        self.k1 = 1.5  # Controls term frequency saturation
        self.b = 0.75  # Controls document length normalization
        
        self.initialize_models()
        self.load_markdown_knowledge_base()
        self.build_bm25_index()
        
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
        for i, doc in enumerate(self.knowledge_base):
            try:
                # Truncate content to avoid token limit issues
                content = doc["content"][:500]  # Limit to 500 characters
                embedding = self.embedder(content, return_tensors="pt")
                # Convert to numpy and flatten
                embedding_np = embedding[0].mean(dim=0).detach().cpu().numpy()
                self.embeddings.append(embedding_np)
            except Exception as e:
                print(f"Error generating embedding for doc {doc['id']}: {e}")
                # Fallback to zero embedding
                self.embeddings.append(np.zeros(384))
        
        self.total_documents = len(self.knowledge_base)
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
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize text for BM25"""
        # Convert to lowercase and remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        # Split into words and filter out short words and stop words
        words = [word for word in text.split() if len(word) > 2 and not self.is_stop_word(word)]
        return words
    
    def is_stop_word(self, word: str) -> bool:
        """Check if word is a stop word"""
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
            'from', 'up', 'out', 'down', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
        }
        return word in stop_words
    
    def build_bm25_index(self):
        """Build BM25 index for all documents"""
        print("Building BM25 index...")
        
        # Reset indexes
        self.term_frequencies = {}
        self.document_frequency = defaultdict(int)
        self.document_lengths = {}
        
        total_length = 0
        
        # First pass: calculate term frequencies and document lengths
        for doc in self.knowledge_base:
            doc_id = doc['id']
            terms = self.tokenize(doc['content'])
            
            # Calculate term frequencies for this document
            term_freq = Counter(terms)
            self.term_frequencies[doc_id] = dict(term_freq)
            
            # Store document length
            doc_length = len(terms)
            self.document_lengths[doc_id] = doc_length
            total_length += doc_length
            
            # Update document frequencies
            unique_terms = set(terms)
            for term in unique_terms:
                self.document_frequency[term] += 1
        
        # Calculate average document length
        self.average_doc_length = total_length / self.total_documents if self.total_documents > 0 else 0
        
        print(f"✅ BM25 index built: {len(self.document_frequency)} unique terms, avg doc length: {self.average_doc_length:.1f}")
    
    def calculate_bm25_score(self, term: str, doc_id: str) -> float:
        """Calculate BM25 score for a term in a document"""
        # Get term frequency in document
        tf = self.term_frequencies.get(doc_id, {}).get(term, 0)
        if tf == 0:
            return 0.0
        
        # Get document frequency and document length
        df = self.document_frequency.get(term, 1)
        doc_length = self.document_lengths.get(doc_id, 0)
        
        # Calculate IDF: log((N - df + 0.5) / (df + 0.5))
        idf = math.log((self.total_documents - df + 0.5) / (df + 0.5))
        
        # Calculate BM25 score
        numerator = tf * (self.k1 + 1)
        denominator = tf + self.k1 * (1 - self.b + self.b * (doc_length / self.average_doc_length))
        
        return idf * (numerator / denominator)
    
    def bm25_search(self, query: str, top_k: int = 10) -> List[Dict]:
        """Perform BM25 search"""
        query_terms = self.tokenize(query)
        if not query_terms:
            return []
        
        scores = {}
        
        # Calculate BM25 score for each document
        for doc in self.knowledge_base:
            doc_id = doc['id']
            score = 0.0
            
            for term in query_terms:
                score += self.calculate_bm25_score(term, doc_id)
            
            if score > 0:
                # Apply priority boost
                priority_boost = 1 + (doc['metadata']['priority'] / 50)
                final_score = score * priority_boost
                
                scores[doc_id] = {
                    'document': doc,
                    'score': final_score,
                    'search_type': 'bm25'
                }
        
        # Sort by score and return top_k
        sorted_results = sorted(scores.values(), key=lambda x: x['score'], reverse=True)
        return sorted_results[:top_k]
    
    def cosine_similarity(self, a, b):
        """Calculate cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def vector_search(self, query: str, top_k: int = 10) -> List[Dict]:
        """Perform vector similarity search"""
        try:
            # Generate query embedding
            query_embedding = self.embedder(query[:500], return_tensors="pt")  # Truncate query
            query_vector = query_embedding[0].mean(dim=0).detach().cpu().numpy()
            
            # Calculate similarities
            similarities = []
            for i, doc_embedding in enumerate(self.embeddings):
                if doc_embedding is not None and len(doc_embedding) > 0:
                    similarity = self.cosine_similarity(query_vector, doc_embedding)
                    
                    # Apply priority boost
                    priority_boost = 1 + (self.knowledge_base[i]['metadata']['priority'] / 100)
                    final_score = similarity * priority_boost
                    
                    similarities.append({
                        'document': self.knowledge_base[i],
                        'score': float(final_score),
                        'search_type': 'vector'
                    })
            
            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x['score'], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            print(f"Error in vector search: {e}")
            return []
    
    def hybrid_search(self, query: str, top_k: int = 10, vector_weight: float = 0.6, bm25_weight: float = 0.4) -> List[Dict]:
        """Perform hybrid search combining vector and BM25 results"""
        try:
            # Get results from both search methods
            vector_results = self.vector_search(query, top_k * 2)  # Get more results for better fusion
            bm25_results = self.bm25_search(query, top_k * 2)
            
            # Normalize scores to [0, 1] range
            if vector_results:
                max_vector_score = max(r['score'] for r in vector_results)
                if max_vector_score > 0:
                    for result in vector_results:
                        result['normalized_score'] = result['score'] / max_vector_score
                else:
                    for result in vector_results:
                        result['normalized_score'] = 0
            
            if bm25_results:
                max_bm25_score = max(r['score'] for r in bm25_results)
                if max_bm25_score > 0:
                    for result in bm25_results:
                        result['normalized_score'] = result['score'] / max_bm25_score
                else:
                    for result in bm25_results:
                        result['normalized_score'] = 0
            
            # Combine results
            combined_scores = {}
            
            # Add vector results
            for result in vector_results:
                doc_id = result['document']['id']
                combined_scores[doc_id] = {
                    'document': result['document'],
                    'vector_score': result['normalized_score'],
                    'bm25_score': 0.0,
                    'search_type': 'vector'
                }
            
            # Add BM25 results
            for result in bm25_results:
                doc_id = result['document']['id']
                if doc_id in combined_scores:
                    combined_scores[doc_id]['bm25_score'] = result['normalized_score']
                    combined_scores[doc_id]['search_type'] = 'hybrid'
                else:
                    combined_scores[doc_id] = {
                        'document': result['document'],
                        'vector_score': 0.0,
                        'bm25_score': result['normalized_score'],
                        'search_type': 'bm25'
                    }
            
            # Calculate final hybrid scores
            final_results = []
            for doc_id, data in combined_scores.items():
                hybrid_score = (vector_weight * data['vector_score']) + (bm25_weight * data['bm25_score'])
                final_results.append({
                    'document': data['document'],
                    'score': hybrid_score,
                    'vector_score': data['vector_score'],
                    'bm25_score': data['bm25_score'],
                    'search_type': data['search_type']
                })
            
            # Sort by hybrid score and return top_k
            final_results.sort(key=lambda x: x['score'], reverse=True)
            return final_results[:top_k]
            
        except Exception as e:
            print(f"Error in hybrid search: {e}")
            # Fallback to vector search only
            return self.vector_search(query, top_k)
    
    def search_knowledge_base(self, query: str, top_k: int = 5, search_type: str = "hybrid") -> List[Dict]:
        """Search the knowledge base using specified method"""
        if search_type == "vector":
            return self.vector_search(query, top_k)
        elif search_type == "bm25":
            return self.bm25_search(query, top_k)
        else:  # hybrid
            return self.hybrid_search(query, top_k)

# Initialize the bot
print("Initializing Hybrid Search RAGtim Bot...")
bot = HybridSearchRAGBot()

def search_api(query, top_k=5, search_type="hybrid", vector_weight=0.6, bm25_weight=0.4):
    """API endpoint for hybrid search functionality"""
    try:
        if search_type == "hybrid":
            results = bot.hybrid_search(query, top_k, vector_weight, bm25_weight)
        else:
            results = bot.search_knowledge_base(query, top_k, search_type)
        
        return {
            "results": results,
            "query": query,
            "top_k": top_k,
            "search_type": search_type,
            "total_documents": len(bot.knowledge_base),
            "search_parameters": {
                "vector_weight": vector_weight if search_type == "hybrid" else None,
                "bm25_weight": bm25_weight if search_type == "hybrid" else None,
                "bm25_k1": bot.k1,
                "bm25_b": bot.b
            }
        }
    except Exception as e:
        print(f"Error in search API: {e}")
        return {"error": str(e), "results": []}

def get_stats_api():
    """API endpoint for knowledge base statistics"""
    try:
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
            "search_capabilities": [
                "Hybrid Search (Vector + BM25)",
                "Semantic Vector Search", 
                "BM25 Keyword Search",
                "GPU Accelerated",
                "Transformer Embeddings"
            ],
            "bm25_parameters": {
                "k1": bot.k1,
                "b": bot.b,
                "unique_terms": len(bot.document_frequency),
                "average_doc_length": bot.average_doc_length
            },
            "backend_type": "Hugging Face Space with Hybrid Search",
            "knowledge_sources": list(sections_by_file.keys()),
            "status": "healthy"
        }
    except Exception as e:
        print(f"Error in get_stats_api: {e}")
        return {
            "error": str(e),
            "status": "error",
            "total_documents": 0,
            "search_capabilities": ["Error"]
        }

def chat_interface(message, history):
    """Chat interface with hybrid search"""
    if not message.strip():
        return "Please ask me something about Raktim Mondol! I use hybrid search combining semantic similarity and keyword matching for the best results."
    
    try:
        # Use hybrid search by default
        search_results = bot.hybrid_search(message, top_k=6)
        
        if search_results:
            # Build comprehensive response
            response_parts = []
            response_parts.append(f"🔍 **Hybrid Search Results** (Vector + BM25 combination, found {len(search_results)} relevant sections):\n")
            
            # Use the best match as primary response
            best_match = search_results[0]
            response_parts.append(f"**Primary Answer** (Hybrid Score: {best_match['score']:.3f}):")
            response_parts.append(f"📄 Source: {best_match['document']['metadata']['source']} - {best_match['document']['metadata']['section']}")
            response_parts.append(f"🔍 Search Type: {best_match['search_type'].upper()}")
            
            # Show score breakdown for hybrid results
            if 'vector_score' in best_match and 'bm25_score' in best_match:
                response_parts.append(f"📊 Vector Score: {best_match['vector_score']:.3f} | BM25 Score: {best_match['bm25_score']:.3f}")
            
            response_parts.append(f"\n{best_match['document']['content']}\n")
            
            # Add additional context if available
            if len(search_results) > 1:
                response_parts.append("**Additional Context:**")
                for i, result in enumerate(search_results[1:3], 1):  # Show up to 2 additional results
                    section_info = f"{result['document']['metadata']['source']} - {result['document']['metadata']['section']}"
                    search_info = f"({result['search_type'].upper()}, Score: {result['score']:.3f})"
                    response_parts.append(f"{i}. {section_info} {search_info}")
                    
                    # Add a brief excerpt
                    excerpt = result['document']['content'][:200] + "..." if len(result['document']['content']) > 200 else result['document']['content']
                    response_parts.append(f"   {excerpt}\n")
            
            response_parts.append("\n🤖 **Hybrid Search Technology:**")
            response_parts.append("• **Vector Search**: Semantic similarity using transformer embeddings")
            response_parts.append("• **BM25 Search**: Advanced keyword ranking with TF-IDF")
            response_parts.append("• **Fusion**: Weighted combination for optimal relevance")
            response_parts.append("\n[Note: This demonstrates hybrid search results. In production, these would be passed to an LLM for natural response generation.]")
            
            return "\n".join(response_parts)
        else:
            return "I don't have specific information about that topic in my knowledge base. Could you please ask something else about Raktim Mondol?"
        
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
.search-type-radio .wrap {
    display: flex;
    gap: 10px;
}
.search-weights {
    background: #f0f0f0;
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
}
"""

# Create the main chat interface
with gr.Blocks(
    title="🔥 Hybrid Search RAGtim Bot",
    css=css,
    theme=gr.themes.Soft(
        primary_hue="green",
        secondary_hue="blue",
        neutral_hue="slate"
    )
) as chat_demo:
    gr.Markdown(f"""
    # 🔥 Hybrid Search RAGtim Bot - Advanced Search Technology
    
    **🚀 Hybrid Search System**: This Space implements **true hybrid search** combining:
    - 🧠 **Semantic Vector Search**: Transformer embeddings for conceptual similarity
    - 🔍 **BM25 Keyword Search**: Advanced TF-IDF ranking for exact term matching
    - ⚖️ **Intelligent Fusion**: Weighted combination for optimal relevance
    
    **📚 Knowledge Base**: **{len(bot.knowledge_base)} sections** from comprehensive markdown files:
    - 📄 **about.md** - Personal info, contact, professional summary
    - 🔬 **research_details.md** - Research projects, methodologies, innovations
    - 📚 **publications_detailed.md** - Publications with technical details
    - 💻 **skills_expertise.md** - Technical skills, LLM expertise, tools
    - 💼 **experience_detailed.md** - Professional experience, teaching
    - 📊 **statistics.md** - Statistical methods, biostatistics expertise
    
    **🔧 Search Parameters**:
    - **BM25 Parameters**: k1={bot.k1}, b={bot.b}
    - **Vocabulary**: {len(bot.document_frequency)} unique terms
    - **Average Document Length**: {bot.average_doc_length:.1f} words
    - **Embedding Model**: sentence-transformers/all-MiniLM-L6-v2 (384-dim)
    
    **💡 Try Different Search Types**:
    - **Hybrid** (Recommended): Best of both semantic and keyword search
    - **Vector**: Pure semantic similarity for conceptual queries
    - **BM25**: Pure keyword matching for specific terms
    
    **Ask me anything about Raktim Mondol's research, expertise, and background!**
    """)
    
    chatbot = gr.Chatbot(
        height=500,
        show_label=False,
        container=True,
        type="messages"
    )
    
    with gr.Row():
        msg = gr.Textbox(
            placeholder="Ask about Raktim's research, LLM expertise, publications, statistical methods...",
            container=False,
            scale=7,
            show_label=False
        )
        submit_btn = gr.Button("🔍 Hybrid Search", scale=1)
    
    # Example buttons
    with gr.Row():
        examples = [
            "What is Raktim's LLM and RAG research?",
            "Tell me about BioFusionNet statistical methods",
            "What are his multimodal AI capabilities?",
            "Describe his biostatistics expertise"
        ]
        for example in examples:
            gr.Button(example, size="sm").click(
                lambda x=example: x, outputs=msg
            )
    
    def respond(message, history):
        if not message.strip():
            return history, ""
        
        # Add user message to history
        history.append({"role": "user", "content": message})
        
        # Get bot response
        bot_response = chat_interface(message, history)
        
        # Add bot response to history
        history.append({"role": "assistant", "content": bot_response})
        
        return history, ""
    
    submit_btn.click(respond, [msg, chatbot], [chatbot, msg])
    msg.submit(respond, [msg, chatbot], [chatbot, msg])

# Create advanced search interface
with gr.Blocks(title="🔧 Advanced Hybrid Search") as search_demo:
    gr.Markdown("# 🔧 Advanced Hybrid Search Configuration")
    gr.Markdown("Fine-tune the hybrid search parameters and compare different search methods")
    
    with gr.Row():
        with gr.Column(scale=2):
            search_input = gr.Textbox(
                label="Search Query", 
                placeholder="Enter your search query about Raktim Mondol..."
            )
            
            with gr.Row():
                search_type = gr.Radio(
                    choices=["hybrid", "vector", "bm25"],
                    value="hybrid",
                    label="Search Method",
                    elem_classes=["search-type-radio"]
                )
                top_k_slider = gr.Slider(
                    minimum=1, 
                    maximum=15, 
                    value=5, 
                    step=1, 
                    label="Top K Results"
                )
            
            # Hybrid search weights (only shown when hybrid is selected)
            with gr.Group(visible=True) as weight_group:
                gr.Markdown("**Hybrid Search Weights**")
                vector_weight = gr.Slider(
                    minimum=0.0,
                    maximum=1.0,
                    value=0.6,
                    step=0.1,
                    label="Vector Weight (Semantic)"
                )
                bm25_weight = gr.Slider(
                    minimum=0.0,
                    maximum=1.0,
                    value=0.4,
                    step=0.1,
                    label="BM25 Weight (Keyword)"
                )
        
        with gr.Column(scale=1):
            gr.Markdown("**Search Method Guide:**")
            gr.Markdown("""
            **🔥 Hybrid**: Combines semantic + keyword
            - Best for most queries
            - Balances meaning and exact terms
            
            **🧠 Vector**: Pure semantic similarity
            - Good for conceptual questions
            - Finds related concepts
            
            **🔍 BM25**: Pure keyword matching
            - Good for specific terms
            - Traditional search ranking
            """)
    
    search_output = gr.JSON(label="Hybrid Search Results", height=400)
    search_btn = gr.Button("🔍 Search with Custom Parameters", variant="primary")
    
    def update_weights_visibility(search_type):
        return gr.Group(visible=(search_type == "hybrid"))
    
    search_type.change(update_weights_visibility, inputs=[search_type], outputs=[weight_group])
    
    def normalize_weights(vector_w, bm25_w):
        total = vector_w + bm25_w
        if total > 0:
            return vector_w / total, bm25_w / total
        return 0.6, 0.4
    
    def advanced_search(query, search_type, top_k, vector_w, bm25_w):
        # Normalize weights
        vector_weight, bm25_weight = normalize_weights(vector_w, bm25_w)
        return search_api(query, top_k, search_type, vector_weight, bm25_weight)
    
    search_btn.click(
        advanced_search,
        inputs=[search_input, search_type, top_k_slider, vector_weight, bm25_weight],
        outputs=search_output
    )

# Create stats interface
with gr.Blocks(title="📊 System Statistics") as stats_demo:
    gr.Markdown("# 📊 Hybrid Search System Statistics")
    gr.Markdown("Detailed information about the knowledge base and search capabilities")
    
    stats_output = gr.JSON(label="System Statistics", height=500)
    stats_btn = gr.Button("📊 Get System Statistics", variant="primary")
    
    stats_btn.click(
        get_stats_api,
        inputs=[],
        outputs=stats_output
    )

# Combine interfaces using TabbedInterface
demo = gr.TabbedInterface(
    [chat_demo, search_demo, stats_demo],
    ["💬 Hybrid Chat", "🔧 Advanced Search", "📊 Statistics"],
    title="🔥 Hybrid Search RAGtim Bot - Vector + BM25 Fusion"
)

# Create API endpoints that can be accessed via HTTP
def api_search_endpoint(request: gr.Request):
    """HTTP API endpoint for search"""
    try:
        # Get query parameters from the request
        query = request.query_params.get('query', '')
        top_k = int(request.query_params.get('top_k', 5))
        search_type = request.query_params.get('search_type', 'hybrid')
        vector_weight = float(request.query_params.get('vector_weight', 0.6))
        bm25_weight = float(request.query_params.get('bm25_weight', 0.4))
        
        if not query:
            return {"error": "Query parameter is required"}
        
        return search_api(query, top_k, search_type, vector_weight, bm25_weight)
    except Exception as e:
        return {"error": str(e)}

def api_stats_endpoint(request: gr.Request):
    """HTTP API endpoint for stats"""
    try:
        return get_stats_api()
    except Exception as e:
        return {"error": str(e)}

# Add API routes to the main demo
demo.api_name = "hybrid_search_api"

if __name__ == "__main__":
    print("🚀 Launching Hybrid Search RAGtim Bot...")
    print(f"📚 Loaded {len(bot.knowledge_base)} sections from markdown files")
    print(f"🔍 BM25 index: {len(bot.document_frequency)} unique terms")
    print(f"🧠 Vector embeddings: {len(bot.embeddings)} documents")
    print("🔥 Hybrid search ready: Semantic + Keyword fusion!")
    
    # Launch the main demo with API access
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )