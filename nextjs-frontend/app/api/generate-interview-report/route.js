import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { feedback, specialization, experienceLevel } = await req.json();

    const prompt = `Generate a comprehensive interview report for a ${experienceLevel} ${specialization.toUpperCase()} student based on the following feedback:
    ${JSON.stringify(feedback, null, 2)}
    
    Provide a detailed analysis in JSON format:
    {
      "report": {
        "overallPerformance": "Overall assessment of the interview performance",
        "strengths": ["strength1", "strength2", "strength3"],
        "areasForImprovement": ["area1", "area2", "area3"],
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
        "nextSteps": {
          "shortTerm": ["immediate action items"],
          "longTerm": ["long-term development goals"]
        },
        "resources": {
          "books": ["recommended book 1", "recommended book 2"],
          "onlineCourses": ["course 1", "course 2"],
          "practicePlatforms": ["platform 1", "platform 2"]
        },
        "skillGapAnalysis": {
          "strongAreas": ["skill1", "skill2"],
          "needsImprovement": ["skill1", "skill2"],
          "recommendedTopics": ["topic1", "topic2"]
        }
      }
    }
    
    IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to handle any markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const report = JSON.parse(cleanText);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating interview report:", error);
    return NextResponse.json(
      { error: "Failed to generate interview report" },
      { status: 500 }
    );
  }
} 