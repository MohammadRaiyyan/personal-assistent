import z from "zod";

export const createResumeSchema = z.object({
    content: z.string("Resume content is required"),
    title: z.string().optional(),
})

export const improveResumeContentSchema = z.object({
    type: z.enum(["experience", "project", "summary", "education"], "Content type is required"),
    content: z.string("Content is required"),
    industry: z.string("Industry is required")
})