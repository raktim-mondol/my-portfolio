import React from 'react';
import { Brain, Eye, MessageSquare, Cpu, Lightbulb, Database, Stethoscope, TestTube, Target, Bot, Users, Search } from 'lucide-react';

const researchAreas = [
  {
    icon: Brain,
    title: "Large Language Models (LLMs)",
    description: "Research on training, fine-tuning, and evaluating LLMs using parameter-efficient techniques (e.g., LoRA, QLoRA), with applications in retrieval-augmented generation, summarisation, multi-hop reasoning, and task-specific adaptation."
  },
  {
    icon: Users,
    title: "Agentic AI & Multi-Agent Systems",
    description: "Design and development of autonomous, tool-using agents capable of reasoning, planning, and collaborating across complex tasks using frameworks like the Agent Development Kit (ADK). Applications include document QA, decision-making, and pipeline orchestration."
  },
  {
    icon: Search,
    title: "Retrieval-Augmented Generation (RAG)",
    description: "Building hybrid search and generation pipelines integrating semantic and keyword-based retrieval (e.g., FAISS, BM25), designed for grounded language understanding, document synthesis, and knowledge-intensive tasks."
  },
  {
    icon: Cpu,
    title: "Bioinformatics",
    description: "Applying computational methods to analyze biological data and solve complex biological problems."
  },
  {
    icon: Lightbulb,
    title: "Explainable AI",
    description: "Creating transparent and interpretable AI systems that provide clear explanations for their decisions and predictions."
  },
  {
    icon: Database,
    title: "Multimodal Analysis",
    description: "Integrating multiple data modalities (images, genomics, clinical data) for comprehensive biomedical insights."
  },
  {
    icon: Eye,
    title: "Computer Vision",
    description: "Research in image processing, object detection, and visual understanding using deep learning approaches."
  },
  {
    icon: MessageSquare,
    title: "Natural Language Processing",
    description: "Working on language models, text analysis, and human-computer interaction through natural language."
  },
  {
    icon: Stethoscope,
    title: "Treatment Recommendation Systems",
    description: "AI-powered personalized treatment plans and clinical decision support systems for improved patient care."
  }
];

export default function Research() {
  return (
    <section id="research" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Research Areas</h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Exploring the frontiers of AI and computational biology
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((area, index) => (
            <div
              key={index}
              className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#94c973] rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 rounded-lg inline-flex p-3 bg-[#94c973]/10 text-[#94c973] ring-4 ring-white dark:ring-gray-800">
                  <area.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{area.title}</h3>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
