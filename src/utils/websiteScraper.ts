// Website content scraper for RAG
export interface ScrapedContent {
  section: string;
  content: string;
  metadata?: {
    type: 'education' | 'experience' | 'skills' | 'research' | 'publications' | 'awards' | 'contact' | 'about';
    priority: number;
  };
}

export class WebsiteScraper {
  private static instance: WebsiteScraper;
  private scrapedContent: ScrapedContent[] = [];

  private constructor() {
    this.scrapeWebsiteContent();
  }

  public static getInstance(): WebsiteScraper {
    if (!WebsiteScraper.instance) {
      WebsiteScraper.instance = new WebsiteScraper();
    }
    return WebsiteScraper.instance;
  }

  private scrapeWebsiteContent(): void {
    // About/Hero section
    this.scrapedContent.push({
      section: 'About',
      content: `Raktim Mondol is a PhD candidate in Computer Science & Engineering at UNSW Sydney. He is a researcher, data scientist, bioinformatician, LLM engineer, and father. His research focuses on deep learning-based prognosis and explainability for breast cancer. He is located at the School of Computer Science and Engineering, Building K17, UNSW Sydney, NSW 2052. Contact: r.mondol@unsw.edu.au, Phone: +61 412 936 237.`,
      metadata: { type: 'about', priority: 10 }
    });

    // Education
    this.scrapedContent.push({
      section: 'Education',
      content: `Raktim Mondol is pursuing a PhD in Computer Science & Engineering at UNSW Sydney (2021-2025 Expected). His thesis is on "Deep Learning Based Prognosis and Explainability for Breast Cancer". He completed his MS by Research in Computer Science & Bioinformatics at RMIT University (2017-2019) with High Distinction. His master's thesis was "Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations". He has a Bachelor's degree in Electrical and Electronic Engineering from BRAC University (2013) with High Distinction.`,
      metadata: { type: 'education', priority: 9 }
    });

    // Experience
    this.scrapedContent.push({
      section: 'Experience',
      content: `Raktim Mondol has been working as a Casual Academic at UNSW since July 2021, conducting laboratory and tutorial classes, providing guidance to students, and assisting in course material development. Previously, he was a Teaching Assistant at RMIT University (July 2017 - Oct 2019), conducting laboratory and tutorial classes and assisting students with programming concepts. He also worked as a Lecturer at World University of Bangladesh (Sep 2013 - Dec 2016), conducting lectures and laboratory works, supervising student projects and thesis, and managing course examinations.`,
      metadata: { type: 'experience', priority: 8 }
    });

    // Skills
    this.scrapedContent.push({
      section: 'Technical Skills',
      content: `Raktim Mondol has expertise in Generative AI & LLM Toolkits including Hugging Face Transformers, LoRA/QLoRA (PEFT), LangChain, OpenAI API/Gemini Pro, GPTQ/GGUF, Prompt Engineering, Agent Development Kit, and RAG Pipelines. He is skilled in Vector Search & Retrieval using FAISS, BM25/Elasticsearch, ChromaDB/Weaviate, and Milvus. His multimodal & CV + NLP skills include CLIP/BLIP/LLaVA, Segment Anything (SAM), Visual Question Answering, and Multimodal Transformers. Programming languages: R, Python, SQL, LaTeX. Deep Learning Frameworks: PyTorch, TensorFlow. Cloud Computing: AWS, GCP, Galaxy. Development tools: Git, Jupyter Notebook, RStudio, Spyder. Statistical Analysis: Stata, SPSS.`,
      metadata: { type: 'skills', priority: 7 }
    });

    // Research Areas
    this.scrapedContent.push({
      section: 'Research Areas',
      content: `Raktim Mondol's research focuses on Large Language Models (LLMs) including training, fine-tuning, and evaluating LLMs using parameter-efficient techniques like LoRA and QLoRA, with applications in retrieval-augmented generation, summarisation, and multi-hop reasoning. He works on Agentic AI & Multi-Agent Systems, designing autonomous, tool-using agents for reasoning, planning, and collaboration. His expertise includes Retrieval-Augmented Generation (RAG), building hybrid search and generation pipelines. Other research areas include Bioinformatics, Explainable AI, Multimodal Analysis, Computer Vision, Natural Language Processing, and Treatment Recommendation Systems.`,
      metadata: { type: 'research', priority: 9 }
    });

    // Publications
    this.scrapedContent.push({
      section: 'Publications',
      content: `Raktim Mondol has published several peer-reviewed papers: 1) "BioFusionNet: Deep Learning-Based Survival Risk Stratification in ER+ Breast Cancer Through Multifeature and Multimodal Data Fusion" in IEEE Journal of Biomedical and Health Informatics (2024). 2) "hist2RNA: An Efficient Deep Learning Architecture to Predict Gene Expression from Breast Cancer Histopathology Images" in Cancers journal (2023). 3) "AFExNet: An Adversarial Autoencoder for Differentiating Breast Cancer Sub-types and Extracting Biologically Relevant Genes" in IEEE/ACM Transactions on Computational Biology and Bioinformatics (2021). All papers have associated code repositories on GitHub and audio summaries available.`,
      metadata: { type: 'publications', priority: 8 }
    });

    // Awards
    this.scrapedContent.push({
      section: 'Awards & Honors',
      content: `Raktim Mondol has received several awards: Doctoral Research Scholarship from UNSW Sydney (2021), Masters by Research with High Distinction from RMIT University (2019), RMIT Research Scholarships including Research Stipend Scholarship and International Tuition Fee Scholarship (2017), B.Sc. with High Distinction from BRAC University (2013), Vice Chancellor Award from BRAC University (2013), and Dean Awards from BRAC University (2010-2011) for academic excellence.`,
      metadata: { type: 'awards', priority: 6 }
    });
  }

  public getContent(): ScrapedContent[] {
    return this.scrapedContent;
  }

  public searchContent(query: string): ScrapedContent[] {
    const lowercaseQuery = query.toLowerCase();
    return this.scrapedContent
      .filter(content => 
        content.content.toLowerCase().includes(lowercaseQuery) ||
        content.section.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => (b.metadata?.priority || 0) - (a.metadata?.priority || 0));
  }
}