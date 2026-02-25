import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ContactModal } from './ContactModal';

const faqs = [
  {
    question: 'Does PastePlay send my text to the cloud?',
    answer: 'No. By default PastePlay uses local system TTS and stores history locally. Privacy Mode disables history entirely.',
  },
  {
    question: 'Which platforms are supported?',
    answer: 'Windows and macOS for the first release. Linux and mobile experiences are in the roadmap.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No for the free features. Signing in is required to enable subscription features and multi-device entitlements.',
  },
  {
    question: 'How do I update?',
    answer: 'PastePlay supports auto-update; you can also download the latest EXE/installer from the website.',
  },
  {
    question: "What if the highlighted text doesn't work with the hotkeys?",
    answer: "If it doesn't just work with a highlight key, you can highlight it again, press the copy button, then press your hot key.",
  },
  {
    question: 'Do I need to run PastePlay as Administrator?',
    answer: 'Yes — for best results, right-click the PastePlay shortcut and select "Run as Administrator." This allows PastePlay\'s global hotkeys to capture text from elevated applications like Task Manager or certain enterprise tools.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            Quick questions
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about PastePlay
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-cyan-500/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-6 pb-5 border-t border-gray-700/50 animate-fadeInUp">
                  <p className="text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/30 text-center backdrop-blur-sm">
          <p className="text-gray-300">
            Still have questions?{' '}
            <button onClick={() => setIsModalOpen(true)} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors bg-transparent border-none p-0">
              Contact us
            </button>
          </p>
        </div>
      </div>
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
