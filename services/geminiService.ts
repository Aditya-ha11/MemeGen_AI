import { GoogleGenAI, Type } from "@google/genai";
import { CaptionSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image using the Gemini 2.5 Flash Image model.
 */
export const generateMemeImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generates witty meme captions based on a topic description or an image context.
 */
export const generateMemeCaptions = async (topic: string): Promise<CaptionSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 funny meme caption pairs (top text and bottom text) about this topic: "${topic}". 
      Make them witty, internet-culture friendly, and short.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              top: { type: Type.STRING },
              bottom: { type: Type.STRING }
            },
            required: ["top", "bottom"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as CaptionSuggestion[];
  } catch (error) {
    console.error("Error generating captions:", error);
    return [];
  }
};

/**
 * Generates captions based on an image input (multimodal).
 */
export const generateCaptionsForImage = async (base64Image: string, mimeType: string): Promise<CaptionSuggestion[]> => {
  try {
    // Remove header from base64 string if present
    const base64Data = base64Image.split(',')[1]; 

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Look at this image and generate 4 hilarious meme caption pairs (top text and bottom text) that fit the context perfectly."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              top: { type: Type.STRING },
              bottom: { type: Type.STRING }
            },
            required: ["top", "bottom"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as CaptionSuggestion[];
  } catch (error) {
    console.error("Error analyzing image for captions:", error);
    return [];
  }
};