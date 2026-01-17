import { GoogleGenAI } from "@google/genai";
import "dotenv";

const apiKey = process.env.GOOGLE_API_KEY || "";
class AIClient {
  private client: GoogleGenAI;
  constructor() {
    this.client = new GoogleGenAI({
      vertexai: false,
      apiKey
    });
  }
  generate(prompt: string) {
    return this.client.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt })
  }
}


type GenerateInsightProps = {
  industry: string,
  skills: string[],
  experience: number,
  country: string
}

type InsightResponse = {
  salaryRanges: [
    { role: string, min: number, max: number, median: number, currency: string, location: string }
  ],
  jobGrowth: number,
  demandLevel: "high" | "medium" | "low",
  keySkills: string[],
  marketOutlook: "positive" | "stable" | "negative",
  keyTrends: string[],
  recommendedSkills: string[]
}
export const generateAIInsights = async (params: GenerateInsightProps): Promise<InsightResponse> => {
  const prompt = `
          Analyze the current state of the ${params.industry} industry based on experience ${params.experience}, skills ${params.skills.join(", ")}, country ${params.country}, and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            salaryRanges: [
              { role: string, min: number, max: number, median: number, currency: string, location: string }
            ],
            jobGrowth: number,
            demandLevel: "high" | "medium" | "low",
            keySkills: string[],
            marketOutlook: "positive" | "stable" | "negative",
            keyTrends: string[],
            recommendedSkills: string[]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
  try {
    const result = await new AIClient().generate(prompt);
    const response = result.text;
    if (!response) {
      throw new Error("Something went wrong while generating insight")
    }

    const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error", error)
    throw new Error("Something went wrong while generating insight")
  }

};

interface GenerateCoverLetterProps {
  jobTitle: string,
  companyName: string,
  industry: string,
  experience: number,
  skills: string[],
  bio: string,
  jobDescription: string
}
export const generateCoverLetter = async (params: GenerateCoverLetterProps) => {
  const prompt = `
    Write a professional cover letter for a ${params.jobTitle} position at ${params.companyName
    }.
    
    About the candidate:
    - Industry: ${params.industry}
    - Years of Experience: ${params.experience}
    - Skills: ${params.skills?.join(", ")}
    - Professional Background: ${params.bio}
    
    Job Description:
    ${params.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;



  try {
    const result = await new AIClient().generate(prompt);
    const response = result.text;
    if (!response) {
      throw new Error("Something went wrong while generating cover letter")
    }
    return response?.trim()
  } catch (error) {
    console.error("Error", error)

    throw new Error("Something went wrong while generating cover letter")
  }
}

export interface ImproveResumeParams {
  type: "experience" | "project" | "summary" | "education",
  content: string,
  industry: string
}

export const improveResume = async (params: ImproveResumeParams) => {
  const prompt = `
    As an expert resume writer, improve the following ${params.type} description for a ${params.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${params.content}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await new AIClient().generate(prompt);
    const response = result.text;
    if (!response) {
      throw new Error("Something went wrong while generating improvements")
    }
    return response?.trim()
  } catch (error) {
    console.error("Error", error)

    throw new Error("Something went wrong while generating improvements")
  }
}

export interface GenerateQuizParams {
  experience: number,
  industry: string,
  skills: string[],
}
export const generateQuiz = async (params: GenerateQuizParams) => {
  const prompt = `
    Generate 10 technical interview questions for a ${params.industry
    } professional having experience of ${params.experience} years${params.skills?.length ? ` with expertise in ${params.skills.join(", ")}` : ""
    }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const result = await new AIClient().generate(prompt);
    const response = result.text;
    if (!response) {
      throw new Error("Something went wrong while generating quiz")
    }
    const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);
    return quiz.questions;
  } catch (error) {
    console.error("Error", error)

    throw new Error("Something went wrong while generating quiz")
  }
}

export interface GenerateImprovementTipProps {
  industry: string,
  wrongQuestions: string,
  category: "technical" | "behavioral"
}
export const generateImprovementTips = async (params: GenerateImprovementTipProps) => {
  const improvementPrompt = `
      The user got the following ${params.industry} ${params.category} interview questions wrong:

      ${params.wrongQuestions}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

  try {
    const result = await new AIClient().generate(improvementPrompt);
    const response = result.text;
    if (!response) {
      throw new Error("Something went wrong while generating quiz")
    }
    const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);
    return quiz.questions;
  } catch (error) {
    console.error("Error", error)

    throw new Error("Something went wrong while generating quiz")
  }

}