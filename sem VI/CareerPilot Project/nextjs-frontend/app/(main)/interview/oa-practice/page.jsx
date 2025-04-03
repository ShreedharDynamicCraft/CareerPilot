"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Timer, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Code, ListChecks, Brain, Target, AlertTriangle } from "lucide-react";
import { addTopicsToTodo } from "@/actions/todo";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function OAPracticePage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [testCompleted, setTestCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [skills, setSkills] = useState("");
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [showExplanation, setShowExplanation] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Timer effect with warning at 15 seconds
  useEffect(() => {
    let timer;
    if (timeLeft > 0 && testStarted && !testCompleted && !questionAnswered) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 15) {
            toast({
              title: "Time Warning",
              description: "15 seconds remaining for this question!",
              variant: "warning",
            });
          }
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, testStarted, testCompleted, questionAnswered]);

  // Progress calculation
  const progress = (currentQuestion / questions.length) * 100;

  const handleStartTest = async () => {
    if (!skills.trim()) {
      toast({
        title: "Skills Required",
        description: "Please enter your skills before starting the test.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          difficulty,
          skills: skills.split(",").map(skill => skill.trim()),
          questionCount: parseInt(questionCount)
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format");
      }

      setQuestions(data.questions);
      setTestStarted(true);
      setTimeLeft(60);
      setAnswers(new Array(data.questions.length).fill(""));
      setQuestionAnswered(false);
      toast({
        title: "Test Started",
        description: `You have 1 minute per question for ${questionCount} questions. Good luck!`,
      });
    } catch (error) {
      console.error("Error starting test:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start the test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    setQuestionAnswered(true);
    setShowExplanation(false);
  };

  const handleRunCode = async (code, testCases) => {
    setIsRunningCode(true);
    try {
      // Here you would typically send the code to your backend for execution
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      const output = `Test Cases:\n${testCases.map((tc, i) => 
        `Case ${i + 1}: Input: ${tc.input}\nExpected: ${tc.output}\nActual: Running...`
      ).join('\n\n')}`;
      setCodeOutput(output);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(60);
      setQuestionAnswered(false);
    } else {
      handleSubmitTest();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setTimeLeft(60);
      setQuestionAnswered(false);
    }
  };


  const handleSubmitTest = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/evaluate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          answers,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to evaluate test");
      }
  
      const data = await response.json();
      setResults(data);
      setTestCompleted(true);
  
      // Save results to localStorage
      const testHistory = JSON.parse(localStorage.getItem("testHistory") || "[]");
      const testResult = {
        date: new Date().toISOString(),
        score: data.score,
        questions: questions.length,
        skills: skills.split(",").map(s => s.trim()),
        difficulty,
      };
      localStorage.setItem("testHistory", JSON.stringify([...testHistory, testResult]));
  
      // Add topics from incorrect answers to todo list
      if (data.topicsToRevise && data.topicsToRevise.length > 0) {
        await addTopicsToTodo(data.topicsToRevise, toast);
      }
  
      toast({
        title: "Test Completed",
        description: `Your score: ${data.score}%. Check the results below.`,
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Error",
        description: "Failed to evaluate test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };




  const renderQuestion = () => {
    if (!questions[currentQuestion]) return null;

    const question = questions[currentQuestion];
    const questionType = question.type || "mcq";

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-white to-blue-50 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn(
                    "text-sm",
                    questionType === "mcq" && "bg-blue-100 text-blue-800",
                    questionType === "fill" && "bg-green-100 text-green-800"
                  )}>
                    {questionType.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {difficulty.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full",
                      timeLeft <= 15 ? "bg-red-100 text-red-500 animate-pulse" : "bg-blue-100 text-blue-500"
                    )}>
                      <Timer className="h-4 w-4" />
                      <span className="font-medium">{timeLeft}s</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Time remaining for this question
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 py-6">
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-800">{question.question}</p>
              
              {questionType === "mcq" && (
                <RadioGroup
                  value={answers[currentQuestion] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
                  className="space-y-3"
                >
                  {question.options.map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </label>
                    </motion.div>
                  ))}
                </RadioGroup>
              )}

              {questionType === "fill" && (
                <Input
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full text-lg p-4"
                />
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestion((prev) => prev - 1);
                  setTimeLeft(60);
                  setQuestionAnswered(false);
                }}
                disabled={currentQuestion === 0}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => {
                  if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion((prev) => prev + 1);
                    setTimeLeft(60);
                    setQuestionAnswered(false);
                  } else {
                    handleSubmitTest();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentQuestion === questions.length - 1 ? "Submit Test" : "Next Question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Overall Score Card */}
        <Card className="bg-gradient-to-br from-white to-green-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center p-6 rounded-lg bg-white shadow-sm"
              >
                <div className="relative inline-block">
                  <svg className="w-24 h-24">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="44"
                      cx="48"
                      cy="48"
                    />
                    <motion.circle
                      className="text-blue-600"
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="44"
                      cx="48"
                      cy="48"
                      initial={{ strokeDasharray: "276.46", strokeDashoffset: "276.46" }}
                      animate={{ strokeDashoffset: 276.46 - (276.46 * results.score) / 100 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <p className="text-3xl font-bold text-blue-600">{results.score}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Overall Score</p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 rounded-lg bg-white shadow-sm"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {results.correctCount}/{questions.length}
                </div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <div className="mt-2">
                  <Progress value={(results.correctCount / questions.length) * 100} className="h-2" />
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-6 rounded-lg bg-white shadow-sm"
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.floor((questions.length * 60 - timeLeft) / 60)}m {((questions.length * 60 - timeLeft) % 60)}s
                </div>
                <p className="text-sm text-gray-600">Total Time</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 rounded-lg bg-white shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Summary</h3>
                <p className="text-gray-600">{results.report?.summary}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-lg bg-green-50"
                >
                  <h3 className="font-medium text-green-800 flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {results.report?.detailedAnalysis?.strengths.map((strength, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="text-sm text-green-700"
                      >
                        • {strength}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-lg bg-red-50"
                >
                  <h3 className="font-medium text-red-800 flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {results.report?.detailedAnalysis?.weaknesses.map((weakness, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="text-sm text-red-700"
                      >
                        • {weakness}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Recommendations */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-lg bg-blue-50"
              >
                <h3 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {results.report?.detailedAnalysis?.recommendations.map((rec, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="text-sm text-blue-700"
                    >
                      • {rec}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Question Analysis */}
        <Card className="bg-gradient-to-br from-white to-purple-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-purple-500" />
              Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="questions" className="space-y-4">
              <TabsList className="space-x-4">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="explanation">Explanation</TabsTrigger>
              </TabsList>
              <TabsContent value="questions" className="space-y-4">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={answers[index] === question.correctAnswer ? "success" : "destructive"}>
                                  {answers[index] === question.correctAnswer ? "Correct" : "Incorrect"}
                                </Badge>
                                <Badge variant="outline">{question.topic}</Badge>
                              </div>
                            </div>
                            <p className="text-lg">{question.question}</p>
                            <div className="space-y-2">
                              <p><span className="font-semibold">Your Answer:</span> {answers[index]}</p>
                              <p><span className="font-semibold">Correct Answer:</span> {question.correctAnswer}</p>
                            </div>
                            <div className="mt-4 p-4 bg-muted rounded-md">
                              <h4 className="font-semibold mb-2">Explanation:</h4>
                              <p className="text-sm text-muted-foreground">{question.explanation}</p>
                              <div className="mt-2">
                                <h4 className="font-semibold mb-2">Recommended Resources:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {question.recommendedResources?.map((resource, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground">{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="explanation">
                {/* Explanation content */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Topics to Revise */}
        {results.topicsToRevise && results.topicsToRevise.length > 0 && (
          <Card className="bg-gradient-to-br from-white to-yellow-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Topics to Revise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.topicsToRevise.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer transition-colors"
                    >
                      {topic}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setTestStarted(false);
              setQuestions([]);
              setAnswers([]);
              setCurrentQuestion(0);
              setResults(null);
              setTimeLeft(60);
              setTestCompleted(false);
              setQuestionAnswered(false);
              setSkills("");
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start New Test
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
          >
            Download Report
          </Button>
        </div>
      </motion.div>
    );
  };

  if (!testStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          Online Assessment Practice
        </h1>
        <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-blue-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Configure Your Practice Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Skills (comma-separated)</label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, Python"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Questions</label>
              <Select
                value={questionCount.toString()}
                onValueChange={(value) => setQuestionCount(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select number of questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                  <SelectItem value="30">30 Questions</SelectItem>
                  <SelectItem value="50">50 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStartTest}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Start Test"
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
        Online Assessment Practice
      </h1>
      
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-4 animate-spin" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!loading && !testCompleted && renderQuestion()}
        {!loading && testCompleted && renderResults()}
      </AnimatePresence>
    </div>
  );
} 