import { Mic, Download, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VoiceLibraryCTA() {
    return (
        <section className="py-20 bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-[3rem] p-8 md:p-16 border border-gray-800 shadow-2xl group">
                    {/* Animated Background Glow */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-all duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-12">
                        {/* Visual Part */}
                        <div className="lg:w-1/2 flex justify-center">
                            <div className="relative">
                                {/* Voice Card Stack Effect */}
                                <div className="absolute top-4 left-4 w-64 h-80 bg-gradient-to-br from-rose-500/20 to-purple-500/20 rounded-3xl border border-white/5 rotate-6 blur-sm" />
                                <div className="absolute top-2 left-2 w-64 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl border border-white/5 rotate-3" />

                                <div className="relative w-64 h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700 p-6 shadow-2xl transform transition-transform group-hover:scale-[1.02] duration-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl shadow-lg ring-4 ring-cyan-500/20">
                                            🌸
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-lg">Bella</p>
                                            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Conversational</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
                                        </div>
                                        <div className="h-1.5 w-2/3 bg-gray-800 rounded-full" />
                                        <div className="h-1.5 w-5/6 bg-gray-800 rounded-full" />
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1 text-yellow-400 font-black text-[10px] uppercase tracking-tighter">
                                                <Star className="w-3 h-3 fill-current" />
                                                Pro AI Voice
                                            </div>
                                            <span className="text-gray-500 text-[10px] font-bold">~3 MB</span>
                                        </div>
                                        <div className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center gap-2 text-white font-black text-xs shadow-lg shadow-cyan-500/20">
                                            <Download className="w-3 h-3" />
                                            Downloaded
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Part */}
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6 transition-colors group-hover:bg-cyan-500/20">
                                <Mic className="w-4 h-4 text-cyan-400" />
                                <span className="text-cyan-400 text-xs font-black uppercase tracking-widest">Premium Voices</span>
                                <span className="bg-cyan-500 text-black text-[10px] px-2 py-0.5 rounded-full font-black uppercase ml-1 shadow-lg shadow-cyan-500/20">
                                    New
                                </span>
                            </div>

                            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                                Give your reading a <br />
                                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Human Touch
                                </span>
                            </h2>

                            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                Browse our curated library of premium AI voices. From warm and friendly to professional business tones — pick the voice that matches your vibe.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/voices"
                                    className="px-8 py-4 bg-white text-black rounded-2xl font-black text-lg hover:bg-cyan-400 transition-all flex items-center gap-2 group/btn shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:-translate-y-1"
                                >
                                    Explore Voice Library
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Available Now • Pro Only
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
