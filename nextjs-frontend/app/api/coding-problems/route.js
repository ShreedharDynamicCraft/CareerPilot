import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting map
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 1; // 1 request per minute to stay within Gemini API limits

function isRateLimited(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  // Add new request
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return false;
}

function cleanJsonResponse(text) {
  try {
    // First try direct JSON parsing
    return JSON.parse(text);
  } catch (e) {
    // If direct parsing fails, try cleaning the response
    try {
      // Remove markdown code blocks and any other markdown formatting
      text = text.replace(/```json\n?/g, '')
                 .replace(/```\n?/g, '')
                 .replace(/`/g, '')
                 .trim();

      // Find the first { and last }
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      
      if (start === -1 || end === -1) {
        throw new Error('No valid JSON object found in response');
      }
      
      // Extract the JSON string
      let jsonStr = text.slice(start, end + 1);
      
      // Clean up any remaining issues
      jsonStr = jsonStr
        // Fix unquoted keys
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix array input strings
        .replace(/"\[([^\]]+)\]"/g, (match, p1) => {
          return '[' + p1.replace(/"/g, '') + ']';
        })
        // Fix escaped quotes
        .replace(/\\"/g, '"')
        // Fix unescaped quotes in strings
        .replace(/"([^"\\]*)"/g, (match, p1) => {
          return '"' + p1.replace(/"/g, '\\"') + '"';
        })
        // Fix triple quotes in strings
        .replace(/"""/g, '"')
        // Fix newlines in strings
        .replace(/\n/g, '\\n')
        // Fix carriage returns in strings
        .replace(/\r/g, '\\r')
        // Fix tabs in strings
        .replace(/\t/g, '\\t')
        // Fix escaped newlines in strings
        .replace(/\\n/g, '\\n')
        // Fix escaped carriage returns in strings
        .replace(/\\r/g, '\\r')
        // Fix escaped tabs in strings
        .replace(/\\t/g, '\\t')
        // Normalize whitespace between properties
        .replace(/\s+/g, ' ')
        // Fix any remaining escaped characters
        .replace(/\\/g, '\\\\')
        .trim();
      
      // Log the cleaned JSON for debugging
      console.log('Cleaned JSON:', jsonStr);
      
      try {
        return JSON.parse(jsonStr);
      } catch (parseError) {
        // If parsing still fails, try to fix common issues
        jsonStr = jsonStr
          // Fix missing quotes around property names
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
          // Fix missing quotes around string values
          .replace(/:(\s*)([^"{\[\],\s]+)(\s*[,}])/g, ': "$2"$3')
          // Fix array values
          .replace(/"\[([^\]]+)\]"/g, (match, p1) => {
            return '[' + p1.split(',').map(item => item.trim()).join(', ') + ']';
          });
        
        return JSON.parse(jsonStr);
      }
    } catch (cleanError) {
      console.error('Error cleaning JSON response:', cleanError);
      console.error('Original text:', text);
      throw new Error('Failed to parse response as JSON');
    }
  }
}

export async function POST(req) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const { type, language, topic, difficulty } = await req.json();

    let prompt;
    if (type === "dsa") {
      prompt = `Generate a ${difficulty} difficulty DSA problem in ${language} with the following requirements:
      
      Topic: ${topic}
      Language: ${language}
      Difficulty: ${difficulty}
      
      Please provide:
      1. A unique problem ID
      2. Problem title
      3. Detailed problem description
      4. Starter code in ${language}
      5. At least 3 test cases with input and expected output
      6. Time and space complexity requirements
      
      IMPORTANT: Return ONLY a valid JSON object with the following structure. Do not include any markdown formatting or additional text:
      {
        "problem": {
          "id": "unique_id",
          "title": "Problem Title",
          "description": "Detailed description",
          "starterCode": "Starter code in specified language",
          "testCases": [
            {
              "input": "input value",
              "expectedOutput": "expected output"
            }
          ],
          "difficulty": "${difficulty}",
          "topic": "${topic}",
          "complexity": {
            "time": "O(...)",
            "space": "O(...)"
          }
        }
      }`;
    } else if (type === "javascript") {
      prompt = `Generate a ${difficulty} difficulty JavaScript problem with the following requirements:
      
      Topic: ${topic}
      Difficulty: ${difficulty}
      
      Please provide:
      1. A unique problem ID
      2. Problem title
      3. Detailed problem description
      4. Starter code in JavaScript
      5. At least 3 test cases with input and expected output
      
      IMPORTANT: Return ONLY a valid JSON object with the following structure. Do not include any markdown formatting or additional text:
      {
        "problem": {
          "id": "unique_id",
          "title": "Problem Title",
          "description": "Detailed description",
          "starterCode": "Starter code in JavaScript",
          "testCases": [
            {
              "input": "input value",
              "expectedOutput": "expected output"
            }
          ],
          "difficulty": "${difficulty}",
          "topic": "${topic}"
        }
      }`;
    } else if (type === "react") {
      prompt = `Generate a ${difficulty} difficulty React problem with the following requirements:
      
      Topic: ${topic}
      Difficulty: ${difficulty}
      
      Please provide:
      1. A unique problem ID
      2. Problem title
      3. Detailed problem description
      4. Starter code with React components
      5. At least 3 test cases with component props and expected output
      
      IMPORTANT: Return ONLY a valid JSON object with the following structure. Do not include any markdown formatting or additional text:
      {
        "problem": {
          "id": "unique_id",
          "title": "Problem Title",
          "description": "Detailed description",
          "starterCode": "Starter code with React components",
          "testCases": [
            {
              "input": {
                "props": {}
              },
              "expectedOutput": "Expected component output"
            }
          ],
          "difficulty": "${difficulty}",
          "topic": "${topic}"
        }
      }`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const data = cleanJsonResponse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse problem data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating coding problem:", error);
    
    // Handle rate limit errors from Gemini API
    if (error.message?.includes("429") || error.status === 429) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please wait a minute before trying again." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate problem" },
      { status: 500 }
    );
  }
} 