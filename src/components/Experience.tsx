import React from 'react';
import { Briefcase, Calendar } from 'lucide-react';

const experiences = [
  {
    title: "Casual Academic",
    company: "UNSW",
    period: "July 2021 - Present",
    location: "Sydney, NSW",
    description: "Teaching and mentoring students in computer science and engineering courses.",
    achievements: [
      "Conduct Laboratory and Tutorial Classes",
      "Provide guidance and support to students in practical sessions",
      "Assist in course material development and assessment"
    ]
  },
  {
    title: "Teaching Assistant",
    company: "RMIT University",
    period: "July 2017 - Oct 2019",
    location: "Melbourne, VIC",
    description: "Supported undergraduate students in computer science courses while pursuing research.",
    achievements: [
      "Conducted Laboratory and Tutorial Classes",
      "Assisted students with programming concepts and practical applications",
      "Contributed to course material improvements"
    ]
  },
  {
    title: "Lecturer",
    company: "World University of Bangladesh",
    period: "Sep 2013 - Dec 2016",
    location: "Dhaka, BD",
    description: "Full-time faculty position teaching computer science courses and supervising student projects.",
    achievements: [
      "Conducted Lectures and Laboratory Works",
      "Supervised Students for Projects and Thesis",
      "Managed course examinations and assessments"
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Professional Experience</h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Building expertise through academic roles</p>
        </div>

        <div className="mt-12 space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="flex flex-row items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-[#94c973]/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-[#94c973]" />
                  </div>
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{exp.title}</h3>
                    <div className="flex items-center text-[#94c973] flex-shrink-0">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm whitespace-nowrap">{exp.period}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{exp.company}</span>
                    <span className="hidden sm:block">•</span>
                    <span>{exp.location}</span>
                  </div>
                  
                  <p className="mt-3 text-gray-700 dark:text-gray-300">{exp.description}</p>
                  
                  <ul className="mt-4 space-y-2">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-[#94c973]">•</span>
                        <span className="text-gray-600 dark:text-gray-300">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}