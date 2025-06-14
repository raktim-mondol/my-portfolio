import gradio as gr
import json
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import os
from typing import List, Dict, Any
import time

# Configure device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

class RAGtimBot:
    def __init__(self):
        self.embedder = None
        self.knowledge_base = []
        self.embeddings = []
        self.initialize_models()
        self.load_knowledge_base()
        
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
    
    def load_knowledge_base(self):
        """Load and process the knowledge base"""
        print("Loading knowledge base...")
        
        # Comprehensive knowledge base about Raktim Mondol
        self.knowledge_base = [
            {
                "id": "about_1",
                "content": "Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is a researcher, data scientist, bioinformatician, biostatistician, LLM engineer, and father. His research focuses on deep learning-based prognosis and explainability for breast cancer. He is located at the School of Computer Science and Engineering, Building K17, UNSW Sydney, NSW 2052. Contact: r.mondol@unsw.edu.au, Phone: +61 412 936 237.",
                "metadata": {"type": "about", "priority": 10}
            },
            {
                "id": "education_1", 
                "content": "Raktim Mondol is pursuing a PhD in Computer Science & Engineering at UNSW Sydney (2021-2025 Expected). His thesis is on 'Deep Learning Based Prognosis and Explainability for Breast Cancer'. He completed his MS by Research in Computer Science & Bioinformatics at RMIT University (2017-2019) with High Distinction. His master's thesis was 'Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations'.",
                "metadata": {"type": "education", "priority": 9}
            },
            {
                "id": "research_llm",
                "content": "Raktim's research focuses on Large Language Models (LLMs) including training, fine-tuning, and evaluating LLMs using parameter-efficient techniques like LoRA and QLoRA, with applications in retrieval-augmented generation, summarisation, and multi-hop reasoning. He works on Agentic AI & Multi-Agent Systems, designing autonomous, tool-using agents for reasoning, planning, and collaboration using frameworks like the Agent Development Kit.",
                "metadata": {"type": "research", "priority": 9}
            },
            {
                "id": "research_rag",
                "content": "His expertise includes Retrieval-Augmented Generation (RAG), building hybrid search and generation pipelines integrating semantic and keyword-based retrieval using technologies like FAISS, BM25, ChromaDB, Weaviate, and Milvus for vector search and retrieval systems.",
                "metadata": {"type": "research", "priority": 9}
            },
            {
                "id": "skills_ai",
                "content": "Raktim has expertise in Generative AI & LLM Toolkits including Hugging Face Transformers, LoRA/QLoRA (PEFT), LangChain, OpenAI API/Gemini Pro, GPTQ/GGUF, Prompt Engineering, Agent Development Kit, and RAG Pipelines. He is skilled in Multimodal & CV + NLP including CLIP/BLIP/LLaVA, Segment Anything (SAM), Visual Question Answering, and Multimodal Transformers.",
                "metadata": {"type": "skills", "priority": 7}
            },
            {
                "id": "skills_programming",
                "content": "Programming languages: Python, R, SQL, LaTeX. Deep Learning Frameworks: PyTorch, TensorFlow. Cloud Computing: AWS, GCP, Galaxy. Development tools: Git, Jupyter Notebook, RStudio, Spyder. Statistical Analysis: Stata, SPSS, SAS, NCSS.",
                "metadata": {"type": "skills", "priority": 7}
            },
            {
                "id": "experience_current",
                "content": "Raktim Mondol has been working as a Casual Academic at UNSW since July 2021, conducting laboratory and tutorial classes for Computer Vision, Neural Networks and Deep Learning, and Artificial Intelligence courses. He provides guidance to students and assists in course material development.",
                "metadata": {"type": "experience", "priority": 8}
            },
            {
                "id": "experience_rmit",
                "content": "Previously, he was a Teaching Assistant at RMIT University (July 2017 - Oct 2019), conducting laboratory classes for Electronics, Software Engineering Design, Engineering Computing, and Introduction to Embedded Systems.",
                "metadata": {"type": "experience", "priority": 8}
            },
            {
                "id": "experience_lecturer",
                "content": "He worked as a full-time Lecturer at World University of Bangladesh (Sep 2013 - Dec 2016), teaching Electrical Circuit I & II, Engineering Materials, Electronics I & II, Digital Logic Design, and supervising student projects and thesis.",
                "metadata": {"type": "experience", "priority": 8}
            },
            {
                "id": "publication_biofusion",
                "content": "BioFusionNet: Deep Learning-Based Survival Risk Stratification in ER+ Breast Cancer Through Multifeature and Multimodal Data Fusion published in IEEE Journal of Biomedical and Health Informatics (2024). This work demonstrates novel multimodal fusion architecture combining histopathology, genomics, and clinical data with attention-based feature selection for interpretability.",
                "metadata": {"type": "publications", "priority": 8}
            },
            {
                "id": "publication_hist2rna",
                "content": "hist2RNA: An Efficient Deep Learning Architecture to Predict Gene Expression from Breast Cancer Histopathology Images published in Cancers journal (2023). This enables gene expression profiling without expensive molecular assays, making personalized medicine more accessible.",
                "metadata": {"type": "publications", "priority": 8}
            },
            {
                "id": "publication_afexnet",
                "content": "AFExNet: An Adversarial Autoencoder for Differentiating Breast Cancer Sub-types and Extracting Biologically Relevant Genes published in IEEE/ACM Transactions on Computational Biology and Bioinformatics (2021). Provides insights into cancer biology while achieving high classification accuracy.",
                "metadata": {"type": "publications", "priority": 8}
            },
            {
                "id": "statistics_expertise",
                "content": "Raktim demonstrates exceptional proficiency in advanced statistical methods including survival analysis with weighted Cox proportional hazards models, multivariate regression analysis, hypothesis testing, correlation analysis with multiple-testing control, and comprehensive biostatistical applications. His BioFusionNet work achieved mean concordance index of 0.77 and time-dependent AUC of 0.84.",
                "metadata": {"type": "statistics", "priority": 9}
            },
            {
                "id": "awards",
                "content": "Awards include: Doctoral Research Scholarship from UNSW Sydney (2021), Masters by Research with High Distinction from RMIT University (2019), RMIT Research Scholarships (2017), B.Sc. with High Distinction from BRAC University (2013), Vice Chancellor Award from BRAC University (2013), and Dean Awards (2010-2011).",
                "metadata": {"type": "awards", "priority": 6}
            }
        ]
        
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
            
            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x["score"], reverse=True)
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
            
            if score > 0:
                results.append({
                    "id": doc["id"],
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                    "score": score,
                    "index": i
                })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

# Initialize the bot
print("Initializing RAGtim Bot...")
bot = RAGtimBot()

def search_only_api(query, top_k=5):
    """API endpoint for search-only functionality"""
    try:
        results = bot.search_knowledge_base(query, top_k)
        return {
            "results": results,
            "query": query,
            "top_k": top_k,
            "search_type": "semantic"
        }
    except Exception as e:
        print(f"Error in search API: {e}")
        return {"error": str(e), "results": []}

def get_stats_api():
    """API endpoint for knowledge base statistics"""
    return {
        "total_documents": len(bot.knowledge_base),
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_dimension": 384,
        "search_capabilities": ["Semantic Search", "GPU Accelerated", "Transformer Embeddings"],
        "backend_type": "Hugging Face Space"
    }

def chat_interface(message, history):
    """Main chat interface function - now just for demo purposes"""
    if not message.strip():
        return "Please ask me something about Raktim Mondol!"
    
    try:
        # Search knowledge base
        search_results = bot.search_knowledge_base(message, top_k=5)
        
        # Simple response for demo (in hybrid mode, DeepSeek will handle this)
        if search_results:
            best_match = search_results[0]
            return f"Based on the search results (similarity: {best_match['score']:.2f}):\n\n{best_match['content']}\n\n[Note: In hybrid mode, DeepSeek LLM will generate more natural responses using this context]"
        else:
            return "I don't have specific information about that topic. Could you please ask something else about Raktim Mondol?"
        
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
    title="🤖 RAGtim Bot - Hybrid Search Engine",
    description="""
    **Hybrid RAG System**: This Hugging Face Space provides GPU-accelerated semantic search that can be combined with external LLMs like DeepSeek for response generation.
    
    **Search Capabilities:**
    - 🔍 Semantic similarity search using transformers
    - 🚀 GPU-accelerated embeddings
    - 📊 Relevance scoring and ranking
    - 🎯 Context-aware retrieval
    
    **API Endpoints:**
    - `/api/search` - Search-only functionality
    - `/api/stats` - Knowledge base statistics
    
    **Ask me about Raktim Mondol:**
    - 🔬 Research in LLMs, RAG, and AI for healthcare
    - 📚 Publications and academic work
    - 💻 Technical skills and programming expertise
    - 🎓 Education and academic background
    - 👨‍🏫 Teaching and professional experience
    - 📊 Statistical methods and biostatistics
    
    **Note**: This demo shows search results. In hybrid mode, these results are passed to DeepSeek LLM for natural response generation.
    """,
    examples=[
        "What is Raktim's research about?",
        "Tell me about his publications",
        "What programming languages does he know?",
        "What is his educational background?",
        "How can I contact Raktim?",
        "What is BioFusionNet?",
        "Tell me about his LLM research",
        "What statistical methods does he use?"
    ],
    css=css,
    theme=gr.themes.Soft(
        primary_hue="green",
        secondary_hue="blue",
        neutral_hue="slate"
    ),
    chatbot=gr.Chatbot(
        height=500,
        show_label=False,
        container=True,
        bubble_full_width=False
    ),
    textbox=gr.Textbox(
        placeholder="Ask me anything about Raktim Mondol...",
        container=False,
        scale=7
    ),
    submit_btn="Search",
    retry_btn="🔄 Retry",
    undo_btn="↩️ Undo",
    clear_btn="🗑️ Clear"
)

# Create API interface for search-only functionality
search_api = gr.Interface(
    fn=search_only_api,
    inputs=[
        gr.Textbox(label="Search Query", placeholder="Enter your search query..."),
        gr.Slider(minimum=1, maximum=10, value=5, step=1, label="Top K Results")
    ],
    outputs=gr.JSON(label="Search Results"),
    title="🔍 Search API",
    description="Direct access to the semantic search functionality"
)

stats_api = gr.Interface(
    fn=get_stats_api,
    inputs=[],
    outputs=gr.JSON(label="Knowledge Base Statistics"),
    title="📊 Stats API",
    description="Knowledge base statistics and capabilities"
)

# Combine interfaces
demo = gr.TabbedInterface(
    [iface, search_api, stats_api],
    ["💬 Chat Demo", "🔍 Search API", "📊 Stats API"],
    title="🤖 RAGtim Bot - Hybrid Search System"
)

if __name__ == "__main__":
    print("🚀 Launching RAGtim Bot Hybrid Search System...")
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )