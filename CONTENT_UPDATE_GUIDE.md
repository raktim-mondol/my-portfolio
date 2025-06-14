# Content Update Guide

## How to Update Your Personal Information

### 1. Update Markdown Files (Recommended)

Edit the files in `/public/content/`:

#### `/public/content/about.md`
- Personal summary
- Contact information
- Professional overview

#### `/public/content/research_details.md`
- Current research projects
- Research interests
- Methodologies

#### `/public/content/publications_detailed.md`
- New publications
- Paper summaries
- Research impact

#### `/public/content/skills_expertise.md`
- New technical skills
- Tools and frameworks
- Programming languages

#### `/public/content/experience_detailed.md`
- New positions
- Responsibilities
- Achievements

#### `/public/content/statistics.md`
- Statistical methods
- Biostatistics expertise
- Research methodologies

### 2. Update Structured Content

For immediate updates, edit the structured content in:

#### Frontend: `src/utils/vectorStore.ts`
Look for the `addStructuredContent()` method and update the content arrays.

#### Backend: `server/services/vectorService.js`
Update the structured content in the `addStructuredContent()` method.

#### Hugging Face: `app.py`
Update the `knowledge_base` array in the `load_knowledge_base()` method.

### 3. Update Process

1. **Edit Content**: Update the relevant files
2. **Test Locally**: Run the development server to test changes
3. **Deploy**: Push changes to trigger redeployment

### 4. Content Guidelines

- **Be Specific**: Include specific achievements, technologies, and details
- **Use Keywords**: Include relevant technical terms for better search
- **Keep Updated**: Regular updates ensure accurate information
- **Maintain Consistency**: Ensure information is consistent across all sources

### 5. Automatic Reprocessing

When you update content:
- **Hugging Face**: Redeploy the Space to pick up changes
- **Backend Server**: Restart to reload content
- **Netlify Functions**: Redeploy to update embedded content

## Example Content Update

### Before:
```markdown
Raktim works on machine learning.
```

### After:
```markdown
Raktim specializes in Large Language Models (LLMs) with expertise in parameter-efficient fine-tuning techniques like LoRA and QLoRA. His research focuses on Retrieval-Augmented Generation (RAG) systems, multimodal AI for healthcare applications, and developing explainable AI models for breast cancer prognosis using deep learning architectures like BioFusionNet and hist2RNA.
```

The more detailed and specific your content, the better RAGtim Bot can answer questions about your expertise!