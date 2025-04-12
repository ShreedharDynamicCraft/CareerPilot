import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request data
    const formData = await req.formData();
    const audioBlob = formData.get("audio");
    const questionText = formData.get("question");
    const responseText = formData.get("responseText"); // This would come from speech-to-text conversion
    const interviewType = formData.get("interviewType") || "technical";
    
    // In a real implementation, we would:
    // 1. Process the audio file using a speech-to-text service
    // 2. Analyze the audio for tone, pace, clarity, etc.
    
    // For now, we'll use the provided text response or a placeholder
    const userResponse = responseText || "[User's spoken response would be transcribed here]";
    
    // Generate analysis using AI
    const prompt = `
      Analyze this ${interviewType} interview response:
      
      Question: "${questionText}"
      
      Response: "${userResponse}"
      
      Provide a detailed analysis in JSON format:
      {
        "feedback": {
          "technicalAccuracy": number (0-100),
          "communication": number (0-100),
          "problemSolving": number (0-100),
          "detailedFeedback": "Detailed explanation of the analysis"
        },
        "strengths": ["strength1", "strength2"],
        "areasForImprovement": ["area1", "area2"],
        "nextQuestionSuggestion": "A suggested follow-up question based on this response"
      }
      
      For technical accuracy, evaluate how well the candidate answered the technical aspects of the question.
      For communication, evaluate clarity, conciseness, and structure of the response.
      For problem solving, evaluate the approach and methodology used to address the question.
      
      IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to handle any markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanText);

    // Store the interview response in the database (optional)
    // This could be used for tracking progress over time
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (user) {
      // You could create a new model in your schema for interview responses
      // For now, we'll just return the analysis
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing voice response:", error);
    return NextResponse.json(
      { error: "Failed to analyze voice response" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}