import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    User, CreditCard, Download, ExternalLink,
    HelpCircle, LogOut, ShieldCheck, Zap, Link2, Lock, Star, Mic
} from 'lucide-react';
import { ContactModal } from './ContactModal';
import { supabase, getUserPlan, getUserBilling, sendMagicLink } from '../lib/supabase';

interface AccountProps {
    onSignOut: () => void;
}

export function Account({ onSignOut }: AccountProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [plan, setPlan] = useState<'free' | 'pro'>('free');
    const [billing, setBilling] = useState<{ subscription_status: string; current_period_end: string } | null>(null);
    const [magicLinkStatus, setMagicLinkStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            const isPreview = new URLSearchParams(location.search).get('preview') === 'true';

            const { data: { user } } = await supabase.auth.getUser();

            if (!user && !isPreview) {
                navigate('/');
                return;
            }

            if (isPreview && !user) {
                // Mock data for preview mode - allow testing free vs pro via &tier=free
                const tier = new URLSearchParams(location.search).get('tier') || 'pro';

                setUserEmail('preview@example.com');
                setPlan(tier === 'free' ? 'free' : 'pro');
                setBilling(tier === 'free' ? null : {
                    subscription_status: 'active',
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                });
                setIsLoading(false);
                return;
            }

            if (user) {
                setUserEmail(user.email ?? null);
                setUserId(user.id);

                const userPlan = await getUserPlan(user.id);
                setPlan(userPlan);

                if (userPlan === 'pro') {
                    const billingData = await getUserBilling(user.id);
                    setBilling(billingData);
                }
            }
            setIsLoading(false);
        };
        loadUserData();
    }, [navigate, location.search]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onSignOut();
        navigate('/');
    };

    const handleSendMagicLink = async () => {
        if (!userEmail || plan !== 'pro') return;
        setMagicLinkStatus('Sending...');
        const { error } = await sendMagicLink(userEmail);
        if (error) {
            setMagicLinkStatus('Failed to send. Try again.');
        } else {
            setMagicLinkStatus('Sent! Check your email.');
        }
        setTimeout(() => setMagicLinkStatus(null), 4000);
    };


    const handleManageBilling = async () => {
        const isPreview = new URLSearchParams(location.search).get('preview') === 'true';
        if (isPreview) {
            alert("This is a 'Preview Mode' demo button. In production, this would securely redirect you to your Stripe Billing Portal where you can manage your payment methods and view history.");
            return;
        }

        const { data, error } = await openBillingPortal();
        if (data?.url) {
            window.location.href = data.url;
        } else if (error) {
            alert(error.message || 'Could not open billing portal. Please contact support.');
        } else {
            alert('Something went wrong. Please refresh the page and try again.');
        }
    };

    const formatDate = (ts: string) => {
        if (!ts) return 'N/A';
        return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <section className="py-20 md:py-32 bg-gray-950 text-gray-200 min-h-screen flex items-center justify-center">
                <div className="text-gray-500 animate-pulse">Loading your account...</div>
            </section>
        );
    }

    return (
        <section className="py-20 md:py-32 bg-gray-950 text-gray-200 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 bg-gray-900/40 border border-gray-800 p-8 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center gap-6 w-full lg:w-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="truncate">
                            <h1 className="text-2xl font-black text-white mb-1 truncate">{userEmail}</h1>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-black text-[10px] font-black uppercase rounded-full ${plan === 'pro' ? 'bg-cyan-400' : 'bg-gray-500'}`}>
                                    {plan === 'pro' ? 'Pro' : 'Free'} Plan
                                </span>
                                {plan === 'pro' && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-400 capitalize">
                                        <ShieldCheck className="w-3 h-3" />
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {plan === 'pro' && (
                            <Link
                                to="/voices"
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl font-black text-sm transition-all hover:-translate-y-0.5"
                            >
                                <Mic className="w-4 h-4" />
                                Voice Library
                            </Link>
                        )}
                    </div>

                    {/* Magic Link Section — Only for Pro */}
                    <div className="flex flex-col items-center text-center px-8 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-gray-800/50 w-full lg:flex-1">
                        {plan === 'pro' ? (
                            <>
                                <p className="text-gray-400 text-xs font-bold mb-1">
                                    Send a magic link to log into the app
                                </p>
                                {magicLinkStatus && <p className="text-green-400 text-xs mb-2">{magicLinkStatus}</p>}
                                <button
                                    onClick={handleSendMagicLink}
                                    title="Send magic link to your email"
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                >
                                    <Link2 className="w-4 h-4" />
                                    Magic Link
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center opacity-40">
                                <Lock className="w-6 h-6 text-gray-600 mb-2" />
                                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Pro Feature</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-red-500/10 hover:text-red-400 border border-gray-700 rounded-xl font-bold transition-all w-full lg:w-auto justify-center shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Subscription Block (Left/Main) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard className="w-24 h-24 text-white" />
                            </div>

                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-cyan-400" />
                                Subscription Details
                            </h2>

                            {/* Status Info Rows */}
                            <div className="space-y-3 mb-8 bg-black/20 rounded-2xl p-5 border border-gray-800">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-lg">✅</span>
                                    <span className="text-gray-400 font-semibold">Plan:</span>
                                    <span className="text-white font-black">{plan === 'pro' ? 'Pro' : 'Free'}</span>
                                </div>

                                {plan === 'pro' ? (
                                    <>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-lg">🟢</span>
                                            <span className="text-gray-400 font-semibold">Status:</span>
                                            <span className="text-green-400 font-black">Active</span>
                                        </div>
                                        {billing?.current_period_end && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-lg">📅</span>
                                                <span className="text-gray-400 font-semibold">Next billing date:</span>
                                                <span className="text-white font-black">{formatDate(billing.current_period_end)}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                                        <p className="text-xs text-cyan-400 font-bold flex items-center gap-2">
                                            <Zap className="w-3 h-3" />
                                            Upgrade to Pro for AI voices and unlimited text.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mb-3 flex-wrap">
                                {plan === 'pro' ? (
                                    <>
                                        <button
                                            onClick={handleManageBilling}
                                            className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-black text-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            Manage Billing
                                            <ExternalLink className="w-5 h-5" />
                                        </button>

                                        {/* Upsell to Yearly for Pro users (assumed Monthly if they see this) */}
                                        <a
                                            href={`https://buy.stripe.com/28E7sNc3Uemz4RWdsb1Jm08?prefilled_email=${encodeURIComponent(userEmail || '')}&client_reference_id=${userId}`}
                                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-900 rounded-xl font-black text-lg hover:shadow-xl hover:shadow-white/10 transition-all flex items-center justify-center gap-2 border border-white/50 shadow-inner group"
                                        >
                                            Upgrade to Yearly
                                            <Star className="w-5 h-5 fill-current text-yellow-500 group-hover:scale-110 transition-transform" />
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href={`https://buy.stripe.com/bJe28t3xo92feswco71Jm07?prefilled_email=${encodeURIComponent(userEmail || '')}&client_reference_id=${userId}`}
                                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-black text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                        >
                                            $7.99 Monthly
                                            <ExternalLink className="w-5 h-5" />
                                        </a>

                                        <a
                                            href={`https://buy.stripe.com/28E7sNc3Uemz4RWdsb1Jm08?prefilled_email=${encodeURIComponent(userEmail || '')}&client_reference_id=${userId}`}
                                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-900 rounded-xl font-black text-lg hover:shadow-xl hover:shadow-white/10 transition-all flex items-center justify-center gap-2 border border-white/50 shadow-inner group"
                                        >
                                            $70 Yearly (Save 25%)
                                            <Star className="w-5 h-5 fill-current text-yellow-500 group-hover:scale-110 transition-transform" />
                                        </a>
                                    </>
                                )}
                            </div>

                            <p className="mt-4 text-xs text-gray-500 font-medium leading-relaxed">
                                {plan === 'pro'
                                    ? 'Redirects to secure Stripe portal. Update payment method, view invoices, or change plan cycle.'
                                    : 'Redirects to secure Stripe checkout. Unlock Pro instantly after payment.'}
                            </p>

                            <div className="mt-8 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                    <span className="text-blue-400 font-bold">Account Security:</span> Magic links are secure, one-time Supabase authentication codes. They verify your identity instantly via your inbox—no passwords required.
                                </p>
                            </div>
                        </div>

                        {/* Downloads Block */}
                        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8">
                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <Download className="w-5 h-5 text-blue-400" />
                                Downloads
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <a
                                    href="/downloads/PastePlay-v1-Setup.exe"
                                    download="PastePlay-v1-Setup.exe"
                                    className="flex items-center justify-between p-4 bg-gray-950/50 hover:bg-gray-800 border border-gray-800 rounded-2xl transition-all"
                                >
                                    <div className="text-left">
                                        <p className="text-white font-bold">Download for Windows</p>
                                        <p className="text-gray-500 text-xs mt-1">Version 1.0 (.exe)</p>
                                    </div>
                                    <Download className="w-5 h-5 text-gray-400" />
                                </a>
                                <button className="flex items-center justify-between p-4 bg-gray-900/40 opacity-50 border border-gray-800 rounded-2xl cursor-not-allowed" disabled>
                                    <div className="text-left text-gray-500">
                                        <p className="font-bold">macOS (Coming Soon)</p>
                                        <p className="text-xs mt-1">Version 1.0 (.dmg)</p>
                                    </div>
                                    <Lock className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Help (Side) */}
                    <div className="space-y-8">
                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8">
                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                Quick Help
                            </h2>
                            <p className="text-gray-300 font-bold mb-4 text-sm">How to log into the app:</p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">1</span>
                                    <p className="text-gray-400 text-sm leading-relaxed">Open PastePlay app and go to <span className="text-white font-bold">Settings</span></p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">2</span>
                                    <p className="text-gray-400 text-sm leading-relaxed">Enter the same email: <span className="text-blue-400 font-bold select-all">{userEmail}</span></p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0">3</span>
                                    <p className="text-gray-400 text-sm leading-relaxed">Click the magic link in your inbox — app opens logged in!</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-3xl text-center">
                            <p className="text-gray-500 text-xs">Need technical support?</p>
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-cyan-400 font-bold hover:underline block mt-1 w-full"
                            >
                                Contact Developer
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
        </section>
    );
}
