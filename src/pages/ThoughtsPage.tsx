import React, { useState } from 'react';
import { BookOpen, Calendar, Tag, ArrowRight, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    id: '1',
    title: 'The Future of Agentic AI in Healthcare',
    excerpt: 'Exploring how autonomous AI agents can revolutionize patient care and clinical decision-making systems.',
    content: `The intersection of agentic AI and healthcare presents unprecedented opportunities for improving patient outcomes. In this post, I explore the emerging paradigm of autonomous AI agents that can reason, plan, and execute complex medical tasks.

Key points discussed:
- Multi-agent systems for clinical decision support
- Integration with existing healthcare infrastructure
- Ethical considerations and patient privacy
- Real-world applications in diagnosis and treatment planning

The future of healthcare will likely involve collaborative human-AI teams, where AI agents handle routine tasks and pattern recognition while healthcare professionals focus on complex decision-making and patient interaction.`,
    date: '2025-11-15',
    category: 'Research',
    tags: ['AI', 'Healthcare', 'Agentic AI'],
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Rethinking RAG: Beyond Vector Similarity',
    excerpt: 'A deep dive into advanced Retrieval-Augmented Generation techniques that go beyond traditional vector search.',
    content: `Retrieval-Augmented Generation (RAG) has become a cornerstone of modern LLM applications, but most implementations rely solely on vector similarity. This post explores advanced techniques that can significantly improve RAG performance.

Topics covered:
- Hybrid search combining dense and sparse retrieval
- Contextual chunk retrieval and reranking
- Query decomposition and multi-hop reasoning
- Adaptive retrieval strategies based on query complexity

By moving beyond simple vector similarity, we can build RAG systems that truly understand context and deliver more relevant, accurate responses.`,
    date: '2025-11-10',
    category: 'Research',
    tags: ['RAG', 'LLMs', 'Vector Search'],
    readTime: '7 min read'
  },
  {
    id: '3',
    title: 'Explainable AI in Genomics: Bridging the Gap',
    excerpt: 'How interpretable machine learning models can help researchers understand complex genomic patterns.',
    content: `As AI models become increasingly complex, the need for explainability in genomics research grows more critical. This post discusses approaches to making AI-driven genomic insights interpretable and actionable.

Key insights:
- SHAP and attention mechanisms for model interpretation
- Biological validation of AI predictions
- Communicating AI insights to non-technical stakeholders
- Case studies in cancer genomics

Explainable AI isn't just about trust—it's about enabling scientific discovery by revealing the "why" behind predictions.`,
    date: '2025-11-05',
    category: 'Bioinformatics',
    tags: ['Explainable AI', 'Genomics', 'Machine Learning'],
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Building Production-Ready LLM Applications',
    excerpt: 'Lessons learned from deploying large language models in real-world production environments.',
    content: `Deploying LLMs in production is vastly different from research prototypes. This post shares practical insights from my experience building production-ready LLM applications.

Lessons learned:
- Prompt engineering and version control
- Monitoring and evaluation metrics
- Cost optimization strategies
- Handling edge cases and failures gracefully
- A/B testing LLM outputs

Moving from prototype to production requires careful consideration of reliability, scalability, and user experience.`,
    date: '2025-10-28',
    category: 'Engineering',
    tags: ['LLMs', 'Production', 'Software Engineering'],
    readTime: '8 min read'
  },
  {
    id: '5',
    title: 'Multimodal AI: Connecting Vision and Language',
    excerpt: 'Exploring the synergy between computer vision and natural language processing in modern AI systems.',
    content: `The convergence of vision and language has opened new frontiers in AI research. This post examines how multimodal models are transforming our approach to AI problems.

Discussion points:
- Vision-language transformers and their applications
- Cross-modal retrieval and understanding
- Medical imaging with natural language reports
- Challenges in multimodal alignment

The future of AI is multimodal, mirroring how humans naturally process information through multiple senses.`,
    date: '2025-10-20',
    category: 'Research',
    tags: ['Multimodal AI', 'Computer Vision', 'NLP'],
    readTime: '6 min read'
  },
  {
    id: '6',
    title: 'Statistical Rigor in Machine Learning Research',
    excerpt: 'Why biostatistical principles are crucial for valid and reproducible ML research.',
    content: `As a biostatistician working in machine learning, I've observed a critical gap: many ML studies lack statistical rigor. This post discusses how to bridge this gap.

Key principles:
- Proper train-test-validation splits
- Statistical significance testing
- Multiple testing correction
- Confidence intervals for model performance
- Power analysis for sample size determination

Applying biostatistical principles to ML research ensures our findings are not just impressive, but also valid and reproducible.`,
    date: '2025-10-15',
    category: 'Research',
    tags: ['Statistics', 'Machine Learning', 'Research Methods'],
    readTime: '7 min read'
  }
];

const ThoughtsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to portfolio
            </button>
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-[#94c973] hover:text-[#7fb95e] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              All thoughts
            </button>
          </div>

          <article className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedPost.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="px-3 py-1 bg-[#94c973] bg-opacity-10 text-[#94c973] rounded-full text-xs font-medium">
                  {selectedPost.category}
                </span>
                <span>{selectedPost.readTime}</span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {selectedPost.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center text-gray-600 dark:text-gray-400 hover:text-[#94c973] dark:hover:text-[#94c973] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to portfolio
        </button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-[#94c973]" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Thoughts
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Research reviews, innovative ideas, and insights from the intersection of AI, bioinformatics, and data science.
          </p>
        </div>

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
                onClick={() => setSelectedPost(post)}
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
      </div>
    </div>
  );
};

export default ThoughtsPage;
