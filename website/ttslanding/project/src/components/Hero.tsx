import { ChevronDown, Download, Info, Sparkles, ShieldCheck, DatabaseZap } from 'lucide-react';
import { useState } from 'react';
import { UpdatesModal } from './UpdatesModal';
import { motion } from 'framer-motion';

export function Hero() {
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);

  return (
    <section id="hero" className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">The faster way to read long text — <span className="text-blue-400 font-bold">v1.0 (pasteplay.app beta)</span></span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            Highlight. Hotkey. Listen.
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
          Turn any text into audio instantly — so you can absorb information while you work.
        </p>

        <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://github.com/wolfken26/pasteplay/releases/download/v1.0.0/PastePlay.Setup.1.0.0.exe"
            download="PastePlay-v1-Setup.exe"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all inline-flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download for Windows
          </a>
          <button className="group px-8 py-4 bg-gray-700 text-gray-400 rounded-lg font-bold text-lg cursor-not-allowed inline-flex items-center justify-center gap-2" disabled>
            <Download className="w-5 h-5" />
            macOS (Coming Soon)
          </button>
          <button className="group px-8 py-4 bg-gray-700 text-gray-400 rounded-lg font-bold text-lg cursor-not-allowed inline-flex items-center justify-center gap-2" disabled>
            <Download className="w-5 h-5" />
            Linux (Coming Soon)
          </button>
        </div>


        <div className="flex justify-center">
          <button onClick={() => setIsUpdatesModalOpen(true)} className="px-8 py-4 border-2 border-gray-700 text-gray-300 rounded-lg font-bold hover:border-blue-500 hover:bg-blue-600/10 transition-all inline-flex items-center justify-center gap-2">
            <Info className="w-5 h-5" />
            Check for updates
          </button>
        </div>

        <p className="text-sm text-gray-400 mt-12 mb-12">
          Highlight any text, pick your hotkey (e.g., Ctrl+Z or Command+Z), and start listening.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm"
        >
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-gray-100">Privacy by Design</h3>
                <p className="text-sm text-gray-400 mt-1">PastePlay is built with privacy at its core. Our application is designed to work offline, using your system’s built-in text-to-speech engines.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <DatabaseZap className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-gray-100">Local Storage</h3>
                <p className="text-sm text-gray-400 mt-1">When you choose to save your history, all data is stored locally on your device. Your snippets and preferences never touch our servers.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <button className="mx-auto block p-2 hover:bg-gray-800/50 rounded-full transition-colors animate-bounce text-gray-400 hover:text-blue-400 mt-16">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
      <UpdatesModal isOpen={isUpdatesModalOpen} onClose={() => setIsUpdatesModalOpen(false)} />
    </section>
  );
}
