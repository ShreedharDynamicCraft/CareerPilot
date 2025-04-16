"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResumeData } from "@/hooks/use-resume-data";
import { Download, Edit, Loader2, Monitor, Save, ChevronLeft, ChevronRight, Sparkles, Info } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Resume templates definitions
const RESUME_TEMPLATES = {
  MINIMAL: "minimal",
  PROFESSIONAL: "professional",
  ACADEMIC: "academic"
};

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [enhancingSections, setEnhancingSections] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(RESUME_TEMPLATES.MINIMAL);

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
      education?.length > 0 && `## Education\n\n${education.map(edu => formatEducation(edu)).join('\n\n')}`,

      skills && `## Technical Skills\n\n${formatSkills(skills)}`,
      experience?.length > 0 && `## Work Experience\n\n${experience.map(exp => formatExperience(exp)).join('\n\n')}`,
      projects?.length > 0 && `## Projects\n\n${projects.map(proj => formatProject(proj)).join('\n\n')}`,
      achievements && `## Achievements & Certifications\n\n${achievements.split('\n').map(a => `- ${a.trim()}`).join('\n')}`,
      languages && `## Languages\n\n${languages.split(',').map(l => `- ${l.trim()}`).join('\n')}`,
    ].filter(Boolean).join('\n\n');
  }, [formValues, getContactMarkdown, formatSkills, formatExperience, formatEducation, formatProject]);

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

  // Update preview content and completion progress
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
      updateCompletionProgress();
    }
  }, [formValues, activeTab, initialContent, getCombinedContent, updateCompletionProgress]);

  // Re-render preview content when template changes
  useEffect(() => {
    if (isClient && activeTab === "preview") {
      // Update preview based on the selected template
      updateTemplatePreview();
    }
  }, [selectedTemplate, isClient, activeTab]);

  // Function to update preview based on selected template
  const updateTemplatePreview = useCallback(() => {
    const formattedContent = getCombinedContent();
    setPreviewContent(formattedContent);
    
    // Add a small delay to ensure the content is updated
    setTimeout(() => {
      const previewElement = document.querySelector('.w-md-editor-preview');
      if (!previewElement) return;
      
      // Remove previous template styles
      previewElement.classList.remove('template-minimal', 'template-professional', 'template-academic');
      
      // Apply current template styles
      previewElement.classList.add(`template-${selectedTemplate}`);
      
      // Apply template-specific styles
      let customStyles = '';
      switch(selectedTemplate) {
        case RESUME_TEMPLATES.PROFESSIONAL:
          customStyles = `
            .w-md-editor-preview {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
            }
            .w-md-editor-preview h2 {
              color: #2c3e50;
              font-size: 18px;
              border-bottom: 2px solid #3498db;
              padding-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .w-md-editor-preview h3 {
              font-weight: bold;
              color: #34495e;
              margin-top: 15px;
              margin-bottom: 5px;
            }
            .w-md-editor-preview ul {
              margin-top: 5px;
            }
            .w-md-editor-preview li {
              margin-bottom: 3px;
            }
            .w-md-editor-preview a {
              color: #3498db;
            }
          `;
          break;
        case RESUME_TEMPLATES.ACADEMIC:
          customStyles = `
            .w-md-editor-preview {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.5;
            }
            .w-md-editor-preview h2 {
              font-size: 16px;
              color: #333;
              text-transform: uppercase;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .w-md-editor-preview h3 {
              font-size: 14px;
              margin: 10px 0 5px;
              color: #444;
            }
            .w-md-editor-preview ul {
              margin-top: 5px;
              margin-bottom: 15px;
            }
            .w-md-editor-preview li {
              margin-bottom: 5px;
            }
            .w-md-editor-preview a {
              color: #0000cc;
              text-decoration: none;
            }
          `;
          break;
        default: // MINIMAL
          customStyles = `
            .w-md-editor-preview {
              font-family: Arial, sans-serif;
              line-height: 1.4;
            }
            .w-md-editor-preview h2 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
          `;
      }
      
      // Apply custom styles
      let styleElement = document.getElementById('template-preview-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'template-preview-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = customStyles;
    }, 100);
  }, [getCombinedContent, selectedTemplate]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const generatePDF = async () => {
    if (!isClient) return;
  
    setIsGenerating(true);
    try {
      let htmlContent;
      
      switch(selectedTemplate) {
        case RESUME_TEMPLATES.PROFESSIONAL:
          htmlContent = generateProfessionalTemplate();
          break;
        case RESUME_TEMPLATES.ACADEMIC:
          htmlContent = generateAcademicTemplate();
          break;
        case RESUME_TEMPLATES.MINIMAL:
        default:
          htmlContent = generateMinimalTemplate();
      }
  
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

  // Default minimal template
  const generateMinimalTemplate = () => {
    return `
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
  };

  // Professional template
  const generateProfessionalTemplate = () => {
    const { summary, skills, experience = [], education = [], projects = [], achievements, languages, contactInfo } = getValues();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${user?.fullName || 'Resume'}</title>
          <style>
            body {
              font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
              color: #222;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              max-width: 900px;
              margin: 0 auto;
              background-color: #fff;
            }
            .resume-container {
              display: flex;
              min-height: 100vh;
            }
            .sidebar {
              width: 32%;
              background-color: #2c3e50;
              color: #fff;
              padding: 40px 20px;
            }
            .main-content {
              width: 68%;
              padding: 40px 30px;
            }
            .profile-img {
              width: 150px;
              height: 150px;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: block;
              background-color: #fff;
              text-align: center;
              line-height: 150px;
              font-size: 48px;
              color: #2c3e50;
            }
            .sidebar h1 {
              text-align: center;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .sidebar h2 {
              text-align: center;
              font-size: 18px;
              font-weight: 400;
              margin: 0 0 30px 0;
              opacity: 0.8;
            }
            .contact-info {
              margin-bottom: 30px;
            }
            .contact-item {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
            }
            .contact-icon {
              margin-right: 10px;
              width: 20px;
              text-align: center;
            }
            .contact-text {
              font-size: 14px;
            }
            .sidebar-section {
              margin-bottom: 25px;
            }
            .sidebar-section-title {
              font-size: 18px;
              border-bottom: 2px solid rgba(255,255,255,0.3);
              padding-bottom: 5px;
              margin-bottom: 12px;
            }
            .skill-item {
              margin-bottom: 10px;
            }
            .skill-name {
              display: block;
              margin-bottom: 3px;
              font-size: 14px;
            }
            .language-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 22px;
              color: #2c3e50;
              border-bottom: 2px solid #2c3e50;
              padding-bottom: 5px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .work-item, .education-item, .project-item {
              margin-bottom: 20px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .item-title {
              font-weight: bold;
              font-size: 18px;
              color: #2c3e50;
            }
            .item-subtitle {
              font-size: 16px;
              margin-bottom: 5px;
            }
            .item-date {
              color: #7f8c8d;
              font-style: italic;
            }
            .item-description ul {
              margin-top: 5px;
              padding-left: 20px;
            }
            .item-description li {
              margin-bottom: 3px;
            }
            .skill-category {
              font-weight: bold;
              margin-bottom: 3px;
            }
            .achievement-item {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <!-- Left Sidebar -->
            <div class="sidebar">
              <!-- Profile Image -->
              <div class="profile-img">
                ${user?.fullName ? user.fullName.charAt(0) : 'R'}
              </div>
              
              <h1>${user?.fullName || 'Your Name'}</h1>
              <h2>${education && education[0] ? education[0].title : 'Professional Title'}</h2>
              
              <!-- Contact Information -->
              <div class="contact-info">
                ${contactInfo.email ? `
                <div class="contact-item">
                  <div class="contact-icon">✉️</div>
                  <div class="contact-text">${contactInfo.email}</div>
                </div>` : ''}
                
                ${contactInfo.mobile ? `
                <div class="contact-item">
                  <div class="contact-icon">📱</div>
                  <div class="contact-text">${contactInfo.mobile}</div>
                </div>` : ''}
                
                ${contactInfo.linkedin ? `
                <div class="contact-item">
                  <div class="contact-icon">🔗</div>
                  <div class="contact-text">${contactInfo.linkedin.replace('https://linkedin.com/in/', '')}</div>
                </div>` : ''}
                
                ${contactInfo.github ? `
                <div class="contact-item">
                  <div class="contact-icon">💻</div>
                  <div class="contact-text">${contactInfo.github.replace('https://github.com/', '')}</div>
                </div>` : ''}
              </div>
              
              <!-- Skills Section -->
              ${skills ? `
              <div class="sidebar-section">
                <div class="sidebar-section-title">Technical Skills</div>
                ${skills.split('\n').map(line => {
                  const [category, items] = line.split(':');
                  if (!items) return `<div class="skill-item"><span class="skill-name">${category.trim()}</span></div>`;
                  return `<div class="skill-item">
                    <span class="skill-name"><strong>${category.trim()}</strong>: ${items.trim()}</span>
                  </div>`;
                }).join('')}
              </div>` : ''}
              
              <!-- Languages Section -->
              ${languages ? `
              <div class="sidebar-section">
                <div class="sidebar-section-title">Languages</div>
                ${languages.split(',').map(lang => `
                <div class="language-item">
                  <span>${lang.trim()}</span>
                </div>`).join('')}
              </div>` : ''}
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
              <!-- Summary Section -->
              ${summary ? `
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <p>${summary}</p>
              </div>` : ''}
              
              <!-- Work Experience Section -->
              ${experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Professional Experience</div>
                ${experience.map(exp => `
                <div class="work-item">
                  <div class="item-header">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
                  </div>
                  <div class="item-subtitle">${exp.organization}${exp.location ? ` | ${exp.location}` : ''}</div>
                  ${exp.description ? `
                  <div class="item-description">
                    <ul>
                      ${exp.description.split('\n').filter(line => line.trim()).map(line => 
                        `<li>${line.replace(/^[-•]\s*/, '').trim()}</li>`
                      ).join('')}
                    </ul>
                  </div>` : ''}
                  ${exp.technologies ? `<div><strong>Technologies:</strong> ${exp.technologies}</div>` : ''}
                </div>
                `).join('')}
              </div>` : ''}
              
              <!-- Projects Section -->
              ${projects.length > 0 ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${projects.map(proj => `
                <div class="project-item">
                  <div class="item-header">
                    <div class="item-title">${proj.title}</div>
                  </div>
                  ${proj.technologies ? `<div class="item-subtitle">${proj.technologies}</div>` : ''}
                  ${proj.description ? `
                  <div class="item-description">
                    <ul>
                      ${proj.description.split('\n').filter(line => line.trim()).map(line => 
                        `<li>${line.replace(/^[-•]\s*/, '').trim()}</li>`
                      ).join('')}
                    </ul>
                  </div>` : ''}
                  ${proj.githubUrl || proj.demoUrl ? `
                  <div>
                    ${proj.githubUrl ? `<a href="${proj.githubUrl}" style="color:#2c3e50;">GitHub</a>` : ''}
                    ${proj.githubUrl && proj.demoUrl ? ' | ' : ''}
                    ${proj.demoUrl ? `<a href="${proj.demoUrl}" style="color:#2c3e50;">Live Demo</a>` : ''}
                  </div>` : ''}
                </div>
                `).join('')}
              </div>` : ''}
              
              <!-- Education Section -->
              ${education.length > 0 ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${education.map(edu => `
                <div class="education-item">
                  <div class="item-header">
                    <div class="item-title">${edu.organization}</div>
                    <div class="item-date">${edu.startDate || ''} - ${edu.endDate || 'Present'}</div>
                  </div>
                  <div class="item-subtitle">${edu.title}${edu.location ? `, ${edu.location}` : ''}</div>
                  ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                  ${edu.relevantCourses ? `<div><strong>Relevant Coursework:</strong> ${edu.relevantCourses}</div>` : ''}
                </div>
                `).join('')}
              </div>` : ''}
              
              <!-- Achievements Section -->
              ${achievements ? `
              <div class="section">
                <div class="section-title">Achievements & Certifications</div>
                <ul>
                  ${achievements.split('\n').filter(a => a.trim()).map(a => 
                    `<li class="achievement-item">${a.replace(/^[-•]\s*/, '').trim()}</li>`
                  ).join('')}
                </ul>
              </div>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Update the Academic template to match the reference template exactly
  const generateAcademicTemplate = () => {
    const { summary, skills, experience = [], education = [], projects = [], achievements, languages, contactInfo } = getValues();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${user?.fullName || 'Resume'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
          }
          h2, h3 {
            margin: 10px 0 5px;
          }
          table {
            width: 100%;
            border-spacing: 0;
          }
          td {
            vertical-align: top;
          }
          a {
            color: #0000cc;
            text-decoration: none;
          }
          hr {
            border: 1px solid #ddd;
            margin: 20px 0;
          }
          ul {
            margin-top: 5px;
          }
        </style>
      </head>
      <body>

      <!-- HEADER -->
      <table>
        <tr>
          <td style="width:15%;">
            <img src="https://www.iiitmanipur.ac.in/img/iiitm-logo.png" width="120">
          </td>
          <td style="width:60%;">
            <h2>${user?.fullName || 'Full Name'}</h2>
            <p style="margin:0;">${education && education[0] ? education[0].title : 'Bachelor of Technology'}</p>
            <p style="margin:0;">${education && education[0] && education[0].organization ? education[0].organization : 'Your Department'}</p>
            <p style="margin:0;">${education && education[0] && education[0].organization ? education[0].organization : 'Indian Institute of Information Technology'}</p>
          </td>
          <td style="text-align:right;">
            ${contactInfo.mobile ? `<p style="margin:0;">📞 ${contactInfo.mobile}</p>` : ''}
            ${contactInfo.email ? `<p style="margin:0;">✉️ <a href="mailto:${contactInfo.email}">${contactInfo.email}</a></p>` : ''}
            ${contactInfo.linkedin ? `<p style="margin:0;">🔗 <a href="${contactInfo.linkedin}">${contactInfo.linkedin.replace('https://linkedin.com/in/', 'linkedin.com/in/')}</a></p>` : ''}
            ${contactInfo.github ? `<p style="margin:0;">💻 <a href="${contactInfo.github}">${contactInfo.github.replace('https://github.com/', 'github.com/')}</a></p>` : ''}
          </td>
        </tr>
      </table>

      <hr>

      <!-- EDUCATION -->
      ${education.length > 0 ? `
      <h3>EDUCATION</h3>
      ${education.map(edu => `
      <table>
        <tr>
          <td><strong>${edu.organization}</strong></td>
          <td style="text-align:right;">${edu.startDate || ''} – ${edu.endDate || 'Present'}</td>
        </tr>
        <tr>
          <td colspan="2">${edu.title}${edu.location ? `, ${edu.location}` : ''}</td>
        </tr>
        ${edu.gpa ? `<tr><td colspan="2">CGPA: ${edu.gpa} / 10</td></tr>` : ''}
        ${edu.relevantCourses ? `<tr><td colspan="2">Relevant Coursework: ${edu.relevantCourses}</td></tr>` : ''}
      </table>
      `).join('')}
      ` : ''}

      <!-- PROJECTS -->
      <hr>
      <h3>PROJECTS</h3>
      ${projects.length > 0 ? projects.map(proj => `
      <p><strong>${proj.title}</strong>${proj.technologies ? ` – ${proj.technologies}` : ''}</p>
      <ul>
        ${proj.description ? proj.description.split('\n').filter(line => line.trim()).map(line => 
          `<li>${line.replace(/^[-•]\s*/, '').trim()}</li>`
        ).join('') : ''}
      </ul>
      `).join('') : `
      <p><strong>Project Title 1</strong> – Brief description of the project, tools/tech used.</p>
      <ul>
        <li>Key feature or functionality.</li>
        <li>Achievement or outcome.</li>
      </ul>
      
      <p><strong>Project Title 2</strong> – Brief description of the project, tools/tech used.</p>
      <ul>
        <li>Key feature or functionality.</li>
        <li>Achievement or outcome.</li>
      </ul>`}

      <!-- TECHNICAL SKILLS -->
      <hr>
      <h3>TECHNICAL SKILLS</h3>
      ${skills ? `
      <ul>
        ${skills.split('\n').map(line => {
          const [category, items] = line.split(':');
          if (!items) return `<li>${category.trim()}</li>`;
          return `<li><strong>${category.trim()}:</strong> ${items.trim()}</li>`;
        }).join('')}
      </ul>` : `
      <ul>
        <li><strong>Languages:</strong> C++, JavaScript, Python</li>
        <li><strong>Tools & Frameworks:</strong> Node.js, React, MongoDB</li>
        <li><strong>Others:</strong> Git, Linux, REST APIs</li>
      </ul>`}

      <!-- INTERNSHIPS / WORK EXPERIENCE -->
      ${experience.length > 0 ? `
      <hr>
      <h3>${experience.some(exp => exp.title.toLowerCase().includes('intern')) ? 'INTERNSHIPS / TRAINING' : 'WORK EXPERIENCE'}</h3>
      ${experience.map(exp => `
      <p><strong>${exp.organization}</strong> – ${exp.title} (${exp.startDate || ''} – ${exp.endDate || 'Present'})</p>
      <ul>
        ${exp.description ? exp.description.split('\n').filter(line => line.trim()).map(line => 
          `<li>${line.replace(/^[-•]\s*/, '').trim()}</li>`
        ).join('') : ''}
      </ul>
      `).join('')}` : `
      <hr>
      <h3>INTERNSHIPS / TRAINING</h3>
      <p><strong>Company/Organization Name</strong> – Role / Internship Title (Month Year – Month Year)</p>
      <ul>
        <li>What you worked on or learned.</li>
      </ul>`}

      <!-- ACHIEVEMENTS -->
      ${achievements ? `
      <hr>
      <h3>ACHIEVEMENTS</h3>
      <ul>
        ${achievements.split('\n').filter(a => a.trim()).map(a => 
          `<li>${a.replace(/^[-•]\s*/, '').trim()}</li>`
        ).join('')}
      </ul>` : `
      <hr>
      <h3>ACHIEVEMENTS</h3>
      <ul>
        <li>Received Rajyapal Puraskar for [Description]</li>
        <li>Top 1% in JEE Mains (mention percentile/rank)</li>
      </ul>`}

      <!-- POSITIONS OF RESPONSIBILITY -->
      <hr>
      <h3>POSITIONS OF RESPONSIBILITY</h3>
      ${(achievements && achievements.toLowerCase().includes('lead')) || (experience && experience.some(exp => exp.title.toLowerCase().includes('lead'))) ? `
      <ul>
        ${achievements && achievements.toLowerCase().includes('lead') ? 
          achievements.split('\n')
            .filter(a => a.toLowerCase().includes('lead') || a.toLowerCase().includes('organiz'))
            .map(a => `<li>${a.replace(/^[-•]\s*/, '').trim()}</li>`)
            .join('') : 
          `<li>Campus Ambassador at Coding Ninjas (Jul 2022 – Dec 2022)</li>
          <li>Organized 5+ events, represented platform to 200+ students</li>`}
      </ul>` : `
      <ul>
        <li>Campus Ambassador at Coding Ninjas (Jul 2022 – Dec 2022)</li>
        <li>Organized 5+ events, represented platform to 200+ students</li>
      </ul>`}

      <!-- EXTRA-CURRICULAR -->
      <hr>
      <h3>EXTRA-CURRICULAR ACTIVITIES</h3>
      <ul>
        <li>Volunteered in TechFest/NGO events</li>
        <li>Organized local workshops on coding for school kids</li>
      </ul>

      </body>
      </html>
    `;
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

  const handleAIEnhance = async (section, enhanceType = 'content') => {
    const toastId = `enhance-${section}`;

    try {
      const values = getValues();
      let currentContent = '';
      let type = section;

      // Get current content based on section
      switch (section.toLowerCase()) {
        case 'summary':
          currentContent = values.summary?.trim() || '';
          type = enhanceType === 'ats' ? 'summary_ats' : 'summary';
          if (!currentContent || currentContent.length < 10) {
            toast.error('Please write a summary of at least 10 characters before enhancing', { id: toastId });
            return;
          }
          break;
        case 'achievements':
          currentContent = values.achievements?.trim() || '';
          if (!currentContent || currentContent.length < 10) {
            toast.error('Please add some achievements (at least 10 characters) before enhancing', { id: toastId });
            return;
          }
          break;
        default:
          throw new Error('Invalid section');
      }

      // Set loading state for specific section
      setEnhancingSections(prev => ({ ...prev, [section]: true }));

      // Show loading toast
      toast.loading(`Enhancing ${section}...`, { id: toastId });

      // Call AI enhancement
      const response = await enhanceWithAI({ 
        current: currentContent, 
        type 
      });

      if (!response || typeof response !== 'string' || response.trim().length === 0) {
        throw new Error('Invalid response received from AI');
      }

      // Update content based on section
      switch (section.toLowerCase()) {
        case 'summary':
          setValue('summary', response.trim(), { shouldDirty: true });
          toast.success(
            `Professional summary ${enhanceType === 'ats' ? 'optimized for ATS' : 'enhanced'} successfully!`,
            { id: toastId }
          );
          break;
        case 'achievements':
          setValue('achievements', response.trim(), { shouldDirty: true });
          toast.success('Achievements enhanced successfully!', {
            id: toastId
          });
          break;
      }

    } catch (error) {
      console.error(`Error enhancing ${section}:`, error);
      toast.error(error.message || `Failed to enhance ${section}. Please try again.`, {
        id: toastId
      });
    } finally {
      // Clear loading state for specific section
      setEnhancingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  // Update the click handlers to prevent default behavior and handle errors
  const handleSummaryAtsClick = async (e) => {
    e.preventDefault();
    try {
      await handleAIEnhance('summary', 'ats');
    } catch (error) {
      console.error('Error in ATS enhancement:', error);
    }
  };

  const handleSummaryEnhanceClick = async (e) => {
    e.preventDefault();
    try {
      await handleAIEnhance('summary', 'content');
    } catch (error) {
      console.error('Error in summary enhancement:', error);
    }
  };

  const handleAchievementsEnhanceClick = async (e) => {
    e.preventDefault();
    try {
      await handleAIEnhance('achievements');
    } catch (error) {
      console.error('Error in achievements enhancement:', error);
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
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Template:</span>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RESUME_TEMPLATES.MINIMAL}>Minimal</SelectItem>
                <SelectItem value={RESUME_TEMPLATES.PROFESSIONAL}>Professional</SelectItem>
                <SelectItem value={RESUME_TEMPLATES.ACADEMIC}>Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>


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
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div id="contact" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Contact Information</h3>
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
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSummaryAtsClick}
                            disabled={enhancingSections.summary}
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                          >
                            {enhancingSections.summary ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-1" />
                            )}
                            Make ATS-Friendly
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            Optimize your summary for Applicant Tracking Systems (ATS) by incorporating relevant keywords and improving readability.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSummaryEnhanceClick}
                            disabled={enhancingSections.summary}
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                          >
                            {enhancingSections.summary ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-1" />
                            )}
                            Enhance Summary
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            Improve your summary's impact by highlighting achievements, skills, and career goals more effectively.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      A strong professional summary should be 3-5 sentences highlighting your key qualifications, achievements, and career goals.
                    </span>
                  </div>
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-32 font-mono text-sm"
                        placeholder="Write a compelling professional summary that highlights your expertise, achievements, and career goals. Example:
                        
Innovative software engineer with 5+ years of experience in full-stack development and cloud architecture. Proven track record of delivering scalable solutions that drive business growth, including a microservices platform that reduced deployment time by 60%. Skilled in React, Node.js, and AWS, with a focus on building high-performance applications. Seeking to leverage technical expertise and leadership abilities to drive innovation in a senior development role."
                        error={errors.summary}
                      />
                    )}
                  />
                  {errors.summary && (
                    <p className="text-sm text-red-500">{errors.summary.message}</p>
                  )}
                </div>
              </div>

              <div id="skills" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Technical Skills</h3>
                </div>
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-medium mb-1 text-blue-700">Tip: Use Categories</h4>
                    <p className="text-sm text-gray-600 mb-2">Format your skills using categories for better organization. Each new line should have a category followed by a colon and then the specific skills.</p>
                    <div className="bg-white p-2 rounded text-sm font-mono text-gray-700">
                      <div>• Programming Languages: Python, C, C++, JavaScript, PHP</div>
                      <div>• Web Development: HTML5, CSS3, React.js, Node.js</div>
                      <div>• Databases: SQL, MongoDB, PostgreSQL</div> 
                      <div>• Machine Learning & AI: TensorFlow, NLP, OpenAI API</div>
                    </div>
                  </div>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-40 font-mono text-sm"
                        placeholder="Programming Languages: Python, JavaScript, TypeScript
Web Development: HTML5, CSS3, React.js, Next.js, Node.js
Databases: SQL, MongoDB, PostgreSQL
Cloud Services: AWS, Firebase, Azure
Tools & Methods: Git, CI/CD, Docker, Agile/Scrum"
                        error={errors.skills}
                      />
                    )}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-500">{errors.skills.message}</p>
                  )}
                </div>
              </div>

              <div id="experience" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Work Experience</h3>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleAchievementsEnhanceClick}
                              disabled={enhancingSections.achievements}
                              className="border-purple-500 text-purple-600 hover:bg-purple-50"
                            >
                              {enhancingSections.achievements ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4 mr-1" />
                              )}
                              Enhance Achievements
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm max-w-xs">
                              Improve your achievements by quantifying results and highlighting impactful certifications.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
              <div className="flex items-center gap-2">
                <span className="text-sm">Template: </span>
                <Badge variant="outline">{selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(previewContent)}
                >
                  Copy Markdown
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
                className={`template-${selectedTemplate}`}
                previewOptions={{
                  rehypePlugins: [],
                  components: {
                    h1: ({node, ...props}) => <h1 className={`template-h1-${selectedTemplate}`} {...props} />,
                    h2: ({node, ...props}) => <h2 className={`template-h2-${selectedTemplate}`} {...props} />,
                    h3: ({node, ...props}) => <h3 className={`template-h3-${selectedTemplate}`} {...props} />
                  }
                }}
              />
            </div>
            
            {resumeMode === "preview" && (
              <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Template Preview: {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}</h3>
                <p className="text-sm text-gray-600">
                  Your resume will be formatted according to the {selectedTemplate} template when you download it as PDF. 
                  {selectedTemplate === RESUME_TEMPLATES.MINIMAL && " This template features a clean, simple design with minimal styling."}
                  {selectedTemplate === RESUME_TEMPLATES.PROFESSIONAL && " This template features a modern business layout with professional styling and formatting."}
                  {selectedTemplate === RESUME_TEMPLATES.ACADEMIC && " This template resembles a traditional academic resume with formal structure and formatting."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}