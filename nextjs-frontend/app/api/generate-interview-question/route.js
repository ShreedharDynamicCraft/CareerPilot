import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CSE_TOPICS = {
  fresher: [
    "Data Structures and Algorithms",
    "Object-Oriented Programming",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Web Development",
    "Programming Languages",
  ],
  experienced: [
    "System Design",
    "Distributed Systems",
    "Cloud Computing",
    "Microservices Architecture",
    "DevOps and CI/CD",
    "Security and Cryptography",
    "Machine Learning",
    "Big Data Technologies",
  ],
};

const ECE_TOPICS = {
  fresher: [
    "Digital Electronics",
    "Analog Electronics",
    "Signals and Systems",
    "Control Systems",
    "Communication Systems",
    "Microprocessors",
    "Circuit Theory",
    "Electromagnetic Theory",
  ],
  experienced: [
    "VLSI Design",
    "Embedded Systems",
    "IoT and Sensors",
    "RF and Microwave Engineering",
    "Power Electronics",
    "Robotics",
    "Signal Processing",
    "Wireless Communication",
  ],
};

export async function POST(req) {
  try {
    const { type, experienceLevel, specialization } = await req.json();

    const topics = specialization === "cse" ? CSE_TOPICS : ECE_TOPICS;
    const relevantTopics = topics[experienceLevel];
    const randomTopic = relevantTopics[Math.floor(Math.random() * relevantTopics.length)];

    const prompt = `Generate a technical interview question for a ${experienceLevel} ${specialization.toUpperCase()} student focusing on ${randomTopic}.
    The question should be challenging but appropriate for the experience level.
    
    Return in JSON format:
    {
      "question": "The interview question",
      "tags": ["topic1", "topic2"],
      "difficulty": "easy/medium/hard",
      "expectedAnswer": "A detailed explanation of the expected answer",
      "followUpQuestions": ["follow-up question 1", "follow-up question 2"]
    }
    
    IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to handle any markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const question = JSON.parse(cleanText);

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error generating interview question:", error);
    return NextResponse.json(
      { error: "Failed to generate interview question" },
      { status: 500 }
    );
  }
} 