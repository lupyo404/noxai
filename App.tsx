
import React, { useState, useEffect, useRef } from 'react';
import { GeneratorMode } from './types';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import Chat from './components/Chat';
import ApiKeySetup from './components/ApiKeySetup';
import Donation from './components/Donation';
import HelpModal from './components/HelpModal';
import LiveChatWidget from './components/LiveChatWidget';

const colorPalettes: Record<string, Record<string, string>> = {
  indigo: { '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca' },
  sky: { '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1' },
  rose: { '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c' },
  emerald: { '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857' },
};
type AccentColor = keyof typeof colorPalettes;

const DEFAULT_BACKGROUND_URL = 'https://images.unsplash.com/photo-1596541223130-5d31a73fb12f?q=80&w=2574&auto=format&fit=crop';


const AccentColorSwitcher: React.FC<{ activeColor: AccentColor; setAccentColor: (color: AccentColor) => void }> = ({ activeColor, setAccentColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="p-2 rounded-full bg-slate-200/50 backdrop-blur-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)] transition-colors"
                aria-label="Choose accent color"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent-500)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.75a.75.75 0 00.75.75h3.5a.75.75 0 000-1.5h-3.5a.75.75 0 00-.75.75zM4.5 6.5A.5.5 0 015 6h4a.5.5 0 010 1H5a.5.5 0 01-.5-.5zM5 8a.5.5 0 000 1h4a.5.5 0 000-1H5zM5 10a.5.5 0 000 1h4a.5.5 0 000-1H5z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200">
                    <div className="flex gap-3">
                        {Object.keys(colorPalettes).map((colorName) => (
                            <button
                                key={colorName}
                                onClick={() => { setAccentColor(colorName as AccentColor); setIsOpen(false); }}
                                className={`w-6 h-6 rounded-full transition-transform duration-150 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[var(--color-accent-500)] ${activeColor === colorName ? 'ring-2 ring-offset-2 ring-offset-white ring-slate-800' : ''}`}
                                style={{ backgroundColor: colorPalettes[colorName]['500'] }}
                                aria-label={`Set accent color to ${colorName}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const BackgroundSwitcher: React.FC<{ setBackgroundImage: (url: string) => void }> = ({ setBackgroundImage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setBackgroundImage(event.target.result as string);
                    setIsOpen(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput.trim()) {
            setBackgroundImage(urlInput.trim());
            setUrlInput('');
            setIsOpen(false);
        }
    };
    
    const handleReset = () => {
        setBackgroundImage(DEFAULT_BACKGROUND_URL);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="p-2 rounded-full bg-slate-200/50 backdrop-blur-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)] transition-colors"
                aria-label="Change background image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent-500)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 p-4 w-64 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 text-slate-800">
                    <div className="flex flex-col gap-4">
                        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
                            <label className="text-sm font-medium">From URL</label>
                            <input 
                                type="text" 
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/image.png"
                                className="w-full text-sm bg-gray-100 border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)]"
                            />
                            <button type="submit" className="w-full text-sm bg-[var(--color-accent-500)] text-white font-semibold py-1.5 px-3 rounded-md hover:bg-[var(--color-accent-600)] transition-colors">
                                Set Image
                            </button>
                        </form>
                        
                        <div className="flex items-center gap-2">
                            <hr className="flex-grow border-gray-300" />
                            <span className="text-gray-500 text-xs">OR</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <div>
                            <label htmlFor="bg-upload" className="w-full text-sm text-center cursor-pointer bg-gray-200 text-gray-800 font-semibold py-1.5 px-3 rounded-md hover:bg-gray-300 transition-colors block">
                                Upload File
                            </label>
                            <input type="file" id="bg-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </div>

                        <hr className="border-gray-300" />
                        
                        <button onClick={handleReset} className="w-full text-sm bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-gray-600 transition-colors">
                            Reset to Default
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 rounded-full bg-slate-200/50 backdrop-blur-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)] transition-colors"
            aria-label="Open help and support modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    );
};

const ApiKeyManager: React.FC<{ onClear: () => void }> = ({ onClear }) => {
    return (
        <button
            onClick={onClear}
            className="p-2 rounded-full bg-slate-200/50 backdrop-blur-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)] transition-colors"
            aria-label="Clear API Key and return to setup"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent-500)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
        </button>
    );
};


const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key') || process.env.API_KEY);
  const [previousApiKey, setPreviousApiKey] = useState<string | null>(null);
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.IMAGE);
  const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('app-accent-color') as AccentColor) || 'indigo');
  const [backgroundImage, setBackgroundImage] = useState<string>(() => localStorage.getItem('app-background-image') || DEFAULT_BACKGROUND_URL);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  
  useEffect(() => {
    const root = document.documentElement;
    const palette = colorPalettes[accentColor];
    for (const [shade, color] of Object.entries(palette)) {
        root.style.setProperty(`--color-accent-${shade}`, color);
    }
    localStorage.setItem('app-accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('app-background-image', backgroundImage);
  }, [backgroundImage]);

  const handleApiKeySubmit = (newApiKey: string) => {
    localStorage.setItem('gemini-api-key', newApiKey);
    setApiKey(newApiKey);
    setPreviousApiKey(null);
  };

  const handleClearApiKey = () => {
    setPreviousApiKey(apiKey);
    localStorage.removeItem('gemini-api-key');
    setApiKey(null);
  };

  const handleCancelApiKeySetup = () => {
    if (previousApiKey) {
      localStorage.setItem('gemini-api-key', previousApiKey);
      setApiKey(previousApiKey);
      setPreviousApiKey(null);
    }
  };

  const renderActiveGenerator = () => {
    switch (mode) {
        case GeneratorMode.IMAGE:
            return <ImageGenerator />;
        case GeneratorMode.VIDEO:
            return <VideoGenerator apiKey={apiKey!} />;
        case GeneratorMode.CHAT:
            return <Chat />;
        default:
            return <ImageGenerator />;
    }
  };

  const renderContent = () => {
    if (!apiKey) {
      return <ApiKeySetup 
                onApiKeySubmit={handleApiKeySubmit} 
                onCancel={handleCancelApiKeySetup}
                hasPreviousKey={!!previousApiKey}
                initialValue={previousApiKey || ''}
             />;
    }

    return (
      <>
        <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
            <HelpButton onClick={() => setIsHelpModalOpen(true)} />
            <ApiKeyManager onClear={handleClearApiKey} />
            <BackgroundSwitcher setBackgroundImage={setBackgroundImage} />
            <AccentColorSwitcher activeColor={accentColor} setAccentColor={setAccentColor} />
        </div>
        
        <div className="w-full max-w-4xl">
            <Header mode={mode} setMode={setMode} />
            
            <main className="bg-slate-100/50 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-200/50">
              {renderActiveGenerator()}
            </main>
            
             <footer className="text-center mt-8 text-slate-200 text-sm [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">
                <button 
                    onClick={() => setIsDonationModalOpen(true)}
                    className="mb-4 bg-[var(--color-accent-500)]/80 text-white font-semibold py-2 px-5 rounded-full hover:bg-[var(--color-accent-600)] transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                     ❤️ Support the Project
                </button>
                <p>Powered by Google Gemini. For educational and illustrative purposes only.</p>
              </footer>
        </div>
        
        {/* Live Chat Widget and Button */}
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-4">
            {isLiveChatOpen && <LiveChatWidget onClose={() => setIsLiveChatOpen(false)} />}
            <button
                onClick={() => setIsLiveChatOpen(prev => !prev)}
                className="bg-[var(--color-accent-600)] text-white rounded-full p-4 shadow-lg hover:bg-[var(--color-accent-700)] transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800/[.5] focus:ring-[var(--color-accent-500)]"
                aria-label={isLiveChatOpen ? "Close customer support chat" : "Open customer support chat"}
                aria-expanded={isLiveChatOpen}
            >
                {isLiveChatOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>
        </div>
      </>
    );
  };

  return (
    <div 
      className="min-h-screen text-slate-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url('${backgroundImage}')`
      }}
    >
      {renderContent()}
      {isDonationModalOpen && <Donation onClose={() => setIsDonationModalOpen(false)} />}
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
    </div>
  );
};

export default App;
