import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption<T extends string> {
    label: string;
    value: T;
}

interface CustomDropdownProps<T extends string> {
    options: DropdownOption<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel: string;
}

const CustomDropdown = <T extends string>({ options, value, onChange, ariaLabel }: CustomDropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (newValue: T) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-2 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] sm:text-sm text-gray-900 flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >
                <span>{selectedOption?.label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1" role="listbox">
                    <ul>
                        {options.map((option) => (
                            <li key={option.value}>
                                <button
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-[var(--color-accent-300)]/50 hover:text-slate-900 transition-colors ${value === option.value ? 'font-semibold bg-[var(--color-accent-300)]/50' : ''}`}
                                    role="option"
                                    aria-selected={value === option.value}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
