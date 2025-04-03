"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Target, AlertCircle, TrendingUp, BookOpen } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get test results from localStorage
        const testResults = JSON.parse(localStorage.getItem("testResults") || "[]");
        
        // Calculate analytics
        const topicPerformance = {};
        const totalTests = testResults.length;
        let totalScore = 0;

        testResults.forEach(result => {
          totalScore += result.score;
          
          // Aggregate topic performance
          result.report.detailedAnalysis.topicPerformance.forEach((performance, topic) => {
            if (!topicPerformance[topic]) {
              topicPerformance[topic] = {
                correct: 0,
                total: 0,
                score: 0
              };
            }
            topicPerformance[topic].correct += performance.correct;
            topicPerformance[topic].total += performance.total;
            topicPerformance[topic].score = (topicPerformance[topic].correct / topicPerformance[topic].total) * 100;
          });
        });

        const averageScore = totalScore / totalTests;
        const topicsToRevise = new Set();

        // Identify topics that need revision (score < 70%)
        Object.entries(topicPerformance).forEach(([topic, performance]) => {
          if (performance.score < 70) {
            topicsToRevise.add(topic);
          }
        });

        setAnalytics({
          averageScore,
          totalTests,
          topicPerformance,
          topicsToRevise: Array.from(topicsToRevise),
          recentTests: testResults.slice(-5)
        });
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  const topicData = Object.entries(analytics.topicPerformance).map(([topic, performance]) => ({
    name: topic,
    score: performance.score
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Performance Analytics</h1>

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
              {analytics.topicsToRevise.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
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
                <BarChart data={topicData}>
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
                    <p className="font-medium">Test {analytics.recentTests.length - index}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(test.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Progress value={test.score} className="w-24 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 