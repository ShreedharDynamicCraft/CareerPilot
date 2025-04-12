"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Target, AlertCircle, TrendingUp, BookOpen, Calendar, Code, Video, Brain, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get all assessments from the API
        const response = await fetch('/api/assessments');
        const data = await response.json();
        
        // Ensure assessments is an array
        const assessments = Array.isArray(data) ? data : [];
        
        // Group assessments by category
        const assessmentsByCategory = {
          "Daily Practice": [],
          "Online Assessment": [],
          "AI Interview": [],
          "DSA Practice": [],
          "Technical": []
        };
        
        assessments.forEach(assessment => {
          if (!assessment) return;
          const category = assessment.category || "Technical";
          if (assessmentsByCategory[category]) {
            assessmentsByCategory[category].push(assessment);
          } else {
            assessmentsByCategory["Technical"].push(assessment);
          }
        });
        
        // Calculate analytics for each category
        const categoryAnalytics = {};
        
        Object.entries(assessmentsByCategory).forEach(([category, categoryAssessments]) => {
          const topicPerformance = {};
          const totalTests = categoryAssessments.length || 0;
          let totalScore = 0;
          
          categoryAssessments.forEach(assessment => {
            totalScore += assessment.quizScore || 0;
            
            // Aggregate topic performance from topicAnalysis
            assessment.topicAnalysis?.forEach(analysis => {
              if (!analysis) return;
              const topic = analysis.topic || 'Unknown';
              if (!topicPerformance[topic]) {
                topicPerformance[topic] = {
                  correct: 0,
                  total: 0,
                  score: 0
                };
              }
              topicPerformance[topic].correct += analysis.correct || 0;
              topicPerformance[topic].total += analysis.total || 0;
              topicPerformance[topic].score = topicPerformance[topic].total > 0 
                ? (topicPerformance[topic].correct / topicPerformance[topic].total) * 100
                : 0;
            });
          });
          
          const averageScore = totalTests > 0 ? (totalScore / totalTests) : 0;
          const topicsToRevise = new Set();
          
          // Identify topics that need revision (score < 70%)
          Object.entries(topicPerformance || {}).forEach(([topic, performance]) => {
            if (performance && performance.score < 70) {
              topicsToRevise.add(topic);
            }
          });
          
          categoryAnalytics[category] = {
            averageScore,
            totalTests,
            topicPerformance,
            topicsToRevise: Array.from(topicsToRevise),
            recentTests: categoryAssessments.slice(-5)
          };
        });
        
        // Calculate overall analytics
        const allTopicPerformance = {};
        let overallTotalTests = 0;
        let overallTotalScore = 0;
        
        assessments.forEach(assessment => {
          overallTotalTests++;
          overallTotalScore += assessment.quizScore || 0;
          
          assessment.topicAnalysis?.forEach(analysis => {
            if (!analysis) return;
            const topic = analysis.topic || 'Unknown';
            if (!allTopicPerformance[topic]) {
              allTopicPerformance[topic] = {
                correct: 0,
                total: 0,
                score: 0
              };
            }
            allTopicPerformance[topic].correct += analysis.correct || 0;
            allTopicPerformance[topic].total += analysis.total || 0;
            allTopicPerformance[topic].score = allTopicPerformance[topic].total > 0 
              ? (allTopicPerformance[topic].correct / allTopicPerformance[topic].total) * 100
              : 0;
          });
        });
        
        const overallAverageScore = overallTotalTests > 0 ? (overallTotalScore / overallTotalTests) : 0;
        const overallTopicsToRevise = new Set();
        
        Object.entries(allTopicPerformance || {}).forEach(([topic, performance]) => {
          if (performance && performance.score < 70) {
            overallTopicsToRevise.add(topic);
          }
        });
        
        // Prepare progress data for line chart
        const progressData = [];
        const dateMap = new Map();
        
        assessments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        assessments.forEach(assessment => {
          const date = new Date(assessment.createdAt).toLocaleDateString();
          const category = assessment.category || "Technical";
          
          if (!dateMap.has(date)) {
            dateMap.set(date, {
              date,
              "Daily Practice": null,
              "Online Assessment": null,
              "AI Interview": null,
              "DSA Practice": null,
              "Technical": null
            });
          }
          
          const entry = dateMap.get(date);
          entry[category] = assessment.quizScore;
        });
        
        dateMap.forEach(entry => {
          progressData.push(entry);
        });
        
        setAnalytics({
          averageScore: overallAverageScore,
          totalTests: overallTotalTests,
          topicPerformance: allTopicPerformance,
          topicsToRevise: Array.from(overallTopicsToRevise),
          recentTests: assessments.slice(-5),
          progressData
        });
        
        setCategoryData(categoryAnalytics);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  const getTopicData = (topicPerformance) => {
    return Object.entries(topicPerformance || {}).map(([topic, performance]) => ({
      name: topic,
      score: performance.score
    }));
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Daily Practice": return <Calendar className="h-5 w-5 text-blue-600" />;
      case "Online Assessment": return <Code className="h-5 w-5 text-purple-600" />;
      case "AI Interview": return <Video className="h-5 w-5 text-green-600" />;
      case "DSA Practice": return <Brain className="h-5 w-5 text-amber-600" />;
      default: return <Target className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Performance Analytics</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Quiz</TabsTrigger>
          <TabsTrigger value="oa">Online Assessment</TabsTrigger>
          <TabsTrigger value="ai">AI Interview</TabsTrigger>
          <TabsTrigger value="dsa">DSA Practice</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Average Score</h3>
                    <Progress value={analytics.averageScore} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {analytics.averageScore.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Total Tests Taken</h3>
                    <p className="text-2xl font-bold">{analytics.totalTests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Topics to Revise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.topicsToRevise.length > 0 ? (
                    analytics.topicsToRevise.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No topics need revision at this time.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Progress Over Time
              </CardTitle>
              <CardDescription>Your performance across different assessment types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Daily Practice" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Online Assessment" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="AI Interview" stroke="#ffc658" />
                    <Line type="monotone" dataKey="DSA Practice" stroke="#ff8042" />
                    <Line type="monotone" dataKey="Technical" stroke="#0088fe" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Topic-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTopicData(analytics.topicPerformance)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Test {analytics.recentTests.length - index}</p>
                          <Badge variant="outline">{test.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Progress value={test.quizScore} className="w-24 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Daily Quiz Tab */}
        <TabsContent value="daily" className="space-y-6">
          {categoryData["Daily Practice"]?.totalTests > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Daily Practice Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Average Score</h3>
                        <Progress value={categoryData["Daily Practice"].averageScore} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {categoryData["Daily Practice"].averageScore.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Total Quizzes Taken</h3>
                        <p className="text-2xl font-bold">{categoryData["Daily Practice"].totalTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Topics to Revise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categoryData["Daily Practice"].topicsToRevise.length > 0 ? (
                        categoryData["Daily Practice"].topicsToRevise.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No topics need revision at this time.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Topic-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTopicData(categoryData["Daily Practice"].topicPerformance)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Daily Practice Data</CardTitle>
                <CardDescription>You haven't taken any daily practice quizzes yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Daily practice helps reinforce your knowledge with quick, focused questions.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/interview/daily-practice">
                  <Button>
                    Start Daily Practice
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Online Assessment Tab */}
        <TabsContent value="oa" className="space-y-6">
          {categoryData["Online Assessment"]?.totalTests > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-purple-600" />
                      Online Assessment Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Average Score</h3>
                        <Progress value={categoryData["Online Assessment"].averageScore} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {categoryData["Online Assessment"].averageScore.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Total Assessments Taken</h3>
                        <p className="text-2xl font-bold">{categoryData["Online Assessment"].totalTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Topics to Revise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categoryData["Online Assessment"].topicsToRevise.length > 0 ? (
                        categoryData["Online Assessment"].topicsToRevise.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No topics need revision at this time.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Topic-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTopicData(categoryData["Online Assessment"].topicPerformance)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Online Assessment Data</CardTitle>
                <CardDescription>You haven't taken any online assessments yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Online assessments simulate real coding tests used by companies in their hiring process.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/interview/oa-practice">
                  <Button>
                    Start Online Assessment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* AI Interview Tab */}
        <TabsContent value="ai" className="space-y-6">
          {categoryData["AI Interview"]?.totalTests > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-green-600" />
                      AI Interview Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Average Score</h3>
                        <Progress value={categoryData["AI Interview"].averageScore} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {categoryData["AI Interview"].averageScore.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Total Interviews Taken</h3>
                        <p className="text-2xl font-bold">{categoryData["AI Interview"].totalTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Topics to Revise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categoryData["AI Interview"].topicsToRevise.length > 0 ? (
                        categoryData["AI Interview"].topicsToRevise.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No topics need revision at this time.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Topic-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTopicData(categoryData["AI Interview"].topicPerformance)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No AI Interview Data</CardTitle>
                <CardDescription>You haven't taken any AI interviews yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI interviews simulate real interview scenarios with voice and video interaction.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/interview/ai-practice">
                  <Button>
                    Start AI Interview
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* DSA Practice Tab */}
        <TabsContent value="dsa" className="space-y-6">
          {categoryData["DSA Practice"]?.totalTests > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-amber-600" />
                      DSA Practice Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Average Score</h3>
                        <Progress value={categoryData["DSA Practice"].averageScore} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {categoryData["DSA Practice"].averageScore.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Total Practices Completed</h3>
                        <p className="text-2xl font-bold">{categoryData["DSA Practice"].totalTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Topics to Revise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {categoryData["DSA Practice"].topicsToRevise.length > 0 ? (
                        categoryData["DSA Practice"].topicsToRevise.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No topics need revision at this time.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Topic-wise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTopicData(categoryData["DSA Practice"].topicPerformance)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" fill="#ff8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No DSA Practice Data</CardTitle>
                <CardDescription>You haven't taken any DSA practice quizzes yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  DSA practice helps you prepare for technical interviews with company-specific trending questions.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/interview/dsa-practice">
                  <Button>
                    Start DSA Practice
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}