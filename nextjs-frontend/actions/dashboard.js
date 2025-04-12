"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry in India and provide detailed insights in ONLY the following JSON format without any additional notes or explanations:
    
    {
      "industry": "${industry}",
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"],
      "lastUpdated": "2025-03-22T00:00:00Z",
      "nextUpdate": "2025-03-29T00:00:00Z"
    }
    
    IMPORTANT REQUIREMENTS:
    - Return ONLY the JSON. No additional text, notes, or markdown formatting.
    - Include at least 7 common roles for salary ranges with accurate Indian market salary data in Rupees.
    - Include at least 5 different locations (Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, etc.) across the salary ranges.
    - Growth rate should be a percentage between 1 and 20.
    - Include at least 8 relevant skills and 6 industry trends specific to India.
    - All salary figures should be in Indian Rupees (not in USD).
    - Each salary value should be provided in full numbers (e.g., 1200000 for 12 lakhs).
    - All trends and insights should be specific to the Indian market.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  try {
    const parsedData = JSON.parse(cleanedText);
    return parsedData;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid response format from AI service");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        userId: user.id,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  // Check if insights need to be refreshed (older than 7 days)
  const now = new Date();
  const lastUpdated = new Date(user.industryInsight.lastUpdated);
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  if (now.getTime() - lastUpdated.getTime() > sevenDaysInMs) {
    return refreshIndustryInsights(user.industry, user.industryInsight.id);
  }

  return user.industryInsight;
}

export async function refreshIndustryInsights(industry, insightId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Generate new insights
    const freshInsights = await generateAIInsights(industry);

    // Update the database
    const updatedInsight = await db.industryInsight.update({
      where: { id: insightId },
      data: {
        ...freshInsights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Revalidate the dashboard page to reflect new data
    revalidatePath("/dashboard");

    return updatedInsight;
  } catch (error) {
    console.error("Failed to refresh industry insights:", error);
    throw new Error("Failed to refresh industry data");
  }
}

export async function getLocationSpecificInsights(location) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user || !user.industryInsight) {
    throw new Error("Industry insights not found");
  }

  // Filter the salary ranges to the specific location
  const locationInsights = {
    ...user.industryInsight,
    salaryRanges: user.industryInsight.salaryRanges.filter(
      range => range.location === location || location === "All India"
    )
  };

  return locationInsights;
}

export async function downloadInsightsReport(format = "csv") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user || !user.industryInsight) {
    throw new Error("Industry insights not found");
  }

  // In a real implementation, this would generate and return a file
  // For now, we'll just return a success message
  return {
    success: true,
    message: `Industry insights report generated in ${format} format`,
  };
}

