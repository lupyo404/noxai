

import React, { useState } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import Spinner from './Spinner';
import CustomDropdown from './CustomDropdown';
import type { AspectRatio } from '../types';

const aspectRatioOptions: { label: string; value: AspectRatio }[] = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Tall (9:16)', value: '9:16' },
];

interface ImageGeneratorProps {
  apiKey: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ apiKey }) => {
    const [prompt, setPrompt] = useState('');
    const [editPrompt, setEditPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [addWatermark, setAddWatermark] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [originalImageUrlForEdit, setOriginalImageUrlForEdit] = useState<string | null>(null);


    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        setOriginalImageUrlForEdit(null);

        const watermarkInstruction = "A small, elegant watermark with the text 'AIC999' is placed in the bottom-right corner. The watermark text is semi-transparent white and has a subtle, dark drop shadow to ensure it is fully visible and legible regardless of the background color. It is positioned precisely in the corner without being cut off.";
        const finalPrompt = addWatermark
            ? `${prompt.trim()}. ${watermarkInstruction}`
            : prompt;

        try {
            const url = await generateImage(apiKey, finalPrompt, aspectRatio);
            setImageUrl(url);
        } catch (err) {
            setError(err instanceof Error ? `API Error: ${err.message}` : 'An unknown error occurred. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPrompt.trim() || !imageUrl || isLoading) return;

        setIsLoading(true);
        setError(null);
        setOriginalImageUrlForEdit(imageUrl); // Set current image as the "before"

        const watermarkInstruction = "Ensure a small, elegant watermark with the text 'AIC999' is present in the bottom-right corner. The watermark text should be semi-transparent white with a subtle, dark drop shadow for legibility, positioned precisely without being cut off.";
        const finalEditPrompt = addWatermark
            ? `${editPrompt.trim()}. ${watermarkInstruction}`
            : editPrompt;

        try {
            const url = await editImage(apiKey, finalEditPrompt, imageUrl);
            setImageUrl(url); // Set the new edited image as the current one
            setEditPrompt('');
        } catch (err) {
            setError(err instanceof Error ? `API Error: ${err.message}` : 'An unknown error occurred. Please try again later.');
            setOriginalImageUrlForEdit(null); // On error, clear the "before" image
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isLoading) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageUrl(reader.result as string);
            setOriginalImageUrlForEdit(null); // Reset edit view on new upload
            setError(null);
        };
        reader.onerror = () => {
            setError('Failed to read the image file.');
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset file input to allow re-uploading the same file
    };
    
    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-media-generator-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleStartOver = () => {
        setImageUrl(null);
        setOriginalImageUrlForEdit(null);
        setPrompt('');
        setEditPrompt('');
        setError(null);
    }

    return (
        <div className="flex flex-col gap-6">
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter a prompt to create an image
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A surrealist painting of a cat playing chess on a cloud"
                        className="w-full bg-gray-100 border-gray-300 rounded-md p-3 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] transition duration-200 resize-none"
                        rows={3}
                        disabled={isLoading || !!imageUrl}
                    />
                </div>
                {!imageUrl && (
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Aspect Ratio
                            </label>
                            <CustomDropdown
                                ariaLabel="Select aspect ratio"
                                options={aspectRatioOptions}
                                value={aspectRatio}
                                // FIX: Wrap state setter in a lambda to match the expected onChange signature.
                                onChange={(value) => setAspectRatio(value)}
                            />
                        </div>
                        <div className="flex items-center pb-2">
                            <button
                                type="button"
                                onClick={() => setAddWatermark(!addWatermark)}
                                className={`${addWatermark ? 'bg-[var(--color-accent-600)]' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-500)]`}
                                role="switch"
                                aria-checked={addWatermark}
                                id="watermark-toggle-image"
                            >
                                <span className={`${addWatermark ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                            </button>
                            <label htmlFor="watermark-toggle-image" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Add Watermark</label>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="w-full sm:w-auto sm:ml-auto bg-[var(--color-accent-600)] text-white font-bold py-2 px-5 rounded-full hover:bg-[var(--color-accent-700)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Spinner className="w-5 h-5" />}
                            Generate Image
                        </button>
                    </div>
                )}
            </form>
            
             {!imageUrl && (
                <div className="flex items-center gap-4">
                    <hr className="flex-grow border-gray-300" />
                    <span className="text-gray-500 text-sm">OR</span>
                    <hr className="flex-grow border-gray-300" />
                </div>
            )}
            
            {!imageUrl && (
                 <div className="flex justify-center">
                    <label htmlFor="image-upload" className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-md hover:bg-gray-300 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 inline-flex items-center justify-center gap-2 cursor-pointer">
                        Upload an Image to Edit
                    </label>
                    <input type="file" id="image-upload" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isLoading} />
                </div>
            )}

            <div className="mt-4 min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center p-4">
                {isLoading && (
                    <div className="text-center">
                        <Spinner className="w-12 h-12 mx-auto" />
                        <p className="mt-4 text-gray-500">AI is thinking...</p>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {imageUrl && !isLoading && !error && (
                    <div className="w-full flex flex-col items-center gap-4">
                        {originalImageUrlForEdit ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Original</h3>
                                    <img src={originalImageUrlForEdit} alt="Original Content" className="w-full rounded-md shadow-lg" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Edited</h3>
                                    <img src={imageUrl} alt="Edited Content" className="w-full rounded-md shadow-lg" />
                                </div>
                            </div>
                        ) : (
                           <img src={imageUrl} alt="Generated Content" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
                        )}
                        
                        <div className="w-full max-w-2xl flex flex-col gap-4 mt-4">
                            <form onSubmit={handleEdit} className="flex flex-col gap-2">
                                <label htmlFor="edit-prompt" className="text-sm font-medium text-gray-700">
                                    Edit your image with a new prompt
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        id="edit-prompt"
                                        type="text"
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="e.g., add sunglasses to the cat"
                                        className="flex-grow bg-gray-100 border-gray-300 rounded-md p-2 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] transition duration-200"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isLoading || !editPrompt.trim()} 
                                        className="bg-[var(--color-accent-500)] text-white font-semibold py-2 px-4 rounded-md hover:bg-[var(--color-accent-600)] disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        Edit Image
                                    </button>
                                </div>
                            </form>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button onClick={handleDownload} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300">
                                    Download
                                </button>
                                <button onClick={handleStartOver} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                                    Start Over
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {!isLoading && !error && !imageUrl && (
                     <p className="text-gray-500 text-center">Your generated image will appear here.</p>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
