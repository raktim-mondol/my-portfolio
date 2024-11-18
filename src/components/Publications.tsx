import React from 'react';
import { BookText } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const publications = [
  {
    title: "BioFusionNet: Deep Learning-Based Survival Risk Stratification in ER+ Breast Cancer Through Multifeature and Multimodal Data Fusion",
    journal: "IEEE Journal of Biomedical and Health Informatics",
    year: 2024,
    authors: "Mondol, R.K.; Millar, E.K.A.; Sowmya, A.; Meijering, E.",
    paperUrl: "https://ieeexplore.ieee.org/document/10568932",
    codeUrl: "https://github.com/raktim-mondol/BioFusionNet",
    audioSummary: "/assets/audio/biofusionnet-summary.wav"
  },
  {
    title: "hist2RNA: An Efficient Deep Learning Architecture to Predict Gene Expression from Breast Cancer Histopathology Images",
    journal: "Cancers",
    year: 2023,
    authors: "Mondol, R.K.; Millar, E.K.A.; Graham, P.H.; Browne, L.; Sowmya, A.; Meijering, E.",
    paperUrl: "https://www.mdpi.com/2072-6694/15/9/2569",
    codeUrl: "https://github.com/raktim-mondol/hist2RNA",
    audioSummary: "/assets/audio/hist2rna-summary.wav"
  },
  {
    title: "AFExNet: An Adversarial Autoencoder for Differentiating Breast Cancer Sub-types and Extracting Biologically Relevant Genes",
    journal: "IEEE/ACM Transactions on Computational Biology and Bioinformatics",
    year: 2021,
    authors: "Mondol, R.K., N. D. Truong, M. Reza, S. Ippolito, E. Ebrahimie, and O. Kavehei",
    paperUrl: "https://ieeexplore.ieee.org/document/9378938",
    codeUrl: "https://github.com/NeuroSyd/breast-cancer-sub-types",
    audioSummary: "/assets/audio/afexnet-summary.wav"
  }
];

export default function Publications() {
  return (
    <section id="publications" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Publications</h2>
          <p className="mt-4 text-xl text-gray-600">Selected peer-reviewed research papers</p>
        </div>

        <div className="mt-12 space-y-8">
          {publications.map((pub, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex items-start space-x-4">
                <BookText className="h-6 w-6 text-[#94c973] mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{pub.title}</h3>
                  <p className="mt-2 text-gray-600">
                    {pub.authors}
                  </p>
                  <p className="mt-1 text-gray-600">
                    {pub.journal} ({pub.year})
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a
                      href={pub.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#94c973] hover:text-[#7fb95e]"
                    >
                      <span>Read Paper</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href={pub.codeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#94c973] hover:text-[#7fb95e]"
                    >
                      <span>View Code</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </a>
                  </div>
                  
                  <div className="mt-4">
                    <AudioPlayer src={pub.audioSummary} title="Paper Summary" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="https://scholar.google.com/citations?user=UaGa0S4AAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#94c973] hover:bg-[#7fb95e] transition-colors"
          >
            View More Publications on Google Scholar
          </a>
        </div>
      </div>
    </section>
  );
}