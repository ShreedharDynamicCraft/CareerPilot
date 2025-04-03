"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast.ts";
import { Code, CheckCircle, XCircle, BookOpen, Terminal, Bug, Timer } from "lucide-react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function CodingPracticePage() {
  const [practiceType, setPracticeType] = useState("dsa");
  const [language, setLanguage] = useState("python");
  const [topic, setTopic] = useState("arrays");
  const [difficulty, setDifficulty] = useState("medium");
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadProblem = async () => {
    try {
      setIsTimerRunning(true);
      setTimeSpent(0);
      const response = await fetch("/api/coding-problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: practiceType,
          language,
          topic,
          difficulty,
        }),
      });

      if (!response.ok) throw new Error("Failed to load problem");

      const data = await response.json();
      setCurrentProblem(data.problem);
      setCode(data.problem.starterCode || "");
      setTestCases(data.problem.testCases || []);
      setResults(null);
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
          language,
        }),
      });

      if (!response.ok) throw new Error("Failed to run solution");

      const data = await response.json();
      setResults(data.results);
      setIsTimerRunning(false);

      // Add to todo list if solution is incorrect
      if (!data.results.allPassed) {
        await addToTodoList(currentProblem.topic);
      }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Coding Practice</h1>
        <p className="text-muted-foreground">
          Practice coding problems, DSA, and framework-specific questions
        </p>
      </div>

      <Tabs defaultValue="dsa" className="mb-8" onValueChange={setPracticeType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dsa">
            <Code className="w-4 h-4 mr-2" />
            DSA Practice
          </TabsTrigger>
          <TabsTrigger value="javascript">
            <Terminal className="w-4 h-4 mr-2" />
            JavaScript
          </TabsTrigger>
          <TabsTrigger value="react">
            <Bug className="w-4 h-4 mr-2" />
            React
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dsa" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Problem Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
            </Card>

            {currentProblem && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentProblem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{currentProblem.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{currentProblem.difficulty}</Badge>
                      <Badge variant="outline">{currentProblem.topic}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      <span>Time Spent: {formatTime(timeSpent)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {currentProblem && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="code" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="space-y-4">
                    <div className="h-[500px] border rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="100%"
                        defaultLanguage={language}
                        theme="vs-dark"
                        value={code}
                        onChange={setCode}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyond: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>

                    <Button
                      onClick={submitSolution}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Running..." : "Run Solution"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="test-cases" className="space-y-4">
                    {testCases.map((testCase, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Test Case {index + 1}</h4>
                              {results && (
                                results.testCases[index].passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )
                              )}
                            </div>
                            <div className="grid gap-2 text-sm">
                              <div>
                                <span className="font-medium">Input:</span>
                                <pre className="mt-1 p-2 bg-gray-100 rounded">
                                  {JSON.stringify(testCase.input, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="font-medium">Expected Output:</span>
                                <pre className="mt-1 p-2 bg-gray-100 rounded">
                                  {JSON.stringify(testCase.expectedOutput, null, 2)}
                                </pre>
                              </div>
                              {results && !results.testCases[index].passed && (
                                <div>
                                  <span className="font-medium">Your Output:</span>
                                  <pre className="mt-1 p-2 bg-red-50 rounded">
                                    {JSON.stringify(results.testCases[index].output, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="javascript" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JavaScript Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                JavaScript practice questions coming soon. Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="react" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>React Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                React practice questions coming soon. Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 