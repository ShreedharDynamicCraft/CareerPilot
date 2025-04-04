"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { resumeSchema } from "@/app/lib/schema";

import { generatePDF } from './generate-pdf';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        industryInsight: true,
      },
    });

    if (!user) throw new Error("User not found");

    let prompt = '';
    
    switch (type) {
      case 'summary_ats':
        prompt = `
          As an ATS optimization expert, improve the following professional summary to make it more ATS-friendly for a ${user.industry} professional.
          Current summary: "${current}"

          Requirements:
          1. Use relevant industry-specific keywords that ATS systems commonly look for
          2. Maintain a clear, simple format without special characters
          3. Include key skills and technologies prominently
          4. Quantify achievements where possible
          5. Keep sentences clear and direct
          6. Ensure proper spelling and grammar
          7. Optimize for both human readers and ATS systems
          8. Keep it between 3-5 sentences
          
          Return ONLY the improved summary without any additional text.
        `;
        break;

      case 'summary':
        prompt = `
          As an expert resume writer, enhance the following professional summary for a ${user.industry} professional.
          Current summary: "${current}"

          Requirements:
          1. Start with a strong professional brand statement
          2. Highlight unique value proposition
          3. Include relevant achievements and expertise
          4. Incorporate industry-specific keywords naturally
          5. Show career progression and goals
          6. Use powerful action verbs
          7. Keep it concise but comprehensive
          8. Make it engaging for human readers
          
          Return ONLY the improved summary without any additional text.
        `;
        break;

      case 'achievements':
        prompt = `
          As an achievements expert, enhance the following achievements for a ${user.industry} professional.
          Current achievements: "${current}"

          Requirements:
          1. Quantify achievements with specific metrics
          2. Highlight industry-recognized certifications
          3. Include relevant awards and recognition
          4. Focus on recent and impactful achievements
          5. Use strong action verbs
          6. Keep descriptions concise but detailed
          
          Return ONLY the improved achievements, one per line starting with a bullet point.
        `;
        break;

      default:
        prompt = `
          As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
          Make it more impactful, quantifiable, and aligned with industry standards.
          Current content: "${current}"

          Requirements:
          1. Use action verbs
          2. Include metrics and results where possible
          3. Highlight relevant technical skills
          4. Keep it concise but detailed
          5. Focus on achievements over responsibilities
          6. Use industry-specific keywords
          
          Return ONLY the improved content without any additional text.
        `;
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    if (!result || !result.response) {
      throw new Error('No response from AI model');
    }

    const improvedContent = result.response.text();
    
    if (!improvedContent || improvedContent.trim().length === 0) {
      throw new Error('AI model returned empty content');
    }

    // Clean up the response
    const cleanedContent = improvedContent
      .replace(/^(Improved|Enhanced|ATS-friendly|Here's|Here is).*?:/i, '')
      .replace(/^[\s\n"']+|[\s\n"']+$/g, '')
      .replace(/^[•\-\*]\s*/gm, '• ');

    if (!cleanedContent || cleanedContent.trim().length === 0) {
      throw new Error('Failed to process AI response');
    }

    return cleanedContent;

  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error(error.message || "Failed to improve content");
  }
}

export const downloadResumePDF = async (htmlContent) => {
  try {
    const pdfBuffer = await generatePDF(htmlContent);
    return pdfBuffer;
  } catch (error) {
    console.error('Error in downloadResumePDF:', error);
    throw error;
  }
};