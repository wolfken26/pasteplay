import { Check, Star } from 'lucide-react';

const freeFeatures = [
  'Instant paste → speak',
  'Basic system voices',
  'Works offline',
  '20+ major languages',
  'Max 2,000 characters per paste',
  'Privacy Mode (Zero Data Retention)',
  'Local storage',
];

const proFeatures = [
  'Unlimited text-to-speech',
  'Hotkey customization',
  'Tray mode + background mode',
  'History / saved clips / pinned favorites',
  '100+ languages',
  'Privacy Mode (Zero Data Retention)',
  'Local storage',
  'Priority support + feature requests',
  'Early access to new features',
  'Lightning Fast search using keywords',
  'AI premium voices (Bella) — browse the Voice Library',
];

interface PricingProps {
  onProAction?: (plan: 'monthly' | 'yearly') => void;
}

export function Pricing({ onProAction }: PricingProps) {
  return (
    <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
          What You Get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-3xl shadow-xl p-8 md:p-10 border border-gray-800 hover:border-gray-700 transition-all duration-300">
            <h3 className="text-3xl font-black mb-8 text-white flex items-center gap-2">
              <Check className="w-8 h-8 text-green-500" />
              Free
            </h3>
            <ul className="space-y-4">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 group/item">
                  <div className="mt-1 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-gray-500 group-hover/item:text-green-500 transition-colors" />
                  </div>
                  <span className="text-gray-400 group-hover/item:text-gray-200 transition-colors">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm font-medium">No account required</p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-blue-900/40 rounded-3xl shadow-2xl p-8 md:p-10 border-2 border-cyan-400 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-full py-2 px-4 shadow-lg shadow-cyan-500/20">
                Most Popular
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-4xl font-black text-white mb-2 flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                Pro
              </h3>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
                  $7.99 / month
                </span>
                <span className="text-cyan-400 font-bold flex items-center gap-2">
                  or $70 yearly
                  <span className="bg-cyan-500 text-black text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                    Save 25%
                  </span>
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 group/item">
                  <div className="mt-1 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 group-hover/item:bg-cyan-500 transition-colors">
                    <Check className="w-3 h-3 text-cyan-400 group-hover/item:text-black transition-colors" />
                  </div>
                  <span className="text-gray-300 group-hover/item:text-white transition-colors">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <button
                onClick={() => onProAction?.('monthly')}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-black text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Get Monthly — $7.99
                <Star className="w-5 h-5" />
              </button>
              <button
                onClick={() => onProAction?.('yearly')}
                className="w-full py-4 bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-900 rounded-xl font-black text-lg hover:shadow-xl hover:shadow-white/10 transition-all flex items-center justify-center gap-2 border border-white/50 shadow-inner group"
              >
                Get Yearly — $70
                <Star className="w-5 h-5 fill-current text-yellow-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
