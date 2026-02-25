import { Code, BookOpen, Briefcase } from 'lucide-react';

const audiences = [
  {
    icon: Code,
    title: 'Developers and Engineers',
    description: 'Consume long docs and issues while coding without context switching.',
    highlights: [
      'Read API docs while hands stay on keyboard',
      'Listen to error messages and logs',
      'Review PRs and code comments',
    ],
  },
  {
    icon: BookOpen,
    title: 'Students and Researchers',
    description: 'Multitask while listening to papers, articles, and research documents.',
    highlights: [
      'Listen to research papers while taking notes',
      'Consume course materials during other tasks',
      'Review long academic texts faster',
    ],
  },
  {
    icon: Briefcase,
    title: 'Busy Professionals',
    description: 'Process long emails, articles, and meeting notes as audio.',
    highlights: [
      'Listen to long emails while other work continues',
      'Consume daily news and industry articles',
      'Review meeting notes hands-free',
    ],
  },
];

export function Audience() {
  return (
    <section id="audience" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            Who is PastePlay for?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            If you read a lot and want to do more with your time, PastePlay is for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, idx) => {
            const Icon = audience.icon;
            return (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-8 border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg w-fit mb-4">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-3">
                  {audience.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {audience.description}
                </p>
                <ul className="space-y-3">
                  {audience.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="flex gap-3 text-sm">
                      <span className="text-cyan-400 font-bold flex-shrink-0">+</span>
                      <span className="text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
