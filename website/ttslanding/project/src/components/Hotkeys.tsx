import { Keyboard, AlertTriangle, ShieldCheck, LifeBuoy, Zap, RefreshCcw } from 'lucide-react';

export function Hotkeys() {
    return (
        <section className="py-20 md:py-32 bg-gray-950 text-gray-200 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                        <Keyboard className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Hotkey Knowledge</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text mb-6">
                        Hotkey Safety & Recovery
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        PastePlay includes multiple safeguards so you never lose access to your capture shortcut.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Fail-Safe Rollback */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl group hover:border-blue-500/30 transition-all">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="p-4 bg-blue-500/10 rounded-2xl shrink-0">
                                <ShieldCheck className="w-10 h-10 text-blue-400" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-white">Fail-Safe Rollback</h2>
                                <p className="text-gray-400 leading-relaxed text-lg">
                                    If you try to set a hotkey that conflicts with another app or with Windows/macOS reserved shortcuts, PastePlay will warn you and automatically revert to your last working hotkey.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm text-gray-300 italic">Choose your hotkey (Ctrl+Alt+R by default) or set hotkey i.e Ctrl+z or command+z</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Default & Emergency Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Default Hotkey */}
                        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <Keyboard className="text-cyan-400" />
                                    Default Hotkey
                                </h3>
                                <p className="text-gray-400 mb-8 font-medium">On a fresh install, PastePlay uses:</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-2xl border border-gray-800 group-hover:bg-cyan-500/5 transition-colors">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter text-xs">Windows</span>
                                        <kbd className="px-3 py-1 bg-gray-800 rounded-lg border-b-4 border-gray-700 text-white font-black">Ctrl + Alt + R</kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-2xl border border-gray-800 group-hover:bg-cyan-500/5 transition-colors">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter text-xs">macOS</span>
                                        <kbd className="px-3 py-1 bg-gray-800 rounded-lg border-b-4 border-gray-700 text-white font-black">⌘ + ⌥ + R</kbd>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all"></div>
                        </div>

                        {/* Emergency Reset */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-500/20 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-red-500/40 transition-all">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <AlertTriangle className="text-red-400" />
                                    Emergency Reset
                                </h3>
                                <p className="text-gray-400 mb-8 font-medium">If you forget your shortcut or it stops working, use the built-in reset combo:</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 group-hover:bg-red-500/10 transition-colors">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter text-xs">Windows</span>
                                        <kbd className="px-3 py-1 bg-gray-800 rounded-lg border-b-4 border-gray-700 text-red-400 font-black">Ctrl+Alt+Shift+R</kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 group-hover:bg-red-500/10 transition-colors">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter text-xs">macOS</span>
                                        <kbd className="px-3 py-1 bg-gray-800 rounded-lg border-b-4 border-gray-700 text-red-400 font-black">⌘+⌥+⇧+R</kbd>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                                    <RefreshCcw className="w-4 h-4" />
                                    <span>This instantly restores the default capture hotkey.</span>
                                </div>
                            </div>
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all"></div>
                        </div>
                    </div>

                    {/* Prompt Support */}
                    <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-lg">
                        <div className="p-4 bg-blue-500/10 rounded-full shrink-0">
                            <LifeBuoy className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-xl mb-1">Still stuck?</h4>
                            <p className="text-gray-400">If the emergency reset doesn't work, try restarting the app or contact support at <a href="mailto:wolftech262000@gmail.com" className="text-blue-400 hover:text-cyan-400 transition-colors font-bold">wolftech262000@gmail.com</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
