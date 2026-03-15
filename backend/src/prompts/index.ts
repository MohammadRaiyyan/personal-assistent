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

// ── Resume JSON → readable text for AI prompts ───────────────────────────────

function formatResumeForAI(content: string): string {
  try {
    const parsed = JSON.parse(content)
    if (!parsed?.data) return content
    const { data } = parsed
    const lines: string[] = []

    const ci = data.contactInfo ?? {}
    const contacts = [
      ci.email,
      ci.mobile,
      ...((ci.links ?? []) as Array<{ label: string; url: string }>)
        .filter((l) => l.url)
        .map((l) => `${l.label}: ${l.url}`),
    ].filter(Boolean)
    if (contacts.length) lines.push(`Contact: ${contacts.join(' | ')}`)

    if (data.summary) lines.push(`\nSummary:\n${data.summary}`)
    if (data.skills) lines.push(`\nSkills:\n${data.skills}`)

    const fmtEntry = (e: Record<string, string | boolean>) => {
      const dates = [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')
      const header = [e.title, e.organization].filter(Boolean).join(' at ')
      const bullets = e.bullets
        ? String(e.bullets).split('\n').map((b) => `    ${b}`).join('\n')
        : ''
      return `  ${header}${dates ? ` (${dates})` : ''}${bullets ? `\n${bullets}` : ''}`
    }

    const sections: Array<{ key: string; label: string }> = [
      { key: 'experience', label: 'Experience' },
      { key: 'education', label: 'Education' },
      { key: 'projects', label: 'Projects' },
    ]
    for (const { key, label } of sections) {
      const entries = (data[key] ?? []) as Array<Record<string, string | boolean>>
      const filled = entries.filter((e) => e.title || e.bullets)
      if (filled.length) {
        lines.push(`\n${label}:`)
        filled.forEach((e) => lines.push(fmtEntry(e)))
      }
    }

    return lines.join('\n')
  } catch {
    return content
  }
}

// ─────────────────────────────────────────────────────────────────────────────

interface GenerateCoverLetterProps {
  jobTitle: string,
  companyName: string,
  industry: string,
  experience: number,
  skills: string[],
  bio: string,
  jobDescription: string,
  resumeContent?: string,
}
export const generateCoverLetter = async (params: GenerateCoverLetterProps) => {
  const resumeSection = params.resumeContent
    ? `\nCandidate's Resume:\n${formatResumeForAI(params.resumeContent)}\n`
    : ''

  const prompt = `
    Write a professional cover letter for a ${params.jobTitle} position at ${params.companyName}.

    About the candidate:
    - Industry: ${params.industry}
    - Years of Experience: ${params.experience}
    - Skills: ${params.skills?.join(", ")}
    - Professional Background: ${params.bio}
    ${resumeSection}
    Job Description:
    ${params.jobDescription}

    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience that match the job description specifically
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements drawn from the resume if provided
    7. Relate candidate's background to job requirements

    Format the letter in markdown. Output only the letter content, no preamble.
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
  industry: string,
  skills?: string[],
  experience?: number,
  bio?: string,
}

export const improveResume = async (params: ImproveResumeParams) => {
  const profileContext = [
    params.experience !== undefined && `- Years of experience: ${params.experience}`,
    params.skills?.length && `- Core skills: ${params.skills.join(", ")}`,
    params.bio && `- Professional background: ${params.bio}`,
  ].filter(Boolean).join("\n")

  const prompt = `
    You are an expert resume writer. Improve the following ${params.type} section for a ${params.industry} professional.

    Candidate profile:
    ${profileContext || "- No additional profile data provided"}

    Content to improve:
    "${params.content}"

    Requirements:
    1. Use strong action verbs and quantifiable achievements
    2. Weave in the candidate's skills naturally where relevant
    3. Match the tone and seniority to their experience level
    4. Use ${params.industry}-specific keywords and terminology
    5. Keep it concise — no fluff, no vague statements
    6. Focus on impact and outcomes, not just responsibilities
    ${params.type !== "summary" ? "7. Return as markdown bullet points, one per line, each starting with '- '. Use **bold** for key metrics, skills, or standout achievements. No other markdown." : "7. Return as a single concise paragraph. No markdown formatting."}

    Return only the improved text with no explanation or preamble.
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
  skillFocus?: string[],
  previousQuestions?: string[],
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
    - Topic: ${params.skillFocus?.length ? params.skillFocus.join(", ") : (params.skills?.join(", ") || "general")}
    - Target level: ${level}
    ${params.skillFocus?.length
      ? `STRICT REQUIREMENT: Every single question must be exclusively and directly about ${params.skillFocus.join(", ")}. Do NOT drift into related technologies (e.g. if the topic is React, do not ask about Node.js, Express, JavaScript fundamentals, or any other library). Every question must clearly test ${params.skillFocus.join(", ")} knowledge specifically.`
      : ""
    }

    ${isTechnical
      ? `Question depth must strictly match ${level}:
      - Junior (0–2 yrs): syntax, basic usage, core concepts, "what does X do", simple debugging
      - Mid-level (2–5 yrs): practical patterns, common pitfalls, "how would you implement X", tradeoffs between approaches
      - Senior (5–8 yrs): advanced internals, performance optimisation, architectural patterns, "design X at scale"
      - Lead/Principal (8+ yrs): system design decisions, cross-team patterns, scalability, "how would you architect X for a large team"
      - Staff/FAANG: deep internals, novel tradeoffs, open-ended architectural challenges, questions that have no single right answer

      For questions that involve reading or analysing code, include the snippet in a "code" field. For concept questions, omit "code".
      All technical questions MUST have exactly 4 "options" and a "correctAnswer" that is an exact match to one of the options.`
      : `Behavioral question depth must match ${level}:
      - Junior: basic teamwork, asking for help, handling feedback
      - Mid-level: owning deliverables, cross-team communication, dealing with ambiguity
      - Senior: influencing without authority, driving projects, handling failure at scale
      - Lead/Principal: org-level decisions, mentoring, trade-off communication to stakeholders
      - Staff/FAANG: company-wide impact, building culture, navigating complex political situations

      Behavioral questions must be open-ended — no "options" or "correctAnswer" fields. The "explanation" field must describe what a strong STAR-format answer looks like at ${level}.`
    }

    ${params.previousQuestions?.length
      ? `The user just answered these questions in their last session — avoid repeating them directly, but similar concepts may reappear if they are fundamental to the topic:\n${params.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : ""
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