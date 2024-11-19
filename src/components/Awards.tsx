import React from 'react';
import { Award, GraduationCap } from 'lucide-react';

const awards = [
  {
    title: "Doctoral Research Scholarship",
    organization: "UNSW Sydney",
    year: "2021",
    description: "Awarded scholarship for pursuing doctoral research studies in Computer Science & Engineering.",
    icon: Award
  },
  {
    title: "Masters by Research with High Distinction",
    organization: "RMIT University",
    year: "2019",
    description: "Completed Masters degree with outstanding academic performance in Computer Science & Bioinformatics.",
    icon: GraduationCap
  },
  {
    title: "RMIT Research Scholarships",
    organization: "RMIT University",
    year: "2017",
    description: "Awarded both Research Stipend Scholarship and International Tuition Fee Scholarship.",
    icon: Award
  },
  {
    title: "B.Sc. with High Distinction",
    organization: "BRAC University",
    year: "2013",
    description: "Graduated with High Distinction in Electrical and Electronic Engineering.",
    icon: GraduationCap
  },
  {
    title: "Vice Chancellor Award",
    organization: "BRAC University",
    year: "2013",
    description: "Recognized for outstanding academic performance in Spring 2013.",
    icon: Award
  },
  {
    title: "Dean Awards",
    organization: "BRAC University",
    year: "2010-2011",
    description: "Received Dean's Award for academic excellence in Fall 2010 and Fall 2011.",
    icon: Award
  }
];

export default function Awards() {
  return (
    <section id="awards" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Awards & Honors</h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Recognition for academic excellence and research achievements</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((award, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <span className="p-2 bg-[#94c973]/10 rounded-lg">
                  <award.icon className="h-6 w-6 text-[#94c973]" />
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{award.title}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[#94c973]">{award.organization}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{award.year}</p>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{award.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}