import React from 'react';
import { GraduationCap, BookOpen, ExternalLink } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { useTheme } from './ThemeContext';

const education = [
  {
    degree: "PhD in Computer Science & Engineering",
    institution: "UNSW Sydney",
    year: "2020-2024 (Expected)",
    thesis: "Deep learning models for histopathology image analysis",
    description: "Developing advanced AI models for analyzing histopathology images and genetic data in breast cancer research.",
    logo: {
      light: "/assets/images/unsw-logo.png",
      dark: "/assets/images/unsw-logo-dm.png"
    }
  },
  {
    degree: "MS by Research in Computer Science & Bioinformatics",
    institution: "RMIT University",
    year: "2017-2019",
    thesis: "Deep learning in classifying cancer subtypes, extracting relevant genes and identifying novel mutations",
    description: "Graduated with High Distinction",
    certUrl: "https://www.myequals.net/sharelink/78e7c7d7-5a73-4e7c-9711-f163f5dd1604/af0d807a-8392-45be-9104-d26b95f5aa7a",
    thesisUrl: "https://research-repository.rmit.edu.au/articles/thesis/Deep_learning_in_classifying_cancer_subtypes_extracting_relevant_genes_and_identifying_novel_mutations/27589272",
    audioSummary: "/assets/audio/masters-thesis-summary.mp3",
    logo: {
      light: "/assets/images/rmit-logo.png",
      dark: "/assets/images/rmit-logo-dm.png"
    }
  }
];

export default function Education() {
  const { theme } = useTheme();

  return (
    <section id="education" className="py-20 bg-white dark:bg-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Education</h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Academic journey</p>
        </div>

        <div className="mt-12 space-y-8">
          {education.map((edu, index) => (
            <div key={index} className="bg-white dark:bg-[#0f172a] p-8 rounded-lg shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8">
                    <GraduationCap className="w-full h-full text-[#94c973]" />
                  </div>
                  <h3 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                </div>
                <div className="flex-shrink-0 w-32 h-16 flex items-center justify-center">
                  <img 
                    src={theme === 'dark' ? edu.logo.dark : edu.logo.light}
                    alt={`${edu.institution} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              
              <div className="ml-12">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{edu.institution}</p>
                <p className="text-[#94c973]">{edu.year}</p>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-[#94c973]" />
                    <h4 className="ml-2 text-lg font-semibold dark:text-white">Thesis</h4>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{edu.thesis}</p>
                  {edu.thesisUrl && (
                    <a
                      href={edu.thesisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-[#94c973] hover:text-[#7fb95e] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Full Thesis
                    </a>
                  )}
                  {edu.audioSummary && (
                    <div className="mt-4">
                      <AudioPlayer src={edu.audioSummary} title="Thesis Summary" />
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  {edu.certUrl && (
                    <a
                      href={edu.certUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#94c973] hover:text-[#7fb95e] transition-colors"
                    >
                      View Certification
                    </a>
                  )}
                  <p className="mt-2 text-gray-600 dark:text-gray-400 italic">{edu.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
