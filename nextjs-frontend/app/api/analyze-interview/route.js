import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const video = formData.get("video");
    const question = formData.get("question");

    // For now, we'll analyze the text response since video analysis requires additional setup
    const prompt = `Analyze the following interview response for a technical question.
    Question: ${question}
    
    Provide a detailed analysis in JSON format:
    {
      "feedback": {
        "technicalAccuracy": number (0-100),
        "communication": number (0-100),
        "problemSolving": number (0-100),
        "detailedFeedback": "Detailed explanation of the analysis"
      },
      "report": {
        "overallPerformance": "Overall assessment of the interview performance",
        "strengths": ["strength1", "strength2", "strength3"],
        "areasForImprovement": ["area1", "area2", "area3"],
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
      }
    }
    
    IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to handle any markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing interview:", error);
    return NextResponse.json(
      { error: "Failed to analyze interview" },
      { status: 500 }
    );
  }
} 