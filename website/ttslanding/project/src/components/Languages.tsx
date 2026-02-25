import { Globe, Settings, Laptop, Info, CheckCircle2 } from 'lucide-react';

export function Languages() {
    return (
        <section className="py-20 md:py-32 bg-gray-950 text-gray-200 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-6">
                        Works with any language your computer speaks
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        The app leverages your computer's native Speech Synthesis engine.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-cyan-500/50 transition-all">
                        <Globe className="w-10 h-10 text-cyan-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Dozens of Languages</h3>
                        <p className="text-gray-400 text-sm">
                            If you have English, Spanish, French, Mandarin, or any other language pack installed on Windows or Mac, PastePlay detects them automatically.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-cyan-500/50 transition-all">
                        <Laptop className="w-10 h-10 text-cyan-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">System-Native Quality</h3>
                        <p className="text-gray-400 text-sm">
                            It uses the same high-quality voices you're already used to on your device.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-cyan-500/50 transition-all">
                        <CheckCircle2 className="w-10 h-10 text-cyan-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Intelligent Highlighting</h3>
                        <p className="text-gray-400 text-sm">
                            We use a modern "Word Segmenter" API (Intl.Segmenter) that knows the difference between English spaces and Chinese characters, ensuring the highlighting is perfectly synced regardless of the language.
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                            <Settings className="text-cyan-400" />
                            Install more Voice Packs
                        </h2>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Windows Voice Pack Installation (10/11)</h3>
                                <ol className="space-y-4 text-gray-400 list-decimal list-inside">
                                    <li>Open the <span className="text-gray-200">Settings</span> app.</li>
                                    <li>Go to <span className="text-gray-200">Time & Language &gt; Speech</span>.</li>
                                    <li>Click on <span className="text-gray-200">Add a voice</span>.</li>
                                    <li>Search or browse for the language/voice you want to add, then click <span className="text-gray-200">Add</span>.</li>
                                    <li className="list-none pt-2 text-sm italic">
                                        <span className="text-cyan-400 font-semibold">Alternative:</span> Go to Time & Language &gt; Language & Region, click the three dots (...) next to a language, select Language options, and download the Speech pack.
                                    </li>
                                </ol>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">macOS Voice Pack Installation</h3>
                                <ol className="space-y-4 text-gray-400 list-decimal list-inside">
                                    <li>Open <span className="text-gray-200">System Settings</span>.</li>
                                    <li>Select <span className="text-gray-200">Accessibility &gt; Spoken Content</span>.</li>
                                    <li>Click the dropdown menu for <span className="text-gray-200">System Voice</span>.</li>
                                    <li>Choose <span className="text-gray-200">Manage Voices...</span>.</li>
                                    <li>Select a language or voice, click the download icon to install it.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-cyan-900/10 border border-cyan-900/30 rounded-2xl">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Info className="text-cyan-400 w-5 h-5" />
                                Tips for better quality
                            </h3>
                            <ul className="space-y-3 text-gray-400">
                                <li><span className="text-white font-medium">Windows:</span> Look for "Natural Voices" in the Speech settings for higher quality.</li>
                                <li><span className="text-white font-medium">Mac:</span> Choose "Enhanced" or "Premium" versions of voices for better sound quality.</li>
                            </ul>
                        </div>
                        <div className="p-8 bg-blue-900/10 border border-blue-900/30 rounded-2xl flex items-center justify-center text-center">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Need a Restart?</h3>
                                <p className="text-gray-400">Some apps may require a restart to recognize the new voices after installation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
