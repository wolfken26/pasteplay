import { Download, Shield, Star, Wifi, Zap } from 'lucide-react';

interface CTAProps {
  onProAction?: (plan: 'monthly' | 'yearly') => void;
}

export function CTA({ onProAction }: CTAProps) {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950 overflow-hidden text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
        <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
          Ready to listen instead of read?
        </h2>
        <p className="text-xl text-gray-400 mb-4">
          Get PastePlay free. No credit card. No signup. Just download, set your hotkey, and start listening.
        </p>
        <p className="text-sm text-gray-500 mb-10">
          <span className="font-semibold text-gray-400">Free forever.</span> Pro unlocks hotkeys, tray, history, and premium voices later.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <a
            href="/downloads/PastePlay-v1-Setup.exe"
            download="PastePlay-v1-Setup.exe"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all inline-flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Free
          </a>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onProAction?.('monthly')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-black text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 min-w-[280px]"
            >
              Get Monthly — $7.99
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={() => onProAction?.('yearly')}
              className="px-8 py-3 bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-900 rounded-xl font-black text-lg hover:shadow-xl hover:shadow-white/10 transition-all flex items-center justify-center gap-2 border border-white/50 shadow-inner group min-w-[280px]"
            >
              Get Yearly — $70
              <Star className="w-4 h-4 fill-current text-yellow-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>


        <p className="text-[10px] text-gray-600 mb-12 max-w-sm mx-auto">
          <Shield className="w-3 h-3 inline mr-1 mb-0.5" />
          Magic links are secure, passwordless authentication codes powered by Supabase.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
            <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-100 mb-2">Privacy-First</h3>
            <p className="text-gray-400 text-sm">Your text never leaves your machine by default</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
            <Wifi className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-100 mb-2">Offline Ready</h3>
            <p className="text-gray-400 text-sm">Works completely offline with system voices</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
            <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-100 mb-2">No Friction</h3>
            <p className="text-gray-400 text-sm">One hotkey, zero learning curve</p>
          </div>
        </div>
      </div>
    </section>
  );
}
