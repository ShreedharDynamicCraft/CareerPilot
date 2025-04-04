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

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        industry: true,
        skills: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get request data
    const formData = await req.formData();
    const resumeFile = formData.get("resume");
    const skills = formData.get("skills");
    const experienceLevel = formData.get("experienceLevel") || "fresher";
    const interviewType = formData.get("interviewType") || "technical";
    const questionIndex = parseInt(formData.get("questionIndex") || "0");

    // Extract skills from resume if provided
    let extractedSkills = [];
    let resumeText = "";
    
    if (resumeFile) {
      // In a real implementation, this would parse the PDF and extract text
      // For now, we'll just use the filename as a placeholder
      resumeText = `Resume uploaded: ${resumeFile.name}`;
      
      // Extract skills from resume using AI
      const extractionPrompt = `
        Extract the key skills and technologies from this resume information:
        ${resumeText}
        
        Return ONLY a comma-separated list of skills, no other text.
      `;
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const extractionResult = await model.generateContent(extractionPrompt);
      const extractedSkillsText = extractionResult.response.text().trim();
      
      if (extractedSkillsText) {
        extractedSkills = extractedSkillsText.split(",").map(skill => skill.trim());
      }
    }
    
    // Combine extracted skills with user-provided skills
    const allSkills = [...extractedSkills];
    if (skills) {
      const userSkills = skills.split(",").map(skill => skill.trim());
      userSkills.forEach(skill => {
        if (!allSkills.includes(skill)) {
          allSkills.push(skill);
        }
      });
    }
    
    // Add user's stored skills if available
    if (user.skills && user.skills.length > 0) {
      user.skills.forEach(skill => {
        if (!allSkills.includes(skill)) {
          allSkills.push(skill);
        }
      });
    }

    // Generate personalized interview question
    const prompt = `
      Generate a personalized ${interviewType} interview question for a ${experienceLevel} candidate 
      in the ${user.industry || "technology"} industry.
      
      ${allSkills.length > 0 ? `The candidate has the following skills: ${allSkills.join(", ")}` : ""}
      ${resumeText ? `Additional context from their resume: ${resumeText}` : ""}
      
      This is question #${questionIndex + 1} in the interview.
      
      Return the response in this JSON format:
      {
        "question": "The interview question",
        "tags": ["relevant", "skill", "tags"],
        "difficulty": "easy/medium/hard",
        "expectedAnswer": "A detailed explanation of what a good answer should include",
        "followUpQuestions": ["follow-up question 1", "follow-up question 2"],
        "aiInterviewerScript": "A natural-sounding script for the AI interviewer to read when asking this question"
      }
      
      IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to handle any markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const questionData = JSON.parse(cleanText);

    return NextResponse.json(questionData);
  } catch (error) {
    console.error("Error in video interview API:", error);
    return NextResponse.json(
      { error: "Failed to process interview request" },
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