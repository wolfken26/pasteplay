import { CheckCircle, ArrowRight, Mail, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Success() {
    return (
        <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black min-h-screen flex items-center justify-center">
            <div className="max-w-xl w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle className="w-16 h-16 text-green-500 shadow-lg shadow-green-500/20" />
                    </div>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent">
                    Payment Successful!
                </h1>

                <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                    Welcome to <span className="text-white font-bold">PastePlay Pro</span>. Your account is being upgraded as we speak.
                </p>

                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-12 text-left backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        What's Next?
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black shrink-0">1</div>
                            <div>
                                <p className="text-white font-bold">Check your email</p>
                                <p className="text-gray-400 text-sm">We've sent a magic link to the email you used at checkout.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black shrink-0">2</div>
                            <div>
                                <p className="text-white font-bold">Click the link</p>
                                <p className="text-gray-400 text-sm">Logging in via the magic link will activate your Pro features across all devices.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black shrink-0">3</div>
                            <div>
                                <p className="text-white font-bold">Open the App</p>
                                <p className="text-gray-400 text-sm">The desktop app will automatically detect your new Pro status.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/account"
                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        Go to My Account
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={() => window.open('mailto:support@pasteplay.app')}
                        className="px-8 py-4 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Mail className="w-5 h-5" />
                        Support
                    </button>
                </div>
            </div>
        </section>
    );
}
