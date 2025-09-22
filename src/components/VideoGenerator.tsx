import React, { useState, useCallback, useEffect } from 'react';
import { generateVideoWithVeo } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import type { AspectRatio } from '../types';
import CustomDropdown from './CustomDropdown';

interface VideoGeneratorProps {
  apiKey: string;
}

const loadingMessages = [
  "Warming up the video synthesizer...",
  "Gathering creative inspiration...",
  "Directing the digital actors...",
  "Compositing virtual scenes...",
  "Rendering frame by frame...",
  "Applying special effects...",
  "Encoding final video stream...",
  "This can take a few minutes, please be patient...",
];

const VEO_MODELS: { [key: string]: string } = {
    'veo2': 'veo-2.0-generate-001',
    'veo3': 'veo-3.0-generate-001',
    'veo3 fast': 'veo-3.0-fast-generate-001',
};

const resolutionOptions = [
    { label: '1080p (HD)', value: '1080p' },
    { label: '720p', value: '720p' },
    { label: '480p (SD)', value: '480p' },
];

const aspectRatioOptions: { label: string; value: AspectRatio }[] = [
    { label: 'Wide (16:9)', value: '16:9' },
    { label: 'Tall (9:16)', value: '9:16' },
];

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState<string>('A majestic cinematic shot of a futuristic city at sunset');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('veo2');
  const [resolution, setResolution] = useState<string>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<number>(5);
  const [addWatermark, setAddWatermark] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResultUri(null);
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt) {
      setError('Please provide a prompt.');
      return;
    }
     if (!apiKey) {
      setError('Please enter a valid API key to begin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultUri(null);
    setLoadingMessage(loadingMessages[0]);

    const watermarkInstruction = "The video features a small, elegant watermark with the text 'AIC999' in the bottom-right corner throughout. The watermark text is semi-transparent white and has a subtle, dark drop shadow to ensure it is fully visible and legible against any background. It must be positioned precisely in the corner without being cut off.";
    const finalPrompt = addWatermark
        ? `${prompt.trim()}. ${watermarkInstruction}`
        : prompt;

    try {
      let base64Image: string | undefined = undefined;
      if (imageFile) {
        base64Image = await fileToBase64(imageFile);
      }
      const modelId = VEO_MODELS[selectedModel];
      const uri = await generateVideoWithVeo(apiKey, finalPrompt, modelId, aspectRatio, resolution, base64Image, imageFile?.type);
      setResultUri(uri);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, prompt, imageFile, selectedModel, aspectRatio, resolution, addWatermark]);

  const handleDownload = () => {
    if (!resultUri) return;
    const link = document.createElement('a');
    link.href = resultUri;
    link.download = `ai-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-slate-800">
      <div className="bg-gray-100/80 p-6 rounded-lg border border-gray-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-700">Video Prompt</label>
            <textarea
              id="prompt-video"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mt-1 block w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] sm:text-sm text-gray-900 p-2"
              placeholder="e.g., An astronaut riding a horse on Mars"
            />
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                <CustomDropdown
                  ariaLabel="Select resolution"
                  options={resolutionOptions}
                  value={resolution}
                  onChange={(value) => setResolution(value)}
                />
              </div>
              <div>
                <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                <CustomDropdown
                  ariaLabel="Select aspect ratio"
                  options={aspectRatioOptions}
                  value={aspectRatio}
                  onChange={(value) => setAspectRatio(value)}
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled
                  className="mt-1 block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] sm:text-sm text-gray-900 p-2 disabled:opacity-50"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Note: Duration setting is for UI demonstration and not yet supported by the API.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Video Model</label>
             <fieldset className="mt-2">
                <div className="flex items-center space-x-4">
                  {Object.keys(VEO_MODELS).map((model) => (
                    <div key={model} className="flex items-center">
                      <input
                        id={model}
                        name="video-model"
                        type="radio"
                        checked={selectedModel === model}
                        onChange={() => setSelectedModel(model)}
                        className="h-4 w-4 text-[var(--color-accent-600)] bg-gray-100 border-gray-300 focus:ring-[var(--color-accent-500)]"
                      />
                      <label htmlFor={model} className="ml-2 block text-sm font-medium text-gray-700 capitalize">{model}</label>
                    </div>
                  ))}
                </div>
             </fieldset>
          </div>
          
          <div className="flex items-center">
            <button
                type="button"
                onClick={() => setAddWatermark(!addWatermark)}
                className={`${addWatermark ? 'bg-[var(--color-accent-600)]' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-500)]`}
                role="switch"
                aria-checked={addWatermark}
                id="watermark-toggle-video"
            >
                <span className={`${addWatermark ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
            </button>
            <label htmlFor="watermark-toggle-video" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Add Watermark</label>
          </div>

          <div>
            <label htmlFor="file-upload-video" className="block text-sm font-medium text-gray-700">Seed Image (Optional)</label>
            {imagePreview ? (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="rounded-lg object-contain w-full h-auto max-h-48" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="mt-2 text-sm text-red-500 hover:text-red-700">Remove image</button>
              </div>
            ) : (
            <div className="mt-2 flex items-center justify-center w-full">
                <label htmlFor="file-upload-video" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[var(--color-accent-400)] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    </div>
                    <input id="file-upload-video" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
            </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !prompt || !apiKey}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-[var(--color-accent-500)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            Generate Video
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="mt-6 p-6 bg-gray-100/80 rounded-lg text-center border border-gray-300">
          <svg className="animate-spin mx-auto h-10 w-10 text-[var(--color-accent-500)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-semibold">Generating Video...</p>
          <p className="text-gray-600 mt-2">{loadingMessage}</p>
        </div>
      )}

      {error && <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}

      {resultUri && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Video</h3>
          <video controls autoPlay loop className="w-full rounded-lg shadow-lg">
            <source src={resultUri} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={handleDownload}
            className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500 transition-all duration-200"
          >
            Download Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;