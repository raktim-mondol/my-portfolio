import React, { useState, useEffect } from 'react';
import { Feather, Calendar, Tag, ArrowRight, Search, ArrowLeft, Mail, MapPin, Phone, Home } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '12847',
    title: 'The Future of Agentic AI in Healthcare',
    excerpt: 'Exploring how autonomous AI agents can revolutionize patient care and clinical decision-making systems.',
    content: `I still remember the moment when it hit me—the real potential of agentic AI in healthcare. I was sitting in a research meeting at UNSW, reviewing a particularly complex case of cancer genomics data, and we were drowning in information. Multiple specialists, countless data points, conflicting treatment options. That's when I thought: what if we had an AI agent that could autonomously navigate this complexity, not to replace clinicians, but to augment their decision-making process?

The intersection of agentic AI and healthcare is where I believe we're about to witness something truly transformative. Unlike traditional AI systems that simply respond to queries, agentic AI possesses the ability to reason, plan, and execute complex multi-step tasks autonomously. Think of it as having a tireless research assistant who never sleeps, can process thousands of medical papers in seconds, and continuously learns from every interaction.

What makes agentic AI different?

In my work developing AI systems for healthcare applications, I've come to appreciate what sets agentic systems apart. Traditional AI is reactive—you ask a question, it gives an answer. Agentic AI is proactive. It can break down complex clinical scenarios into manageable subtasks, gather relevant information from multiple sources, reason about uncertainties, and even adapt its approach when initial strategies don't work.

During my time working on bioinformatics projects, I've seen firsthand how overwhelming the data can be. A single patient's genomic profile might contain millions of variants. Clinical literature adds thousands of new papers every day. No human, no matter how brilliant, can keep track of it all. But an agentic AI system? It thrives in this environment.

Real-world applications I'm excited about

Multi-agent clinical decision support is perhaps the most promising area. Imagine a team of specialized AI agents, each expert in different domains—one focused on radiology interpretation, another on genomic analysis, a third on drug interactions, and so on. These agents communicate with each other, share insights, and collectively present a comprehensive analysis to the human clinician.

I've been prototyping similar systems in my research, and the results are genuinely exciting. In one pilot project analyzing complex cancer cases, a multi-agent system was able to identify treatment options that individual specialists had missed, simply because it could synthesize information across domains that humans typically compartmentalize.

The integration challenge

Here's the hard truth though—integrating these systems with existing healthcare infrastructure is incredibly challenging. I've learned this the hard way. Healthcare IT systems are often decades old, built on proprietary standards, and notoriously difficult to work with. But this is where my background in both computer science and biostatistics becomes invaluable. You need to understand not just the AI, but also the clinical workflows, the regulatory requirements, and the practical realities of healthcare delivery.

One approach I've found promising is building agentic systems as middleware—they sit between existing systems and end-users, aggregating data, making sense of it, and presenting actionable insights without requiring massive infrastructure overhauls.

The ethics keep me up at night

Let me be completely honest: the ethical considerations of agentic AI in healthcare are complex and sometimes troubling. Patient privacy is paramount. When you have autonomous agents accessing and processing sensitive medical data, the potential for breaches or misuse is real. In my work, I've become almost obsessive about privacy-preserving techniques—federated learning, differential privacy, secure multi-party computation. These aren't just buzzwords; they're essential safeguards.

There's also the question of accountability. When an AI agent makes a recommendation that influences treatment, and something goes wrong, who's responsible? The developer? The hospital? The clinician who followed the recommendation? These are questions we need to answer before widespread deployment.

Looking ahead

The future I envision is one of true human-AI collaboration in healthcare. Not AI replacing doctors, but AI handling the cognitive load that currently overwhelms them. AI agents could monitor patients continuously, flag concerning trends before they become emergencies, synthesize the latest research, and free clinicians to do what they do best—connect with patients, apply nuanced judgment, and make the final decisions.

We're already seeing glimpses of this future. AI agents are being deployed for drug discovery, identifying potential compounds in weeks that would have taken years. They're optimizing treatment regimens for cancer patients based on real-time response data. They're even assisting in surgical planning, simulating different approaches and predicting outcomes.

As someone who bridges the gap between AI research and biomedical applications, I feel a profound responsibility to ensure we build these systems thoughtfully, ethically, and with patient wellbeing as the absolute priority. The technology is powerful, perhaps more powerful than anything we've developed before in healthcare. We need to wield it wisely.`,
    date: '2025-11-15',
    category: 'Research',
    tags: ['AI', 'Healthcare', 'Agentic AI'],
    readTime: '12 min read'
  },
  {
    id: '38291',
    title: 'Rethinking RAG: Beyond Vector Similarity',
    excerpt: 'A deep dive into advanced Retrieval-Augmented Generation techniques that go beyond traditional vector search.',
    content: `I've been working with RAG systems for the past two years, and I have a confession to make: when I first started, I thought vector similarity search was the answer to everything. Build good embeddings, use cosine similarity, retrieve the top-k results, and voilà—you have a functioning RAG system. Boy, was I wrong.

The wake-up call came when I was building a RAG system for biomedical research queries. Users would ask complex questions like "What are the molecular mechanisms linking diabetes and Alzheimer's disease?" The system would return documents that mentioned both conditions but completely missed the causal pathways, the biochemical connections, the actual mechanisms the user was asking about. The retrieved documents were semantically similar at a surface level, but contextually? They were missing the mark entirely.

That's when I realized: we've been thinking about RAG too narrowly.

The limitations of pure vector search

Here's the thing about vector embeddings—they're amazing at capturing semantic similarity, but they struggle with several critical aspects of information retrieval. Exact keyword matches? Often missed if the embedding space deems them semantically less important. Rare technical terms? They might get overshadowed by more common vocabulary. Multi-hop reasoning where you need to connect information from different documents? Good luck with that using just similarity scores.

I experienced this firsthand when building a research assistant for our genomics lab. A researcher asked about "CRISPR off-target effects in hematopoietic stem cells." The pure vector search returned general CRISPR papers and general stem cell papers, but missed the specific intersection we needed. The information was there in our database, but our retrieval strategy couldn't find it.

Hybrid search: the best of both worlds

This led me down the path of hybrid search—combining dense retrieval (vector embeddings) with sparse retrieval (traditional keyword-based methods like BM25). The results were transformative. Suddenly, we could capture both semantic understanding and precise keyword matching.

In practice, I implement this as a two-stage process. First, I use BM25 to get a candidate set based on keyword relevance. Then, I use vector similarity to rerank these candidates based on semantic meaning. But here's the trick I've learned: the weighting between these two methods needs to be adaptive. Technical queries with specific terminology? Weight BM25 higher. Conceptual questions? Give more weight to vector similarity.

I've also experimented with learned fusion—using a small neural network to optimally combine the scores from different retrieval methods based on query characteristics. The improvement in retrieval quality was substantial, especially for domain-specific applications.

Contextual chunking and reranking

Another lesson I learned the hard way: how you chunk your documents matters enormously. Early on, I was doing simple fixed-size chunking—split documents every 512 tokens and call it a day. This led to chunks that would cut off mid-sentence, mid-paragraph, sometimes mid-thought.

Now, I use contextual chunking. I analyze document structure, respect paragraph and section boundaries, and most importantly, I add context to each chunk. Each chunk gets a header that includes the document title, section headings, and even a brief summary of what comes before and after. This context dramatically improves both embedding quality and LLM comprehension.

For reranking, I've moved beyond simple similarity scores to use cross-encoders—models specifically trained to score query-document pairs. The computational cost is higher, but the improvement in relevance is worth it. In our biomedical RAG system, reranking with a domain-specific cross-encoder improved answer quality by what users estimated as 40-50%.

Query decomposition: breaking down complexity

Complex queries need to be broken down. When someone asks, "How have treatment protocols for Stage III lung cancer evolved over the past decade, and what role has genomic profiling played in this evolution?" you can't just throw that at a vector search and expect good results.

I've implemented a query decomposition layer that uses an LLM to break complex questions into sub-questions:

What were the treatment protocols for Stage III lung cancer a decade ago?

What are current treatment protocols for Stage III lung cancer?

How is genomic profiling used in lung cancer treatment?

How has genomic profiling influenced treatment decisions over time?

Each sub-question gets its own retrieval, and then the system synthesizes information across all retrieved documents. The difference in answer quality is night and day.

Adaptive retrieval strategies

Not all queries are created equal. A simple factual question ("What is the half-life of metformin?") needs a different retrieval strategy than a complex analytical question ("Compare the efficacy and safety profiles of SGLT2 inhibitors versus GLP-1 agonists for Type 2 diabetes management").

I've built a query classifier that categorizes incoming questions and adapts the retrieval strategy accordingly:

Factual queries: Use sparse retrieval, low k value, focus on precision

Comparative queries: Use hybrid search, higher k value, retrieve from multiple categories

Exploratory queries: Use vector search, high k value, accept lower precision for higher recall

Analytical queries: Use query decomposition, multi-hop reasoning, reranking

This adaptive approach has made our RAG system feel genuinely intelligent rather than mechanically returning the most similar documents.

The road ahead

I'm currently exploring even more advanced techniques. Graph-based retrieval that captures relationships between concepts. Iterative retrieval where the system can make multiple retrieval calls, learning from each iteration. Retrieval with uncertainty quantification, so the system knows when it doesn't have enough information and needs to look deeper.

What I've learned through all this experimentation is that RAG is not a solved problem. Vector similarity was just the beginning. The real power comes from combining multiple techniques, adapting to query characteristics, and deeply understanding your domain and user needs.

Building effective RAG systems is as much art as it is science. It requires understanding not just the technology, but also how people think, how they ask questions, and what they really need when they come to your system looking for answers.`,
    date: '2025-11-10',
    category: 'Research',
    tags: ['RAG', 'LLMs', 'Vector Search'],
    readTime: '14 min read'
  },
  {
    id: '56473',
    title: 'Explainable AI in Genomics: Bridging the Gap',
    excerpt: 'How interpretable machine learning models can help researchers understand complex genomic patterns.',
    content: `There's a moment that every computational biologist dreads: you've built this incredibly accurate machine learning model, it's predicting outcomes with 95% accuracy, and then a wet-lab scientist asks you, "But why did the model make that prediction?" And you're standing there with your neural network that has millions of parameters, and all you can say is... "Well, it's complicated."

I've been in that situation more times than I care to admit. And let me tell you, "it's complicated" doesn't cut it when you're trying to identify potential therapeutic targets or understand disease mechanisms. In genomics research, we don't just need predictions—we need understanding.

The black box problem in genomics

Genomics is drowning in data. A single whole-genome sequencing run generates billions of data points. Traditional statistical methods can't handle this complexity, which is why machine learning has become indispensable. But here's the rub: the models that work best—deep neural networks, gradient boosted trees with hundreds of estimators—are often the least interpretable.

I learned this lesson working on a cancer subtype classification project. We built a deep learning model that could predict cancer subtypes from gene expression data with remarkable accuracy. The oncologists were impressed until they started asking questions: "Which genes are driving this classification? What biological pathways are involved? Can we use this to identify drug targets?"

I had no good answers. The model was a black box, and in biological research, black boxes don't advance understanding—they just shift the mystery from one place to another.

SHAP values: my gateway to interpretability

My journey into explainable AI started with SHAP (SHapley Additive exPlanations). The first time I applied SHAP to a genomics model, it was genuinely eye-opening. Suddenly, I could see which features—which genes, which variants—were contributing to each prediction, and by how much.

Here's what makes SHAP special: it's grounded in game theory, treating each feature as a "player" and calculating its contribution to the prediction. It's mathematically rigorous, model-agnostic, and provides both global interpretability (which features matter overall) and local interpretability (why this specific prediction was made).

I remember analyzing a model predicting drug response in cancer patients. SHAP revealed that the model was heavily weighting a set of genes involved in drug metabolism—which made perfect biological sense and actually led to a follow-up experimental validation. That's when I realized: explainable AI isn't just about understanding models, it's about generating biological hypotheses.

But SHAP isn't perfect. For high-dimensional genomics data, computation can be slow. The explanations can also be misleading if your model has learned spurious correlations. I've learned to always sanity-check SHAP outputs against known biology.

Attention mechanisms: built-in interpretability

When I'm building new models now, I often use architectures with built-in interpretability, particularly attention mechanisms. Attention layers learn to focus on specific parts of the input, and those attention weights tell you what the model is "looking at."

In a recent project on predicting regulatory element activity from DNA sequences, we used a transformer-based model with self-attention. The attention weights highlighted specific sequence motifs—and when we aligned these with known transcription factor binding sites, there was remarkable concordance. The model was learning actual biology, not just statistical patterns.

This is interpretability at its best: the model's internal representations align with our biological understanding, giving us confidence in the predictions and sometimes even revealing new insights about regulatory grammar.

Biological validation: the ultimate test

Here's something I wish I'd understood earlier in my career: computational interpretability is necessary but not sufficient. Just because your model says a gene is important doesn't mean it actually is. You need biological validation.

I've started collaborating closely with experimental biologists, and it's transformed how I approach explainable AI. Now, when a model highlights a gene or pathway, we design experiments to test whether perturbing that gene actually affects the outcome we're predicting. Sometimes the model is spot-on, and we discover real biology. Sometimes it's capturing a confound or batch effect, and we need to go back to the drawing board.

This iterative process—prediction, explanation, experimental validation, model refinement—is where the real scientific value emerges. Explainable AI becomes a tool for discovery, not just a diagnostic for model behavior.

Communicating with non-technical stakeholders

I've learned that different audiences need different types of explanations. When I'm presenting to computational colleagues, I can talk about SHAP values, permutation importance, and attention weights. When I'm presenting to wet-lab biologists, I need to translate these into biological terms: "The model identified these pathways as important," "These regulatory elements appear to be key drivers."

For clinicians, the communication challenge is even greater. They don't want to know about model internals—they want to know: Is this prediction reliable? What evidence supports it? What should I do with this information?

I've started creating different visualization strategies for different audiences. For a cancer genomics project, we developed a "prediction report" that showed: the prediction, confidence level, the top contributing genomic features, known biological pathways involved, and similar cases in the training data. This multi-level explanation met different stakeholders where they were.

Case study: interpreting variant pathogenicity predictions

Let me share a specific example. We built a model to predict whether genetic variants were pathogenic (disease-causing). Initial accuracy was good, but clinicians were hesitant to trust it. We added multiple layers of interpretability:

SHAP values showed which features of the variant (conservation scores, functional annotations, protein structure impacts) were most influential

Counterfactual explanations showed how changing specific features would change the prediction

We provided similar known pathogenic variants from literature

We highlighted relevant functional studies

This comprehensive explanation strategy increased clinical adoption dramatically. Clinicians understood not just what the model predicted, but why, and could integrate it into their existing knowledge.

The future of explainable genomics AI

I'm excited about emerging techniques. Causal inference methods that go beyond correlation to identify actual causal relationships. Mechanistic models that incorporate biological knowledge directly into the architecture. Multi-modal explanations that combine different types of evidence.

But I've also learned humility. Some biological systems are genuinely complex, with emergent properties that resist simple explanations. Sometimes "it's complicated" is actually the truth. The goal isn't always to reduce complexity to simplicity, but to provide tools that help researchers navigate and understand that complexity.

Explainable AI in genomics isn't just a technical challenge—it's a bridge between computational and biological sciences. When done right, it doesn't just help us trust our models; it helps us discover new biology and ultimately improve human health. And that's why I keep working on it, even when it's frustrating, even when the explanations are incomplete. Because every bit of interpretability we add moves us closer to understanding the beautiful complexity of life.`,
    date: '2025-11-05',
    category: 'Bioinformatics',
    tags: ['Explainable AI', 'Genomics', 'Machine Learning'],
    readTime: '13 min read'
  },
  {
    id: '74125',
    title: 'Building Production-Ready LLM Applications',
    excerpt: 'Lessons learned from deploying large language models in real-world production environments.',
    content: `My first LLM production deployment failed spectacularly. Well, not failed exactly—it worked in the demo. It worked in our staging environment. But two hours after we released it to real users, our costs had skyrocketed, latency was through the roof, and about 15% of queries were producing completely nonsensical outputs. That was my brutal introduction to the gap between prototype and production.

Let me save you from making the same mistakes I did.

The demo-to-production chasm

In research and prototyping, you can get away with a lot. Slow response times? No problem, we're just exploring. Occasional weird outputs? Interesting edge case! No cost considerations? We're still figuring out if this even works!

Production is a different beast entirely. Users expect sub-second response times. Every output needs to be useful—or at least not embarrassingly wrong. And someone is paying for every single API call, every token generated.

I learned this managing a biomedical Q&A system. In development, we were using GPT-4 for everything, crafting elaborate prompts, generating long, detailed responses. It was great! Until we launched and realized each query was costing us dollars and taking 30-40 seconds. Users were dropping off in frustration, and our cloud bill was terrifying.

Prompt engineering: it's software now

Here's something I wish I'd understood from day one: prompts are code. They need version control, testing, review processes, and deployment pipelines, just like any other code.

I now maintain a prompt library in Git. Every prompt has:

Version history with clear changelogs

Test cases with expected outputs

Performance benchmarks (latency, cost, quality metrics)

A/B test results when we've compared versions

This might sound like overkill, but I've been saved so many times by being able to roll back to a previous prompt version when a "small improvement" caused unexpected issues.

I also use templating systems for prompts. Instead of hard-coding examples or instructions, I inject them dynamically based on context. This makes prompts more maintainable and allows for easy personalization.

For our biomedical system, we created different prompt variants for different query types—drug information queries get different prompting than disease mechanism questions. The router that selects which prompt to use is itself an LLM call, but a much cheaper one using a smaller model.

Monitoring: you can't improve what you don't measure

Production LLM systems need comprehensive monitoring. I track:

Latency: p50, p95, p99 response times

Cost: per query, per user, by model/endpoint

Quality: user ratings, task success metrics, automated evaluation scores

Errors: API failures, timeout rates, content filter triggers

User behavior: drop-off rates, query reformulation patterns

The quality monitoring was tricky to get right. We started with just user feedback (thumbs up/down), but quickly realized we needed more nuanced metrics. Now we have:

Automated semantic similarity checks: does the response actually address the query?

Factuality scores: for biomedical queries, we cross-reference against curated knowledge bases

Coherence metrics: does the response flow logically?

Safety checks: flagging potentially harmful medical advice

These automated checks run on every response. When they detect issues, we log them for review and sometimes trigger fallback behaviors.

Cost optimization: the never-ending battle

Let me be blunt: LLM costs can spiral out of control fast. Here's what I've learned:

Model cascading: Use the smallest model that can handle each task. We route simple queries to GPT-3.5, moderate complexity to GPT-4, and only use GPT-4 Turbo for the really complex stuff. This single change cut our costs by 60%.

Caching: Aggressively cache responses for common queries. We use semantic similarity to match new queries to cached responses—if someone asks essentially the same question, why pay for a new API call?

Prompt optimization: Shorter prompts = lower costs. I've spent hours trimming prompts while maintaining quality. Every token counts when you're running millions of queries.

Batch processing: Where latency requirements allow, batch multiple queries together. Much more efficient than one-by-one processing.

Self-hosting: For our biomedical system, we eventually fine-tuned Llama-2 on domain-specific data and self-hosted it. Higher upfront cost, but much cheaper per query at scale.

Handling failures gracefully

LLMs will fail. APIs go down. Rate limits get hit. Content filters get triggered. Models generate garbage. You need strategies for all of this.

Retry logic with exponential backoff: obvious but essential. I've implemented smart retries that try cheaper models first before escalating to expensive ones.

Fallback chains: If GPT-4 fails, try GPT-3.5. If that fails, return a helpful error message with suggestions.

Timeout handling: Set aggressive timeouts. If a response is taking too long, kill it and try with a shorter max token limit or simpler prompt.

Content filtering: We pre-screen queries and post-screen responses. For medical applications, this is crucial—you cannot let harmful advice slip through.

Graceful degradation: When things go wrong, fail informatively. Tell the user what happened and what they can do. Don't just show a generic error page.

A/B testing LLM outputs

This was harder than I expected. With traditional software, A/B testing is straightforward—measure clicks, conversions, time on page. With LLMs, quality is more subjective.

Our approach:

Randomized assignment: Users get either variant A or B of a prompt/model

Multi-metric evaluation: We track user satisfaction, task completion, follow-up query rates, and time to satisfaction

Automated quality checks: Run both variants through our evaluation pipeline

Statistical testing: Ensure differences are significant, not just noise

Qualitative review: Sample responses from each variant and do human evaluation

We run A/B tests continuously, always experimenting with new prompts, different models, varied parameters. It's how we've incrementally improved from "works okay" to "actually really good."

One surprise: sometimes the "worse" variant according to automated metrics performs better with real users. Turns out people sometimes prefer concise responses over comprehensive ones, even if the comprehensive ones are objectively more informative.

The human in the loop

Despite all the automation, production LLM systems need human oversight. We have a team that:

Reviews flagged outputs (potential quality issues, reported problems)

Analyzes patterns in failures to inform improvements

Curates difficult queries for use in testing and fine-tuning

Updates knowledge bases and validation rules

This feedback loop has been invaluable. Many of our best improvements came from the team noticing patterns that our automated systems missed.

Lessons I'm still learning

Production LLM engineering is evolving rapidly. I'm currently exploring:

Streaming responses: Reduces perceived latency dramatically

Structured outputs: Using function calling and JSON mode for more reliable parsing

Prompt compression: Techniques to reduce token count while maintaining meaning

Chain-of-thought optimization: Getting better reasoning with fewer tokens

Hybrid retrieval: Combining vector search, knowledge graphs, and SQL for more reliable information access

Real talk

Building production LLM systems is harder than it looks. The demos are easy. Getting it to work reliably, cost-effectively, and safely for thousands of users is a different challenge entirely.

But it's also incredibly rewarding. When I see researchers using our biomedical Q&A system to quickly find answers that would have taken hours of literature review, when I see the system helping make sense of complex genomic data, when I see it just... working... all the late nights debugging weird API errors feel worth it.

If you're building LLM applications, my advice: start with production considerations from day one. Think about costs, monitoring, failures, and user experience from the beginning, not as an afterthought. Your future self will thank you.`,
    date: '2025-10-28',
    category: 'Engineering',
    tags: ['LLMs', 'Production', 'Software Engineering'],
    readTime: '15 min read'
  },
  {
    id: '91038',
    title: 'Multimodal AI: Connecting Vision and Language',
    excerpt: 'Exploring the synergy between computer vision and natural language processing in modern AI systems.',
    content: `I'll never forget the first time I saw a multimodal AI system truly "understand" an image. It wasn't just identifying objects—it was reasoning about relationships, context, and even the implicit narrative. A radiologist colleague showed me a chest X-ray and asked, "Can you describe what's wrong here?" I, with no medical training, saw some gray blobs. The AI system, however, generated: "Bilateral pulmonary infiltrates consistent with pneumonia, more pronounced in the lower lobes. Small right-sided pleural effusion also noted."

That's when it clicked for me: we're not just combining vision and language. We're creating AI systems that perceive and reason about the world in fundamentally richer ways.

Why multimodality matters

Think about how you understand the world. You don't process vision in isolation, then language separately, then combine the results. You perceive multimodally from the start. When you see a dog and someone says "The golden retriever is playing," your brain seamlessly integrates the visual information with the linguistic description.

For decades, AI research treated vision and language as separate problems. We had computer vision models that could identify objects, and NLP models that could understand text, but getting them to work together was clunky at best. You'd run an image through a vision model, extract features, feed those to a language model, and hope for coherent output.

Modern multimodal models are different. They're trained from the ground up to process vision and language jointly, learning representations where the two modalities naturally inform each other.

Vision-language transformers: the breakthrough

The transformer architecture revolutionized NLP, and then it came for computer vision, and then—inevitably—it bridged the two. Models like CLIP, LLaVA, and GPT-4V have shown what's possible when you train transformers on paired image-text data at massive scale.

I've been working with these models in medical imaging applications, and the capabilities are stunning. You can show the model a microscopy image and ask, "What tissue type is this, and are there any abnormalities?" It can identify the tissue, spot anomalies, and explain its reasoning in natural language.

But here's what really excites me: these models don't just caption images or answer questions. They demonstrate genuine cross-modal understanding. Show them an image and ask "What would happen if the object on the left moved?" They can reason about physics and spatial relationships. Show them a medical image and ask "What additional imaging would help diagnose this?" They can suggest appropriate follow-up tests.

This isn't pattern matching. It's understanding that spans modalities.

Cross-modal retrieval: finding needles in multimodal haystacks

One application I'm particularly passionate about is cross-modal retrieval—finding images based on text queries and vice versa. In medical research, this is transformative.

Imagine you're researching a rare disease. You have thousands of medical images in your database and thousands of clinical notes. Traditional search would make you query these separately: search images for visual patterns, search text for keywords, manually connect the dots.

With multimodal retrieval, you can ask: "Show me cases with enlarged lymph nodes and fever lasting more than two weeks." The system searches across both images and text, finding relevant cases whether the information was captured visually or described in notes.

I've built systems like this for genomics research. Researchers can query: "Show me cells expressing high levels of marker X with abnormal nuclear morphology." The system retrieves based on both image features (abnormal morphology) and associated text/metadata (marker expression levels).

The key technical challenge is aligning the embedding spaces—making sure that an image of a concept and text describing that concept are close together in the learned representation. CLIP-style contrastive learning has been remarkably effective for this, though I've found that domain-specific fine-tuning is crucial for specialized applications.

Medical imaging meets natural language

Healthcare is where multimodal AI gets really interesting—and really important. Medical diagnosis is inherently multimodal. Radiologists look at images but also read patient histories. Pathologists examine tissue slides while considering clinical context. Treatment decisions integrate visual findings with textual reports, lab values, and patient narratives.

I'm working on systems that help with radiology report generation. Traditionally, radiologists examine images and manually dictate detailed reports—time-consuming and sometimes inconsistent. Multimodal AI can draft these reports automatically, extracting findings from images and presenting them in standardized language.

But we've learned it's not just about automation. The real value is in augmentation. The AI highlights findings, suggests differential diagnoses, retrieves similar cases from the literature—all while the radiologist maintains oversight and makes final decisions. Human expertise combined with AI's tireless pattern recognition.

One exciting direction is using language to guide image analysis. Instead of just showing the model an image, we can provide context: "This patient has a history of smoking and presents with persistent cough." The model then focuses its analysis accordingly, looking for findings consistent with that clinical context.

The alignment challenge

Building multimodal systems sounds straightforward: take a vision model, add a language model, train them together. But the devil is in the alignment.

Different modalities have different structures. Language is sequential and discrete. Vision is spatial and continuous. Aligning these so they share coherent representations is non-trivial.

I've spent countless hours debugging alignment issues. The model might learn to caption images well but fail at visual question answering. Or it excels at retrieval but struggles with reasoning. Often, the problem traces back to how we're aligning modalities during training.

Some lessons I've learned:

Contrastive learning helps but isn't sufficient for complex reasoning

Attention mechanisms need to flow bidirectionally—vision attending to language and vice versa

Task diversity during training matters hugely—models need exposure to many types of cross-modal tasks

Data quality trumps quantity—poorly paired image-text data teaches misalignment

Architecture matters—how you fuse modalities (early, late, or throughout) affects what the model learns

Current projects and future directions

I'm currently exploring several exciting areas:

Multimodal chain-of-thought: Teaching models to reason step-by-step across vision and language. For medical diagnosis, this means: "I see X in the image, which combined with symptom Y, suggests condition Z, but we should rule out A with additional test B."

Temporal multimodality: Most work focuses on static images and text. But medical imaging often involves sequences—CT scans over time, video of procedures. Modeling temporal evolution across vision and language is a frontier I'm actively exploring.

Uncertainty quantification: Medical applications need confidence estimates. When a multimodal model generates a diagnosis, how certain is it? Working on principled approaches to multimodal uncertainty.

Grounded language models: Using vision to ground language model outputs in reality. This helps reduce hallucinations—if the model claims to see something in an image, we can verify it's actually there.

The human element

Despite all the technical excitement, I always come back to: how does this help people? In healthcare, multimodal AI should augment clinicians, not replace them. In research, it should accelerate discovery, not generate misleading conclusions.

I've learned to involve end-users early and often. The features I think are impressive often aren't what clinicians actually need. And the ethical implications—bias in medical imaging AI, privacy of multimodal patient data, liability for AI-assisted diagnoses—require ongoing attention.

Looking ahead

The future I envision is one where AI systems perceive and reason as richly as humans do. Not just vision and language, but audio, sensor data, structured databases—all integrated into coherent understanding.

We're already seeing glimpses. Models that can watch a video, listen to audio, read accompanying text, and answer complex questions about all of it. Systems that navigate physical environments using vision, language instructions, and spatial reasoning.

For someone who started in pure NLP, watching these multimodal capabilities emerge has been thrilling. The boundaries between AI subdisciplines are dissolving, and what's emerging is something more powerful than the sum of parts.

As I write this, I'm looking at a chest X-ray on my screen, with an AI-generated report next to it, discussing findings with a radiologist colleague. The AI caught something subtle that was initially missed. This integration of vision and language, of human and machine intelligence, of different ways of knowing—this is the future we're building. And I'm excited to be part of it.`,
    date: '2025-10-20',
    category: 'Research',
    tags: ['Multimodal AI', 'Computer Vision', 'NLP'],
    readTime: '13 min read'
  },
  {
    id: '23695',
    title: 'Statistical Rigor in Machine Learning Research',
    excerpt: 'Why biostatistical principles are crucial for valid and reproducible ML research.',
    content: `I need to tell you about the paper that almost ruined my week. A highly-cited machine learning study claimed a breakthrough in predicting disease outcomes. The accuracy numbers were impressive—95% on their test set! The methods seemed solid. I was excited to build on their work.

Then I looked closer at their statistical methodology. The train-test split was done after data preprocessing, potentially leaking information. No confidence intervals on their performance metrics. Multiple model comparisons without any correction for multiple testing. No power analysis to justify their sample size.

When I tried to reproduce their results on an independent dataset, performance dropped to barely better than random chance. The impressive results? Likely a combination of overfitting, p-hacking, and statistical sloppiness.

This is not an isolated incident. As someone with a foot in both biostatistics and machine learning, I see this constantly. The ML community has developed powerful methods, but we've often neglected the statistical principles that ensure our findings are actually valid.

The reproducibility crisis is real

Machine learning research has a reproducibility problem. Studies report spectacular results that fail to replicate. Models that work beautifully in papers fall apart on real data. Why? Often, it's not because the ML methods are bad—it's because the statistical methodology is flawed.

I've been on peer review committees where I've seen papers with:

Test sets created after looking at the data (information leakage guaranteed)

Performance metrics reported without any measure of uncertainty

Dozens of hyperparameters tuned on the "test" set (which is therefore not a test set at all)

Cherry-picked results from the best-performing model architecture

No consideration of multiple testing when comparing multiple models

From a biostatistics perspective, this is alarming. These are mistakes we learned to avoid decades ago in clinical trials and epidemiological studies. Why are we repeating them in ML research?

Train-test-validation: it's harder than you think

Let's start with the basics: train-test-validation splits. Sounds simple, right? I thought so too, until I started seeing all the ways this can go wrong.

The correct procedure:

Split your data FIRST, before any analysis

Use the training set for model development and hyperparameter tuning (with cross-validation within this set)

Use the validation set (or cross-validation on the training set) to select your final model

Use the test set EXACTLY ONCE to evaluate final performance

Never, ever let information from the test set influence any modeling decision

But I routinely see:

Data preprocessing (normalization, feature selection) done on the full dataset before splitting—this leaks information from test to train

Test set performance used to guide model selection—now your test set is contaminated

Multiple rounds of "testing" as models are refined—each peek at the test set invalidates it

For time-series or patient data, random splitting that breaks temporal or structural dependencies

In my own work on genomics data, I learned this the hard way. Early on, I normalized gene expression data across all samples, then split into train and test. My model performed great! Until I applied it to truly new data and performance tanked. The normalization had leaked information about the test set distribution to the training set.

Now I'm fanatical about proper splitting. I even write the test set to a locked directory that requires a specific unlock code to access, forcing myself to think hard before peeking at it.

Statistical significance: your p-value isn't enough

Machine learning papers love to report accuracy improvements: "Our method achieves 87.3% accuracy compared to 85.1% for the baseline." Sounds impressive! But is that difference statistically significant? Would we see a similar improvement on new data?

Usually, the paper doesn't tell you. No confidence intervals, no significance tests, no quantification of uncertainty. Just point estimates, as if our performance metrics were perfect measurements rather than random variables.

From a biostatistics perspective, this is unacceptable. Every estimate should come with a measure of uncertainty. I now report:

Confidence intervals on all performance metrics (using bootstrapping or cross-validation)

Statistical tests when comparing models (with appropriate corrections for multiple testing)

Effect sizes, not just p-values (a statistically significant improvement might not be practically meaningful)

Sample size calculations demonstrating adequate power to detect meaningful differences

I'll give a concrete example. I was comparing two models for predicting drug response. Model A: 82.3% accuracy. Model B: 84.1% accuracy. Looks like B is better, right?

But when I calculated 95% confidence intervals:

Model A: 82.3% (95% CI: 79.1% - 85.2%)

Model B: 84.1% (95% CI: 80.8% - 87.0%)

The confidence intervals overlap substantially! A formal statistical test confirmed no significant difference (p=0.31). The apparent superiority of Model B could easily be due to random variation.

This completely changed the conclusion. Instead of claiming Model B was better, I concluded there was insufficient evidence to prefer one over the other, and went with the simpler Model A.

The multiple testing problem

Here's a scenario I see constantly: A researcher trains 50 different model architectures, each with 10 different hyperparameter settings. They test all 500 combinations and report the best one, which shows statistically significant improvement over baseline (p=0.03).

Problem: when you test 500 things, you expect 25 to be "significant" at p=0.05 just by chance. That p=0.03 doesn't mean what you think it means.

This is the multiple testing problem, well-understood in biostatistics, often ignored in ML. When you make multiple comparisons, your false positive rate explodes unless you correct for it.

Standard corrections include:

Bonferroni: Divide your significance threshold by the number of tests

Benjamini-Hochberg: Controls false discovery rate rather than familywise error rate

Holdout test set: Use cross-validation for model selection, then a single final test on held-out data

Pre-registration: Decide on your model and evaluation before looking at test data

In my work, I've adopted a multi-stage approach:

Stage 1: Exploratory analysis on training data, no corrections needed

Stage 2: Model selection using cross-validation on training set

Stage 3: Final evaluation on test set, with only the pre-selected model

This prevents p-hacking and ensures my reported performance is honest.

Power analysis and sample size

Here's a question I wish more ML researchers asked: "Is my dataset large enough to reliably detect the effect I'm looking for?"

Power analysis answers this question. It tells you how large your sample needs to be to detect an effect of a given size with acceptable probability (typically 80% power).

In ML, people often skip this, assuming "more data is always better" or "deep learning needs huge datasets." But:

Sometimes your dataset is smaller than you think (due to class imbalance, after quality filtering, etc.)

Not all models need massive data (simple models with few parameters can work with modest samples)

Understanding the data requirements helps with study design and resource allocation

I worked on a project predicting rare disease subtypes. Only 150 cases available. Could we even build a reliable model?

I did a power analysis based on expected effect sizes from literature and determined we'd need at least 120 cases to achieve 80% power for detecting a meaningful difference between subtypes. We had 150, so we proceeded—but with a more conservative modeling approach and careful validation.

Without that analysis, we might have built an overly complex model that appeared to work but was actually just overfitting noise.

Confidence intervals for model performance

Every performance metric—accuracy, AUC, F1, recall—is a random variable. It varies depending on which samples happen to be in your test set. Reporting a single number without uncertainty is statistically incomplete.

I always report confidence intervals, typically using bootstrapping:

Resample my test set with replacement 1000 times

Calculate the performance metric on each resample

Use the percentiles of this distribution as confidence intervals

This tells me not just "my model achieves 85% accuracy" but "I'm 95% confident the true accuracy is between 81% and 89%."

This has important practical implications. A model with 85% ± 2% accuracy is much more reliable than one with 85% ± 8% accuracy, even though the point estimates are identical.

Bridging the cultures

The ML community and biostatistics community have different cultures and priorities. ML emphasizes predictive performance and scalability. Biostatistics emphasizes validity, reproducibility, and rigorous uncertainty quantification.

Both perspectives are valuable. The best work I've done has been when I successfully combine them:

Use powerful ML models for their flexibility and performance

Apply biostatistical principles to ensure validity and reproducibility

Report not just what works, but how confident we are that it works

Design studies with proper controls, appropriate sample sizes, and pre-specified analyses

Moving forward

I've become passionate about this because I've seen too many promising ML results fail to translate to real-world impact. Not because the algorithms were bad, but because the statistical methodology was sloppy.

If you're doing ML research, I encourage you:

Learn basic biostatistics (hypothesis testing, confidence intervals, study design)

Report uncertainty, not just point estimates

Correct for multiple testing

Do power analyses

Use proper train-test-validation splits

Pre-register your analysis plans when possible

These practices might seem tedious, but they're essential for doing science that's not just impressive, but true. And in fields like healthcare where lives are at stake, we owe it to the people affected by our work to get the statistics right.

As both a biostatistician and an ML researcher, I'm convinced we can have the best of both worlds—powerful, flexible models AND rigorous, reproducible methodology. It just requires a bit more statistical thinking alongside all that computational power.`,
    date: '2025-10-15',
    category: 'Research',
    tags: ['Statistics', 'Machine Learning', 'Research Methods'],
    readTime: '14 min read'
  }
];

const ThoughtsPage: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const selectedPost = postId ? blogPosts.find(post => post.id === postId) : null;

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postId]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Always visible */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Feather className="w-12 h-12 text-[#94c973]" />
            </div>
            <h1
              className={`text-5xl font-bold text-gray-900 dark:text-white mb-4 ${selectedPost ? 'cursor-pointer hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors' : ''}`}
              onClick={() => selectedPost && navigate('/thoughts')}
            >
              Thoughts
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Research reviews, innovative ideas, and insights from the intersection of AI, bioinformatics, and data science.
            </p>
          </div>

          {selectedPost ? (
            /* Blog Post View */
            <div className="max-w-5xl mx-auto">
            <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Header Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-8 sm:px-12 py-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-[#94c973] bg-opacity-10 text-[#94c973] rounded-full text-sm font-semibold">
                    {selectedPost.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">•</span>
                  <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedPost.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">•</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{selectedPost.readTime}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Section */}
              <div className="px-8 sm:px-12 py-10">
                <div className="max-w-3xl">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {selectedPost.content.split('\n\n').map((paragraph, index) => {
                      // Check if paragraph is a heading or list
                      if (paragraph.startsWith('Key points') || paragraph.startsWith('Topics covered') ||
                          paragraph.startsWith('Key insights') || paragraph.startsWith('Lessons learned') ||
                          paragraph.startsWith('Discussion points') || paragraph.startsWith('Key principles')) {
                        return (
                          <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6 first:mt-0">
                            {paragraph}
                          </h2>
                        );
                      } else if (paragraph.startsWith('- ')) {
                        // Handle bullet points
                        const items = paragraph.split('\n').filter(item => item.trim());
                        return (
                          <ul key={index} className="space-y-3 my-6 ml-6">
                            {items.map((item, i) => (
                              <li key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg pl-2">
                                {item.replace(/^- /, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      } else {
                        return (
                          <p key={index} className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                            {paragraph}
                          </p>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            </article>

            {/* Back button - Outside the article */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/thoughts')}
                className="flex items-center text-[#94c973] hover:text-[#7fb95e] transition-colors font-medium group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to all thoughts
              </button>
            </div>
            </div>
          ) : (
            /* Blog Grid View */
            <>
              {/* Search and Filter */}
              <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search thoughts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#94c973] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 flex-wrap justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#94c973] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blog Posts Grid */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No thoughts found matching your search.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/thoughts/${post.id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-[#94c973] bg-opacity-10 text-[#94c973] rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-[#94c973] hover:text-[#7fb95e] font-medium flex items-center">
                            Read more
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dr Raktim Mondol</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  AI/ML Engineer, Data Scientist & Bioinformatics Researcher sharing insights on AI, research, and innovation.
                </p>
                <Link
                  to="/#about"
                  className="inline-flex items-center mt-4 text-[#94c973] hover:text-[#7fb95e] transition-colors font-medium text-sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Portfolio
                </Link>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 text-[#94c973] mr-3 mt-0.5 flex-shrink-0" />
                    <a
                      href="mailto:r.mondol@unsw.edu.au"
                      className="text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
                    >
                      r.mondol@unsw.edu.au
                    </a>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 text-[#94c973] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">+61 412 936 237</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-[#94c973] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      UNSW Sydney, NSW 2052
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <Link
                    to="/#about"
                    className="block text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    to="/#research"
                    className="block text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
                  >
                    Research
                  </Link>
                  <Link
                    to="/#publications"
                    className="block text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
                  >
                    Publications
                  </Link>
                  <Link
                    to="/#contact"
                    className="block text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
                  >
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().getFullYear()} Dr Raktim Mondol. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
};

export default ThoughtsPage;
