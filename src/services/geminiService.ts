import { GoogleGenAI } from "@google/genai";
import { UserRole, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getSystemInstruction = (role: UserRole, language: Language) => {
  const base = `You are VetAI, an expert multilingual veterinary AI assistant.
Language: ${language.name}
User Role: ${role === 'owner' ? 'Livestock Owner / Farmer' : role === 'vet' ? 'Veterinarian' : 'Institutional Management'}

Tone:
- For Owners: Simple, warm, practical, colloquial. Avoid jargon.
- For Veterinarians: Clinical, precise, evidence-based, scientific.
- For Management: Professional, data-driven, formal.

Safety: Always include: "This AI guidance is supportive. Please consult a licensed veterinarian for diagnosis and treatment decisions."
Escalation: Flag emergencies (FMD, Anthrax, Rabies, Bloat, Dystocia >2h, Mass mortality) with "⚠️ EMERGENCY".

Structure: Use clear sections, bullet points, and emojis (✅ ⚠️ 🐄 💊 📋).`;

  return base;
};

export async function generateVetResponse(
  role: UserRole,
  language: Language,
  prompt: string,
  image?: string
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: image 
      ? { parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: image.split(',')[1] } }] }
      : prompt,
    config: {
      systemInstruction: getSystemInstruction(role, language),
    },
  });

  return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
}
