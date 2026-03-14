import { GoogleGenAI } from "@google/genai";

class AIClient {
  private client: GoogleGenAI;
  constructor() {
    this.client = new GoogleGenAI({
      vertexai: false,
      apiKey: process.env.GEMINI_API_KEY ?? "",
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
  country: string | null
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
  const location = params.country ?? "global";
  const prompt = `
          You are a career intelligence analyst. Analyze the ${params.industry} industry job market specifically for ${location}.

          Candidate profile:
          - Country/Region: ${location}
          - Experience: ${params.experience} years
          - Skills: ${params.skills.join(", ")}

          Return insights tailored to the ${location} market (local salary ranges in the correct local currency, trends relevant to ${location}, in-demand skills specific to ${location}).

          Respond in ONLY the following JSON format with no additional text or markdown:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "currency": "string", "location": "string" }
            ],
            "jobGrowth": number,
            "demandLevel": "high" | "medium" | "low",
            "keySkills": ["string"],
            "marketOutlook": "positive" | "stable" | "negative",
            "keyTrends": ["string"],
            "recommendedSkills": ["string"]
          }

          Requirements:
          - salaryRanges: at least 5 common roles, salaries in local currency for ${location}
          - jobGrowth: percentage as a number (e.g. 8.2)
          - keyTrends: at least 5 trends relevant to ${location}
          - keySkills and recommendedSkills: at least 5 each
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
  category: "technical" | "behavioral",
  difficulty: "junior" | "mid" | "senior" | "lead" | "staff",
  count: number,
}

const difficultyLabel: Record<GenerateQuizParams["difficulty"], string> = {
  junior: "Junior (0–2 years)",
  mid: "Mid-level (2–5 years)",
  senior: "Senior (5–8 years)",
  lead: "Lead / Principal (8+ years)",
  staff: "Staff / Architect / FAANG-level",
}

export const generateQuiz = async (params: GenerateQuizParams) => {
  const level = difficultyLabel[params.difficulty]
  const isTechnical = params.category === "technical"
  const prompt = `
    Generate ${params.count} ${params.category} interview questions for a ${params.industry} professional.

    Candidate profile:
    - Experience: ${params.experience} years
    - Skills: ${params.skills?.join(", ") || "general"}
    - Target level: ${level}

    ${isTechnical
      ? `Focus on technical depth appropriate for ${level}. Include questions on system design, coding patterns, or architecture for senior/lead/staff levels. For junior/mid, focus on fundamentals and problem-solving.

      For questions that involve reading or analyzing code, include the code snippet in a "code" field (as a string with newlines escaped). For concept/theory questions, omit the "code" field.
      All technical questions MUST have 4 "options" and a "correctAnswer" (exact match to one of the options).`
      : `Focus on behavioral questions using STAR format scenarios relevant to ${level}. Include leadership, conflict resolution, and impact-driven questions scaled to the target level.

      Behavioral questions should NOT have options or a correctAnswer — they are open-ended. Omit the "options" and "correctAnswer" fields entirely for behavioral questions. The "explanation" field should describe what a strong answer looks like.`
    }

    Return ONLY this JSON format, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "code": "optional string — only for technical questions with code snippets",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }

    For behavioral questions, the format is:
    {
      "question": "string",
      "explanation": "string describing what a strong STAR answer looks like"
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
  category: "technical" | "behavioral",
  difficulty: "junior" | "mid" | "senior" | "lead" | "staff",
  score: number,
  wrongQuestions?: string,
}
export const generateImprovementTips = async (params: GenerateImprovementTipProps) => {
  const isPerfect = params.score >= 90;
  const improvementPrompt = isPerfect
    ? `
      The user just scored ${params.score.toFixed(0)}% on a ${params.difficulty}-level ${params.category} interview quiz in the ${params.industry} industry.

      Write a short (2 sentences max), enthusiastic, and specific congratulatory message.
      Acknowledge their achievement and suggest one advanced next step to keep growing.
      Be warm, energetic, and motivating — like a proud mentor.
    `
    : `
      The user scored ${params.score.toFixed(0)}% on a ${params.difficulty}-level ${params.category} interview quiz in the ${params.industry} industry.

      ${params.wrongQuestions ? `They got these questions wrong:\n${params.wrongQuestions}` : ""}

      Write a short (2 sentences max) feedback message.
      Be encouraging but specific — acknowledge what they got right and give one actionable improvement tip.
      Focus on the knowledge gaps without listing the mistakes. Be warm and motivating.
    `;

  try {
    const result = await new AIClient().generate(improvementPrompt);
    const response = result.text;
    if (!response) {
      throw new Error("Something went wrong while generating improvement tips")
    }
    return response.trim();
  } catch (error) {
    console.error("Error", error)

    throw new Error("Something went wrong while generating improvement tips")
  }

}