"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResumeData } from "@/hooks/use-resume-data";
import { Download, Edit, Loader2, Monitor, Save, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EntryForm } from "./form";
import { useUser } from "@clerk/nextjs";
import { resumeSchema } from "@/app/lib/schema";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { saveResume, getResume, improveWithAI, downloadResumePDF } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";

const RESUME_SECTIONS = [
  "contact",
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "achievements",
  "languages"
];

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const { resumeData, saveResumeData } = useResumeData();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    getValues,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: resumeData,
  });

  // Fetch hooks for server actions
  const { loading: isSaving, fn: saveResumeFn, error: saveError, data: saveResult } = useFetch(saveResume);
  const { loading: isEnhancing, fn: enhanceWithAI, error: enhanceError } = useFetch(improveWithAI);
  const { loading: isLoadingResume, fn: loadResumeFn } = useFetch(getResume);

  // Load initial data from database
  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const resume = await loadResumeFn();
        if (resume?.structuredData) {
          reset(JSON.parse(resume.structuredData));
          setPreviewContent(resume.content);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      }
    };
    loadResumeData();
  }, [reset, loadResumeFn]);

  const formValues = watch();

  // Update preview content and completion progress
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
      updateCompletionProgress();
    }
  }, [formValues, activeTab, initialContent]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const updateCompletionProgress = useCallback(() => {
    const values = getValues();
    let completedFields = 0;
    let totalFields = 0;

    if (values.contactInfo?.email) completedFields++;
    totalFields++;

    const fieldsToCheck = ['summary', 'skills', 'achievements', 'languages'];
    fieldsToCheck.forEach(field => {
      if (values[field]?.trim()) completedFields++;
      totalFields++;
    });

    const arraysToCheck = ['experience', 'education', 'projects'];
    arraysToCheck.forEach(array => {
      if (values[array]?.length > 0) completedFields++;
      totalFields++;
    });

    const progress = Math.round((completedFields / totalFields) * 100);
    setCompletionProgress(progress);
  }, [getValues]);

  const getContactMarkdown = useCallback(() => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);
    if (contactInfo.github) parts.push(`💻 [GitHub](${contactInfo.github})`);

    return parts.length > 0
      ? `## <div align="center">${user?.fullName || "Your Name"}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  }, [formValues, user]);

  const formatSkills = useCallback((skills) => {
    if (!skills) return "";
    return skills.split('\n')
      .map(line => {
        const [category, items] = line.split(':');
        return !items ? `- ${line.trim()}` : `- **${category.trim()}:** ${items.trim()}`;
      })
      .join('\n');
  }, []);

  const formatProject = useCallback((project) => {
    if (!project) return "";
    let content = `### ${project.title}\n`;
    
    if (project.technologies) {
      content += `*${project.technologies.split(',').map(t => t.trim()).join(', ')}*\n\n`;
    }
    
    if (project.description) {
      content += project.description.split('\n')
        .filter(line => line.trim())
        .map(line => `- ${line.replace(/^[-•]\s*/, '').trim()}`)
        .join('\n') + '\n';
    }
    
    if (project.githubUrl || project.demoUrl) {
      content += '\n';
      if (project.githubUrl) content += `[GitHub](${project.githubUrl}) `;
      if (project.demoUrl) content += `[Live Demo](${project.demoUrl})`;
    }
    
    return content;
  }, []);

  const formatExperience = useCallback((experience) => {
    if (!experience) return "";
    let content = `### ${experience.title}\n*${experience.organization}* | `;
    
    if (experience.startDate) {
      content += `${experience.startDate} - ${experience.endDate || 'Present'}`;
      if (experience.location) content += ` | ${experience.location}`;
    }
    
    content += '\n\n';
    
    if (experience.description) {
      content += experience.description.split('\n')
        .filter(line => line.trim())
        .map(line => `- ${line.replace(/^[-•]\s*/, '').trim()}`)
        .join('\n') + '\n';
    }
    
    if (experience.technologies) {
      content += `\n**Technologies:** ${experience.technologies.split(',').map(t => t.trim()).join(', ')}\n`;
    }
    
    return content;
  }, []);

  const formatEducation = useCallback((education) => {
    if (!education) return "";
    let content = `### ${education.title}\n*${education.organization}* | `;
    
    if (education.startDate) {
      content += `${education.startDate} - ${education.endDate || 'Present'}`;
      if (education.location) content += ` | ${education.location}`;
    }
    
    content += '\n\n';
    
    if (education.gpa) content += `- GPA: ${education.gpa}\n`;
    if (education.relevantCourses) content += `- Relevant Coursework: ${education.relevantCourses}\n`;
    
    return content;
  }, []);

  const getCombinedContent = useCallback(() => {
    const { summary, skills, experience, education, projects, achievements, languages } = formValues;
    
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Technical Skills\n\n${formatSkills(skills)}`,
      experience?.length > 0 && `## Work Experience\n\n${experience.map(exp => formatExperience(exp)).join('\n\n')}`,
      education?.length > 0 && `## Education\n\n${education.map(edu => formatEducation(edu)).join('\n\n')}`,
      projects?.length > 0 && `## Projects\n\n${projects.map(proj => formatProject(proj)).join('\n\n')}`,
      achievements && `## Achievements & Certifications\n\n${achievements.split('\n').map(a => `- ${a.trim()}`).join('\n')}`,
      languages && `## Languages\n\n${languages.split(',').map(l => `- ${l.trim()}`).join('\n')}`,
    ].filter(Boolean).join('\n\n');
  }, [formValues, getContactMarkdown, formatSkills, formatExperience, formatEducation, formatProject]);

  const generatePDF = async () => {
    if (!isClient) return;
  
    setIsGenerating(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${user?.fullName || 'Resume'}</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; padding: 0; margin: 0; }
              h1 { font-size: 16pt; margin: 15pt 0 10pt 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5pt; }
              h2 { font-size: 14pt; margin: 12pt 0 8pt 0; color: #34495e; }
              h3 { font-size: 12pt; margin: 10pt 0 6pt 0; color: #7f8c8d; }
              strong { font-weight: bold; }
              em { font-style: italic; }
              a { color: #3498db; text-decoration: none; }
              ul, ol { margin: 8pt 0 8pt 15pt; padding: 0; }
              li { margin: 4pt 0; }
              .center { text-align: center; }
              .header { margin-bottom: 15pt; }
              .contact-info { margin: 5pt 0; font-size: 10pt; }
              .section { margin-bottom: 15pt; }
              .job-title, .degree { font-weight: bold; }
              .company, .school { font-style: italic; }
              .date { color: #7f8c8d; font-size: 10pt; }
            </style>
          </head>
          <body>
            ${previewContent
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
              .replace(/^\s*-\s(.*$)/gm, '<li>$1</li>')
              .replace(/<div align="center">(.*?)<\/div>/g, '<div class="center">$1</div>')
              .replace(/### (.*?)\n\*(.*?)\*/g, '<h3 class="job-title">$1</h3><p class="company">$2</p>')
              .replace(/(\d{4} - \d{4}|Present)/g, '<span class="date">$1</span>')
            }
          </body>
        </html>
      `;
  
      const pdfBuffer = await downloadResumePDF(htmlContent);
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.fullName || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = getCombinedContent();
      saveResumeData(data);
      await saveResumeFn({
        content: formattedContent,
        structuredData: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const navigateSection = (direction) => {
    const newSection = direction === 'next' 
      ? Math.min(currentSection + 1, RESUME_SECTIONS.length - 1)
      : Math.max(currentSection - 1, 0);
    setCurrentSection(newSection);
    
    document.getElementById(RESUME_SECTIONS[newSection])?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleAIEnhance = async (section) => {
    try {
      setIsGenerating(true);
      toast.info(`Enhancing ${section} with AI...`);

      const values = getValues();
      let currentContent = '';
      let type = section;

      switch (section.toLowerCase()) {
        case 'summary':
          currentContent = values.summary || '';
          break;
        case 'skills':
          currentContent = values.skills || '';
          break;
        case 'achievements':
          currentContent = values.achievements || '';
          break;
        case 'languages':
          currentContent = values.languages || '';
          break;
        case 'experience':
          if (values.experience?.length > 0) {
            currentContent = values.experience.map(exp => exp.description).join('\n');
            type = 'experience';
          }
          break;
        case 'education':
          if (values.education?.length > 0) {
            currentContent = values.education.map(edu => edu.title).join('\n');
            type = 'education';
          }
          break;
        case 'projects':
          if (values.projects?.length > 0) {
            currentContent = values.projects.map(proj => proj.description).join('\n');
            type = 'project';
          }
          break;
        case 'resume':
          currentContent = getCombinedContent();
          type = 'resume';
          break;
        default:
          throw new Error('Invalid section');
      }

      if (!currentContent) {
        toast.error(`No content found to enhance in ${section}`);
        return;
      }

      const improvedContent = await enhanceWithAI({ current: currentContent, type });

      switch (section.toLowerCase()) {
        case 'summary':
          setValue('summary', improvedContent, { shouldDirty: true });
          break;
        case 'skills':
          setValue('skills', improvedContent, { shouldDirty: true });
          break;
        case 'achievements':
          setValue('achievements', improvedContent, { shouldDirty: true });
          break;
        case 'languages':
          setValue('languages', improvedContent, { shouldDirty: true });
          break;
        case 'experience':
          const updatedExp = values.experience.map((exp, index) => ({
            ...exp,
            description: improvedContent.split('\n')[index] || exp.description
          }));
          setValue('experience', updatedExp, { shouldDirty: true });
          break;
        case 'education':
          const updatedEdu = values.education.map((edu, index) => ({
            ...edu,
            title: improvedContent.split('\n')[index] || edu.title
          }));
          setValue('education', updatedEdu, { shouldDirty: true });
          break;
        case 'projects':
          const updatedProj = values.projects.map((proj, index) => ({
            ...proj,
            description: improvedContent.split('\n')[index] || proj.description
          }));
          setValue('projects', updatedProj, { shouldDirty: true });
          break;
        case 'resume':
          setPreviewContent(improvedContent);
          break;
      }

      toast.success(`${section} enhanced successfully!`);
    } catch (error) {
      console.error(`Error enhancing ${section}:`, error);
      toast.error(`Failed to enhance ${section}: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-50 to-gray-100 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col">
          <h1 className="font-bold text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Resume Builder
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={completionProgress} className="h-2 w-40" />
            <span className="text-sm text-gray-600">{completionProgress}% complete</span>
          </div>
        </div>
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleAIEnhance('resume')}
                  disabled={isEnhancing}
                  className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 hover:from-purple-200 hover:to-indigo-200"
                >
                  {isEnhancing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-medium hidden md:inline">AI Enhance</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use AI to improve your entire resume</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || !isDirty}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-medium">Saving...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                <span className="font-medium">Save Resume</span>
              </>
            )}
          </Button>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-medium">Generating...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                <span className="font-medium hidden md:inline">Download PDF</span>
                <span className="font-medium md:hidden">PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigateSection('prev')}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Badge variant="outline" className="px-4 py-1 text-sm font-medium">
          {RESUME_SECTIONS[currentSection].charAt(0).toUpperCase() + RESUME_SECTIONS[currentSection].slice(1)}
        </Badge>
        <Button 
          variant="ghost" 
          onClick={() => navigateSection('next')}
          disabled={currentSection === RESUME_SECTIONS.length - 1}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {isClient && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="edit">Form</TabsTrigger>
            <TabsTrigger value="preview">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div id="contact" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAIEnhance('contact')}
                    disabled={isEnhancing}
                    className="text-purple-600"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Enhance
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      {...register("contactInfo.email")}
                      type="email"
                      placeholder="your@email.com"
                      error={errors.contactInfo?.email}
                    />
                    {errors.contactInfo?.email && (
                      <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile Number</label>
                    <Input
                      {...register("contactInfo.mobile")}
                      type="tel"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">LinkedIn URL</label>
                    <Input
                      {...register("contactInfo.linkedin")}
                      type="url"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub URL</label>
                    <Input
                      {...register("contactInfo.github")}
                      type="url"
                      placeholder="https://github.com/your-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Twitter/X Profile</label>
                    <Input
                      {...register("contactInfo.twitter")}
                      type="url"
                      placeholder="https://twitter.com/your-handle"
                    />
                  </div>
                </div>
              </div>

              <div id="summary" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Professional Summary</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAIEnhance('summary')}
                    disabled={isEnhancing}
                    className="text-purple-600"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Enhance
                  </Button>
                </div>
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-32"
                      placeholder="Write a compelling professional summary..."
                      error={errors.summary}
                    />
                  )}
                />
                {errors.summary && (
                  <p className="text-sm text-red-500">{errors.summary.message}</p>
                )}
              </div>

              <div id="skills" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Technical Skills</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAIEnhance('skills')}
                    disabled={isEnhancing}
                    className="text-purple-600"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Enhance
                  </Button>
                </div>
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-32"
                      placeholder="Programming Languages: Python, JavaScript..."
                      error={errors.skills}
                    />
                  )}
                />
                {errors.skills && (
                  <p className="text-sm text-red-500">{errors.skills.message}</p>
                )}
              </div>

              <div id="experience" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Work Experience</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAIEnhance('experience')}
                    disabled={isEnhancing}
                    className="text-purple-600"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Enhance All
                  </Button>
                </div>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Experience"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div id="education" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Education</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAIEnhance('education')}
                    disabled={isEnhancing}
                    className="text-purple-600"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Enhance All
                  </Button>
                </div>
                <Controller
                  name="education"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Education"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div id="projects" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Projects</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAIEnhance('projects')}
                    disabled={isEnhancing}
                    className="text-purple-600"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Enhance All
                  </Button>
                </div>
                <Controller
                  name="projects"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Project"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div id="achievements" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Achievements & Certifications</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAIEnhance('achievements')}
                        disabled={isEnhancing}
                        className="text-purple-600"
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-1" />
                        )}
                        Enhance
                      </Button>
                    </div>
                    <Controller
                      name="achievements"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="List your achievements..."
                          className="h-32"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Languages Known</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAIEnhance('languages')}
                        disabled={isEnhancing}
                        className="text-purple-600"
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-1" />
                        )}
                        Enhance
                      </Button>
                    </div>
                    <Controller
                      name="languages"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="English, Spanish, etc."
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="link"
                type="button"
                onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
                className="text-blue-600"
              >
                {resumeMode === "preview" ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Markdown
                  </>
                ) : (
                  <>
                    <Monitor className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(previewContent)}
                >
                  Copy Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIEnhance('resume')}
                  disabled={isEnhancing}
                  className="text-purple-600 border-purple-300"
                >
                  {isEnhancing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Enhance
                </Button>
              </div>
            </div>

            {activeTab === "preview" && resumeMode !== "preview" && (
              <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                <span className="text-sm">
                  Note: Switching to form will overwrite markdown edits
                </span>
              </div>
            )}
            <div className="border rounded-lg">
              <MDEditor
                value={previewContent}
                onChange={setPreviewContent}
                height={800}
                preview={resumeMode}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}