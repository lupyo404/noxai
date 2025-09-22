
import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types';

const getApiKey = (): string => {
    const apiKey = localStorage.getItem('gemini-api-key') || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing. Please provide it on the setup page.");
    }
    return apiKey;
}

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Make a lightweight, non-streaming call to check for authentication errors.
        await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    
    throw new Error("Image generation failed or returned no images.");
};

const parseDataUrl = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid data URL format");
    }
    return { mimeType: match[1], data: match[2] };
};

export const editImage = async (prompt: string, imageDataUrl: string): Promise<string> => {
    const ai = getAiClient();
    const { mimeType, data } = parseDataUrl(imageDataUrl);

    const imagePart = {
        inlineData: {
            mimeType,
            data,
        },
    };

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageMimeType: string = part.inlineData.mimeType;
            return `data:${imageMimeType};base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error("Image editing failed or returned no image.");
};


export const generateVideoWithVeo = async (apiKey: string, prompt: string, model: string, aspectRatio: AspectRatio, resolution: string, base64Image?: string, mimeType?: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });

    const requestPayload: {
        model: string;
        prompt: string;
        image?: { imageBytes: string; mimeType: string; };
        config: {
            numberOfVideos: number;
        };
    } = {
        model: model,
        prompt: prompt,
        config: {
            numberOfVideos: 1,
        }
    };

    if (base64Image && mimeType) {
        requestPayload.image = {
            imageBytes: base64Image,
            mimeType: mimeType,
        };
    }

    let operation = await ai.models.generateVideos(requestPayload);
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video file: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
