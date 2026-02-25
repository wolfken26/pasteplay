
import { X } from 'lucide-react';
import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [inquiryType, setInquiryType] = useState('General Question / Inquiry');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const subject = `PastePlay Inquiry: ${inquiryType}`;
    const body = encodeURIComponent(message);
    window.location.href = `mailto:wolftech262000@gmail.com?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg relative">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">Submit Inquiry / Update</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-400 mb-6">
            Have a suggestion or found a skip? Let us know! Specify your inquiry type below.
          </p>

          <div className="space-y-6">
            <div>
              <label htmlFor="inquiry-type" className="block text-sm font-medium text-gray-300 mb-2">
                Type of Information
              </label>
              <div className="relative">
                <select
                  id="inquiry-type"
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option>Update Recommendation</option>
                  <option>General Question / Inquiry</option>
                  <option>Bug Report</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Tell us more..."
              ></textarea>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all inline-flex items-center justify-center gap-2"
            >
              Send to wolftech262000@gmail.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
