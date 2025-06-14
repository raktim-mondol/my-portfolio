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
        self.load_comprehensive_knowledge_base()
        
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
    
    def load_comprehensive_knowledge_base(self):
        """Load comprehensive knowledge base from all content sources"""
        print("Loading comprehensive knowledge base...")
        
        # Reset knowledge base
        self.knowledge_base = []
        
        # Load structured content sections
        self.load_about_content()
        self.load_education_content()
        self.load_experience_content()
        self.load_skills_content()
        self.load_research_content()
        self.load_publications_content()
        self.load_statistics_content()
        self.load_awards_content()
        
        # Generate embeddings for knowledge base
        print("Generating embeddings for comprehensive knowledge base...")
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
        
        print(f"✅ Comprehensive knowledge base loaded with {len(self.knowledge_base)} documents")
    
    def load_about_content(self):
        """Load about/personal information content"""
        about_sections = [
            {
                "id": "about_summary",
                "content": """Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is an experienced data scientist and programmer with deep expertise in artificial intelligence, generative AI (GenAI) techniques and large language models (LLMs), bioinformatics, computer vision, and high-performance computing. His research and professional background is centered on analyzing large-scale image and biomedical datasets, developing novel deep learning models, and conducting advanced statistical analyses. He is a dedicated and committed individual with a strong team-oriented spirit, a positive attitude, and exceptional interpersonal skills.""",
                "metadata": {"type": "about", "priority": 10, "section": "Summary"}
            },
            {
                "id": "contact_info",
                "content": """Raktim Mondol is located at the School of Computer Science and Engineering, Building K17, UNSW Sydney, NSW 2052, Australia. Contact information: Email: r.mondol@unsw.edu.au, Phone: +61 412 936 237. He is available for research collaboration, academic discussions, and professional opportunities.""",
                "metadata": {"type": "contact", "priority": 10, "section": "Contact Information"}
            },
            {
                "id": "professional_identity",
                "content": """Raktim Mondol identifies as a researcher, data scientist, bioinformatician, biostatistician, LLM engineer, and father. His multidisciplinary expertise spans computer science, biomedical engineering, artificial intelligence, and statistical analysis. He combines technical excellence with practical application in healthcare and biomedical research.""",
                "metadata": {"type": "about", "priority": 9, "section": "Professional Identity"}
            }
        ]
        self.knowledge_base.extend(about_sections)
    
    def load_education_content(self):
        """Load comprehensive education information"""
        education_sections = [
            {
                "id": "phd_education",
                "content": """Raktim Mondol is pursuing a PhD in Computer Science & Engineering at UNSW Sydney (2021-2025 Expected). His doctoral research focuses on "Deep Learning Based Prognosis and Explainability for Breast Cancer". The thesis has been submitted and covers novel deep learning architectures for medical image analysis, multimodal data fusion, and explainable AI for clinical decision support. His PhD work includes developing BioFusionNet, hist2RNA, and other innovative AI models for healthcare applications.""",
                "metadata": {"type": "education", "priority": 10, "section": "PhD Studies"}
            },
            {
                "id": "masters_education",
                "content": """Raktim completed his Masters by Research in Computer Science & Bioinformatics at RMIT University (2017-2019) with High Distinction (85%). His master's thesis was titled "Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations". This research laid the foundation for his expertise in applying machine learning to biomedical data analysis and cancer research. The thesis is available at: https://research-repository.rmit.edu.au/articles/thesis/Deep_learning_in_classifying_cancer_subtypes_extracting_relevant_genes_and_identifying_novel_mutations/27589272""",
                "metadata": {"type": "education", "priority": 9, "section": "Masters Degree"}
            },
            {
                "id": "undergraduate_education",
                "content": """Raktim earned his Bachelor of Science in Electrical and Electronic Engineering from BRAC University, Bangladesh (2009-2013) with High Distinction. During his undergraduate studies, he received multiple academic awards including the Vice Chancellor Award (Spring 2013) and Dean Awards (Fall 2010, Fall 2011). His undergraduate thesis focused on hardware architecture design and FPGA implementations.""",
                "metadata": {"type": "education", "priority": 8, "section": "Undergraduate Studies"}
            }
        ]
        self.knowledge_base.extend(education_sections)
    
    def load_experience_content(self):
        """Load comprehensive work experience"""
        experience_sections = [
            {
                "id": "current_unsw_position",
                "content": """Raktim Mondol has been working as a Casual Academic at UNSW Sydney since July 2021. In this role, he conducts laboratory and consultation classes for Computer Vision, Neural Networks and Deep Learning, and Artificial Intelligence courses. He provides guidance and support to students in practical sessions, assists in course material development and assessment, and mentors students in their academic journey. He has taught over 200 students across various courses and received positive feedback for clear explanations and patient guidance.""",
                "metadata": {"type": "experience", "priority": 9, "section": "Current Position"}
            },
            {
                "id": "rmit_teaching_assistant",
                "content": """Raktim served as a Teaching Assistant at RMIT University from July 2017 to October 2019. During his master's program, he conducted laboratory classes for Electronics (EEET2255), Software Engineering Design (EEET2250), Engineering Computing I (EEET2246), and Introduction to Embedded Systems (EEET2256). He assisted students with programming concepts and practical applications, contributed to course material improvements, and gained valuable experience in higher education.""",
                "metadata": {"type": "experience", "priority": 8, "section": "Teaching Assistant Role"}
            },
            {
                "id": "wub_lecturer_position",
                "content": """Raktim worked as a full-time Lecturer at World University of Bangladesh from September 2013 to December 2016. He taught theory courses including Electrical Circuit I & II, Engineering Materials, Electronics I & II, and Digital Logic Design. He also conducted laboratory classes for Microprocessor & Interfacing, Digital Electronics, and Digital Signal Processing. Additionally, he supervised students for projects and thesis work, managed course examinations and assessments, and contributed to curriculum development.""",
                "metadata": {"type": "experience", "priority": 8, "section": "Lecturer Position"}
            },
            {
                "id": "research_experience",
                "content": """Raktim has extensive research experience spanning multiple institutions. As a Doctoral Researcher at UNSW's Biomedical Image Computing Research Group (March 2021 – January 2025), he developed AI models to assist pathologists in breast cancer identification and treatment recommendation. As a Master's Researcher at RMIT's NeuroSyd Research Laboratory (March 2017 – April 2019), he worked on developing deep learning models and bioinformatics pipelines to extract biomarkers from high-throughput biological data.""",
                "metadata": {"type": "experience", "priority": 9, "section": "Research Experience"}
            }
        ]
        self.knowledge_base.extend(experience_sections)
    
    def load_skills_content(self):
        """Load comprehensive technical skills"""
        skills_sections = [
            {
                "id": "llm_generative_ai",
                "content": """Raktim has extensive expertise in Large Language Models and Generative AI, including Hugging Face Transformers, parameter-efficient fine-tuning techniques like LoRA and QLoRA (PEFT), LangChain for building LLM applications, OpenAI API and Gemini Pro integration, model quantization with GPTQ and GGUF, advanced prompt engineering techniques, Agent Development Kit for building autonomous agents, and comprehensive RAG (Retrieval-Augmented Generation) pipeline development.""",
                "metadata": {"type": "skills", "priority": 10, "section": "LLM & Generative AI"}
            },
            {
                "id": "vector_search_retrieval",
                "content": """He is skilled in vector search and retrieval technologies including FAISS for efficient similarity search and index optimization, BM25 and Elasticsearch for keyword-based search, ChromaDB and Weaviate for vector databases, and Milvus for scalable vector database management. He has experience with dense retrieval using bi-encoder architectures, sparse retrieval with BM25 and TF-IDF, hybrid search combining dense and sparse methods, and re-ranking with cross-encoder models.""",
                "metadata": {"type": "skills", "priority": 9, "section": "Vector Search & Retrieval"}
            },
            {
                "id": "multimodal_cv_nlp",
                "content": """Raktim's multimodal AI and computer vision skills include working with vision-language models like CLIP, BLIP, LLaVA, and DALL-E, using Segment Anything Model (SAM) for image segmentation, developing Visual Question Answering systems, and building multimodal transformers. He has experience with convolutional networks (ResNet, DenseNet, EfficientNet, Vision Transformers), object detection (YOLO, R-CNN family, DETR), and medical imaging specialized architectures for histopathology and radiology.""",
                "metadata": {"type": "skills", "priority": 9, "section": "Multimodal & Computer Vision"}
            },
            {
                "id": "programming_languages",
                "content": """Programming languages expertise includes advanced proficiency in Python for scientific computing and web development, R for statistical analysis and bioinformatics packages, SQL for database design and query optimization, LaTeX for technical writing and documentation, and JavaScript/TypeScript for web development. He also has experience with Bash/Shell scripting for system administration and automation.""",
                "metadata": {"type": "skills", "priority": 8, "section": "Programming Languages"}
            },
            {
                "id": "deep_learning_frameworks",
                "content": """Deep learning expertise includes advanced proficiency in PyTorch for model development, custom layers, and distributed training, TensorFlow 2.x with Keras and TensorFlow Serving, scikit-learn for classical ML algorithms and model evaluation, and experience with transfer learning, attention mechanisms, adversarial training, multi-task learning, and meta-learning approaches.""",
                "metadata": {"type": "skills", "priority": 8, "section": "Deep Learning Frameworks"}
            },
            {
                "id": "cloud_computing_mlops",
                "content": """Cloud computing and MLOps skills include experience with AWS (EC2, S3, SageMaker, Lambda, ECS), Google Cloud (Compute Engine, Cloud Storage, Vertex AI), Azure services, MLflow and DVC for model versioning, Docker and Kubernetes for containerization, GitHub Actions and Jenkins for CI/CD, and distributed computing with Spark and Dask.""",
                "metadata": {"type": "skills", "priority": 7, "section": "Cloud Computing & MLOps"}
            },
            {
                "id": "bioinformatics_computational_biology",
                "content": """Bioinformatics expertise includes sequence analysis with alignment algorithms and variant calling, gene expression analysis with RNA-seq and differential expression, pathway analysis and network biology, protein structure prediction and folding analysis, mass spectrometry data processing, and multi-omics integration for systems biology applications.""",
                "metadata": {"type": "skills", "priority": 8, "section": "Bioinformatics"}
            }
        ]
        self.knowledge_base.extend(skills_sections)
    
    def load_research_content(self):
        """Load comprehensive research information"""
        research_sections = [
            {
                "id": "llm_research_detailed",
                "content": """Raktim's research on Large Language Models (LLMs) focuses on training, fine-tuning, and evaluating LLMs using parameter-efficient techniques such as LoRA (Low-Rank Adaptation), QLoRA (Quantized LoRA), AdaLoRA, and Prefix tuning. His applications include retrieval-augmented generation (RAG), text summarization, multi-hop reasoning, and instruction tuning. He works on model optimization through pruning, distillation, and efficient architectures, as well as prompt engineering with chain-of-thought and few-shot prompting techniques.""",
                "metadata": {"type": "research", "priority": 10, "section": "LLM Research"}
            },
            {
                "id": "agentic_ai_research",
                "content": """His research in Agentic AI and Multi-Agent Systems involves designing and developing autonomous, tool-using agents capable of reasoning, planning, and collaborating across complex tasks. He uses frameworks like the Agent Development Kit (ADK) for applications including document QA, decision-making, and pipeline orchestration. His work focuses on creating agents that can interact with multiple tools and APIs to solve complex, multi-step problems.""",
                "metadata": {"type": "research", "priority": 10, "section": "Agentic AI"}
            },
            {
                "id": "rag_research_detailed",
                "content": """Raktim's Retrieval-Augmented Generation (RAG) research involves building hybrid search and generation pipelines that integrate semantic and keyword-based retrieval methods. He works with vector databases like FAISS, ChromaDB, and Weaviate, implements BM25 for keyword search, and develops fusion strategies for combining different retrieval methods. His RAG systems are designed for grounded language understanding, document synthesis, and knowledge-intensive tasks.""",
                "metadata": {"type": "research", "priority": 10, "section": "RAG Research"}
            },
            {
                "id": "phd_research_focus",
                "content": """His PhD research on 'Deep Learning Based Prognosis and Explainability for Breast Cancer' aims to develop novel deep learning architectures for breast cancer survival prediction, create explainable AI models that clinicians can trust and understand, integrate multimodal data (histopathology images, genomics, clinical data), and build treatment recommendation systems based on patient-specific factors. Key innovations include BioFusionNet, hist2RNA, and AFExNet architectures.""",
                "metadata": {"type": "research", "priority": 10, "section": "PhD Research"}
            },
            {
                "id": "multimodal_ai_research",
                "content": """His multimodal AI research focuses on vision-language models like CLIP, BLIP, and LLaVA, fusion strategies including early fusion, late fusion, and attention-based fusion, cross-modal retrieval for image-text matching and semantic search, and multimodal generation for text-to-image and image captioning applications. He works on integrating heterogeneous data types including images, text, and tabular data.""",
                "metadata": {"type": "research", "priority": 9, "section": "Multimodal AI"}
            },
            {
                "id": "explainable_ai_research",
                "content": """Raktim's explainable AI research focuses on creating transparent and interpretable AI systems that provide clear explanations for their decisions and predictions. He works on attention visualization techniques, counterfactual explanations, feature importance analysis, and clinical decision support systems. His goal is to build AI systems that clinicians can trust and understand for medical applications.""",
                "metadata": {"type": "research", "priority": 9, "section": "Explainable AI"}
            }
        ]
        self.knowledge_base.extend(research_sections)
    
    def load_publications_content(self):
        """Load comprehensive publications information"""
        publications_sections = [
            {
                "id": "biofusionnet_detailed",
                "content": """BioFusionNet: Deep Learning-Based Survival Risk Stratification in ER+ Breast Cancer Through Multifeature and Multimodal Data Fusion, published in IEEE Journal of Biomedical and Health Informatics (2024). This work presents a novel multimodal fusion architecture combining histopathology images, genomics, and clinical data with attention-based feature selection for interpretability. The model achieved superior performance with a C-index of 0.78 on validation datasets and provides clinicians with a comprehensive tool for patient risk assessment, enabling personalized treatment planning. GitHub: https://github.com/raktim-mondol/BioFusionNet""",
                "metadata": {"type": "publications", "priority": 10, "section": "BioFusionNet"}
            },
            {
                "id": "hist2rna_detailed",
                "content": """hist2RNA: An Efficient Deep Learning Architecture to Predict Gene Expression from Breast Cancer Histopathology Images, published in Cancers journal (2023). This work enables direct prediction of gene expression from tissue images using a custom CNN architecture optimized for gene expression prediction. The model uses multi-task learning framework and attention mechanisms for spatial feature importance, with validation across multiple cancer datasets. This enables gene expression profiling without expensive molecular assays, making personalized medicine more accessible. GitHub: https://github.com/raktim-mondol/hist2RNA""",
                "metadata": {"type": "publications", "priority": 10, "section": "hist2RNA"}
            },
            {
                "id": "afexnet_detailed",
                "content": """AFExNet: An Adversarial Autoencoder for Differentiating Breast Cancer Sub-types and Extracting Biologically Relevant Genes, published in IEEE/ACM Transactions on Computational Biology and Bioinformatics (2021). This work uses adversarial training for robust feature learning, automatic biomarker discovery, and cancer subtype classification with biologically interpretable features. The model employs an adversarial autoencoder architecture with gene selection based on reconstruction importance, validated on TCGA datasets with pathway enrichment analysis. GitHub: https://github.com/raktim-mondol/breast-cancer-sub-types""",
                "metadata": {"type": "publications", "priority": 10, "section": "AFExNet"}
            },
            {
                "id": "conference_publications",
                "content": """Conference publications include: MM-Survnet: Deep Learning-Based Survival Risk Stratification in Breast Cancer Through Multimodal Data Fusion (IEEE ISBI 2024), Hardware architecture design of anemia detecting regression model based on FPGA (ICIEV 2014), FPGA based leaf chlorophyll estimating regression model (SKIMA 2014), Hardware architecture design of face recognition system based on FPGA (ICIIECS 2015), and Computer network design of a company — A simplistic way (ICACCS 2015).""",
                "metadata": {"type": "publications", "priority": 8, "section": "Conference Papers"}
            },
            {
                "id": "ongoing_research_publications",
                "content": """Ongoing research includes work on multimodal foundation models for medical imaging, pre-training on large-scale medical datasets, transfer learning for rare diseases, AI ethics in healthcare with bias detection and mitigation, fairness in medical AI, and regulatory compliance frameworks. He is also developing large language models for healthcare applications and conversational AI for patient education.""",
                "metadata": {"type": "research", "priority": 8, "section": "Ongoing Research"}
            }
        ]
        self.knowledge_base.extend(publications_sections)
    
    def load_statistics_content(self):
        """Load comprehensive statistical expertise"""
        statistics_sections = [
            {
                "id": "biostatistics_overview",
                "content": """Raktim Mondol demonstrates exceptional proficiency in advanced statistical methods and machine learning techniques, with particular expertise in biomedical data analysis, survival modeling, and multimodal data fusion. His research contributions span multiple domains of statistical application, showcasing both theoretical innovation and practical implementation excellence in biostatistics.""",
                "metadata": {"type": "statistics", "priority": 10, "section": "Statistical Expertise Overview"}
            },
            {
                "id": "survival_analysis_expertise",
                "content": """Raktim has developed sophisticated expertise in survival analysis, particularly through his implementation of weighted Cox proportional hazards models with custom loss functions specifically designed for imbalanced survival data. His BioFusionNet work achieved a mean concordance index of 0.77 and time-dependent area under the curve of 0.84, demonstrating superior predictive performance with hazard ratios showing statistical significance (HR: 2.99, 95% CI: 1.88-4.78, p < 0.005). He uses Kaplan-Meier estimation, log-rank tests, and both univariate and multivariate Cox models.""",
                "metadata": {"type": "statistics", "priority": 10, "section": "Survival Analysis"}
            },
            {
                "id": "machine_learning_statistics",
                "content": """His deep learning expertise includes three major architectural innovations: AFExNet (adversarial autoencoder for genomic data), BioFusionNet (multimodal fusion framework), and hist2RNA (gene expression prediction). These demonstrate advanced statistical validation methodologies including comprehensive evaluation across multiple algorithms, cross-validation frameworks, and external validation on independent datasets. He employs paired t-tests, ANOVA, correlation analysis with FDR correction, and comprehensive model benchmarking.""",
                "metadata": {"type": "statistics", "priority": 9, "section": "Machine Learning Statistics"}
            },
            {
                "id": "regression_methodologies",
                "content": """Raktim employs comprehensive evaluation methodology across multiple algorithms including Support Vector Machines, Random Forest, XGBoost, Gradient Boosting, and Neural Networks. His regression analysis expertise encompasses multivariate regression modeling, Cox proportional hazards regression with custom implementations, multinomial logistic regression for multi-class classification problems, and polynomial regression with interaction terms for hardware implementations.""",
                "metadata": {"type": "statistics", "priority": 9, "section": "Regression Methodologies"}
            },
            {
                "id": "hypothesis_testing",
                "content": """His hypothesis testing expertise includes paired and one-tailed t-tests for comparing model performance, ANOVA for multi-group comparisons, Spearman rank correlation with Benjamini-Hochberg FDR adjustment for multiple testing correction, and comprehensive statistical validation of machine learning models. He has experience with both parametric and non-parametric statistical tests depending on data distribution and research requirements.""",
                "metadata": {"type": "statistics", "priority": 8, "section": "Hypothesis Testing"}
            }
        ]
        self.knowledge_base.extend(statistics_sections)
    
    def load_awards_content(self):
        """Load awards and recognition information"""
        awards_sections = [
            {
                "id": "recent_awards",
                "content": """Recent awards include the Doctoral Research Scholarship (Tuition Fee and Stipend) from UNSW Sydney awarded in 2021 for pursuing PhD research studies in Computer Science & Engineering. In 2019, he completed his Masters by Research with High Distinction (85%) at RMIT University, demonstrating outstanding academic performance in Computer Science & Bioinformatics.""",
                "metadata": {"type": "awards", "priority": 8, "section": "Recent Awards"}
            },
            {
                "id": "rmit_scholarships",
                "content": """In 2017, Raktim was awarded both the RMIT Research Stipend Scholarship and the RMIT Research International Tuition Fee Scholarship, recognizing his potential for research excellence and supporting his master's degree studies in Computer Science & Bioinformatics at RMIT University.""",
                "metadata": {"type": "awards", "priority": 7, "section": "RMIT Scholarships"}
            },
            {
                "id": "undergraduate_awards",
                "content": """During his undergraduate studies at BRAC University, Raktim received multiple prestigious awards: B.Sc. in Electrical and Electronic Engineering with High Distinction (2013), Vice Chancellor Award for Spring 2013 recognizing outstanding academic performance, and Dean Awards for Fall 2010 and Fall 2011 for academic excellence. These awards demonstrate consistent high-level academic achievement throughout his undergraduate career.""",
                "metadata": {"type": "awards", "priority": 7, "section": "Undergraduate Awards"}
            },
            {
                "id": "professional_events",
                "content": """Raktim has participated in numerous professional development events including training on NGS RNA Seq. & DNA Seq. Data Analysis organized by ArrayGen (2019), presenting a poster at AMSI BioinfoSummer at Monash University (2017), presenting his thesis in the 3 Minute Thesis (3MT) competition at RMIT University (2017), receiving training on High Performance Computing (HPC) at Monash University (2017), and presenting his undergraduate thesis at a workshop organized by IEEE Bangladesh (2013).""",
                "metadata": {"type": "awards", "priority": 6, "section": "Professional Events"}
            }
        ]
        self.knowledge_base.extend(awards_sections)
    
    def cosine_similarity(self, a, b):
        """Calculate cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def search_knowledge_base(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search the comprehensive knowledge base using semantic similarity"""
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
print("Initializing RAGtim Bot with comprehensive knowledge base...")
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
    for doc in bot.knowledge_base:
        doc_type = doc["metadata"]["type"]
        doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
    
    return {
        "total_documents": len(bot.knowledge_base),
        "document_types": doc_types,
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_dimension": 384,
        "search_capabilities": ["Semantic Search", "GPU Accelerated", "Transformer Embeddings", "Comprehensive Knowledge Base"],
        "backend_type": "Hugging Face Space",
        "knowledge_sources": [
            "About & Contact Information",
            "Education (PhD, Masters, Undergraduate)",
            "Professional Experience (UNSW, RMIT, WUB)",
            "Technical Skills (LLM, AI, Programming)",
            "Research Areas (LLM, RAG, Multimodal AI)",
            "Publications (BioFusionNet, hist2RNA, AFExNet)",
            "Statistical Expertise & Biostatistics",
            "Awards & Professional Recognition"
        ]
    }

def chat_interface(message, history):
    """Enhanced chat interface with comprehensive knowledge"""
    if not message.strip():
        return "Please ask me something about Raktim Mondol! I have comprehensive information about his research, publications, skills, experience, education, and more."
    
    try:
        # Search comprehensive knowledge base
        search_results = bot.search_knowledge_base(message, top_k=6)
        
        if search_results:
            # Build comprehensive response
            response_parts = []
            response_parts.append(f"Based on my comprehensive knowledge base (found {len(search_results)} relevant sections):\n")
            
            # Use the best match as primary response
            best_match = search_results[0]
            response_parts.append(f"**Primary Answer** (Relevance: {best_match['score']:.2f}):")
            response_parts.append(f"{best_match['content']}\n")
            
            # Add additional context if available
            if len(search_results) > 1:
                response_parts.append("**Additional Context:**")
                for i, result in enumerate(search_results[1:3], 1):  # Show up to 2 additional results
                    section_info = result['metadata'].get('section', result['metadata']['type'])
                    response_parts.append(f"{i}. {section_info} (Relevance: {result['score']:.2f})")
                    # Add a brief excerpt
                    excerpt = result['content'][:200] + "..." if len(result['content']) > 200 else result['content']
                    response_parts.append(f"   {excerpt}\n")
            
            response_parts.append("\n[Note: In hybrid mode, DeepSeek LLM generates more natural responses using this comprehensive context]")
            
            return "\n".join(response_parts)
        else:
            return "I don't have specific information about that topic. Could you please ask something else about Raktim Mondol's research, experience, skills, education, or publications?"
        
    except Exception as e:
        print(f"Error in chat interface: {e}")
        return "I'm sorry, I encountered an error while processing your question. Please try again."

# Create Gradio interface
print("Creating comprehensive Gradio interface...")

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
    title="🤖 RAGtim Bot - Comprehensive Knowledge System",
    description=f"""
    **Comprehensive RAG System**: This Hugging Face Space provides GPU-accelerated semantic search across Raktim Mondol's complete portfolio with **{len(bot.knowledge_base)} knowledge sections**.
    
    **Knowledge Coverage:**
    - 🎓 **Education**: PhD research, Masters thesis, undergraduate achievements
    - 💼 **Experience**: UNSW, RMIT, WUB positions and research roles
    - 🔬 **Research**: LLMs, RAG, Multimodal AI, Explainable AI, Healthcare AI
    - 📚 **Publications**: BioFusionNet, hist2RNA, AFExNet with detailed analysis
    - 💻 **Skills**: Programming, AI/ML frameworks, cloud computing, bioinformatics
    - 📊 **Statistics**: Biostatistics, survival analysis, hypothesis testing
    - 🏆 **Awards**: Scholarships, academic recognition, professional achievements
    - 📞 **Contact**: Professional contact information and collaboration opportunities
    
    **Search Capabilities:**
    - 🔍 Semantic similarity search using transformers
    - 🚀 GPU-accelerated embeddings with priority ranking
    - 📊 Relevance scoring and multi-source context
    - 🎯 Context-aware retrieval across all knowledge domains
    
    **API Endpoints:**
    - `/api/search` - Search across comprehensive knowledge base
    - `/api/stats` - Detailed knowledge base statistics
    
    **Ask me anything about Raktim Mondol:**
    - Research projects, methodologies, and innovations
    - Publications with technical details and impact
    - Technical skills, programming expertise, and tools
    - Educational background and academic achievements
    - Professional experience and teaching roles
    - Statistical methods and biostatistics applications
    - Awards, recognition, and professional development
    - Contact information and collaboration opportunities
    
    **Note**: This demo shows comprehensive search results. In hybrid mode, these results are passed to DeepSeek LLM for natural response generation.
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
    outputs=gr.JSON(label="Comprehensive Search Results"),
    title="🔍 Comprehensive Search API",
    description="Direct access to the comprehensive semantic search functionality across all knowledge domains"
)

stats_api = gr.Interface(
    fn=get_stats_api,
    inputs=[],
    outputs=gr.JSON(label="Comprehensive Knowledge Base Statistics"),
    title="📊 Knowledge Base Stats",
    description="Detailed statistics about the comprehensive knowledge base covering all aspects of Raktim's expertise"
)

# Combine interfaces
demo = gr.TabbedInterface(
    [iface, search_api, stats_api],
    ["💬 Comprehensive Chat", "🔍 Search API", "📊 Stats API"],
    title="🤖 RAGtim Bot - Comprehensive Knowledge System"
)

if __name__ == "__main__":
    print("🚀 Launching RAGtim Bot Comprehensive Knowledge System...")
    print(f"📚 Loaded {len(bot.knowledge_base)} comprehensive knowledge sections")
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )