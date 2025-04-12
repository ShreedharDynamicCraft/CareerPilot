import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { topic, difficulty } = await req.json();

    const prompt = `Generate a DSA practice problem in JSON format with the following structure:
    {
      "id": "unique-id",
      "title": "Problem title",
      "description": "Detailed problem description",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "starterCode": "Initial code template",
      "testCases": [
        {
          "input": "input value",
          "expectedOutput": "expected output",
          "explanation": "explanation of the test case"
        }
      ]
    }
    
    IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to handle any markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const problem = JSON.parse(cleanText);

    return NextResponse.json({ problem });
  } catch (error) {
    console.error("Error generating DSA problem:", error);
    return NextResponse.json(
      { error: "Failed to generate DSA problem" },
      { status: 500 }
    );
  }
} 