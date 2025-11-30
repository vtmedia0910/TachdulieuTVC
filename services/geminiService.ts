import { GoogleGenAI } from "@google/genai";
import { AIModelType } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAIResponse = async (
  prompt: string,
  contextData: string,
  modelType: AIModelType
): Promise<string> => {
  const ai = getClient();
  
  const finalPrompt = `
Context Data:
${contextData}

User Request:
${prompt}
  `;

  try {
    let modelName = 'gemini-2.5-flash'; // Default fast
    let config = {};

    if (modelType === AIModelType.THINKING) {
      modelName = 'gemini-3-pro-preview';
      config = {
        thinkingConfig: { thinkingBudget: 32768 },
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: finalPrompt,
      config: config
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response. Please try again.");
  }
};
