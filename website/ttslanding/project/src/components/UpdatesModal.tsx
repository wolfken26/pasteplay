
import { X, GitMerge, Cpu, Download } from 'lucide-react';

interface UpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatesModal({ isOpen, onClose }: UpdatesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md relative">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">Updates & Releases</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Upcoming Features</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <span>AI model for premium, more natural voices</span>
                </li>
                <li className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-400" />
                  <span>Download for Linux (coming soon)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Development Info</h3>
              <p className="text-gray-400 text-sm">
                We are currently on Electron v1.0.1.
              </p>
              <a
                href="https://releases.electronjs.org/release/v1.0.1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm inline-flex items-center gap-2 mt-2"
              >
                <GitMerge className="w-4 h-4" />
                Check Electron Releases
              </a>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full px-8 py-3 bg-gray-700/50 text-white rounded-lg font-bold hover:bg-gray-600/50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
