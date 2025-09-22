

import React, { useState, useEffect, useRef } from 'react';
import { validateApiKey } from '../services/geminiService';
import Spinner from './Spinner';

interface ApiKeySetupProps {
  onApiKeySubmit: (apiKey: string) => void;
  onCancel?: () => void;
  hasPreviousKey?: boolean;
  initialValue?: string;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

const statusMessages: Record<ValidationStatus, string> = {
    idle: 'Your key will be validated automatically.',
    validating: 'Checking key...',
    valid: 'Success! Your API key is valid.',
    invalid: 'Invalid API Key. Please check and try again.',
}

const statusColors: Record<ValidationStatus, string> = {
    idle: 'text-slate-400',
    validating: 'text-blue-300',
    valid: 'text-green-400',
    invalid: 'text-red-400',
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySubmit, onCancel, hasPreviousKey, initialValue = '' }) => {
  const [keyInput, setKeyInput] = useState(initialValue);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Clear any pending validation when the component unmounts
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (!keyInput.trim()) {
      setValidationStatus('idle');
      return;
    }

    setValidationStatus('validating');
    
    debounceTimeout.current = window.setTimeout(async () => {
      const isValid = await validateApiKey(keyInput.trim());
      if (isValid) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
      }
    }, 750); // 750ms debounce delay

  }, [keyInput]);


  const getStatusIcon = () => {
    switch (validationStatus) {
        case 'validating':
            return <Spinner className="w-5 h-5 text-blue-400" />;
        case 'valid':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
        case 'invalid':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
        default:
            return null;
    }
  }


  return (
    <div className="relative w-full max-w-2xl bg-slate-800/70 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-slate-200/50 text-center">
        {hasPreviousKey && onCancel && (
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 rounded-full py-1.5 px-3 text-slate-300 hover:text-white"
                aria-label="Close and go back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">Close</span>
            </button>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[var(--color-accent-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h7a2 2 0 012 2z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mt-4">API Key Required</h1>
        <p className="mt-4 text-slate-200">
            Please enter your Google Gemini API key to use the generator.
        </p>
        
        <div className="mt-6 flex flex-col gap-2">
            <div className="relative">
                 <input
                    type={isKeyVisible ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter your API key here"
                    className="w-full text-center bg-slate-900/50 border-slate-500 rounded-md p-3 text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] transition duration-200 pr-16"
                    aria-label="API Key Input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                        type="button"
                        onClick={() => setIsKeyVisible(prev => !prev)}
                        className="p-1 mr-1 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 rounded-full transition-colors"
                        aria-label={isKeyVisible ? "Hide API Key" : "Show API Key"}
                    >
                        {isKeyVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 10 3c-2.256 0-4.34.78-5.942 2.08L3.28 2.22ZM7.06 7.06A3.5 3.5 0 0 0 10 5.5c1.93 0 3.5 1.57 3.5 3.5a3.5 3.5 0 0 1-1.56 2.94l-2.88-2.88ZM10 17a10.005 10.005 0 0 1-9.336-6.41 1.651 1.651 0 0 1 0-1.186A10.005 10.005 0 0 1 10 3c.926 0 1.817.123 2.656.353l-1.93 1.93A5.5 5.5 0 0 0 10 5.5c-3.036 0-5.5 2.464-5.5 5.5a5.5 5.5 0 0 0 1.825 4.013l-1.442 1.442A10.021 10.021 0 0 1 .664 10.59Z" clipRule="evenodd" />
                            </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893 2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <div className="pointer-events-none">
                        {getStatusIcon()}
                    </div>
                </div>
            </div>
            <p className={`text-sm h-5 ${statusColors[validationStatus]}`}>{statusMessages[validationStatus]}</p>
        </div>
        
        <button
            type="button"
            onClick={() => onApiKeySubmit(keyInput.trim())}
            disabled={validationStatus !== 'valid'}
            className="w-full mt-6 bg-[var(--color-accent-600)] text-white font-bold py-3 px-5 rounded-full hover:bg-[var(--color-accent-700)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
        >
            Start Generating
        </button>

        <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-left text-sm text-yellow-200">
           <h3 className="font-bold text-yellow-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Security Notice
           </h3>
           <p className="mt-2">
            For your security, it is <strong className="font-semibold">strongly recommended</strong> to configure the API key using environment variables for any production or shared environment.
           </p>
            <p className="mt-1">
                The key you enter here is stored in your browser's local storage and will persist until you clear it.
           </p>
        </div>
    </div>
  );
};

export default ApiKeySetup;
