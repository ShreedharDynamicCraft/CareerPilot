"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz(type = "technical", count = 15) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  let promptTemplate = "";
  
  switch(type) {
    case "daily":
      promptTemplate = `
        Generate ${count} daily practice questions for a ${user.industry} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.
        These should be quick, practical questions that test fundamental knowledge.
        Include a mix of easy and medium difficulty questions.
        
        Each question should be multiple choice with 4 options.
        
        For each question, include:
        - A topic field indicating the main subject area (e.g., "Arrays", "React Hooks", "Database Design")
        - A subtopic field for more specific categorization
        - A difficulty field ("easy", "medium", or "hard")
        
        Return the response in this JSON format only, no additional text:
        {
          "questions": [
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctAnswer": "string",
              "explanation": "string",
              "topic": "string",
              "subtopic": "string",
              "difficulty": "string"
            }
          ]
        }
      `;
      break;
      
    case "oa":
      promptTemplate = `
        Generate ${count} online assessment questions for a ${user.industry} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.
        These should simulate real coding assessment questions from top companies.
        
        Each question should be multiple choice with 4 options.
        
        For each question, include:
        - A topic field indicating the main subject area
        - A subtopic field for more specific categorization
        - A difficulty field ("easy", "medium", or "hard")
        - A company field suggesting which companies commonly ask this type of question
        
        Return the response in this JSON format only, no additional text:
        {
          "questions": [
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctAnswer": "string",
              "explanation": "string",
              "topic": "string",
              "subtopic": "string",
              "difficulty": "string",
              "company": "string"
            }
          ]
        }
      `;
      break;
      
    case "dsa":
      promptTemplate = `
        Generate ${count} data structures and algorithms questions for a ${user.industry} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.
        Focus on trending DSA questions commonly asked in technical interviews at top companies.
        
        Each question should be multiple choice with 4 options.
        
        For each question, include:
        - A topic field indicating the algorithm or data structure (e.g., "Binary Search", "Dynamic Programming")
        - A subtopic field for more specific categorization
        - A difficulty field ("easy", "medium", or "hard")
        - A company field listing companies that commonly ask this question
        - A timeComplexity field indicating the expected time complexity of the optimal solution
        
        Return the response in this JSON format only, no additional text:
        {
          "questions": [
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctAnswer": "string",
              "explanation": "string",
              "topic": "string",
              "subtopic": "string",
              "difficulty": "string",
              "company": "string",
              "timeComplexity": "string"
            }
          ]
        }
      `;
      break;
      
    case "ai":
      promptTemplate = `
        Generate ${count} AI interview questions for a ${user.industry} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.
        These should simulate questions an interviewer would ask in a live interview setting.
        Include both technical and behavioral questions.
        
        Each question should be multiple choice with 4 options.
        
        For each question, include:
        - A topic field indicating the main subject area
        - A questionType field ("technical" or "behavioral")
        - A difficulty field ("easy", "medium", or "hard")
        
        Return the response in this JSON format only, no additional text:
        {
          "questions": [
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctAnswer": "string",
              "explanation": "string",
              "topic": "string",
              "questionType": "string",
              "difficulty": "string"
            }
          ]
        }
      `;
      break;
      
    case "technical":
    default:
      promptTemplate = `
        Generate ${count} technical interview questions for a ${user.industry} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.
        
        Each question should be multiple choice with 4 options.
        
        For each question, include:
        - A topic field indicating the main subject area
        - A subtopic field for more specific categorization
        - A difficulty field ("easy", "medium", or "hard")
        
        Return the response in this JSON format only, no additional text:
        {
          "questions": [
            {
              "question": "string",
              "options": ["string", "string", "string", "string"],
              "correctAnswer": "string",
              "explanation": "string",
              "topic": "string",
              "subtopic": "string",
              "difficulty": "string"
            }
          ]
        }
      `;
  }

  try {
    const result = await model.generateContent(promptTemplate);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score, type = "technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  // Enhanced question results with topic analysis
  const questionResults = questions.map((q, index) => {
    // Create base object with required fields
    const questionResult = {
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: answers[index],
      isCorrect: q.correctAnswer === answers[index],
      explanation: q.explanation,
      topic: q.topic || "General",
      difficulty: q.difficulty || "medium"
    };
    
    // Only add optional fields if they are defined
    if (q.subtopic) questionResult.subtopic = q.subtopic;
    if (q.company) questionResult.company = q.company;
    if (q.timeComplexity) questionResult.timeComplexity = q.timeComplexity;
    if (q.questionType) questionResult.questionType = q.questionType;
    
    return questionResult;
  });

  // Get wrong answers and analyze patterns
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  
  // Topic-wise performance analysis
  const topicAnalysis = questionResults.reduce((acc, q) => {
    if (!acc[q.topic]) {
      acc[q.topic] = { total: 0, correct: 0, incorrect: 0 };
    }
    acc[q.topic].total++;
    if (q.isCorrect) {
      acc[q.topic].correct++;
    } else {
      acc[q.topic].incorrect++;
    }
    return acc;
  }, {});

  // Calculate topic-wise scores
  const topicScores = Object.entries(topicAnalysis).map(([topic, stats]) => ({
    topic,
    score: Math.round((stats.correct / stats.total) * 100),
    total: stats.total,
    correct: stats.correct,
    incorrect: stats.incorrect
  }));

  // Generate personalized improvement tips
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const weakTopics = topicScores
      .filter(t => t.score < 70)
      .map(t => t.topic)
      .join(", ");

    const wrongQuestionsText = wrongAnswers
      .map(q => 
        `Question: "${q.question}"\nTopic: ${q.topic}\nSubtopic: ${q.subtopic || 'N/A'}\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    // Customize improvement prompt based on assessment type
    let improvementPrompt = "";
    
    switch(type) {
      case "daily":
        improvementPrompt = `
          The user got the following daily practice questions wrong:

          ${wrongQuestionsText}

          Weak topics identified: ${weakTopics}

          Based on these mistakes and weak topics, provide:
          1. A specific improvement tip focusing on the knowledge gaps
          2. Keep it encouraging and actionable
          3. Suggest specific resources or practice areas
          4. Keep the response under 3 sentences
        `;
        break;
        
      case "oa":
        improvementPrompt = `
          The user got the following online assessment questions wrong:

          ${wrongQuestionsText}

          Weak topics identified: ${weakTopics}

          Based on these mistakes and weak topics, provide:
          1. A specific improvement tip focusing on the knowledge gaps
          2. Suggest specific online assessment practice strategies
          3. Keep it encouraging and actionable
          4. Keep the response under 3 sentences
        `;
        break;
        
      case "dsa":
        improvementPrompt = `
          The user got the following DSA practice questions wrong:

          ${wrongQuestionsText}

          Weak topics identified: ${weakTopics}

          Based on these mistakes and weak topics, provide:
          1. A specific improvement tip focusing on the algorithm/data structure knowledge gaps
          2. Suggest specific practice problems or resources
          3. Mention time/space complexity considerations
          4. Keep the response under 3 sentences
        `;
        break;
        
      case "ai":
        improvementPrompt = `
          The user got the following AI interview questions wrong:

          ${wrongQuestionsText}

          Weak topics identified: ${weakTopics}

          Based on these mistakes and weak topics, provide:
          1. A specific improvement tip focusing on interview technique and knowledge gaps
          2. Suggest specific interview preparation strategies
          3. Keep it encouraging and actionable
          4. Keep the response under 3 sentences
        `;
        break;
        
      case "technical":
      default:
        improvementPrompt = `
          The user got the following ${user.industry} technical interview questions wrong:

          ${wrongQuestionsText}

          Weak topics identified: ${weakTopics}

          Based on these mistakes and weak topics, provide:
          1. A specific improvement tip focusing on the knowledge gaps
          2. Keep it encouraging and actionable
          3. Suggest specific resources or practice areas
          4. Keep the response under 3 sentences
        `;
    }

    try {
      const tipResult = await model.generateContent(improvementPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  // Map assessment types to categories
  const categoryMap = {
    "daily": "Daily Practice",
    "oa": "Online Assessment",
    "dsa": "DSA Practice",
    "ai": "AI Interview",
    "technical": "Technical"
  };

  try {
    // Ensure score is a valid number to avoid validation errors
    const normalizedScore = typeof score === 'number' ? 
      Number(score.toFixed(2)) : // Round to 2 decimal places
      0; // Default to 0 if score is not a number
      
    // Prepare assessment data with proper handling of JSON fields
    // Only include fields that are defined in the Prisma schema
    const assessmentData = {
      userId: user.id,
      quizScore: normalizedScore,
      questions: questionResults,
      category: categoryMap[type] || "Technical",
      improvementTip: improvementTip || null,
    };
    
    // Store topic analysis information within the questions array
    // since the Assessment model doesn't have separate fields for these
    
    const assessment = await db.assessment.create({
      data: assessmentData,
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    
    // Provide more detailed error information for debugging
    if (error.name === 'PrismaClientValidationError') {
      console.error("Validation error details:", JSON.stringify(assessmentData, null, 2));
      throw new Error(`Validation error when saving quiz result. Please check the data format.`);
    } else if (error.name === 'PrismaClientKnownRequestError') {
      throw new Error(`Database error: ${error.message}`);
    } else {
      throw new Error(`Error saving quiz result: ${error.message}`);
    }
  }
}

export async function getAssessments(category = null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Build the query with optional category filter
    const whereClause = {
      userId: user.id,
      ...(category ? { category } : {})
    };

    const assessments = await db.assessment.findMany({
      where: whereClause,
      include: {
        user: true // Include related user data if needed
      },
      orderBy: {
        createdAt: "desc", // Changed to desc to show newest first
      },
    });

    // Transform the data to include topic analysis
    const transformedAssessments = assessments.map(assessment => {
      const topicAnalysis = {};
      
      // Process questions to calculate topic-wise performance
      // Since questions is a Json[] field, we can access it directly
      if (Array.isArray(assessment.questions)) {
        assessment.questions.forEach(question => {
          const topicName = question.topic || 'General';
          if (!topicAnalysis[topicName]) {
            topicAnalysis[topicName] = {
              correct: 0,
              total: 0
            };
          }
          if (question.isCorrect) {
            topicAnalysis[topicName].correct++;
          }
          topicAnalysis[topicName].total++;
        });
      }

      // Convert topicAnalysis object to array format
      const topicAnalysisArray = Object.entries(topicAnalysis).map(([topic, stats]) => ({
        topic,
        correct: stats.correct,
        total: stats.total
      }));

      return {
        ...assessment,
        quizScore: (assessment.quizScore || 0), // Use quizScore directly from the assessment
        topicAnalysis: topicAnalysisArray
      };
    });

    return transformedAssessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}

// Function to generate a daily practice quiz
export async function generateDailyQuiz() {
  return generateQuiz("daily", 5); // Generate 5 daily practice questions
}

// Function to generate DSA practice questions with company-specific focus
export async function generateDSAQuiz(companies = []) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  // Create a prompt that focuses on company-specific questions
  const companiesStr = companies.length > 0 ? companies.join(", ") : "top tech companies";
  
  const prompt = `
    Generate 10 data structures and algorithms questions commonly asked at ${companiesStr} for a ${user.industry} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.
    
    Each question should be multiple choice with 4 options.
    
    For each question, include:
    - A topic field indicating the algorithm or data structure (e.g., "Binary Search", "Dynamic Programming")
    - A subtopic field for more specific categorization
    - A difficulty field ("easy", "medium", or "hard")
    - A company field listing companies that commonly ask this question
    - A timeComplexity field indicating the expected time complexity of the optimal solution
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string",
          "topic": "string",
          "subtopic": "string",
          "difficulty": "string",
          "company": "string",
          "timeComplexity": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating DSA quiz:", error);
    throw new Error("Failed to generate DSA practice questions");
  }
}
