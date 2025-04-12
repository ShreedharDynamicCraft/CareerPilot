"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AnalyzeResumePage() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setAnalysisData(null);
  };

  const analyzeResume = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    if (!file) {
      setError("Please select a resume file");
      setIsLoading(false);
      return;
    }

    // Validate file format
    const allowedFormats = [".pdf", ".docx", ".txt"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Please upload a PDF, DOCX, or TXT file.`);
      setIsLoading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum file size is 5MB.");
      setIsLoading(false);
      return;
    }

    try {
      // Create form data object
      const formData = new FormData();
      formData.append("file", file);

      // Use Promise.all for concurrent API requests
      try {
        const [analysisRes, skillsRes, predictionRes] = await Promise.all([
          axios.post("http://127.0.0.1:8000/upload_resume/", formData, {
            timeout: 30000, // 30 second timeout
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
          axios.post("http://127.0.0.1:8000/skills/", formData, {
            timeout: 15000, // 15 second timeout
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
          axios.post("http://127.0.0.1:8000/predict_job_role/", formData, {
            timeout: 15000, // 15 second timeout
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        ]);

        if (analysisRes.status === 200 && analysisRes.data) {
          // Process response data
          setAnalysisData({
            ...analysisRes.data,
            skills: skillsRes.data,
            predictedRoles: predictionRes.data.predicted_roles,
          });
        } else {
          throw new Error("Failed to analyze resume");
        }
      } catch (error) {
        console.error("Error analyzing resume:", error);

        // Handle specific PDF errors
        if (error.response && error.response.data && error.response.data.detail) {
          if (
            error.response.data.detail.includes("PDF parsing error") ||
            error.response.data.detail.includes("No /Root object")
          ) {
            setError(
              "The PDF file is corrupted or cannot be read. Please try a different PDF or convert your resume to a different format."
            );
          } else {
            setError(
              error.response.data.detail || "Failed to analyze resume. Please try again."
            );
          }
        } else {
          setError(
            "Failed to analyze resume. Please check your internet connection and try again."
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analyze Your Resume</h1>
      <form onSubmit={analyzeResume} className="space-y-4">
        <Input type="file" onChange={handleFileChange} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Analyze Resume"}
        </Button>
      </form>
      {analysisData && (
        <Card className="mt-4">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
            <div className="space-y-2">
              <p>
                <strong>Extracted Text:</strong> {analysisData.extracted_text}
              </p>
              <p>
                <strong>Skills:</strong> {analysisData.skills.join(", ")}
              </p>
              <p>
                <strong>Predicted Roles:</strong>{" "}
                {analysisData.predictedRoles.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}