
import { GoogleGenAI } from "@google/genai";

export const getVictoryMessage = async (moves: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, enthusiastic, and funny congratulatory message for someone who just won a memory card game in ${moves} moves. Keep it under 15 words. Include an emoji.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    
    return response.text || "Incredible! Your memory is truly legendary! 🧠✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Fantastic! You cleared the board in ${moves} moves! 🏆`;
  }
};
