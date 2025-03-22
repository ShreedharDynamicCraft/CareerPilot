"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDocument } from "pdfjs-dist/legacy/build/pdf"; // Use legacy build for Node.js compatibility

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateJobDescriptionFromResume(resumeFile) {
  try {
    // Validate resumeFile
    if (!(resumeFile instanceof File)) {
      throw new Error("Invalid resume file: Expected a File object");
    }

    // Convert File to Uint8Array for pdfjs-dist
    const arrayBuffer = await resumeFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log("PDF buffer length:", uint8Array.length); // Debug log

    // Extract text from PDF
    const pdf = await getDocument({ data: uint8Array }).promise;
    let resumeText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      resumeText += content.items.map(item => item.str).join(" ") + "\n";
    }
    console.log("Extracted resume text:", resumeText.substring(0, 100)); // Debug log

    // Prompt Gemini with the extracted text
    const prompt = `
      Based on the following resume content, generate a concise job description (150-200 words) that aligns with the candidate's skills, experience, and career goals:
      
      Resume Content:
      ${resumeText}
      
      Instructions:
      1. Summarize the candidate's key skills and experience.
      2. Create a job description for a role they are well-suited for.
      3. Use professional language suitable for inclusion in a cover letter.
      4. Ensure the description reflects the candidate’s background and aspirations.
      
      Output the job description as plain text.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating job description from resume:", error.message);
    throw new Error("Failed to generate job description from resume");
  }
}

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  // Validate required fields
  if (!data.wordLimit || !data.letterType) {
    throw new Error("Word limit and letter type are required");
  }

  const wordLimitMap = {
    short: 200,
    medium: 400,
    detailed: 600,
  };
  
  // Add safety check for word limit
  const wordLimit = wordLimitMap[data.wordLimit] || 400; // Default to medium if invalid
  console.log("Word limit:", wordLimit);

  const letterTypePrompts = {
    jobApplication: `
      Write a cover letter for applying to a posted job at ${data.companyName} for the ${data.jobTitle} position.
      Focus on matching the candidate's skills and experience to the job description, using a confident and professional tone.
      Highlight specific achievements that align with the role's requirements.
    `,
    internship: `
      Write a cover letter for an internship position at ${data.companyName} for the ${data.jobTitle} role.
      Emphasize the candidate's eagerness to learn, relevant coursework or projects, and potential to grow.
      Use an enthusiastic, humble tone suitable for a beginner seeking hands-on experience.
    `,
    networking: `
      Write a cover letter for reaching out to industry professionals at ${data.companyName} regarding ${data.jobTitle} opportunities.
      Prioritize building a connection, expressing admiration for the company, and subtly showcasing relevant skills.
      Use a warm, professional, and relationship-focused tone.
    `,
    referral: `
      Write a cover letter for a job referral at ${data.companyName} for the ${data.jobTitle} position, mentioning a referral from a company insider.
      Highlight the candidate's fit for the role, leveraging the referral to establish credibility.
      Use a confident yet appreciative tone.
    `,
    careerChange: `
      Write a cover letter for switching industries or roles to the ${data.jobTitle} position at ${data.companyName}.
      Focus on transferable skills and explain the candidate's motivation for the change, connecting past experience to the new role.
      Use a determined and adaptable tone.
    `,
    coldEmail: `
      Write a cold email cover letter for an unsolicited job application to ${data.companyName} for a potential ${data.jobTitle} role.
      Pitch the candidate’s value to the company, addressing a specific need or opportunity inferred from the job description.
      Use a bold, proactive, and concise tone.
    `,
  };

  // Add safety check for letter type
  const letterTypeInstruction = letterTypePrompts[data.letterType] || letterTypePrompts.jobApplication;
  console.log("Letter type:", data.letterType);
  console.log("Letter type instruction:", letterTypeInstruction);

  // Use ISO string format for consistent date rendering
  const formattedDate = new Date().toISOString().split('T')[0];

  const prompt = `
    
    Candidate Information:
    - Name: ${user.name}
    - Email: ${user.email}
    - Date: ${formattedDate}
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Details:
    - Company Name: ${data.companyName}
    - Job Title: ${data.jobTitle}
    - Job Description: ${data.jobDescription}
    
    Instructions:
    
   
    1. ${letterTypeInstruction}
    2. Incorporate details from the job description to show deep understanding of the role.
    3. Use a tone that matches the letter type (e.g., confident for job applications, eager for internships, warm for networking).
    4. Highlight 1-2 specific achievements from the candidate’s background that directly relate to the job description.
    5. Keep the length concise, targeting ${wordLimit} words—short letters should be brief and impactful, medium letters balanced, and detailed letters comprehensive yet focused.
    6. Format the letter in markdown with proper business letter structure (e.g., date, greeting, body, closing).
    7. Avoid generic phrases; make it unique to the candidate and job.
    
    Output the cover letter in markdown format.
  `;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: { id, userId: user.id },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: { id, userId: user.id },
  });
}


export async function deleteAllCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  await db.coverLetter.deleteMany({
    where: { userId: user.id },
  });

  return { success: true };
}