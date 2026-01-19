
import { GoogleGenAI } from "@google/genai";

// Always initialize GoogleGenAI with a named parameter for apiKey
export const analyzeDrawing = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1], // Remove the data:image/png;base64, prefix
    },
  };

  const textPart = {
    text: "You are an art critic and creative companion. Look at this drawing and provide a brief, encouraging comment (2-3 sentences). Mention the colors used and suggest one fun thing they could add to the scene to make it more magical. If it's just scribbles, be playful about it!"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // Use .text property directly
    return response.text;
  } catch (error) {
    console.error("Error analyzing drawing:", error);
    return "I couldn't quite see that. Maybe try drawing something more!";
  }
};
