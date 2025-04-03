"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Mic, MicOff, Video, VideoOff, Send, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AIPracticePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [interviewType, setInterviewType] = useState("technical");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [specialization, setSpecialization] = useState("cse");
  const [feedback, setFeedback] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startInterview = async () => {
    try {
      setIsAnalyzing(true);
      const response = await fetch("/api/generate-interview-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: interviewType,
          experienceLevel,
          specialization,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate question");
      
      const data = await response.json();
      setCurrentQuestion(data.question);
      setIsAnalyzing(false);
      toast({
        title: "Interview Started",
        description: "Please answer the question clearly and professionally.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        await analyzeResponse(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Please answer the question clearly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your camera and microphone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Analyzing your response...",
      });
    }
  };

  const analyzeResponse = async (videoBlob) => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("video", videoBlob);
      formData.append("question", currentQuestion.question);

      const response = await fetch("/api/analyze-interview", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze response");

      const data = await response.json();
      setFeedback(data.feedback);
      setInterviewReport(data.report);
      setInterviewProgress((prev) => prev + 20);

      // Add failed topics to todo list
      if (data.feedback.technicalAccuracy < 70) {
        const existingTodos = JSON.parse(localStorage.getItem("interview-todos") || "[]");
        const newTodo = {
          id: Date.now(),
          text: `Review and practice: ${currentQuestion.topic}`,
          completed: false,
          createdAt: new Date().toISOString(),
          priority: "high",
        };
        
        // Check if this topic is already in the todo list
        const topicExists = existingTodos.some(todo => 
          todo.text.toLowerCase().includes(currentQuestion.topic.toLowerCase())
        );
        
        if (!topicExists) {
          localStorage.setItem("interview-todos", JSON.stringify([...existingTodos, newTodo]));
          toast({
            title: "Topic Added to Todo List",
            description: `"${currentQuestion.topic}" has been added to your todo list for revision.`,
          });
        }
      }

      if (interviewProgress >= 100) {
        generateFinalReport();
      } else {
        startInterview();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFinalReport = async () => {
    try {
      setIsAnalyzing(true);
      const response = await fetch("/api/generate-interview-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedback,
          specialization,
          experienceLevel,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const data = await response.json();
      setInterviewReport(data.report);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate final report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Interview Practice</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with our AI interviewer. Get instant feedback and detailed analysis.
        </p>
      </div>

      <Tabs defaultValue="technical" className="mb-8">
        <TabsList>
          <TabsTrigger value="technical">Technical Interview</TabsTrigger>
          <TabsTrigger value="hr">HR Interview</TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interview Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Experience Level</label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Specialization</label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    <option value="cse">Computer Science</option>
                    <option value="ece">Electronics</option>
                  </select>
                </div>

                <Button
                  className="w-full"
                  onClick={startInterview}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Interview
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Question</CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion ? (
                  <div className="space-y-4">
                    <p className="text-lg">{currentQuestion.question}</p>
                    <div className="flex gap-2">
                      {currentQuestion.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Start the interview to get your first question.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {currentQuestion && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Record Your Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isAnalyzing}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {feedback && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Technical Accuracy</h3>
                    <Progress value={feedback.technicalAccuracy} className="h-2" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Communication</h3>
                    <Progress value={feedback.communication} className="h-2" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Problem Solving</h3>
                    <Progress value={feedback.problemSolving} className="h-2" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Detailed Feedback</h3>
                    <p className="text-muted-foreground">{feedback.detailedFeedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {interviewReport && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Interview Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Overall Performance</AlertTitle>
                    <AlertDescription>
                      {interviewReport.overallPerformance}
                    </AlertDescription>
                  </Alert>
                  <div>
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {interviewReport.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {interviewReport.areasForImprovement.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {interviewReport.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hr">
          <Card>
            <CardHeader>
              <CardTitle>HR Interview Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                HR interview practice coming soon. Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 