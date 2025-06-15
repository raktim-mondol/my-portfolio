import React from 'react';
import { Code, Database, Lock, Share2 } from 'lucide-react';

const projects = [
  {
    title: "Quantum Circuit Optimizer",
    description: "An open-source tool for optimizing quantum circuits, reducing gate count and improving fidelity.",
    tech: ["Python", "Qiskit", "CircuitQ"],
    icon: Code,
    link: "#"
  },
  {
    title: "Quantum Database Search",
    description: "Implementation of a quantum algorithm for accelerating database searches using Grover's algorithm.",
    tech: ["Q#", "Python", "SQL"],
    icon: Database,
    link: "#"
  },
  {
    title: "Quantum Cryptography Protocol",
    description: "Development of a new quantum cryptography protocol for secure key distribution.",
    tech: ["C++", "OpenSSL", "QuantumKit"],
    icon: Lock,
    link: "#"
  },
  {
    title: "Quantum Cloud Platform",
    description: "A cloud-based platform for running quantum algorithms on various quantum hardware.",
    tech: ["React", "Node.js", "AWS"],
    icon: Share2,
    link: "#"
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Featured Projects</h2>
          <p className="mt-4 text-xl text-gray-600">
            Innovative solutions in quantum computing and related technologies
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {projects.map((project, index) => (
            <div
              key={index}
              className="relative group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center">
                <span className="p-3 rounded-md bg-indigo-50 text-indigo-700">
                  <project.icon className="h-6 w-6" />
                </span>
                <h3 className="ml-4 text-xl font-semibold text-gray-900">{project.title}</h3>
              </div>
              
              <p className="mt-4 text-gray-600">{project.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 text-sm text-indigo-600 bg-indigo-50 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <a
                href={project.link}
                className="mt-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Learn more
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}