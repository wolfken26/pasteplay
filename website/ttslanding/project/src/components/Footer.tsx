import { Volume2, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ContactModal } from './ContactModal';

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContactModalOpen(true);
  };

  return (
    <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-md flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">PastePlay</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">Copy. Hotkey. Listen.</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-100 mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</a></li>
              <li><a href="#audience" className="hover:text-cyan-400 transition-colors">For You</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/hotkeys" className="hover:text-cyan-400 transition-colors">Keyboard Shortcuts</Link></li>
              <li><Link to="/languages" className="hover:text-cyan-400 transition-colors">Languages</Link></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-100 mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 hover:bg-gray-800 rounded-lg hover:text-cyan-400 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <button
                onClick={handleContactClick}
                className="p-2 hover:bg-gray-800 rounded-lg hover:text-cyan-400 transition-all"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2026 PastePlay v1.0. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
            <button
              onClick={handleContactClick}
              className="hover:text-cyan-400 transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </footer>
  );
}
