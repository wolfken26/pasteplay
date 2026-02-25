import { CreditCard, RefreshCcw, Mail, Scale } from 'lucide-react';

export function Terms() {
    return (
        <section className="py-20 md:py-32 bg-gray-950 text-gray-200 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text mb-6">
                        Legal Documents
                    </h1>
                    <p className="text-xl text-gray-400">
                        Terms of Service & Refund Policy
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Terms of Service Section */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Scale className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white">Terms of Service (PastePlay)</h2>
                                <p className="text-gray-500 text-sm">Last updated: [02/20/2026]</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <p className="text-lg text-gray-300 leading-relaxed italic">
                                By downloading, installing, or using PastePlay (“the App”), you agree to these Terms.
                            </p>

                            <div className="grid gap-8">
                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">1.</span> The App
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        PastePlay is a desktop utility that provides text-to-speech functionality and related features.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">2.</span> Eligibility
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        You must be at least 13 years old to use PastePlay. If you are under 18, you must have permission from a parent or guardian.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">3.</span> Subscriptions & Billing
                                    </h3>
                                    <div className="space-y-4 text-gray-400">
                                        <p>
                                            PastePlay offers both free and paid features. Paid subscriptions are billed through our payment provider (Stripe). Subscription access is tied to the email used to sign in.
                                        </p>
                                        <p>
                                            You can manage, cancel, or update billing details anytime through the billing portal.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">4.</span> Acceptable Use
                                    </h3>
                                    <p className="text-gray-400 mb-3">You agree not to use PastePlay to:</p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                                        <li>violate any laws or regulations</li>
                                        <li>infringe copyrights or intellectual property</li>
                                        <li>generate or distribute harmful, abusive, or illegal content</li>
                                        <li>attempt to reverse engineer or abuse the licensing system</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">5.</span> Availability
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        We may update, modify, or discontinue features at any time. We do not guarantee uninterrupted access, especially for beta or “coming soon” features.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">6.</span> Disclaimer
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed italic">
                                        PastePlay is provided “as is” without warranties of any kind. We do not guarantee the accuracy, performance, or fitness for a particular purpose.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">7.</span> Limitation of Liability
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        To the maximum extent permitted by law, PastePlay and its creators will not be liable for any indirect, incidental, or consequential damages.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">8.</span> Termination
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        We may suspend or terminate access if we detect abuse, fraud, or violations of these Terms.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-blue-500">9.</span> Contact & Payments
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-gray-950/50 rounded-xl border border-gray-800">
                                            <Mail className="w-5 h-5 text-blue-400" />
                                            <span className="text-gray-300">Support: <a href="mailto:wolftech262000@gmail.com" className="text-blue-400 hover:text-cyan-400 transition-colors">wolftech262000@gmail.com</a></span>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-gray-950/50 rounded-xl border border-gray-800">
                                            <CreditCard className="w-5 h-5 text-green-400" />
                                            <span className="text-gray-400">Payments are processed by <span className="text-white font-bold tracking-tight">Stripe</span>. We do not store your full payment details.</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Refund Policy Section */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <RefreshCcw className="w-24 h-24 text-blue-400" />
                        </div>

                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <RefreshCcw className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white">Refund Policy (PastePlay)</h2>
                                <p className="text-gray-500 text-sm">Last updated: [02/20/2026]</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-xl text-gray-200 font-medium">
                                If you’re not satisfied, you can request a refund within <span className="text-cyan-400">7 days</span> of your first paid purchase.
                            </p>

                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-gray-100 italic">Refunds are not guaranteed for:</h4>
                                <ul className="space-y-3">
                                    {['repeated refund requests', 'abuse or chargeback behavior', 'purchases older than 7 days'].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                <h4 className="text-white font-bold mb-2">How to Request:</h4>
                                <p className="text-gray-400 mb-4">Include the email used for your subscription and send to:</p>
                                <a href="mailto:wolftech262000@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
                                    <Mail className="w-5 h-5" />
                                    wolftech262000@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
