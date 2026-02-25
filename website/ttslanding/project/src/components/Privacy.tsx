
import { ShieldCheck, ServerOff, DatabaseZap } from 'lucide-react';

export function Privacy() {
  return (
    <section id="privacy" className="py-20 md:py-32 bg-gray-950 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Your Privacy, Our Priority
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            We are committed to protecting your data. Here’s how we do it.
          </p>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <ShieldCheck className="w-16 h-16 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-100">Privacy by Design</h3>
              <p className="mt-2 text-gray-400">
                PastePlay is built with privacy at its core. We believe that your data is yours and yours alone. Our application is designed to work offline, using your system’s built-in text-to-speech engines.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-shrink-0">
              <ServerOff className="w-16 h-16 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-100">Zero Data Retention</h3>
              <p className="mt-2 text-gray-400">
                PastePlay operates with zero data retention by default. Your text is never sent to any server, and it is never stored on disk. The application processes your text and immediately forgets it after converting to speech. This ensures your information remains entirely on your machine.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <DatabaseZap className="w-16 h-16 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-100">Local Storage</h3>
              <p className="mt-2 text-gray-400">
                When you choose to save your history, all data is stored locally on your device. Your snippets and preferences never touch our servers. This gives you the benefit of keeping a record of your work without compromising your privacy. You have full control over your data and can clear your history at any time.
              </p>
            </div>
          </div>

          {/* Detailed Policy Section */}
          <div className="mt-20 pt-20 border-t border-gray-800/50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-1">Privacy Policy (PastePlay)</h2>
                    <p className="text-gray-500 text-sm">Last updated: [02/20/2026]</p>
                  </div>
                  <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                    <span className="text-cyan-400 font-bold text-sm">Privacy-First</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-cyan-400 font-black uppercase tracking-widest text-xs mb-4">What we collect</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                          <span>Your email address <span className="text-gray-500 text-sm">(only if you sign in)</span></span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                          <span>Subscription status <span className="text-gray-500 text-sm">(active/inactive)</span> linked to your account</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                          <span>Basic billing metadata stored by Stripe <span className="text-gray-500 text-sm">(handled by Stripe)</span></span>
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-red-400/80 font-black uppercase tracking-widest text-xs mb-4">What we do NOT collect</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-2 shrink-0" />
                          <span>We do not collect the text you paste into the app</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-2 shrink-0" />
                          <span>We do not store your clipboard content on our servers</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-2 shrink-0" />
                          <span>We do not sell personal data</span>
                        </li>
                      </ul>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="bg-gray-800/30 p-8 rounded-2xl border border-gray-800">
                      <h4 className="text-blue-400 font-black uppercase tracking-widest text-xs mb-4">Local storage</h4>
                      <p className="text-gray-400 text-sm mb-4 font-medium">PastePlay may store preferences locally on your device, such as:</p>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-500/50 rounded-full shrink-0" />
                          <span>hotkey settings</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-500/50 rounded-full shrink-0" />
                          <span>app preferences</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-1 h-4 bg-blue-500/50 rounded-full shrink-0" />
                          <span>optional snippet history <span className="text-gray-500 text-sm">(if enabled)</span></span>
                        </li>
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
