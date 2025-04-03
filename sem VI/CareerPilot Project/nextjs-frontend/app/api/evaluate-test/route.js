import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { questions, answers } = await req.json();

    // Validate input
    if (!questions || !answers || !Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return NextResponse.json(
        { error: "Invalid input: questions and answers must be arrays of equal length" },
        { status: 400 }
      );
    }

    // Calculate score and collect incorrect answers
    let correctCount = 0;
    const incorrectAnswers = [];
    const topicAnalysis = {};

    questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) {
        correctCount++;
      } else {
        incorrectAnswers.push({
          question: question.question,
          yourAnswer: answers[index],
          correctAnswer: question.correctAnswer,
          topic: question.topic,
          subtopic: question.subtopic
        });

        // Track topics for incorrect answers
        if (question.topic) {
          topicAnalysis[question.topic] = (topicAnalysis[question.topic] || 0) + 1;
        }
        if (question.subtopic) {
          topicAnalysis[question.subtopic] = (topicAnalysis[question.subtopic] || 0) + 1;
        }
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Generate analysis using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const analysisPrompt = `You are an expert at analyzing test results and providing constructive feedback.
    Analyze the following test results and provide a detailed report in JSON format:
    
    Test Results:
    - Total Questions: ${questions.length}
    - Correct Answers: ${correctCount}
    - Score: ${score}%
    - Incorrect Answers: ${incorrectAnswers.length}
    
    Required JSON Structure:
    {
      "score": ${score},
      "correctCount": ${correctCount},
      "report": {
        "summary": "A brief summary of the test performance",
        "detailedAnalysis": {
          "strengths": ["List 2-3 key strengths"],
          "weaknesses": ["List 2-3 areas for improvement"],
          "recommendations": ["List 2-3 specific recommendations"]
        }
      }
    }
    
    Important: Return ONLY the JSON object, no additional text or formatting.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to ensure it's valid JSON
    const cleanedText = text
      .replace(/```json\n?|\n?```/g, "") // Remove markdown code blocks
      .replace(/^\s*\[|\]\s*$/g, "") // Remove array brackets if present
      .trim();
    
    let analysis;
    try {
      analysis = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error parsing analysis:", error);
      // Fallback to a basic analysis if parsing fails
      analysis = {
        score,
        correctCount,
        report: {
          summary: "Test completed successfully",
          detailedAnalysis: {
            strengths: ["Completed the test"],
            weaknesses: ["Some questions were incorrect"],
            recommendations: ["Review incorrect topics"]
          }
        }
      };
    }

    // Get unique topics from incorrect answers
    const topicsToRevise = [...new Set(incorrectAnswers.map(answer => answer.topic).filter(Boolean))];

    return NextResponse.json({
      ...analysis,
      topicsToRevise,
      incorrectAnswers
    });

  } catch (error) {
    console.error("Error in evaluate-test API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate test" },
      { status: 500 }
    );
  }
} 