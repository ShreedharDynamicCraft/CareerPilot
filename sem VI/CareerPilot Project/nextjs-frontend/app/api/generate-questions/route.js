import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { skills, difficulty, questionCount } = await req.json();

    // Validate input
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "Skills must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    if (![5, 10, 20, 30, 50].includes(questionCount)) {
      return NextResponse.json(
        { error: "Invalid question count" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ${questionCount} interview questions for the following skills: ${skills.join(", ")}. 
    Difficulty level: ${difficulty}
    
    Requirements:
    1. Questions should be a mix of multiple choice (MCQ) and fill-in-the-blank questions
    2. Each question should include:
       - The question text
       - Type (either "mcq" or "fill")
       - Topic and subtopic
       - For MCQ: 4 options with one correct answer
       - For fill-in-the-blank: the correct answer
       - A detailed explanation
       - Recommended resources for learning more about the topic
    
    Format the response as a JSON array with the following structure:
    [
      {
        "question": "Question text",
        "type": "mcq" or "fill",
        "topic": "Main topic",
        "subtopic": "Specific subtopic",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Only for MCQ
        "correctAnswer": "Correct answer",
        "explanation": "Detailed explanation",
        "recommendedResources": ["Resource 1", "Resource 2"]
      }
    ]
    
    Make sure the questions are challenging but fair, and cover a good range of topics within the specified skills.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text to remove any markdown formatting
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      
      try {
        const questions = JSON.parse(cleanText);
        
        // Validate the questions array
        if (!Array.isArray(questions)) {
          throw new Error("Generated content is not an array");
        }

        // Validate each question has required fields
        questions.forEach((q, index) => {
          if (!q.type || !q.question || !q.correctAnswer || !q.topic || !q.subtopic) {
            throw new Error(`Question ${index + 1} is missing required fields`);
          }
          if (q.type === "mcq" && (!q.options || !Array.isArray(q.options))) {
            throw new Error(`Question ${index + 1} (MCQ) is missing options array`);
          }
          if (q.type === "coding" && (!q.testCases || !Array.isArray(q.testCases))) {
            throw new Error(`Question ${index + 1} (coding) is missing test cases`);
          }
        });

        return NextResponse.json({ questions });
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        return NextResponse.json(
          { error: "Failed to parse generated questions" },
          { status: 500 }
        );
      }
    } catch (genError) {
      console.error("Error generating content:", genError);
      return NextResponse.json(
        { error: "Failed to generate questions. Please check your API key and try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in generate-questions API:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
} 