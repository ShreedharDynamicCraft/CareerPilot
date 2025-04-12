"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Clock, CheckCircle2, XCircle, Code, Brain, Target, AlertTriangle, Timer, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function CppPracticePage() {
  const { toast } = useToast();
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("arrays");
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [complexityAnalysis, setComplexityAnalysis] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [mockTestMode, setMockTestMode] = useState(false);
  const [codingStarted, setCodingStarted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'partial', 'failed'
  const timerRef = useRef(null);
  const editorRef = useRef(null);

  // Enhanced problems for C++ focused practice
  const problems = {
    arrays: {
      easy: {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
        ],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
        expectedComplexity: { time: "O(n)", space: "O(n)" },
        testCases: [
          { input: { nums: [2, 7, 11, 15], target: 9 }, output: [0, 1] },
          { input: { nums: [3, 2, 4], target: 6 }, output: [1, 2] },
          { input: { nums: [3, 3], target: 6 }, output: [0, 1] }
        ],
        starterCode: "#include <vector>\n#include <iostream>\n#include <unordered_map>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    vector<int> result = sol.twoSum(nums, target);\n    cout << \"[\" << result[0] << \",\" << result[1] << \"]\" << endl;\n    return 0;\n}",
        solutionCode: "#include <vector>\n#include <iostream>\n#include <unordered_map>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> numMap;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (numMap.count(complement)) {\n                return {numMap[complement], i};\n            }\n            numMap[nums[i]] = i;\n        }\n        return {}; // No solution found\n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    vector<int> result = sol.twoSum(nums, target);\n    cout << \"[\" << result[0] << \",\" << result[1] << \"]\" << endl;\n    return 0;\n}",
        complexityExplanation: "The optimal solution uses a hash map to store each element's value and its index. For each element, we check if its complement (target - nums[i]) exists in the hash map. This gives us O(n) time complexity as hash map lookups are O(1) on average. The space complexity is O(n) for storing the hash map."
      },
      medium: {
        title: "Container With Most Water",
        description: "Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
        examples: [
          { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
          { input: "height = [1,1]", output: "1" }
        ],
        constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        expectedComplexity: { time: "O(n)", space: "O(1)" },
        testCases: [
          { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, output: 49 },
          { input: { height: [1, 1] }, output: 1 },
          { input: { height: [4, 3, 2, 1, 4] }, output: 16 }
        ],
        starterCode: "#include <vector>\n#include <iostream>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n        \n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};\n    cout << sol.maxArea(height) << endl;\n    return 0;\n}",
        solutionCode: "#include <vector>\n#include <iostream>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int maxWater = 0;\n        int left = 0;\n        int right = height.size() - 1;\n        \n        while (left < right) {\n            int h = min(height[left], height[right]);\n            int w = right - left;\n            maxWater = max(maxWater, h * w);\n            \n            if (height[left] < height[right]) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        \n        return maxWater;\n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};\n    cout << sol.maxArea(height) << endl;\n    return 0;\n}",
        complexityExplanation: "The optimal solution uses a two-pointer approach, starting from both ends of the array and moving inward. At each step, we calculate the area and move the pointer with the smaller height. This gives us O(n) time complexity as we process each element at most once. The space complexity is O(1) as we only use a constant amount of extra space."
      },
      hard: {
        title: "Trapping Rain Water",
        description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        examples: [
          { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
          { input: "height = [4,2,0,3,2,5]", output: "9" }
        ],
        constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
        expectedComplexity: { time: "O(n)", space: "O(1)" },
        testCases: [
          { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, output: 6 },
          { input: { height: [4, 2, 0, 3, 2, 5] }, output: 9 },
          { input: { height: [5, 4, 1, 2] }, output: 1 }
        ],
        starterCode: "#include <vector>\n#include <iostream>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        \n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> height = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};\n    cout << sol.trap(height) << endl;\n    return 0;\n}",
        solutionCode: "#include <vector>\n#include <iostream>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        if (height.empty()) return 0;\n        \n        int left = 0, right = height.size() - 1;\n        int leftMax = height[left], rightMax = height[right];\n        int water = 0;\n        \n        while (left < right) {\n            if (leftMax < rightMax) {\n                left++;\n                leftMax = max(leftMax, height[left]);\n                water += leftMax - height[left];\n            } else {\n                right--;\n                rightMax = max(rightMax, height[right]);\n                water += rightMax - height[right];\n            }\n        }\n        \n        return water;\n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> height = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};\n    cout << sol.trap(height) << endl;\n    return 0;\n}",
        complexityExplanation: "The optimal solution uses a two-pointer approach with O(n) time complexity and O(1) space complexity. We maintain two pointers (left and right) and two variables to track the maximum height seen from both sides. At each step, we move the pointer with the smaller maximum height and calculate the trapped water."
      }
    },
    dp: {
      easy: {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        examples: [
          { input: "n = 2", output: "2" },
          { input: "n = 3", output: "3" }
        ],
        constraints: ["1 <= n <= 45"],
        expectedComplexity: { time: "O(n)", space: "O(1)" },
        testCases: [
          { input: { n: 2 }, output: 2 },
          { input: { n: 3 }, output: 3 },
          { input: { n: 4 }, output: 5 }
        ],
        starterCode: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n        \n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    cout << sol.climbStairs(2) << endl;  // Expected: 2\n    cout << sol.climbStairs(3) << endl;  // Expected: 3\n    return 0;\n}",
        solutionCode: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        \n        int prev1 = 2;  // Ways to climb 2 steps\n        int prev2 = 1;  // Ways to climb 1 step\n        int current = 0;\n        \n        for (int i = 3; i <= n; i++) {\n            current = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = current;\n        }\n        \n        return prev1;\n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    cout << sol.climbStairs(2) << endl;  // Expected: 2\n    cout << sol.climbStairs(3) << endl;  // Expected: 3\n    return 0;\n}",
        complexityExplanation: "The optimal solution uses dynamic programming with O(n) time complexity and O(1) space complexity. We can solve this problem by recognizing that the number of ways to reach step n is the sum of ways to reach step n-1 and step n-2. This is because we can either take a single step from n-1 or a double step from n-2."
      },
      medium: {
        title: "Coin Change",
        description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
        examples: [
          { input: "coins = [1,2,5], amount = 11", output: "3" },
          { input: "coins = [2], amount = 3", output: "-1" }
        ],
        constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
        expectedComplexity: { time: "O(amount * coins.length)", space: "O(amount)" },
        testCases: [
          { input: { coins: [1, 2, 5], amount: 11 }, output: 3 },
          { input: { coins: [2], amount: 3 }, output: -1 },
          { input: { coins: [1], amount: 0 }, output: 0 }
        ],
        starterCode: "#include <vector>\n#include <iostream>\n#include <algorithm>\n#include <climits>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Your code here\n        \n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> coins = {1, 2, 5};\n    cout << sol.coinChange(coins, 11) << endl;  // Expected: 3\n    return 0;\n}",
        solutionCode: "#include <vector>\n#include <iostream>\n#include <algorithm>\n#include <climits>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount + 1, INT_MAX);\n        dp[0] = 0;\n        \n        for (int i = 1; i <= amount; i++) {\n            for (int coin : coins) {\n                if (coin <= i && dp[i - coin] != INT_MAX) {\n                    dp[i] = min(dp[i], dp[i - coin] + 1);\n                }\n            }\n        }\n        \n        return dp[amount] == INT_MAX ? -1 : dp[amount];\n    }\n};\n\n// Test function\nint main() {\n    Solution sol;\n    vector<int> coins = {1, 2, 5};\n    cout << sol.coinChange(coins, 11) << endl;  // Expected: 3\n    return 0;\n}",
        complexityExplanation: "The optimal solution uses dynamic programming with O(amount * coins.length) time complexity and O(amount) space complexity. We create a dp array where dp[i] represents the minimum number of coins needed to make amount i. For each amount, we try all possible coins and update dp[i] if using the current coin results in fewer total coins."
      }
    }
  };

  // Load a problem based on selected topic and difficulty
  useEffect(() => {
    if (topic && difficulty && problems[topic] && problems[topic][difficulty]) {
      const problem = problems[topic][difficulty];
      setCurrentProblem(problem);
      setCode(problem.starterCode);
      setOutput("");
      setComplexityAnalysis(null);
      setTestCases(problem.testCases || []);
      setTestCaseResults([]);
      setShowSolution(false);
      setCodingStarted(false);
      setSubmissionStatus(null);
      
      // Reset timer when loading a new problem
      setTimer(0);
      setTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [topic, difficulty, mockTestMode]);

  // Enhanced timer functionality - starts when coding begins and provides time warnings
  useEffect(() => {
    if (timerRunning && codingStarted) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          // Add time warnings at specific intervals
          if (newTime === 300) { // 5 minutes
            toast({
              title: "Time Check",
              description: "You've been working for 5 minutes.",
            });
          } else if (newTime === 900) { // 15 minutes
            toast({
              title: "Time Warning",
              description: "You've been working for 15 minutes. Consider reviewing your approach.",
              variant: "warning",
            });
          }
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, codingStarted, toast]);
  
  // Enhanced code change detection to automatically start timer
  useEffect(() => {
    if (currentProblem && code !== currentProblem.starterCode && !codingStarted) {
      // Check if user has made meaningful changes (not just whitespace)
      const starterCodeNoWhitespace = currentProblem.starterCode.replace(/\s/g, '');
      const currentCodeNoWhitespace = code.replace(/\s/g, '');
      
      if (currentCodeNoWhitespace !== starterCodeNoWhitespace) {
        setCodingStarted(true);
        setTimerRunning(true);
        toast({
          title: "Coding Started",
          description: "Timer has automatically started as you began coding.",
        });
      }
    }
  }, [code, currentProblem, codingStarted, toast]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start coding and timer
  const handleStartCoding = () => {
    setTimerRunning(true);
    toast({
      title: "Timer Started",
      description: "Your coding session has begun. Good luck!",
    });
  };

  // Run code simulation
  const handleRunCode = () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      // This is a mock implementation. In a real app, you would send the code to a backend for execution.
      const sampleOutput = "Running test cases...\n";
      let success = false;
      
      if (topic === "arrays" && difficulty === "easy") {
        success = code.includes("unordered_map") || code.includes("map");
      } else if (topic === "arrays" && difficulty === "medium") {
        success = code.includes("while") && code.includes("max");
      } else if (topic === "dp" && difficulty === "easy") {
        success = code.includes("dp") || code.includes("vector");
      }
      
      const result = success ? 
        sampleOutput + "Test case 1: Passed\nTest case 2: Passed\nAll test cases passed!" :
        sampleOutput + "Test case 1: Passed\nTest case 2: Failed\nExpected: [1,2], Got: [0,2]";
      
      setOutput(result);
      
      // Analyze time complexity
      analyzeComplexity(code);
      
      setIsRunning(false);
    }, 1500);
  };

  // Enhanced code complexity analysis with better pattern recognition
  const analyzeComplexity = (code) => {
    // This is a more sophisticated mock implementation
    // In a production app, you would use a more advanced algorithm or send to backend
    let timeComplexity = "O(n²)";
    let spaceComplexity = "O(n)";
    let feedback = "";
    let optimizationTips = [];
    
    // Check for nested loops (O(n²) or worse)
    const hasNestedLoops = (code.match(/for\s*\([^\)]*\)[^{]*{[^}]*for\s*\(/g) || []).length > 0;
    
    // Check for single loops (O(n))
    const hasSingleLoop = (code.match(/for\s*\([^\)]*\)/g) || []).length > 0 || 
                         (code.match(/while\s*\([^\)]*\)/g) || []).length > 0;
    
    // Check for hash maps/sets (often O(1) lookup)
    const hasHashMap = code.includes("unordered_map") || code.includes("unordered_set");
    
    // Check for binary search patterns (O(log n))
    const hasBinarySearch = code.includes("mid = ") && 
                           (code.includes("left") || code.includes("start")) && 
                           (code.includes("right") || code.includes("end"));
    
    // Check for recursive calls
    const hasRecursion = code.includes("return ") && code.match(/\w+\s*\([^\)]*\w+\s*-\s*\d+[^\)]*\)/g);
    
    // Check for dynamic programming patterns
    const hasDPArray = code.includes("vector<") && code.includes("dp[") && code.includes("return dp");
    const hasTabulation = hasDPArray && code.includes("for") && code.includes("dp[");
    const hasMemoization = hasRecursion && code.includes("memo");
    
    // Analyze based on problem type and patterns
    if (topic === "arrays") {
      if (difficulty === "easy") {
        if (hasHashMap) {
          timeComplexity = "O(n)";
          spaceComplexity = "O(n)";
          feedback = "Great job! Your solution uses a hash map for O(n) time complexity.";
        } else if (hasNestedLoops) {
          timeComplexity = "O(n²)";
          spaceComplexity = "O(1)";
          feedback = "Your solution has nested loops resulting in O(n²) time complexity.";
          optimizationTips.push("Consider using a hash map to achieve O(n) time complexity.");
        } else if (hasSingleLoop) {
          timeComplexity = "O(n)";
          spaceComplexity = "O(1)";
          feedback = "Your solution has linear time complexity.";
        }
      } else if (difficulty === "medium") {
        if (hasBinarySearch) {
          timeComplexity = "O(log n)";
          spaceComplexity = "O(1)";
          feedback = "Excellent! Your binary search approach achieves O(log n) time complexity.";
        } else if (hasNestedLoops) {
          timeComplexity = "O(n²)";
          spaceComplexity = "O(1)";
          feedback = "Your solution has quadratic time complexity due to nested loops.";
          optimizationTips.push("For this problem, consider a two-pointer approach to achieve O(n) time complexity.");
        } else if (hasSingleLoop && !code.includes("for")) {
          timeComplexity = "O(n)";
          spaceComplexity = "O(1)";
          feedback = "Great job! Your two-pointer approach achieves optimal O(n) time complexity.";
        } else if (hasSingleLoop) {
          timeComplexity = "O(n)";
          spaceComplexity = "O(n)";
          feedback = "Your solution has linear time complexity.";
        }
      } else if (difficulty === "hard") {
        if (hasSingleLoop && code.includes("max(") && code.includes("min(")) {
          timeComplexity = "O(n)";
          spaceComplexity = "O(1)";
          feedback = "Excellent! Your solution achieves the optimal O(n) time and O(1) space complexity.";
        } else if (hasNestedLoops) {
          timeComplexity = "O(n²)";
          spaceComplexity = "O(1)";
          feedback = "Your solution has quadratic time complexity.";
          optimizationTips.push("Consider using a more efficient approach with a single pass through the array.");
        } else if (code.includes("vector") && code.includes("leftMax") && code.includes("rightMax")) {
          timeComplexity = "O(n)";
          spaceComplexity = "O(n)";
          feedback = "Good solution with O(n) time complexity, but using O(n) extra space.";
          optimizationTips.push("Try optimizing to O(1) space using a two-pointer approach.");
        }
      }
    } else if (topic === "dp") {
      if (hasTabulation) {
        timeComplexity = "O(n)";
        spaceComplexity = "O(n)";
        feedback = "Good dynamic programming solution using tabulation!";
      } else if (hasMemoization) {
        timeComplexity = "O(n)";
        spaceComplexity = "O(n)";
        feedback = "Good dynamic programming solution using memoization!";
      } else if (hasRecursion && !hasMemoization) {
        timeComplexity = "O(2^n)";
        spaceComplexity = "O(n)";
        feedback = "Your recursive solution works but has exponential time complexity.";
        optimizationTips.push("Consider adding memoization to improve to O(n) time complexity.");
      } else if (code.includes("prev1") && code.includes("prev2")) {
        timeComplexity = "O(n)";
        spaceComplexity = "O(1)";
        feedback = "Excellent! You've optimized space complexity to O(1) using variables instead of an array.";
      }
    }
    
    // Compare with expected complexity
    const isOptimal = timeComplexity === currentProblem.expectedComplexity.time && 
                     spaceComplexity === currentProblem.expectedComplexity.space;
    
    // Add overall assessment
    if (isOptimal) {
      feedback = "✅ " + feedback + " Your solution achieves the optimal complexity!";
    } else if (timeComplexity !== currentProblem.expectedComplexity.time) {
      feedback = "⚠️ " + feedback;
    }
    
    setComplexityAnalysis({
      time: timeComplexity,
      space: spaceComplexity,
      expected: currentProblem.expectedComplexity,
      feedback,
      optimizationTips,
      isOptimal
    });
  };

  // Submit solution
  const handleSubmit = () => {
    // Stop the timer
    setTimerRunning(false);
    
    // Run the code first
    handleRunCode();
    
    // Show completion message
    toast({
      title: "Solution Submitted",
      description: `You completed the problem in ${formatTime(timer)}!`,
    });
  };

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            C++ Coding Practice
          </h1>
          <p className="text-muted-foreground">
            Enhance your C++ coding skills with timed practice and complexity analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-2">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Problem Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrays">Arrays & Strings</SelectItem>
                    <SelectItem value="dp">Dynamic Programming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {currentProblem && (
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={difficulty === "easy" ? "success" : 
                           difficulty === "medium" ? "warning" : "destructive"}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-mono">{formatTime(timer)}</span>
                    </div>
                  </div>
                  
                  {!timerRunning ? (
                    <Button 
                      onClick={handleStartCoding} 
                      className="w-full mt-4"
                      variant="default"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Coding
                    </Button>
                  ) : (
                    <div className="space-y-2 mt-4">
                      <Button 
                        onClick={handleRunCode} 
                        className="w-full"
                        variant="outline"
                        disabled={isRunning}
                      >
                        {isRunning ? "Running..." : "Run Code"}
                      </Button>
                      
                      <Button 
                        onClick={handleSubmit} 
                        className="w-full"
                        variant="default"
                      >
                        Submit Solution
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {complexityAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Complexity Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Complexity:</span>
                    <Badge variant={complexityAnalysis.time === complexityAnalysis.expected.time ? "success" : "warning"}>
                      {complexityAnalysis.time}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Space Complexity:</span>
                    <Badge variant={complexityAnalysis.space === complexityAnalysis.expected.space ? "success" : "warning"}>
                      {complexityAnalysis.space}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Expected Time:</span>
                    <Badge variant="outline">{complexityAnalysis.expected.time}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Expected Space:</span>
                    <Badge variant="outline">{complexityAnalysis.expected.space}</Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">{complexityAnalysis.feedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-3 space-y-4">
          {currentProblem ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{currentProblem.title}</CardTitle>
                  <CardDescription>{currentProblem.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Examples:</h3>
                      <div className="space-y-2">
                        {currentProblem.examples.map((example, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <div><span className="font-mono">Input:</span> {example.input}</div>
                            <div><span className="font-mono">Output:</span> {example.output}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Constraints:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {currentProblem.constraints.map((constraint, index) => (
                          <li key={index} className="text-sm">{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="code">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger value="output" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Output
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="font-mono h-[500px] resize-none"
                        placeholder="Write your C++ code here..."
                        disabled={!timerRunning}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="output" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[500px] w-full rounded-md border p-4 font-mono bg-black text-white">
                        {output ? (
                          <pre>{output}</pre>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Run your code to see output here
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Please select a topic and difficulty level to load a problem.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}