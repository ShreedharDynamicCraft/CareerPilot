"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import VideoInterview from "./_components/video-interview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function AIPracticePage() {
  const [activeTab, setActiveTab] = useState("video");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Interview Practice</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with our AI interviewer. Get instant feedback and detailed analysis.
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>New Feature: Video Interview</AlertTitle>
        <AlertDescription>
          Our new video call-based interview feature allows you to practice with a realistic AI interviewer that responds to your voice and provides real-time feedback.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="video" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="video">Video Interview</TabsTrigger>
          <TabsTrigger value="technical">Technical Interview</TabsTrigger>
          <TabsTrigger value="hr">HR Interview</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <VideoInterview />
        </TabsContent>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle>Technical Interview Practice</CardTitle>
              <CardDescription>
                Our traditional technical interview practice mode is still available. Try our new video interview experience for a more immersive practice session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("video");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Video Interview
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr">
          <Card>
            <CardHeader>
              <CardTitle>HR Interview Practice</CardTitle>
              <CardDescription>
                Our HR interview practice mode is coming soon. Try our new video interview experience which includes HR questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("video");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Video Interview
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}