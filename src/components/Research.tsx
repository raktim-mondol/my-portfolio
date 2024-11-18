import React from 'react';
import { Brain, Eye, MessageSquare, Cpu, Lightbulb, Database } from 'lucide-react';

const researchAreas = [
  {
    icon: Brain,
    title: "Artificial Intelligence",
    description: "Developing advanced AI models and algorithms for complex problem-solving and decision-making systems."
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
  }
];

export default function Research() {
  return (
    <section id="research" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Research Areas</h2>
          <p className="mt-4 text-xl text-gray-600">
            Exploring the frontiers of AI and computational biology
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((area, index) => (
            <div
              key={index}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#94c973] rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-[#94c973]/10 text-[#94c973] ring-4 ring-white">
                  <area.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  {area.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}