"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateIndustryInsights(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const prompt = `
    Analyze the following industry and provide strategic insights:
    Industry: ${data.industry}
    Focus Areas: ${data.focusAreas}
    
    Please provide:
    1. Current trends and market conditions
    2. Key challenges and opportunities
    3. Required skills and qualifications
    4. Career growth potential
    5. Recommended next steps for career development
    
    Format the response in markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const insight = await db.industryInsight.create({
      data: {
        content,
        industry: data.industry,
        userId: user.id,
      },
    });

    return insight;
  } catch (error) {
    console.error("Error generating industry insights:", error);
    throw new Error("Failed to generate industry insights");
  }
}
