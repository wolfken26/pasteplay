import { X, Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => void;
    mode?: 'signin' | 'checkout';
}

export function SignInModal({ isOpen, onClose, onSuccess, mode = 'signin' }: SignInModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'checkout') {
            onSuccess(email);
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/account`,
                }
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Magic link sent! Check your email.' });
            onSuccess(email);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to send link.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Censored/Darkened Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md relative overflow-hidden group animate-fadeInUp">
                {/* Decorative flair */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 pointer-events-none"></div>

                <div className="p-8 relative z-10 text-center">
                    {/* Top-Left Close Button */}
                    <div className="absolute top-4 left-4">
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg flex items-center justify-center"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Heading */}
                    <div className="mb-8 mt-6">
                        <h2 className="text-3xl font-black text-white mb-2">
                            {mode === 'checkout' ? 'Almost There!' : 'Sign In'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {mode === 'checkout' ? 'Enter your email to continue to checkout' : 'Manage your account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
                                Email Address
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                                    placeholder="name@example.com"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            {message && (
                                <p className={`text-xs ml-1 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {message.text}
                                </p>
                            )}
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 mt-2">
                                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                                    <span className="text-blue-400 font-bold">Trust & Security:</span> Magic links are secure, one-time Supabase authentication codes. Just verify your login via your inbox—no passwords to remember or lose.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {isLoading ? 'Sending...' : mode === 'checkout' ? 'Continue to Payment' : 'Send Magic Link'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-800/50">
                        <p className="text-gray-500 text-xs leading-relaxed">
                            By signing in, you agree to our{' '}
                            <button className="text-blue-400 hover:underline">Terms</button> and{' '}
                            <button className="text-blue-400 hover:underline">Privacy Policy</button>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
