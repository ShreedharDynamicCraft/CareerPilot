"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateCoverLetter, generateJobDescriptionFromResume } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();
  const [descriptionSource, setDescriptionSource] = useState("manual");
  const [resumeFile, setResumeFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      wordLimit: "medium",
      letterType: "jobApplication",
    },
  });

  const {
    loading: generatingLetter,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  const {
    loading: generatingDescription,
    fn: generateDescriptionFn,
    data: generatedDescription,
  } = useFetch(generateJobDescriptionFromResume);

  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
      setResumeFile(null);
      setDescriptionSource("manual");
    }
  }, [generatedLetter, router, reset]);

  useEffect(() => {
    if (generatedDescription) {
      setValue("jobDescription", generatedDescription);
      toast.success("Job description generated from resume!");
    }
  }, [generatedDescription, setValue]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      toast.info("Resume uploaded, generating job description...");
      try {
        await generateDescriptionFn({ resumeFile: file }); // Pass as an object
      } catch (error) {
        toast.error("Failed to generate job description from resume");
      }
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide information about the position you're applying for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">{errors.companyName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Word Limit Preference</Label>
              <Select 
                onValueChange={(value) => setValue("wordLimit", value)} 
                defaultValue="medium"
                {...register("wordLimit")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select word limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~200 words)</SelectItem>
                  <SelectItem value="medium">Medium (~400 words)</SelectItem>
                  <SelectItem value="detailed">Detailed (~600 words)</SelectItem>
                </SelectContent>
              </Select>
              {errors.wordLimit && (
                <p className="text-sm text-red-500">{errors.wordLimit.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cover Letter Type</Label>
              <Select 
                onValueChange={(value) => setValue("letterType", value)}
                defaultValue="jobApplication"
                {...register("letterType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cover letter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jobApplication">Job Application Cover Letter</SelectItem>
                  <SelectItem value="internship">Internship Cover Letter</SelectItem>
                  <SelectItem value="networking">Networking Cover Letter</SelectItem>
                  <SelectItem value="referral">Referral Cover Letter</SelectItem>
                  <SelectItem value="careerChange">Career Change Cover Letter</SelectItem>
                  <SelectItem value="coldEmail">Cold Email Cover Letter</SelectItem>
                </SelectContent>
              </Select>
              {errors.letterType && (
                <p className="text-sm text-red-500">{errors.letterType.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Job Description Source</Label>
              <RadioGroup
                value={descriptionSource}
                onValueChange={setDescriptionSource}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Manual Input</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resume" id="resume" />
                  <Label htmlFor="resume">Generate from Resume</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder={
                  descriptionSource === "manual"
                    ? "Paste the job description here"
                    : "Upload a resume to generate a job description"
                }
                className="h-32"
                {...register("jobDescription")}
                disabled={descriptionSource === "resume" && !resumeFile}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
              )}
            </div>
            {descriptionSource === "resume" && (
              <div className="space-y-2">
                <Label htmlFor="resumeUpload">Upload Resume (PDF)</Label>
                <Input
                  id="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  disabled={generatingDescription}
                />
                {resumeFile && (
                  <p className="text-sm text-green-500">{resumeFile.name} uploaded</p>
                )}
                {generatingDescription && (
                  <p className="text-sm text-blue-500">Generating job description...</p>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={generatingLetter || generatingDescription || (descriptionSource === "resume" && !resumeFile)}
                className="px-5 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out"
              >
                {generatingLetter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "🚀 Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}