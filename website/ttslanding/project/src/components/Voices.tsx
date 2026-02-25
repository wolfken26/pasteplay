import { Star } from 'lucide-react';

interface Voice {
    name: string;
    description: string;
    tone: string;
    color: string;
    gradient: string;
    icon: string;
    kokoroId?: string;
}

const voices: Voice[] = [
    {
        name: 'Bella',
        description: 'Warm & friendly voice perfect for casual conversations and everyday reading.',
        tone: 'Conversational',
        color: 'from-pink-500 to-rose-500',
        gradient: 'from-pink-900/30 via-rose-900/20 to-pink-900/30',
        icon: '🌸',
        kokoroId: 'af_bella',
    }
];

export function Voices() {
    return (
        <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                        <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                        <span className="text-blue-400 text-sm font-semibold tracking-wide uppercase">AI Voice Library</span>
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase ml-1 shadow-sm">
                            v1.0 Ready
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                        Meet Bella
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Experience high-fidelity <span className="text-white font-medium">Local AI Synthesis</span>. Bella is included with PastePlay Pro, running 100% offline on your machine with near-instant response and no character limits.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            Included in v1.0 • <span className="text-cyan-400 font-semibold">Native Support</span> • Runs 100% offline on CPU
                        </p>
                    </div>
                </div>

                {/* Voice Card Display */}
                <div className="flex justify-center">
                    {voices.map((voice) => {
                        return (
                            <div
                                key={voice.name}
                                className={`max-w-md w-full bg-gradient-to-br ${voice.gradient} rounded-3xl border border-gray-800 p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 group`}
                            >
                                {/* Icon + Name */}
                                <div className="flex items-center gap-5 mb-8">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${voice.color} flex items-center justify-center text-4xl shadow-lg shadow-black/40`}>
                                        {voice.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-3xl">{voice.name} (AI)</h3>
                                        <span className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">{voice.tone}</span>
                                    </div>
                                </div>

                                <p className="text-gray-300 text-xl mb-10 leading-relaxed font-medium">{voice.description}</p>

                                {/* Pro badge + status */}
                                <div className="flex flex-col gap-4 mb-4 p-6 bg-black/40 rounded-2xl border border-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                            <span className="text-green-400 text-xs font-black uppercase tracking-widest">
                                                Live in v1.0
                                            </span>
                                        </div>
                                        <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                                            Premium Pro Voice
                                        </span>
                                    </div>
                                    <div className="h-[1px] bg-gray-800/50 w-full" />
                                    <div className="flex items-center justify-center gap-2 py-2">
                                        <span className="text-white font-bold text-sm tracking-wide">Pre-installed & Ready</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Note */}
                <div className="text-center mt-20 p-10 bg-gradient-to-b from-gray-900/50 to-transparent rounded-3xl border border-gray-800/50 max-w-3xl mx-auto backdrop-blur-sm">
                    <p className="text-gray-400 italic text-lg leading-relaxed">
                        "Bella represents our first step into high-quality local AI voices. By removing the need for cloud APIs, we give you total privacy and unlimited speech without the subscription fatigue of per-character billing."
                    </p>
                </div>
            </div>
        </section>
    );
}
