import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "@/src/types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const projectParserService = {
  /**
   * Parses a PDF file (base64) and extracts project information using Gemini.
   */
  async parseProjectFromPDF(base64Data: string): Promise<Partial<Project>> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Data,
                },
              },
              {
                text: `Extract all relevant project information from this PDF brochure. 
                Return the data in a structured JSON format according to these fields:
                - titleAr: Title in Arabic
                - titleEn: Title in English
                - locationAr: Location in Arabic
                - locationEn: Location in English
                - price: Pricing information (e.g., "Starting from 1,000,000 EGP")
                - type: Project type, must be one of: 'residential', 'commercial', 'office', 'retail'
                - descriptionAr: Detailed description in Arabic
                - paymentPlanAr: Payment plan details in Arabic
                - isUnderConstruction: boolean (true if the project is under development)

                If a field is not found, leave it empty. Ensure accuracy in extraction.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleAr: { type: Type.STRING },
              titleEn: { type: Type.STRING },
              locationAr: { type: Type.STRING },
              locationEn: { type: Type.STRING },
              price: { type: Type.STRING },
              type: { 
                type: Type.STRING,
                enum: ['residential', 'commercial', 'office', 'retail']
              },
              descriptionAr: { type: Type.STRING },
              paymentPlanAr: { type: Type.STRING },
              isUnderConstruction: { type: Type.BOOLEAN },
            },
          },
        },
      });

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");
      
      return JSON.parse(resultText) as Partial<Project>;
    } catch (error) {
      console.error("Project Parsing Error:", error);
      throw new Error("Failed to parse project from PDF. Please ensure the file is valid and try again.");
    }
  }
};
