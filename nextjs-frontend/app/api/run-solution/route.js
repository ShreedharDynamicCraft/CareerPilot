import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { problemId, code, testCases, language } = await request.json();
    
    // In a real application, you would run the code against the test cases
    // using a secure sandbox environment like AWS Lambda, Docker containers, etc.
    // For this demo, we'll just simulate the results
    
    // Simulate running the tests
    const results = simulateRunningTests(code, testCases);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error running solution:', error);
    return NextResponse.json(
      { error: 'Failed to run solution' },
      { status: 500 }
    );
  }
}

function simulateRunningTests(code, testCases) {
  // Analyze code complexity (simplified version)
  const complexity = analyzeCodeComplexity(code);
  
  // Analyze code quality
  const codeQuality = analyzeCodeQuality(code);
  
  // Generate improvement suggestions
  const suggestions = generateSuggestions(code, complexity);
  
  // Simulate test results
  const testResults = testCases.map((testCase, index) => {
    // For demonstration purposes, let's say:
    // - First test case always passes
    // - Others have an 80% chance of passing if the code is non-empty
    const passed = index === 0 || (code.trim().length > 100 && Math.random() < 0.8);
    
    return {
      passed,
      output: passed ? testCase.expectedOutput : simulateIncorrectOutput(testCase.expectedOutput),
      error: passed ? null : (Math.random() < 0.3 ? "Runtime error: segmentation fault" : null)
    };
  });
  
  const allPassed = testResults.every(result => result.passed);
  
  return {
    testCases: testResults,
    allPassed,
    complexity,
    codeQuality,
    suggestions,
    executionTime: Math.floor(Math.random() * 200) + 50, // Simulated execution time (ms)
  };
}

function analyzeCodeComplexity(code) {
  // This is a simplified implementation - in production, this would be more sophisticated
  let timeComplexity = "";
  let spaceComplexity = "";
  
  // Look for nested loops (O(n²))
  const hasNestedLoops = (code.match(/for\s*\([^\)]*\)[^{]*{[^}]*for\s*\(/g) || []).length > 0;
  
  // Look for single loops (O(n))
  const hasSingleLoop = (code.match(/for\s*\([^\)]*\)/g) || []).length > 0;
  
  // Look for hash maps/sets (often O(1) lookup)
  const hasHashMap = code.includes("unordered_map") || code.includes("unordered_set");
  
  // Look for binary search patterns (O(log n))
  const hasBinarySearch = code.includes("mid = ") && code.includes("left") && code.includes("right");
  
  // Determine time complexity
  if (hasNestedLoops) {
    timeComplexity = "O(n²)";
  } else if (hasBinarySearch) {
    timeComplexity = "O(log n)";
  } else if (hasSingleLoop) {
    timeComplexity = "O(n)";
  } else {
    timeComplexity = "O(1)";
  }
  
  // Determine space complexity
  if (code.includes("vector<vector<")) {
    spaceComplexity = "O(n²)";
  } else if (code.includes("vector<") || hasHashMap) {
    spaceComplexity = "O(n)";
  } else {
    spaceComplexity = "O(1)";
  }
  
  return {
    time: timeComplexity,
    space: spaceComplexity
  };
}

function analyzeCodeQuality(code) {
  // This is a simplified implementation
  // In a real application, you would use static analysis tools
  
  // Simulated code quality metrics (1-10 scale)
  const readability = Math.min(10, Math.max(1, Math.floor(5 + 3 * Math.random())));
  
  // Higher score for non-empty code with good practices
  const hasComments = code.includes("//") || code.includes("/*");
  const hasGoodNaming = !code.includes("i, j, k") && !code.includes("temp");
  const efficiency = code.length > 200 ? Math.floor(7 + 3 * Math.random()) : Math.floor(3 + 4 * Math.random());
  
  // Check for best practices
  const bestPractices = (hasComments ? 2 : 0) + 
                       (hasGoodNaming ? 2 : 0) + 
                       Math.floor(3 + 3 * Math.random());
  
  return {
    readability,
    efficiency,
    bestPractices: Math.min(10, bestPractices)
  };
}

function generateSuggestions(code, complexity) {
  const suggestions = [];
  
  // Check for common issues and provide suggestions
  if (!code.includes("//") && !code.includes("/*")) {
    suggestions.push("Add comments to explain your approach and key steps in the algorithm.");
  }
  
  if (complexity.time === "O(n²)" && code.length > 100) {
    suggestions.push("Consider using a hashmap to reduce the time complexity from O(n²) to O(n).");
  }
  
  if (code.includes("vector<vector<") && !code.includes("reserve(")) {
    suggestions.push("Pre-allocate vector size using reserve() to improve performance.");
  }
  
  // Random suggestions based on common best practices (for demonstration)
  const randomSuggestions = [
    "Consider edge cases in your solution.",
    "Check for potential integer overflow in your calculations.",
    "Ensure proper error handling for all possible inputs.",
    "Use descriptive variable names to improve readability.",
    "Consider using a more efficient data structure for lookups."
  ];
  
  // Add 0-2 random suggestions
  const numRandomSuggestions = Math.floor(Math.random() * 3);
  for (let i = 0; i < numRandomSuggestions; i++) {
    const randomIndex = Math.floor(Math.random() * randomSuggestions.length);
    if (!suggestions.includes(randomSuggestions[randomIndex])) {
      suggestions.push(randomSuggestions[randomIndex]);
    }
  }
  
  return suggestions;
}

function simulateIncorrectOutput(expected) {
  // Create a slightly modified version of the expected output
  if (Array.isArray(expected)) {
    if (expected.length === 0) return [0];
    
    // For arrays, modify one element or add/remove an element
    const modified = [...expected];
    const changeType = Math.floor(Math.random() * 3);
    
    if (changeType === 0 && modified.length > 0) {
      // Modify an element
      const indexToModify = Math.floor(Math.random() * modified.length);
      if (typeof modified[indexToModify] === 'number') {
        modified[indexToModify] = modified[indexToModify] + 1;
      } else {
        modified[indexToModify] = null;
      }
    } else if (changeType === 1) {
      // Add an element
      if (typeof modified[0] === 'number') {
        modified.push(Math.floor(Math.random() * 10));
      } else {
        modified.push(null);
      }
    } else if (changeType === 2 && modified.length > 1) {
      // Remove an element
      const indexToRemove = Math.floor(Math.random() * modified.length);
      modified.splice(indexToRemove, 1);
    }
    
    return modified;
  } else if (typeof expected === 'number') {
    // For numbers, slightly modify the value
    return expected + (Math.random() > 0.5 ? 1 : -1);
  } else if (typeof expected === 'boolean') {
    // For booleans, flip the value
    return !expected;
  } else {
    // For other types, return a default incorrect value
    return null;
  }
}