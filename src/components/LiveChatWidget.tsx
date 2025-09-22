

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import Spinner from './Spinner';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface LiveChatWidgetProps {
  onClose: () => void;
  apiKey: string;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ onClose, apiKey }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize chat
    useEffect(() => {
        if (apiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: "You are a friendly and knowledgeable customer support agent for an application called 'AI Media Generator'. Your purpose is to help users with their questions about the app's features (Image Generation, Video Generation, brainstorming Chat), troubleshoot common problems (like API key errors or slow video generation), and provide guidance on how to use the application effectively. Be concise, clear, and always maintain a positive and helpful tone.",
                    },
                });
                setChat(chatSession);
                setMessages([{ role: 'model', text: 'Hi there! How can I help you with the AI Media Generator today?' }]);
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'Failed to initialize chat session.');
            }
        } else {
            setError('API Key not found. This is unexpected.');
        }
    }, [apiKey]);
    
    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const stream = await chat.sendMessageStream({ message: currentInput });
            
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const lastMessageIndex = prev.length - 1;
                    if (lastMessageIndex >= 0 && prev[lastMessageIndex].role === 'model') {
                        const updatedMessages = [...prev];
                        updatedMessages[lastMessageIndex] = {
                            ...updatedMessages[lastMessageIndex],
                            text: updatedMessages[lastMessageIndex].text + chunkText,
                        };
                        return updatedMessages;
                    }
                    return prev;
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? `API Error: ${err.message}` : 'An unknown error occurred.';
            setError(errorMessage);
            // Remove the user message and the empty model message on error
            setMessages(prev => prev.slice(0, -2));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[60vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col text-slate-800 animate-slide-in-up">
            <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="font-bold text-lg text-slate-800">Customer Support</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18L6 6M6 18l12-12" />
                    </svg>
                </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-accent-600)]" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a1.65 1.65 0 00-1.074 1.916l1.217 4.259a1.65 1.65 0 001.916 1.074l1.518-.759a1 1 0 011.06.54l.74 4.435a1 1 0 01-.836.986H3a1 1 0 01-1-1V3z" />
                                    <path d="M17.94 2.06a1 1 0 00-1.06-.54l-2.748.916a1 1 0 00-.748 1.258l1.217 4.259a1.65 1.65 0 01-1.074 1.916l-1.518.759a1 1 0 01-1.06.54l-4.435-.74a1 1 0 01-.836-.986V3a1 1 0 011-1h4a1 1 0 011 1v2.253a1 1 0 001.916.414l1.217-4.259a1 1 0 00-.54-1.06z" />
                                </svg>
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 shadow ${
                            msg.role === 'user'
                            ? 'bg-[var(--color-accent-500)] text-white rounded-br-none'
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                        }`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-accent-600)]" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a1.65 1.65 0 00-1.074 1.916l1.217 4.259a1.65 1.65 0 001.916 1.074l1.518-.759a1 1 0 011.06.54l.74 4.435a1 1 0 01-.836.986H3a1 1 0 01-1-1V3z" />
                                <path d="M17.94 2.06a1 1 0 00-1.06-.54l-2.748.916a1 1 0 00-.748 1.258l1.217 4.259a1.65 1.65 0 01-1.074 1.916l-1.518.759a1 1 0 01-1.06.54l-4.435-.74a1 1 0 01-.836-.986V3a1 1 0 011-1h4a1 1 0 011 1v2.253a1 1 0 001.916.414l1.217-4.259a1 1 0 00-.54-1.06z" />
                            </svg>
                        </div>
                        <div className="max-w-[80%] rounded-xl px-4 py-2.5 shadow bg-white text-slate-800 rounded-bl-none border border-slate-200 flex items-center gap-2">
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="px-4 pb-2 text-sm text-center text-red-500">{error}</p>}
            <div className="p-4 border-t border-slate-200 bg-white/70">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                     <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!chat ? "Connecting..." : "Type your message..."}
                        className="flex-grow bg-slate-100 border-slate-300 rounded-full py-2.5 px-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] transition duration-200"
                        disabled={isLoading || !chat}
                        aria-label="Chat input"
                    />
                    <button type="submit" disabled={isLoading || !input.trim() || !chat} className="bg-[var(--color-accent-600)] text-white rounded-full p-3 hover:bg-[var(--color-accent-700)] disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300 flex-shrink-0" aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
             <style>{`
                @keyframes slide-in-up {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in-up {
                  animation: slide-in-up 0.3s ease-out forwards;
                }
              `}</style>
        </div>
    );
};

export default LiveChatWidget;
