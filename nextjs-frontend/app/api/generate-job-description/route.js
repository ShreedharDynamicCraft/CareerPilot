import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromPDF } from "@/lib/pdf-utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const resumeFile = formData.get('resumeFile');

    if (!resumeFile || !(resumeFile instanceof File)) {
      return NextResponse.json({ 
        error: "Invalid resume file: Expected a File object" 
      }, { status: 400 });
    }

    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json({ 
        error: "Invalid file type: Please upload a PDF file" 
      }, { status: 400 });
    }

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("PDF buffer length:", buffer.length);

    // Extract text from PDF using pdf-parse
    const resumeText = await extractTextFromPDF(buffer);
    console.log("Extracted resume text:", resumeText.substring(0, 100));

    if (!resumeText.trim()) {
      return NextResponse.json({ 
        error: "No text could be extracted from the PDF" 
      }, { status: 400 });
    }

    // Prompt Gemini with the extracted text
    const prompt = `
      Based on the following resume content, generate a concise job description (150-200 words) that aligns with the candidate's skills, experience, and career goals:
      
      Resume Content:
      ${resumeText}
      
      Instructions:
      1. Summarize the candidate's key skills and experience.
      2. Create a job description for a role they are well-suited for.
      3. Use professional language suitable for inclusion in a cover letter.
      4. Ensure the description reflects the candidate's background and aspirations.
      
      Output the job description as plain text.
    `;

    const result = await model.generateContent(prompt);
    const jobDescription = result.response.text().trim();

    return NextResponse.json({ jobDescription });
  } catch (error) {
    console.error("Error generating job description from resume:", error.message);
    return NextResponse.json({ 
      error: "Failed to generate job description from resume" 
    }, { status: 500 });
  }
}
