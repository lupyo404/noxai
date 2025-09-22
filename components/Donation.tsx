import React, { useEffect, useRef, useState } from 'react';

interface DonationProps {
  onClose: () => void;
}

const Donation: React.FC<DonationProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const qrCodeImageUrl = 'https://storage.googleapis.com/ai-studio-ss-images/21356499_d-org-277109731608750_s-p-1719293144-848529-kbz-pay-qr-code.jpg';
  const kbzPayNumber = '09965818129';
  const accountName = 'Aung Kyaw Kyaw';

  const handleCopy = () => {
      navigator.clipboard.writeText(kbzPayNumber).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="donation-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center text-slate-800 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close donation modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
            <img src={qrCodeImageUrl} alt="KBZPay QR Code" className="w-56 h-56 mx-auto mb-4 rounded-lg shadow-md object-cover" />
        
            <h2 id="donation-title" className="text-xl font-bold text-slate-800">
                Support the Project
            </h2>
            <p className="text-sm text-slate-500 mb-4">Scan the QR code or use the number below to donate via KBZPay.</p>

            <div className="bg-slate-100 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">KBZPay Number</p>
                        <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">
                            {kbzPayNumber}
                        </p>
                    </div>
                    <button onClick={handleCopy} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50 flex-shrink-0" disabled={copied}>
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500">Account Name</p>
                    <p className="font-semibold text-slate-800">{accountName}</p>
                </div>
            </div>

            <p className="text-xs text-slate-400 mt-6">
                Your contribution helps keep this project alive and growing. Thank you!
            </p>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Donation;