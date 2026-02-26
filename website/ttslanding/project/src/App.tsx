import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductDescription } from './components/ProductDescription';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Audience } from './components/Audience';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Pricing } from './components/Pricing';
import { Privacy } from './components/Privacy';
import { Languages } from './components/Languages';
import { Terms } from './components/Terms';
import { Hotkeys } from './components/Hotkeys';
import { Account } from './components/Account';
import { Voices } from './components/Voices';
import { Success } from './components/Success';
import { VoiceLibraryCTA } from './components/VoiceLibraryCTA';
import { ScrollToTop } from './components/ScrollToTop';
import { SignInModal } from './components/SignInModal';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const MainPage = ({ onProAction }: { onProAction: (plan: 'monthly' | 'yearly') => void }) => (
  <>
    <Hero />
    <ProductDescription />
    <Features />
    <HowItWorks />
    <Audience />
    <Pricing onProAction={onProAction} />
    <VoiceLibraryCTA />
    <FAQ />
    <CTA onProAction={onProAction} />
  </>
);

function App() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);

  // Real Supabase session tracking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user && selectedPlan) {
        // If they just logged in and had a plan selected, send them to account
        window.location.href = '/account';
      }
    });

    return () => subscription.unsubscribe();
  }, [selectedPlan]);

  const handleSignInClick = () => setIsSignInOpen(true);

  const handleProAction = async (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);

    if (isLoggedIn) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const stripeLinks = {
          monthly: 'https://buy.stripe.com/bJe28t3xo92feswco71Jm07',
          yearly: 'https://buy.stripe.com/28E7sNc3Uemz4RWdsb1Jm08'
        };
        const baseUrl = stripeLinks[plan];
        window.location.href = `${baseUrl}?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`;
      } else {
        // Fallback in case isLoggedIn was true but user session expired
        setIsSignInOpen(true);
      }
    } else {
      setIsSignInOpen(true);
    }
  };

  const handleSignInSuccess = (email: string) => {
    if (selectedPlan) {
      const stripeLinks = {
        monthly: 'https://buy.stripe.com/bJe28t3xo92feswco71Jm07',
        yearly: 'https://buy.stripe.com/28E7sNc3Uemz4RWdsb1Jm08'
      };

      // Get userId if possible (though they might not be authenticated yet on the client)
      // If we don't have it, the webhook will match by email.
      const baseUrl = stripeLinks[selectedPlan];
      window.location.href = `${baseUrl}?prefilled_email=${encodeURIComponent(email)}`;
    } else {
      setIsLoggedIn(true);
      setIsSignInOpen(false);
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-black">
        <Header
          onSignInClick={handleSignInClick}
          isLoggedIn={isLoggedIn}
        />
        <main>
          <Routes>
            <Route path="/" element={<MainPage onProAction={handleProAction} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/languages" element={<Languages />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/hotkeys" element={<Hotkeys />} />
            <Route path="/account" element={<Account onSignOut={() => setIsLoggedIn(false)} />} />
            <Route path="/voices" element={<Voices />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => {
          setIsSignInOpen(false);
          setSelectedPlan(null);
        }}
        onSuccess={handleSignInSuccess}
        mode={selectedPlan ? 'checkout' : 'signin'}
      />
    </Router>
  );
}

export default App;
