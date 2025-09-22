
import React, { useEffect, useRef } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="p-4 rounded-lg bg-slate-100 open:bg-slate-200/50 transition-colors group">
        <summary className="font-semibold text-slate-800 cursor-pointer list-none flex justify-between items-center">
            {question}
            <svg className="w-5 h-5 text-slate-500 transform transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </summary>
        <div className="mt-3 text-slate-600 text-sm max-w-none prose prose-sm">
            {children}
        </div>
    </details>
);

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-800 relative animate-fade-in-up flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
            <h2 id="help-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help & Support
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close help modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
            <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Frequently Asked Questions</h3>
                <div className="space-y-2">
                    <FAQItem question="Where can I get a Google Gemini API key?">
                        <p>You can get a Gemini API key from Google AI Studio. It's free to get started.</p>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-600)] hover:underline font-medium">Get your API Key here</a>.
                    </FAQItem>
                    <FAQItem question="Why is my API key not working?">
                        <p>There could be several reasons:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The key might be copied incorrectly. Double-check for any extra spaces or missing characters.</li>
                            <li>The project associated with the key might not have the "Generative Language API" enabled in Google Cloud.</li>
                            <li>For heavy usage, you may need to set up billing on your Google Cloud account.</li>
                        </ul>
                    </FAQItem>
                    <FAQItem question="Why is video generation so slow?">
                        <p>Creating high-quality video from a text prompt is a very complex and computationally intensive process. The model needs to generate thousands of individual frames and ensure they are coherent. The process can take several minutes, which is normal for the current state of this technology.</p>
                    </FAQItem>
                </div>
            </section>

            <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Contact & Issues</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-slate-800">Report a Bug</h4>
                            <p className="text-sm text-slate-600">Found a bug or have a feature request? Please open an issue on our GitHub repository. This is the fastest way to get a response from the development team.</p>
                            <a href="https://github.com/google/ai-studio-web-apps/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-accent-600)] hover:underline font-medium mt-1 inline-block">
                                Open an Issue
                            </a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-slate-800">General Inquiries</h4>
                            <p className="text-sm text-slate-600">For other questions or support, you can reach out to us via email.</p>
                             <a href="mailto:support@example.com" className="text-sm text-[var(--color-accent-600)] hover:underline font-medium mt-1 inline-block">
                                support@example.com
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        /* Style for the details/summary arrow */
        details summary::-webkit-details-marker {
            display: none;
        }
        details > summary svg {
            transition: transform 0.2s;
        }
        details[open] > summary svg {
            transform: rotate(180deg);
        }
       `}</style>
    </div>
  );
};

export default HelpModal;
