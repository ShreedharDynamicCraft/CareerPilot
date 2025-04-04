"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz() {
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

  const prompt = `
    Generate 15 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
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
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  // Enhanced question results with topic analysis
  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
    topic: q.topic || "General",
    subtopic: q.subtopic,
    difficulty: q.difficulty || "medium"
  }));

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

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Weak topics identified: ${weakTopics}

      Based on these mistakes and weak topics, provide:
      1. A specific improvement tip focusing on the knowledge gaps
      2. Keep it encouraging and actionable
      3. Suggest specific resources or practice areas
      4. Keep the response under 3 sentences
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
        topicAnalysis: topicScores,
        weakTopics: topicScores.filter(t => t.score < 70).map(t => t.topic),
        strongTopics: topicScores.filter(t => t.score >= 70).map(t => t.topic),
        timestamp: new Date(),
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      // Remove the invalid include for questions since it's a Json[] field, not a relation
      include: {
        user: true // Include related user data if needed
      },
      orderBy: {
        createdAt: "asc",
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
