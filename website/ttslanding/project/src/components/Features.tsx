import { Zap, Clipboard, Settings, Wind, History, Lock, Search } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant pop-up widget',
    description: 'Press your global hotkey or paste text into the tiny floating box — no app switching needed.',
    benefit: 'Save seconds every time.',
  },
  {
    icon: Clipboard,
    title: 'Clipboard-first workflow',
    description: 'Select text anywhere, hit the hotkey, and PastePlay auto-fills from the clipboard. Manual paste also supported.',
    benefit: 'Zero friction input.',
  },
  {
    icon: Settings,
    title: 'Hotkey customization',
    description: 'Set your own accelerator (Ctrl/Alt/Shift combos) so PastePlay matches your workflow.',
    benefit: 'Works the way you work.',
    badge: 'Pro',
  },
  {
    icon: Wind,
    title: 'Tray & background mode',
    description: 'Close the window and keep PastePlay running in the tray so hotkeys always respond.',
    benefit: 'Always-on convenience.',
    badge: 'Pro',
  },
  {
    icon: History,
    title: 'History & saved snippets',
    description: 'Replay past snippets and pin your favorites for later. With local storage, your history is effectively unlimited. Even 100,000 clips would barely take up any disk space (less than a single photo!).',
    benefit: 'Quick recall of important passages.',
    badge: 'Pro',
  },
  {
    icon: Lock,
    title: 'Privacy-first & local voices',
    description: 'Your text never leaves your computer — no servers, no cloud tracking, no data retention.',
    benefit: 'Your text never leaves your machine.',
  },
  {
    icon: Search,
    title: 'Lightning-Fast Search',
    description: 'The search bar is now live in the History section—right where you wanted it. Pro users can now filter through their entire history instantly using keywords.',
    benefit: 'Find anything, instantly.',
    badge: 'Pro',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            How PastePlay helps you move faster
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to turn text into audio instantly, without friction
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  {feature.badge && (
                    <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <p className="text-cyan-400 font-semibold text-sm">
                  {feature.benefit}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
