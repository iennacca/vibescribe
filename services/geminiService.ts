
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const processMedia = async (
  fileBase64: string, 
  mimeType: string
): Promise<AnalysisResult> => {
  // Initialize AI inside the function to ensure process.env.API_KEY is available
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this media file. 
    1. Provide a verbatim transcript (clean up filler words like 'um', 'uh').
    2. Create a comprehensive executive summary.
    3. Extract 5 key bullet points.
    4. Identify any actionable items or next steps mentioned.
    5. Determine the overall sentiment of the speaker(s).

    Return the result in JSON format following this structure:
    {
      "transcript": "full text...",
      "summary": "executive summary...",
      "keyPoints": ["point 1", "point 2", ...],
      "actionItems": ["action 1", "action 2", ...],
      "sentiment": "Positive/Neutral/Negative/Mixed with brief reason"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentiment: { type: Type.STRING }
          },
          required: ["transcript", "summary", "keyPoints", "actionItems", "sentiment"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("The AI returned an empty response. Please try again with a different file.");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini processing error:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("API Key configuration error. Please ensure your environment is set up correctly.");
    }
    throw new Error(`Analysis failed: ${error.message || "Unknown error"}`);
  }
};
