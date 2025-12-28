
import { GoogleGenAI } from "@google/genai";
import { BusinessInfo } from "../types";

export const getBotReply = async (
  message: string, 
  history: { role: string; parts: string }[], 
  businessInfo: BusinessInfo,
  attachment?: { data: string; mimeType: string }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional business assistant for "${businessInfo.name}".
    Business Description: ${businessInfo.description}
    Knowledge Base: ${JSON.stringify(businessInfo.faqs)}
    Language Preference: ${businessInfo.languagePreference}.
    
    INSTRUCTIONS:
    1. Be polite and professional. Use the user's preferred language style (Hinglish/English).
    2. Collect "name" and "requirement" naturally. Do not ask for both in the first message.
    3. If the user sends an attachment, acknowledge it based on the business context.
    4. If the user wants a human agent, say "Connecting you to an agent..."
    5. VERY IMPORTANT: Whenever you have captured the user's name OR requirement, append this at the end: [LEAD_CAPTURE: {"name": "...", "requirement": "..."}]
  `;

  try {
    const userParts: any[] = [{ text: message || "The user sent a media file." }];
    
    if (attachment) {
      userParts.push({
        inlineData: {
          data: attachment.data.split(',')[1] || attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    const contents = [
      ...history.map(h => ({ 
        role: h.role === 'bot' ? 'model' : 'user', 
        parts: [{ text: h.parts }] 
      })),
      { role: 'user', parts: userParts }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "I'm currently processing your request. Please wait.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The assistant is momentarily busy. Please try sending your message again.";
  }
};

export const generateSuggestedFaqs = async (businessInfo: Partial<BusinessInfo>) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Suggest 5 common FAQs for:
  Name: ${businessInfo.name}
  Description: ${businessInfo.description}
  Return ONLY JSON array: [{"question": "", "answer": ""}]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error generating FAQs:", error);
    return [];
  }
};

export const extractLeadInfo = (text: string) => {
  const match = text.match(/\[LEAD_CAPTURE: (.*?)\]/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const cleanBotResponse = (text: string) => {
  return text.replace(/\[LEAD_CAPTURE: .*?\]/g, '').trim();
};
