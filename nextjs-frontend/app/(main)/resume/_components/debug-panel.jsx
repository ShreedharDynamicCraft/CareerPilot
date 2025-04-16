"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bug, ClipboardCopy, FileDown, Eye } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DebugPanel = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewType, setPreviewType] = useState("normal");
  const { copyToClipboard } = useClipboard();

  if (process.env.NODE_ENV !== 'development') return null;

  const generateMarkdown = () => {
    try {
      const resumeData = typeof data === 'string' ? JSON.parse(data) : data;
      
      let markdown = `# ${resumeData.contactInfo?.name || 'Resume'}\n`;
      
      if (resumeData.contactInfo) {
        const contact = resumeData.contactInfo;
        markdown += `${contact.email || ''} | ${contact.mobile || ''} ${contact.linkedin ? `| [LinkedIn](${contact.linkedin})` : ''}\n\n`;
      }
      
      if (resumeData.summary) {
        markdown += `## Professional Summary\n${resumeData.summary}\n\n`;
      }
      
      if (resumeData.skills) {
        markdown += `## Skills\n${resumeData.skills}\n\n`;
      }
      
      if (resumeData.experience && resumeData.experience.length > 0) {
        markdown += `## Experience\n`;
        resumeData.experience.forEach(job => {
          markdown += `### ${job.title} | ${job.organization}\n`;
          markdown += `${job.startDate} - ${job.current ? 'Present' : job.endDate}\n\n`;
          markdown += `${job.description}\n\n`;
        });
      }
      
      if (resumeData.education && resumeData.education.length > 0) {
        markdown += `## Education\n`;
        resumeData.education.forEach(edu => {
          markdown += `### ${edu.title} | ${edu.organization}\n`;
          markdown += `${edu.startDate} - ${edu.endDate}\n\n`;
          markdown += `${edu.description}\n\n`;
        });
      }
      
      return markdown;
    } catch (error) {
      console.error('Error generating markdown:', error);
      return "Error generating preview. Please check your resume data.";
    }
  };

  const renderPreview = () => {
    if (previewType === "latex") {
      return (
        <div className="font-serif text-sm" style={{ fontFamily: "'Latin Modern Roman', 'Computer Modern', serif" }}>
          {generateMarkdown().split('\n').map((line, i) => {
            if (line.startsWith('# ')) {
              return <h1 key={i} className="text-xl font-bold mb-2">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={i} className="text-lg font-bold mt-3 mb-1">{line.substring(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={i} className="text-base font-bold mt-2">{line.substring(4)}</h3>;
            } else {
              return <p key={i} className="mb-1">{line}</p>;
            }
          })}
        </div>
      );
    } else if (previewType === "professional") {
      return (
        <div className="font-sans text-sm" style={{ fontFamily: "'Georgia', 'Helvetica', 'Arial', sans-serif" }}>
          {generateMarkdown().split('\n').map((line, i) => {
            if (line.startsWith('# ')) {
              return <h1 key={i} className="text-xl font-bold text-blue-800 mb-2">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={i} className="text-lg font-bold text-blue-700 mt-3 mb-1 border-b pb-1">{line.substring(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={i} className="text-base font-semibold mt-2">{line.substring(4)}</h3>;
            } else {
              return <p key={i} className="mb-1">{line}</p>;
            }
          })}
        </div>
      );
    } else {
      return (
        <pre className="text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg"
      >
        <Bug className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-white rounded-lg shadow-xl border w-[600px] max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Resume Preview</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
              >
                <ClipboardCopy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  alert(`Download resume with ${previewType} template`);
                }}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Download {previewType.charAt(0).toUpperCase() + previewType.slice(1)}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="normal" onValueChange={setPreviewType} className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="normal">JSON</TabsTrigger>
              <TabsTrigger value="latex">LaTeX Style</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
            </TabsList>
            
            <div className="p-2 border rounded-md mt-2">
              <p className="text-xs text-gray-500 mb-2">
                Currently viewing: <span className="font-semibold">{previewType.charAt(0).toUpperCase() + previewType.slice(1)} Template</span>
              </p>
              {renderPreview()}
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;