import { generateQuiz } from "./index.ts";

async function main() {
    try {
        // const result = await generateAIInsights({ experience: 3, industry: "Software", skills: ["react", "javascript", "typescript"], country: "India" });

        // const result = await generateCoverLetter({
        //     jobTitle: "Frontend Developer",
        //     companyName: "Tech Solutions",
        //     industry: "Software",
        //     experience: 3,
        //     skills: ["react", "javascript", "typescript"],
        //     bio: "A passionate frontend developer with 3 years of experience in building responsive web applications.",
        //     jobDescription: "We are looking for a skilled Frontend Developer to join our dynamic team. The ideal candidate should have experience with React, JavaScript, and TypeScript. Responsibilities include developing user-friendly web applications, collaborating with designers and backend developers, and ensuring high performance and responsiveness of applications."
        // });
        const result = await generateQuiz({
            industry: "Software",
            experience: 3,
            skills: ["react", "javascript", "typescript"],
        })
        console.log("Results", result)
    } catch (error) {
        console.log("Error", error)
    }
}

main()