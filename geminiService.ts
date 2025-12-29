
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const JOB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Post title e.g., UPSSSC Lekhpal 2025' },
    department: { type: Type.STRING, description: 'Full organization name' },
    shortInfo: { type: Type.STRING, description: 'A highly detailed professional description of the recruitment, exactly 150 to 200 words long.' },
    importantDates: { type: Type.STRING, description: 'Detailed dates list' },
    fee: { type: Type.STRING, description: 'Detailed fee structure' },
    ageLimit: { type: Type.STRING, description: 'Age limit requirements' },
    totalPosts: { type: Type.STRING, description: 'Number of vacancies' },
    vacancyDetails: { type: Type.STRING, description: 'Post-wise vacancy count' },
    eligibility: { type: Type.STRING, description: 'Qualification details' },
    howToApply: { type: Type.STRING, description: 'Step by step instructions' },
    selectionProcess: { type: Type.STRING, description: 'Exam/Interview details' },
    category: { type: Type.STRING, description: 'Category e.g. Latest Jobs' },
    officialWebsite: { type: Type.STRING, description: 'Official URL' }
  },
  required: ['title', 'department', 'category', 'shortInfo']
};

export const generatePostFromTitle = async (title: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a professional Sarkari Result style notification for: ${title}. MANDATORY: The "shortInfo" field must contain a very detailed description between 150 and 200 words.`,
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
    contents: `Extract recruitment details from: ${url}. MANDATORY: Create a new "shortInfo" field which is a professional summary of 150-200 words about this job.`,
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
    contents: `Write a professional 200-word recruitment summary for the post "${title}" in "${dept}". Keep it formal and informative.`,
  });
  return response.text || '';
};
