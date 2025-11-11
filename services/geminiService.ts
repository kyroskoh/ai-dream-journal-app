
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDreamImage(dreamText: string, language: string): Promise<string> {
    const prompt = `Create a high-resolution, surrealist digital painting that captures the emotional essence of this dream. Focus on symbolism and abstract representation over literal depiction. The style should be reminiscent of Salvador Dalí and Max Ernst. The dream was described in ${language}. Dream description: ${dreamText}`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed or returned no images.");
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function interpretDream(dreamText: string, language: string): Promise<string> {
    const prompt = `You are an expert dream analyst with deep knowledge of Jungian psychology. Analyze the following dream transcript. Provide a structured interpretation covering: 1. Core Emotional Theme: The dominant feeling or mood. 2. Key Symbols & Archetypes: Identify major symbols (e.g., water, flying, teeth falling out) and connect them to Jungian archetypes (e.g., The Shadow, Anima/Animus, The Self). 3. Potential Meaning: Offer potential interpretations of what these symbols and themes might signify for the dreamer's waking life. Present this in a clear, accessible, and empathetic tone using Markdown for formatting. **You must respond entirely in ${language}.** Dream: ${dreamText}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
}

export function createDreamChat(dreamText: string, interpretation: string, language: string): Chat {
    const systemInstruction = `You are a dream analysis chatbot. The user's dream was: '${dreamText}'. A Jungian interpretation has already been provided: '${interpretation}'. Your role is to answer the user's follow-up questions about specific symbols, characters, or feelings from their dream. Use the provided context and your knowledge of dream psychology to give insightful and helpful answers. Be conversational and supportive. **You must converse entirely in ${language}.**`;
    
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
    return chat;
}

export async function sendMessage(chat: Chat, message: string): Promise<string> {
    const response = await chat.sendMessage({ message });
    return response.text;
}