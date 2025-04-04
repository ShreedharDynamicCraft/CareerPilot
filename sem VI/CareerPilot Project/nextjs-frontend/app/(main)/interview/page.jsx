import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Brain, Code, Video, Target, BarChart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="font-bold text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          Interview Preparation Hub
        </h1>
  
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              <BarChart className="h-4 w-4 mr-2 hidden md:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="oa" className="data-[state=active]:bg-white">
              <Code className="h-4 w-4 mr-2 hidden md:inline" />
              Online Assessment
            </TabsTrigger>
            <TabsTrigger value="ai-interview" className="data-[state=active]:bg-white">
              <Video className="h-4 w-4 mr-2 hidden md:inline" />
              AI Interview
            </TabsTrigger>
            <TabsTrigger value="dsa" className="data-[state=active]:bg-white">
              <Brain className="h-4 w-4 mr-2 hidden md:inline" />
              DSA Practice
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <StatsCards assessments={assessments} />
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-600" />
                Performance Trends
              </CardTitle>
              <CardDescription>Your progress over time across different assessment types</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart assessments={assessments} />
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Assessments</h2>
              <Link 
                href="/interview/all-assessments"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <QuizList assessments={assessments} />
          </div>
        </TabsContent>

        <TabsContent value="oa" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Customized OA Practice
                </CardTitle>
                <CardDescription>Practice AI-generated questions based on your skill level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-semibold">Completed:</span> 23
                  </div>
                  <div>
                    <span className="font-semibold">Success Rate:</span> 78%
                  </div>
                </div>
                <Link 
                  href="/interview/oa-practice"
                  className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Start Practice
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>Get detailed analysis and improvement recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-semibold">Top Area:</span> Arrays
                  </div>
                  <div>
                    <span className="font-semibold">Needs Work:</span> DP
                  </div>
                </div>
                <Link 
                  href="/interview/analytics"
                  className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  View Analytics
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-interview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-600" />
                  AI Interview Practice
                </CardTitle>
                <CardDescription>Experience realistic interview scenarios with AI feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-semibold">Sessions:</span> 5
                  </div>
                  <div>
                    <span className="font-semibold">Avg. Score:</span> 83%
                  </div>
                </div>
                <Link 
                  href="/interview/ai-practice"
                  className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Start AI Interview
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-amber-600" />
                  Behavioral Analysis
                </CardTitle>
                <CardDescription>Get insights into your interview performance and style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-semibold">Last Analysis:</span> April 2
                  </div>
                  <div>
                    <span className="font-semibold">Key Strength:</span> Communication
                  </div>
                </div>
                <Link 
                  href="/interview/analysis"
                  className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  View Analysis
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dsa" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-indigo-600" />
                  DSA Practice
                </CardTitle>
                <CardDescription>Practice problems with topic-wise categorization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-semibold">Solved:</span> 47/136
                  </div>
                  <div>
                    <span className="font-semibold">Completion:</span> 35%
                  </div>
                </div>
                <Link 
                  href="/interview/dsa-practice"
                  className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Start DSA Practice
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-teal-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-600" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>Track progress and get personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="font-semibold">Easy:</span> 80%
                  </div>
                  <div>
                    <span className="font-semibold">Medium:</span> 45%
                  </div>
                  <div>
                    <span className="font-semibold">Hard:</span> 23%
                  </div>
                </div>
                <Link 
                  href="/interview/dsa-progress"
                  className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  View Progress
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>


    </div>
  );
}