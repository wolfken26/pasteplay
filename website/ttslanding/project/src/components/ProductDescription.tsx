import { Lock, Zap, BookOpen } from 'lucide-react';

export function ProductDescription() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <p className="text-gray-100 leading-relaxed font-medium text-lg">
                "PastePlay is a tiny always-on TTS widget that pops up with one hotkey. Highlight text anywhere, press your shortcut, paste, and listen — no context-switching, no clutter."
              </p>
            </div>

            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">What is PastePlay?</h2>

            <p className="text-gray-300 leading-relaxed mb-6 text-lg">
              PastePlay is the fastest way to turn any text into audio. Whether you're debugging long docs, scanning research, or doom-scrolling through long threads, PastePlay gives you a compact, always-on widget that reads so you don't have to.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6 text-lg">
              Unlike cloud-only tools, PastePlay works offline and never sends your text to servers. That means faster playback, lower cost, and true privacy.
            </p>

            <p className="text-gray-400 leading-relaxed mb-8">
              It starts with a single global hotkey, auto-fills from the clipboard, and plays using local system voices for instant reliability and privacy. Free features include max 2,000 characters per paste and offline operation.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-100">Instant & Always-On</h3>
                  <p className="text-gray-400 text-sm">One hotkey to pop open, works in the background</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-100">Privacy-First</h3>
                  <p className="text-gray-400 text-sm">Local voices, zero cloud retention by default</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <BookOpen className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-100">No Context Switching</h3>
                  <p className="text-gray-400 text-sm">Tiny floating widget keeps you focused</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border border-gray-700 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <h3 className="font-bold text-gray-100 mb-4">Free Features</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span className="text-gray-300">Max 2,000 characters per paste</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span className="text-gray-300">Offline operation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span className="text-gray-300">System voices</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span className="text-gray-300">Basic pop-up widget</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-6 border border-blue-500/50 backdrop-blur-sm">
                <h3 className="font-bold text-gray-100 mb-4">Pro — $7.99/mo</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span className="text-gray-300">Custom hotkeys</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span className="text-gray-300">Tray & background mode</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span className="text-gray-300">History & saved snippets</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span className="text-gray-300">Coming: Premium AI voices</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
