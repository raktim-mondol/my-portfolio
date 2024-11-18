import React from 'react';
import { Code, Brain, Cloud, Terminal, Database, Layout } from 'lucide-react';

const skillCategories = [
  {
    title: "Programming Languages",
    icon: Code,
    skills: ["R", "Python", "SQL", "LaTeX"]
  },
  {
    title: "Deep Learning Frameworks",
    icon: Brain,
    skills: ["PyTorch", "TensorFlow"]
  },
  {
    title: "Distributed & Cloud Computing",
    icon: Cloud,
    skills: ["AWS", "GCP", "Galaxy"]
  },
  {
    title: "Development Environments",
    icon: Layout,
    skills: ["Spyder", "Jupyter Notebook", "RStudio"]
  },
  {
    title: "Statistical Analysis",
    icon: Database,
    skills: ["Stata", "SPSS"]
  },
  {
    title: "Development Tools",
    icon: Terminal,
    skills: ["Git", "Version Control", "Command Line"]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Technical Skills</h2>
          <p className="mt-4 text-xl text-gray-600">Expertise across computational biology and data science</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <span className="p-2 bg-[#94c973]/10 rounded-lg">
                  <category.icon className="h-6 w-6 text-[#94c973]" />
                </span>
                <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#94c973]/10 text-[#94c973] rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}