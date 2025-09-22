

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import Spinner from './Spinner';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatComponentProps {
  apiKey: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ apiKey }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: 'You are a friendly and helpful AI assistant specializing in creative ideas for image and video generation. Your goal is to help users brainstorm and refine their prompts.',
                    },
                });
                setChat(chatSession);
                setMessages([{ role: 'model', text: 'Hello! How can I help you brainstorm some creative media ideas today?' }]);
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'Failed to initialize chat session.');
            }
        } else {
            setError('API Key not found. Please set it up first.');
        }
    }, [apiKey]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

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
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[70vh] max-h-[70vh] bg-gray-50/80 rounded-lg border border-gray-300 text-slate-800 shadow-inner">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex flex-col space-y-2">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-xl px-4 py-2.5 shadow-md ${
                                    msg.role === 'user'
                                    ? 'bg-[var(--color-accent-500)] text-white'
                                    : 'bg-white text-slate-800'
                                }`}
                                >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-xl px-4 py-2.5 shadow-md bg-white text-slate-800 flex items-center gap-2">
                                <Spinner className="w-5 h-5 text-[var(--color-accent-500)]"/>
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && <p className="px-4 pb-2 text-sm text-center text-red-500">{error}</p>}

            <div className="p-4 border-t border-gray-200 bg-white/50 rounded-b-lg">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!chat ? "Initializing chat..." : "Ask for creative ideas..."}
                        className="flex-grow bg-gray-100 border-gray-300 rounded-full py-2.5 px-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] transition duration-200"
                        disabled={isLoading || !chat}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || !chat}
                        className="bg-[var(--color-accent-600)] text-white rounded-full p-3 hover:bg-[var(--color-accent-700)] disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300 flex-shrink-0"
                        aria-label="Send message"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;
