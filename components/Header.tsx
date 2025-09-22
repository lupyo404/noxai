import React, { useState, useRef, useEffect } from 'react';
import { GeneratorMode } from '../types';

interface HeaderProps {
    mode: GeneratorMode;
    setMode: (mode: GeneratorMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { label: 'Image Generator', mode: GeneratorMode.IMAGE },
        { label: 'Video Generator', mode: GeneratorMode.VIDEO },
        { label: 'Chat Generator', mode: GeneratorMode.CHAT },
    ];

    const activeLabel = menuItems.find(item => item.mode === mode)?.label || 'Select Mode';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (newMode: GeneratorMode) => {
        setMode(newMode);
        setIsOpen(false);
    };

    return (
        <header className="w-full flex flex-col items-center py-2 mb-8 gap-6">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-[var(--color-accent-500)] to-blue-500 text-transparent bg-clip-text">
                    AI Media Generator
                </h1>
                <p className="mt-2 text-slate-100 text-lg [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">Create with Nano & Veo</p>
            </div>

            <nav className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-64 bg-slate-200/50 backdrop-blur-sm rounded-full flex items-center justify-between p-3 font-semibold text-slate-800 hover:bg-slate-300/60 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-label="Generator mode"
                >
                    <span>{activeLabel}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                        <ul>
                            {menuItems.map((item) => (
                                <li key={item.mode}>
                                    <button
                                        onClick={() => handleSelect(item.mode)}
                                        className={`w-full text-left px-4 py-2 text-slate-700 hover:bg-[var(--color-accent-300)] hover:text-slate-900 transition-colors ${mode === item.mode ? 'font-bold bg-slate-200/50' : ''}`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;