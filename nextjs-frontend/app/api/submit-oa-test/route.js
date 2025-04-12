import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { questions, answers, formData } = await req.json();

    // Calculate basic metrics
    const correctAnswers = Object.entries(answers).filter(
      ([index, answer]) => answer === questions[parseInt(index)].correctAnswer
    ).length;

    const overallScore = (correctAnswers / questions.length) * 100;

    // Analyze topics and generate feedback using Gemini
    const prompt = `Analyze the following interview test results and provide detailed feedback:
    
    Test Configuration:
    - Skills: ${formData.skills}
    - Difficulty: ${formData.difficulty}
    - Number of Questions: ${formData.numQuestions}
    
    Performance:
    - Correct Answers: ${correctAnswers}/${questions.length}
    - Overall Score: ${overallScore}%
    
    Questions and Answers:
    ${questions.map((q, i) => `
    Question ${i + 1}:
    ${q.question}
    Correct Answer: ${q.correctAnswer}
    User's Answer: ${answers[i] || 'Not answered'}
    `).join('\n')}
    
    Please provide:
    1. Topic-wise analysis (percentage score for each topic)
    2. Areas for improvement
    3. Specific topics to review
    4. Recommendations for further practice
    
    Return in JSON format with the following structure:
    {
      "topicAnalysis": {
        "topic1": percentage,
        "topic2": percentage,
        ...
      },
      "areasForImprovement": [
        "Area 1",
        "Area 2",
        ...
      ],
      "topicsToReview": [
        "Topic 1",
        "Topic 2",
        ...
      ],
      "recommendations": [
        "Recommendation 1",
        "Recommendation 2",
        ...
      ]
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const analysis = JSON.parse(text);

    // Add topics to todo list
    const todoResponse = await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks: analysis.topicsToReview.map(topic => ({
          title: `Review ${topic}`,
          description: `Based on OA test performance. Score: ${analysis.topicAnalysis[topic]}%`,
          priority: "high",
        })),
      }),
    });

    if (!todoResponse.ok) {
      console.error("Failed to add topics to todo list");
    }

    return NextResponse.json({
      overallScore,
      correctAnswers,
      timeTaken: formData.timeLimit,
      ...analysis,
    });
  } catch (error) {
    console.error("Error analyzing test results:", error);
    return NextResponse.json(
      { error: "Failed to analyze test results" },
      { status: 500 }
    );
  }
} 