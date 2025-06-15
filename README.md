---
title: RAGtim Bot - Raktim's AI Assistant
emoji: 🤖
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: "4.15.0"
app_file: app.py
pinned: false
license: mit
---

# 🤖 RAGtim Bot - Raktim's AI Assistant

An intelligent AI assistant powered by Hugging Face Transformers that answers questions about Raktim Mondol's research, expertise, and professional background.

## 🌟 Features

- **Complete Markdown Knowledge Base**: Loads all portfolio content from markdown files
- **GPU-Accelerated Search**: Uses `sentence-transformers/all-MiniLM-L6-v2` for semantic similarity
- **Comprehensive Coverage**: Research, publications, skills, experience, education, statistics
- **API Endpoints**: Direct access to search and statistics
- **Real-time Chat**: Interactive conversational interface

## 📚 Knowledge Base

This Space loads comprehensive information from:

- **about.md** - Personal information, contact details, professional summary
- **research_details.md** - Detailed research projects, methodologies, current work
- **publications_detailed.md** - Complete publication details, technical contributions
- **skills_expertise.md** - Comprehensive technical skills, tools, frameworks
- **experience_detailed.md** - Professional experience, teaching, research roles
- **statistics.md** - Statistical methods, biostatistics expertise, methodologies

## 🔍 What You Can Ask

- Research projects and methodologies
- Publications with technical details
- Technical skills and programming expertise
- Educational background and achievements
- Professional experience and teaching roles
- Statistical methods and biostatistics applications
- Awards, recognition, and professional development
- Contact information and collaboration opportunities

## 🚀 API Usage

### Search API
```python
import requests

response = requests.post(
    "https://raktimhugging-ragtim-bot.hf.space/api/search",
    json={"query": "What is Raktim's research about?", "top_k": 5}
)
results = response.json()
```

### Stats API
```python
response = requests.get("https://raktimhugging-ragtim-bot.hf.space/api/stats")
stats = response.json()
```

## 🔧 Technical Details

- **Model**: sentence-transformers/all-MiniLM-L6-v2
- **Embedding Dimension**: 384
- **Search Type**: Semantic similarity with relevance scoring
- **Knowledge Sections**: 50+ sections across 6 markdown files
- **GPU Acceleration**: Automatic CUDA detection and usage

## 🌐 Integration

This Space can be integrated with:
- Portfolio websites for intelligent chat assistance
- Research collaboration platforms
- Academic networking tools
- Professional inquiry systems

## 📞 Contact

For questions about Raktim Mondol or collaboration opportunities:
- **Email**: r.mondol@unsw.edu.au
- **Portfolio**: [mondol.me](https://mondol.me)
- **Institution**: UNSW Sydney, School of Computer Science & Engineering

---

**Built with**: Gradio, Hugging Face Transformers, PyTorch
**Powered by**: GPU-accelerated semantic search and comprehensive markdown knowledge base