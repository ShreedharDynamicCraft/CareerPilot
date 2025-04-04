\"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Code, CheckCircle, XCircle, BookOpen, Terminal, Bug, Timer, Clock, AlertCircle, Zap, BarChart, Brain, Target } from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function CodingPracticePage() {
  const [topic, setTopic] = useState("arrays");
  const [difficulty, setDifficulty] = useState("medium");
  const [company, setCompany] = useState("all");
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [expectedComplexity, setExpectedComplexity] = useState({ time: "O(n)", space: "O(1)" });
  const [userComplexity, setUserComplexity] = useState({ time: "", space: "" });
  const { toast } = useToast();

  // Timer effect - starts when user begins coding
  const timerRef = useRef(null);
  
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
        
        // Show warning when approaching time thresholds
        if (prev === 300) { // 5 minutes
          toast({
            title: "Time Check",
            description: "You've been working for 5 minutes. Keep going!",
          });
        } else if (prev === 900) { // 15 minutes
          toast({
            title: "Time Check",
            description: "15 minutes have passed. Consider reviewing your approach if stuck.",
            variant: "warning",
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, toast]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const loadProblem = async () => {
    try {
      setIsTimerRunning(true);
      setTimeSpent(0);
      setResults(null);
      setActiveTab("code");
      
      const response = await fetch("/api/coding-problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "dsa",
          language: "cpp", // Only C++ is supported now
          topic,
          difficulty,
          company,
        }),
      });

      if (!response.ok) throw new Error("Failed to load problem");

      const data = await response.json();
      setCurrentProblem(data.problem);
      setCode(data.problem.starterCode || "");
      setTestCases(data.problem.testCases || []);
      setExpectedComplexity(data.problem.expectedComplexity || { time: "O(n)", space: "O(1)" });
      
      toast({
        title: "Problem Loaded",
        description: `${data.problem.title} - Timer started!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load problem. Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitSolution = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/run-solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          code,
          testCases,
          language: "cpp", // Only C++ is supported now
        }),
      });

      if (!response.ok) throw new Error("Failed to run solution");

      const data = await response.json();
      setResults(data.results);
      setIsTimerRunning(false);
      setUserComplexity(data.results.complexity || { time: "Unknown", space: "Unknown" });
      setActiveTab("results");

      // Add to todo list if solution is incorrect
      if (!data.results.allPassed) {
        await addToTodoList(currentProblem.topic);
      }

      toast({
        title: data.results.allPassed ? "Success!" : "Some tests failed",
        description: data.results.allPassed 
          ? "All test cases passed. Great job!" 
          : "Some test cases failed. Check the results tab for details.",
        variant: data.results.allPassed ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Analyze code complexity based on patterns in the code
  const analyzeComplexity = (code) => {
    // This is a simplified implementation - in production, this would be more sophisticated
    let timeComplexity = "";
    let spaceComplexity = "";
    let feedback = "";
    
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
    
    // Generate feedback
    if (timeComplexity === expectedComplexity.time && spaceComplexity === expectedComplexity.space) {
      feedback = "Great job! Your solution meets the expected time and space complexity.";
    } else if (timeComplexity !== expectedComplexity.time) {
      feedback = `Your time complexity is ${timeComplexity}, but the expected is ${expectedComplexity.time}. `;
      
      if (timeComplexity === "O(n²)" && expectedComplexity.time === "O(n)") {
        feedback += "Consider using a hash map to avoid nested loops.";
      } else if (timeComplexity === "O(n)" && expectedComplexity.time === "O(log n)") {
        feedback += "Consider using binary search to improve efficiency.";
      }
    } else if (spaceComplexity !== expectedComplexity.space) {
      feedback = `Your space complexity is ${spaceComplexity}, but the expected is ${expectedComplexity.space}. `;
      
      if (spaceComplexity === "O(n)" && expectedComplexity.space === "O(1)") {
        feedback += "Try to optimize your solution to use constant space.";
      }
    }
    
    setUserComplexity({
      time: timeComplexity,
      space: spaceComplexity,
      feedback
    });
  };

  const addToTodoList = async (topic) => {
    try {
      await fetch("/api/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topics: [topic],
        }),
      });
    } catch (error) {
      console.error("Failed to add to todo list:", error);
    }
  };

  const getComplexityColor = (expected, actual) => {
    if (!actual) return "text-gray-400";
    
    // Extract the big O notation
    const extractBigO = (complexity) => {
      const match = complexity.match(/O\(([^)]+)\)/);
      return match ? match[1] : complexity;
    };
    
    const expectedBigO = extractBigO(expected);
    const actualBigO = extractBigO(actual);
    
    // Simple comparison - this could be enhanced with more sophisticated comparison
    if (expectedBigO === actualBigO) return "text-green-500";
    
    // Check if actual is better than expected
    const complexityOrder = [
      "1", "log n", "n", "n log n", "n^2", "n^3", "2^n", "n!"
    ];
    
    const expectedIndex = complexityOrder.findIndex(c => expectedBigO.includes(c));
    const actualIndex = complexityOrder.findIndex(c => actualBigO.includes(c));
    
    if (expectedIndex === -1 || actualIndex === -1) return "text-gray-400";
    
    return actualIndex <= expectedIndex ? "text-green-500" : "text-red-500";
  };

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-0' : 'container mx-auto px-4 py-8'}`}>
      {!isFullscreen && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">C++ DSA Practice</h1>
          <p className="text-muted-foreground">
            Practice data structures and algorithms problems in C++
          </p>
        </div>
      )}

      <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
        {!isFullscreen && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Problem Selection</CardTitle>
              <CardDescription>Configure your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrays">Arrays</SelectItem>
                    <SelectItem value="strings">Strings</SelectItem>
                    <SelectItem value="linked-list">Linked List</SelectItem>
                    <SelectItem value="trees">Trees</SelectItem>
                    <SelectItem value="graphs">Graphs</SelectItem>
                    <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
                    <SelectItem value="sorting">Sorting</SelectItem>
                    <SelectItem value="searching">Searching</SelectItem>
                    <SelectItem value="greedy">Greedy Algorithms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Focus</label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="microsoft">Microsoft</SelectItem>
                    <SelectItem value="meta">Meta</SelectItem>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="netflix">Netflix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={loadProblem} className="w-full">
                Load Problem
              </Button>
            </CardContent>
            
            {currentProblem && (
              <CardFooter className="flex flex-col items-start space-y-4 pt-0">
                <div className="w-full">
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Expected Complexity</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The optimal time and space complexity for this problem</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <span className="text-sm font-medium">{expectedComplexity.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Space:</span>
                      <span className="text-sm font-medium">{expectedComplexity.space}</span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        )}

        <div className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-3'}`}>
          {currentProblem ? (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{currentProblem.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary">{currentProblem.difficulty}</Badge>
                      <Badge variant="outline">{currentProblem.topic}</Badge>
                      {company !== "all" && <Badge variant="outline">{company}</Badge>}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <div className="border-b px-4">
                    <TabsList className="h-10">
                      <TabsTrigger value="problem" className="data-[state=active]:bg-background">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Problem
                      </Tabs>Trigger>
                      <TabsTrigger value="code" className="data-[state=active]:bg-background">
                        <Code className="h-4 w-4 mr-2" />
                        Code
                      </Tabs>Trigger>
                      <TabsTrigger value="test-cases" className="data-[state=active]:bg-background">
                        <Terminal className="h-4 w-4 mr-2" />
                        Test Cases
                      </Tabs>Trigger>
                      {results && (
                        <TabsTrigger value="results" className="data-[state=active]:bg-background">
                          <BarChart className="h-4 w-4 mr-2" />
                          Results
                        </Tabs>Trigger>
                      )}
                    </Tabs>List>
                  </div>

                  <TabsContent value="problem" className="p-4 h-[calc(100%-2.5rem)] overflow-auto">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">Description</h3>
                          <p className="mt-2 text-muted-foreground whitespace-pre-line">{currentProblem.description}</p>
                        </div>
                        
                        {currentProblem.examples && (
                          <div>
                            <h3 className="text-lg font-semibold mt-6">Examples</h3>
                            <div className="space-y-4 mt-2">
                              {currentProblem.examples.map((example, index) => (
                                <div key={index} className="border rounded-md p-3">
                                  <p className="font-medium">Example {index + 1}:</p>
                                  <div className="mt-2 space-y-2">
                                    <div>
                                      <span className="font-medium">Input:</span>
                                      <pre className="mt-1 p-2 bg-secondary/50 rounded-md overflow-x-auto">
                                        {example.input}
                                      </pre>
                                    </div>
                                    <div>
                                      <span className="font-medium">Output:</span>
                                      <pre className="mt-1 p-2 bg-secondary/50 rounded-md overflow-x-auto">
                                        {example.output}
                                      </pre>
                                    </div>
                                    {example.explanation && (
                                      <div>
                                        <span className="font-medium">Explanation:</span>
                                        <p className="mt-1 text-sm text-muted-foreground">{example.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-lg font-semibold mt-6">Constraints</h3>
                          <ul className="list-disc list-inside mt-2 text-muted-foreground">
                            {currentProblem.constraints?.map((constraint, index) => (
                              <li key={index}>{constraint}</li>
                            )) || <li>No specific constraints provided.</li>}
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </Tabs>Content>

                  <TabsContent value="code" className="h-[calc(100%-2.5rem)]">
                    <div className="h-[calc(100%-3.5rem)]">
                      <MonacoEditor
                        height="100%"
                        defaultLanguage="cpp"
                        theme="vs-dark"
                        value={code}
                        onChange={setCode}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyond: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: "on",
                          suggestOnTriggerCharacters: true,
                        }}
                      />
                    </div>
                    <div className="p-4 border-t">
                      <Button
                        onClick={submitSolution}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>Run Solution</>  
                        )}
                      </Button>
                    </div>
                  </Tabs>Content>

                  <TabsContent value="test-cases" className="p-4 h-[calc(100%-2.5rem)] overflow-auto">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        {testCases.map((testCase, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Test Case {index + 1}</CardTitle>
                                {results && (
                                  results.testCases[index]?.passed ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="py-3 space-y-3">
                              <div>
                                <span className="font-medium">Input:</span>
                                <pre className="mt-1 p-2 bg-secondary/50 rounded-md overflow-x-auto">
                                  {JSON.stringify(testCase.input, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="font-medium">Expected Output:</span>
                                <pre className="mt-1 p-2 bg-secondary/50 rounded-md overflow-x-auto">
                                  {JSON.stringify(testCase.expectedOutput, null, 2)}
                                </pre>
                              </div>
                              {results && !results.testCases[index]?.passed && (
                                <div>
                                  <span className="font-medium">Your Output:</span>
                                  <pre className="mt-1 p-2 bg-red-50 dark:bg-red-950/20 rounded-md overflow-x-auto">
                                    {JSON.stringify(results.testCases[index]?.output, null, 2)}
                                  </pre>
                                  {results.testCases[index]?.error && (
                                    <div className="mt-2">
                                      <span className="font-medium text-red-500">Error:</span>
                                      <pre className="mt-1 p-2 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-md overflow-x-auto">
                                        {results.testCases[index].error}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </Tabs>Content>

                  {results && (
                    <TabsContent value="results" className="p-4 h-[calc(100%-2.5rem)] overflow-auto">
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Performance Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-2">Test Results</h3>
                                  <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                      <Progress 
                                        value={results.testCases.filter(tc => tc.passed).length / results.testCases.length * 100} 
                                        className="h-2"
                                      />
                                    </div>
                                    <div className="text-sm font-medium">
                                      {results.testCases.filter(tc => tc.passed).length}/{results.testCases.length} Passed
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-2">
                                  <h3 className="text-sm font-medium mb-2">Time Complexity</h3>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">Expected:</span>
                                      <span className="text-sm font-medium">{expectedComplexity.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Zap className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">Your solution:</span>
                                      <span className={`text-sm font-medium ${getComplexityColor(expectedComplexity.time, userComplexity.time)}`}>
                                        {userComplexity.time || "Not analyzed"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-2">
                                  <h3 className="text-sm font-medium mb-2">Space Complexity</h3>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">Expected:</span>
                                      <span className="text-sm font-medium">{expectedComplexity.space}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Zap className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">Your solution:</span>
                                      <span className={`text-sm font-medium ${getComplexityColor(expectedComplexity.space, userComplexity.space)}`}>
                                        {userComplexity.space || "Not analyzed"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle>Code Quality</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {results.codeQuality && (
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">Readability</span>
                                        <span className="text-sm font-medium">{results.codeQuality.readability}/10</span>
                                      </div>
                                      <Progress value={results.codeQuality.readability * 10} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">Efficiency</span>
                                        <span className="text-sm font-medium">{results.codeQuality.efficiency}/10</span>
                                      </div>
                                      <Progress value={results.codeQuality.efficiency * 10} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">Best Practices</span>
                                        <span className="text-sm font-medium">{results.codeQuality.bestPractices}/10</span>
                                      </div>
                                      <Progress value={results.codeQuality.bestPractices * 10} className="h-2" />
                                    </div>
                                  </div>
                                )}
                                
                                {results.suggestions && results.suggestions.length > 0 && (
                                  <div className="pt-4">
                                    <h3 className="text-sm font-medium mb-2">Improvement Suggestions</h3>
                                    <ul className="space-y-2">
                                      {results.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                          <span className="text-sm">{suggestion}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </ScrollArea>
                    </Tabs>Content>
                  )}
                </Tabs>