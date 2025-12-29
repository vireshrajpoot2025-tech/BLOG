
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const JOB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Post title e.g., UPSSSC Lekhpal 2025' },
    department: { type: Type.STRING, description: 'Full organization name' },
    shortInfo: { type: Type.STRING, description: 'Professional summary of the job (150 words).' },
    importantDates: { type: Type.STRING, description: 'Dates like Start, Last Date, Exam Date' },
    fee: { type: Type.STRING, description: 'Application fee details' },
    ageLimit: { type: Type.STRING, description: 'Min and Max age' },
    totalPosts: { type: Type.STRING, description: 'Number of vacancies' },
    vacancyDetails: { type: Type.STRING, description: 'Post name and count' },
    eligibility: { type: Type.STRING, description: 'Educational qualification' },
    howToApply: { type: Type.STRING, description: 'Instructions to apply' },
    selectionProcess: { type: Type.STRING, description: 'How selection will happen' },
    category: { type: Type.STRING, description: 'Result, Admit Card, or Latest Job' },
    officialWebsite: { type: Type.STRING, description: 'Official URL' }
  },
  required: ['title', 'department', 'category', 'shortInfo']
};

// 1. New function to FIND jobs from Google
export const searchLatestJobsFromWeb = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Find 5 latest government job notifications (Sarkari Naukri) released in India in the last 48 hours. Provide their official titles and notification links.",
    config: {
      tools: [{googleSearch: {}}],
    },
  });
  
  // Extracting the search results to show as clickable sources
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Job Notification',
    url: chunk.web?.uri || ''
  })).filter((c: any) => c.url) || [];

  return {
    text: response.text,
    sources: links
  };
};

export const generatePostFromTitle = async (title: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed professional Sarkari Result style notification for: ${title}. Use Hindi/English mix.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: JOB_SCHEMA
    }
  });
  return JSON.parse(response.text || '{}');
};

export const syncPostFromLink = async (url: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Carefully read this official notification page: ${url}. Extract ALL recruitment details like dates, fees, and eligibility into the provided schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: JOB_SCHEMA
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateOnlyDescription = async (title: string, dept: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional 200-word recruitment summary for the post "${title}" in "${dept}".`,
  });
  return response.text || '';
};
