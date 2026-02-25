import { Volume2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSignInClick: () => void;
  isLoggedIn?: boolean;
}

export function Header({ onSignInClick, isLoggedIn }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-gray-950/95 backdrop-blur-md border-b border-gray-800 z-50 transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent italic">pasteplay.app <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest align-top mt-1 inline-block ml-0.5">beta</span></span>
        </div>

        <button
          className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className={`${mobileMenuOpen ? 'absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 space-y-3' : 'hidden md:flex'
          } md:flex items-center gap-8`}>
          <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
            How it Works
          </button>
          <button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
            Pricing
          </button>
          <Link to="/voices" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
            Voices
          </Link>
          <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
            Privacy
          </Link>
          <button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
            FAQ
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => {
              const shareData = {
                title: 'pasteplay.app',
                text: 'Instant text-to-speech for your clipboard.',
                url: window.location.origin
              };
              if (navigator.share) {
                navigator.share(shareData).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.origin);
                alert('Website link copied to clipboard!');
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition-all border border-gray-800 rounded-lg bg-gray-900/50 hover:border-cyan-500/30"
          >
            Share
          </button>
          {isLoggedIn ? (
            <Link to="/account" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              Account
            </Link>
          ) : (
            <button onClick={onSignInClick} className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
              Sign in
            </button>
          )}
        </div>


      </nav>
    </header>
  );
}
