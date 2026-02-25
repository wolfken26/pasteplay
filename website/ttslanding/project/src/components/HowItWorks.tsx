import { Copy, Play, Bookmark } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Copy,
    title: 'Highlight text anywhere',
    description: 'Press your hotkey.',
  },
  {
    number: 2,
    icon: Play,
    title: 'Widget pops up with text auto-filled',
    description: 'Press Play.',
  },
  {
    number: 3,
    icon: Bookmark,
    title: 'Pause, resume, or save to history',
    description: 'Keep working.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            How it works in 3 steps
          </h2>
          <p className="text-xl text-gray-400">
            Simple, fast, and focused on getting you listening
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx}>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/50">
                      {step.number}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-1 h-16 bg-gradient-to-b from-blue-600 to-cyan-600/30 mt-4"></div>
                    )}
                  </div>

                  <div className="pb-8 pt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-2xl font-bold text-gray-100">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-lg font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-8 border border-blue-500/30 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Quick Start</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 w-6">1.</span>
              <span>Download PastePlay</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 w-6">2.</span>
              <span>Choose your hotkey (Ctrl+Alt+R by default) or set hotkey i.e Ctrl+z or command+z</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 w-6">3.</span>
              <span>Highlight any text and press your hotkey — start listening</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
