// app/lib/schema.ts
import { z } from "zod";

// Base entry schema with all possible fields
const baseEntrySchema = z.object({
  id: z.string().optional(), // Added for tracking entries
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  technologies: z.string().optional(),
  achievements: z.string().optional(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
});

// Experience/Education schema
export const entrySchema = baseEntrySchema.extend({
  organization: z.string().min(1, "Organization is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false).optional(),
  location: z.string().optional(),
  gpa: z.string().optional(),
  relevantCourses: z.string().optional(),
  teamSize: z.string().optional(),
  role: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.current === undefined) return;
  
  if (data.startDate && !data.current && !data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    });
  }
});

export const projectSchema = baseEntrySchema;

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
});

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(projectSchema),
  achievements: z.string().optional(),
  languages: z.string().optional(),
});



// Cover letter schema remains unchanged
export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  wordLimit: z.string({
    required_error: "Please select a word limit",
  }),
  letterType: z.string({
    required_error: "Please select a letter type",
  }),
});