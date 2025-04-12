"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Video, VideoOff, Send, Loader2, Upload, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VideoInterview() {
  // State for video call
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  // State for interview
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [interviewType, setInterviewType] = useState("technical");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [specialization, setSpecialization] = useState("cse");
  const [feedback, setFeedback] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);
  
  // State for resume/skills form
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [interviewMode, setInterviewMode] = useState("skills"); // "skills" or "resume"
  
  // Refs
  const userVideoRef = useRef(null);
  const aiVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const userStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const { toast } = useToast();

  // Cleanup function
  useEffect(() => {
    return () => {
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle resume upload
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully."
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  };

  // Submit form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (interviewMode === "resume" && !resumeFile) {
      toast({
        title: "Missing Resume",
        description: "Please upload your resume for a resume-based interview.",
        variant: "destructive"
      });
      return;
    }
    
    if (interviewMode === "skills" && !skills.trim()) {
      toast({
        title: "Missing Skills",
        description: "Please enter your skills for a skill-based interview.",
        variant: "destructive"
      });
      return;
    }
    
    setFormSubmitted(true);
    toast({
      title: "Form Submitted",
      description: `Your ${interviewMode === "resume" ? "resume" : "skills"} have been submitted. You can now start the interview.`
    });
  };

  // Start video call
  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      userStreamRef.current = stream;
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setIsCallActive(true);
      setIsVideoOn(true);
      setIsMuted(false);
      
      // Load AI interviewer video
      if (aiVideoRef.current) {
        // In a real implementation, this would be a video stream of the AI
        // For now, we'll use a placeholder video or animation
        aiVideoRef.current.src = "/interview-ai-placeholder.mp4";
        aiVideoRef.current.loop = true;
        aiVideoRef.current.play().catch(e => console.error("AI video playback failed:", e));
      }
      
      toast({
        title: "Video Call Started",
        description: "You are now connected with the AI interviewer."
      });
    } catch (error) {
      console.error("Error starting video call:", error);
      toast({
        title: "Error",
        description: "Failed to start video call. Please check your camera and microphone permissions.",
        variant: "destructive"
      });
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (userStreamRef.current) {
      userStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (userStreamRef.current) {
      userStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  // End call
  const endCall = () => {
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
    if (aiVideoRef.current) {
      aiVideoRef.current.pause();
      aiVideoRef.current.src = "";
    }
    setIsCallActive(false);
    toast({
      title: "Call Ended",
      description: "Your interview session has ended."
    });
  };

  // Start interview
  const startInterview = async () => {
    if (!isCallActive) {
      await startVideoCall();
    }
    
    try {
      setIsAnalyzing(true);
      
      // Prepare the welcome message
      const welcomeMessage = `Welcome to your ${interviewType} interview. I'll be asking you questions based on your ${interviewMode === "resume" ? "resume" : "skills"}. Please speak clearly and take your time to answer.`;
      
      // Speak the welcome message
      speakQuestion(welcomeMessage);
      
      // Wait for welcome message to complete before fetching the first question
      setTimeout(async () => {
        const response = await fetch("/api/generate-interview-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: interviewType,
            experienceLevel,
            specialization,
            interviewMode,
            resume: resumeFile ? "uploaded" : null,
            skills: skills || null
          }),
        });

        if (!response.ok) throw new Error("Failed to generate question");
        
        const data = await response.json();
        setCurrentQuestion(data);
        setIsAnalyzing(false);
        
        // Use text-to-speech to ask the question
        speakQuestion(data.question);
        
        toast({
          title: "Interview Started",
          description: "The AI interviewer has asked you a question. Please respond clearly.",
        });
      }, 6000); // Allow time for welcome message
      
    } catch (error) {
      console.error("Interview error:", error);
      setIsAiSpeaking(false);
      setIsAnalyzing(false);
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  // AI speaking with Web Speech API - Indian accent
  const speakQuestion = (question) => {
    setIsAiSpeaking(true);
    
    // Add Indian conversational fillers to make speech more natural
    const addIndianConversationalElements = (text) => {
      // Only add these elements occasionally to sound natural
      if (Math.random() > 0.7) {
        const fillers = [
          "Haan, ", 
          "Actually, ", 
          "See, ", 
          "You know, ", 
          "Basically, "
        ];
        const endPhrases = [
          ", isn't it?", 
          ", you see?", 
          ", correct?", 
          ", right?"
        ];
        
        // Add starter phrase sometimes
        if (Math.random() > 0.5 && !text.includes("Thank you")) {
          text = fillers[Math.floor(Math.random() * fillers.length)] + text;
        }
        
        // Add ending phrase sometimes for questions
        if (Math.random() > 0.7 && text.includes("?")) {
          // Remove the question mark, add the phrase, then add back question mark
          text = text.replace("?", endPhrases[Math.floor(Math.random() * endPhrases.length)] + "?");
        }
      }
      return text;
    };
    
    // Make the speech more conversational
    const enhancedQuestion = addIndianConversationalElements(question);
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(enhancedQuestion);
      
      // Adjust parameters for Indian accent
      utterance.rate = 0.9; // Slightly slower rate
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1.0;
      
      // Get available voices and try to find an Indian voice
      let voices = window.speechSynthesis.getVoices();
      
      // If voices array is empty, wait for voices to load
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoiceAndSpeak();
        };
      } else {
        setVoiceAndSpeak();
      }
      
      function setVoiceAndSpeak() {
        // Try to find an Indian voice or one that can simulate it
        const indianVoice = voices.find(voice => 
          voice.name.includes('Indian') || 
          voice.name.includes('Hindi') || 
          voice.lang === 'hi-IN' ||
          voice.lang === 'en-IN'
        );
        
        // Fallback to other English voices if no Indian voice is found
        const englishVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') || 
          voice.name.includes('Premium')
        );
        
        utterance.voice = indianVoice || englishVoice || voices[0];
        
        // Event handlers
        utterance.onstart = () => {
          console.log('AI started speaking with Indian accent');
        };
        
        utterance.onend = () => {
          console.log('AI finished speaking');
          setIsAiSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsAiSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Fallback for browsers that don't support Speech API
      console.warn('Speech synthesis not supported in this browser');
      setTimeout(() => {
        setIsAiSpeaking(false);
      }, 5000);
    }
  };

  // Process user's answer with enhanced feedback
  const processAnswer = async () => {
    try {
      setIsAnalyzing(true);
      
      // Start recording user's answer if we have access to the microphone
      if (userStreamRef.current && !isMuted) {
        // In a real implementation, this would use speech-to-text to capture the user's response
        // For now, we'll simulate the process
        
        // Provide feedback that we're listening
        toast({
          title: "Processing Response",
          description: "Analyzing your answer...",
        });
        
        // Simulate processing the audio response
        setTimeout(async () => {
          // Generate more detailed AI feedback based on the current question and interview mode
          const generateDetailedFeedback = () => {
            // Feedback templates based on interview type
            const feedbackTemplates = {
              technical: [
                "I noticed you explained the {concept} quite well, but maybe you could have gone deeper into {detail}. Try to explain the underlying principles next time.",
                "Your approach to solving the {problem} was logical, but consider discussing time and space complexity as well. This shows advanced understanding.",
                "You demonstrated good knowledge of {technology}, but I'd recommend also mentioning how it compares to alternatives like {alternative}."
              ],
              behavioral: [
                "Your example about {situation} was relevant, but try using the complete STAR method - Situation, Task, Action, and Result - to make your answer more impactful.",
                "I liked how you described handling {challenge}, but next time, emphasize more on what you personally contributed to the team's success.",
                "When discussing {experience}, consider also sharing what you learned from it and how it changed your approach to similar situations later."
              ],
              hr: [
                "Your answer about {topic} was clear, but you could strengthen it by connecting it more directly to the company's values or culture.",
                "When discussing your career goals, try to be more specific about how this role aligns with your {timeframe} plans.",
                "Your salary expectations were reasonable, but remember to also emphasize the value you bring that justifies that compensation level."
              ],
              "system-design": [
                "Your system design for {system} covered the basic components, but consider discussing scalability challenges more thoroughly.",
                "I liked your approach to {architecture}, but also consider discussing trade-offs between different architectural choices.",
                "Your database design was solid, but next time, elaborate on how you'd handle data partitioning and replication for large-scale systems."
              ]
            };
            
            // Select appropriate template based on interview type
            const templates = feedbackTemplates[interviewType] || feedbackTemplates.technical;
            let template = templates[Math.floor(Math.random() * templates.length)];
            
            // Fill in template with relevant information
            const concepts = ["algorithms", "data structures", "design patterns", "API design", "database optimization"];
            const technologies = ["React", "Node.js", "Python", "AWS", "Docker", "Kubernetes"];
            const alternatives = ["Angular", "Express", "Java", "GCP", "VMs", "traditional servers"];
            const challenges = ["tight deadlines", "team conflicts", "technical debt", "scaling issues"];
            const timeframes = ["3-year", "5-year", "long-term"];
            
            template = template.replace("{concept}", concepts[Math.floor(Math.random() * concepts.length)]);
            template = template.replace("{technology}", technologies[Math.floor(Math.random() * technologies.length)]);
            template = template.replace("{alternative}", alternatives[Math.floor(Math.random() * alternatives.length)]);
            template = template.replace("{problem}", "problem");
            template = template.replace("{detail}", "implementation details");
            template = template.replace("{situation}", "a challenging project");
            template = template.replace("{challenge}", challenges[Math.floor(Math.random() * challenges.length)]);
            template = template.replace("{experience}", "past work experience");
            template = template.replace("{topic}", "company culture");
            template = template.replace("{timeframe}", timeframes[Math.floor(Math.random() * timeframes.length)]);
            template = template.replace("{system}", "the proposed system");
            template = template.replace("{architecture}", "microservices architecture");
            
            // Add personalized advice
            const personalizedAdvice = [
              "I would suggest practicing more with real-world examples from your experience.",
              "Consider preparing 2-3 strong examples for each common question type.",
              "Try recording yourself and reviewing your answers to improve clarity and conciseness.",
              "Remember to maintain good eye contact and positive body language during interviews."
            ];
            
            return template + " " + personalizedAdvice[Math.floor(Math.random() * personalizedAdvice.length)];
          };
          
          // Generate scores with slight randomization but generally positive
          const technicalAccuracy = Math.floor(Math.random() * 30) + 70;
          const communication = Math.floor(Math.random() * 20) + 80;
          const problemSolving = Math.floor(Math.random() * 25) + 75;
          
          // Create feedback object with detailed feedback
          const feedbackResponse = {
            technicalAccuracy,
            communication,
            problemSolving,
            detailedFeedback: generateDetailedFeedback(),
            strengths: [],
            areasToImprove: []
          };
          
          // Add strengths based on highest score
          if (technicalAccuracy >= communication && technicalAccuracy >= problemSolving) {
            feedbackResponse.strengths.push("Strong technical knowledge");
          } else if (communication >= technicalAccuracy && communication >= problemSolving) {
            feedbackResponse.strengths.push("Excellent communication skills");
          } else {
            feedbackResponse.strengths.push("Good problem-solving approach");
          }
          
          // Add areas to improve based on lowest score
          if (technicalAccuracy <= communication && technicalAccuracy <= problemSolving) {
            feedbackResponse.areasToImprove.push("Deepen technical knowledge");
          } else if (communication <= technicalAccuracy && communication <= problemSolving) {
            feedbackResponse.areasToImprove.push("Work on communication clarity");
          } else {
            feedbackResponse.areasToImprove.push("Enhance problem-solving methodology");
          }
          
          setFeedback(feedbackResponse);
          setInterviewProgress((prev) => Math.min(prev + 25, 100));
          setIsAnalyzing(false);
          
          // Provide verbal feedback with Indian conversational style
          const feedbackIntro = [
            "Thank you for your answer. ",
            "That was a good attempt. ",
            "I appreciate your response. ",
            "Thank you for sharing your thoughts. "
          ];
          
          speakQuestion(feedbackIntro[Math.floor(Math.random() * feedbackIntro.length)] + feedbackResponse.detailedFeedback);
          
          // Wait for feedback to be spoken before continuing
          setTimeout(() => {
            // If interview is complete, generate final report
            if (interviewProgress + 25 >= 100) {
              generateFinalReport(feedbackResponse);
            } else {
              // Ask next question after a short pause
              setTimeout(() => {
                startInterview();
              }, 2000);
            }
          }, 8000); // Wait for feedback to be spoken
        }, 3000);
      } else {
        toast({
          title: "Microphone Issue",
          description: "Please ensure your microphone is enabled to continue the interview.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      setIsAnalyzing(false);
      toast({
        title: "Error",
        description: "Failed to process your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate comprehensive final report for personal growth
  const generateFinalReport = async (feedbackData) => {
    try {
      setIsAnalyzing(true);
      
      // In a real implementation, this would call an API
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        // Generate a more personalized and detailed report
        const generatePersonalizedReport = () => {
          // Overall performance assessment based on interview type
          const overallPerformanceByType = {
            technical: [
              "You demonstrated solid technical knowledge throughout the interview. Your ability to explain complex concepts was noteworthy, though there's room to deepen your understanding in some areas.",
              "Your technical interview performance showed good foundational knowledge. You approached problems methodically, which is a valuable skill in technical roles."
            ],
            behavioral: [
              "Throughout the behavioral interview, you showcased strong interpersonal skills and self-awareness. Your examples were relevant, though they could benefit from more structure.",
              "Your behavioral responses demonstrated good emotional intelligence and teamwork capabilities. The interview revealed your ability to navigate workplace challenges effectively."
            ],
            hr: [
              "In this HR interview, you presented yourself professionally and answered questions thoughtfully. Your career goals appear well-aligned with the types of roles you're pursuing.",
              "Your HR interview responses were clear and showed good preparation. You articulated your motivations well and demonstrated understanding of workplace dynamics."
            ],
            "system-design": [
              "Your system design interview showed good architectural thinking. You considered many important components, though some scalability aspects could use more attention.",
              "In the system design portion, you demonstrated methodical thinking and awareness of trade-offs. Your designs were practical and addressed core requirements effectively."
            ]
          };
          
          // Select appropriate performance assessment
          const performanceOptions = overallPerformanceByType[interviewType] || overallPerformanceByType.technical;
          const overallPerformance = performanceOptions[Math.floor(Math.random() * performanceOptions.length)];
          
          // Generate strengths based on interview type and experience level
          const strengthsByType = {
            technical: [
              "Solid understanding of core technical concepts",
              "Ability to explain complex ideas clearly",
              "Logical approach to problem-solving",
              "Good knowledge of relevant technologies",
              "Awareness of best practices in software development"
            ],
            behavioral: [
              "Strong communication skills",
              "Good examples of past experiences",
              "Demonstrated teamwork capabilities",
              "Effective conflict resolution approach",
              "Positive attitude toward challenges"
            ],
            hr: [
              "Clear career objectives",
              "Professional self-presentation",
              "Good understanding of company/role fit",
              "Appropriate salary expectations",
              "Thoughtful questions about the organization"
            ],
            "system-design": [
              "Structured approach to system architecture",
              "Consideration of scalability requirements",
              "Understanding of database design principles",
              "Awareness of system reliability concerns",
              "Ability to make appropriate technology choices"
            ]
          };
          
          // Select strengths based on interview type
          const typeStrengths = strengthsByType[interviewType] || strengthsByType.technical;
          
          // Randomly select 3 strengths without repetition
          const strengths = [];
          const strengthsCopy = [...typeStrengths];
          for (let i = 0; i < 3 && strengthsCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * strengthsCopy.length);
            strengths.push(strengthsCopy[index]);
            strengthsCopy.splice(index, 1);
          }
          
          // Generate improvement areas based on interview type and experience level
          const improvementsByType = {
            technical: [
              "Deepen knowledge of advanced algorithms and data structures",
              "Practice explaining technical concepts more concisely",
              "Consider time and space complexity in your solutions",
              "Strengthen understanding of system architecture principles",
              "Develop more familiarity with industry-standard tools and frameworks"
            ],
            behavioral: [
              "Structure your responses using the STAR method more consistently",
              "Prepare more diverse examples from your experiences",
              "Quantify your achievements with specific metrics",
              "Focus more on your individual contributions in team settings",
              "Practice more concise storytelling in your responses"
            ],
            hr: [
              "Research companies more thoroughly before interviews",
              "Align your career goals more explicitly with the positions you seek",
              "Prepare more thoughtful questions about company culture",
              "Practice discussing salary expectations more confidently",
              "Develop clearer explanations for career transitions or gaps"
            ],
            "system-design": [
              "Consider non-functional requirements more thoroughly",
              "Develop deeper knowledge of distributed systems concepts",
              "Practice drawing system diagrams more clearly",
              "Strengthen understanding of database scaling strategies",
              "Consider security implications in your designs"
            ]
          };
          
          // Select improvement areas based on interview type
          const typeImprovements = improvementsByType[interviewType] || improvementsByType.technical;
          
          // Randomly select 3 improvement areas without repetition
          const areasForImprovement = [];
          const improvementsCopy = [...typeImprovements];
          for (let i = 0; i < 3 && improvementsCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * improvementsCopy.length);
            areasForImprovement.push(improvementsCopy[index]);
            improvementsCopy.splice(index, 1);
          }
          
          // Generate personalized recommendations based on experience level and interview type
          const recommendationsByExperience = {
            fresher: [
              "Build small projects to demonstrate practical application of your skills",
              "Join online communities to learn from experienced professionals",
              "Practice coding challenges on platforms like LeetCode or HackerRank",
              "Contribute to open-source projects to gain real-world experience",
              "Take online courses to strengthen your theoretical foundation"
            ],
            junior: [
              "Seek mentorship from senior developers in your organization",
              "Take on challenging tasks that stretch your abilities",
              "Document your projects and learnings in a portfolio",
              "Practice system design with increasingly complex scenarios",
              "Develop expertise in one or two specialized areas"
            ],
            mid: [
              "Lead small projects to develop your leadership skills",
              "Mentor junior developers to solidify your knowledge",
              "Study architectural patterns and their applications",
              "Develop deeper understanding of business domains",
              "Practice explaining technical decisions to non-technical stakeholders"
            ],
            senior: [
              "Focus on system design and architecture for large-scale systems",
              "Develop your ability to evaluate and adopt new technologies",
              "Practice communicating technical vision to diverse audiences",
              "Study successful case studies in your industry",
              "Develop strategies for managing technical debt in large codebases"
            ]
          };
          
          // Select recommendations based on experience level
          const experienceRecommendations = recommendationsByExperience[experienceLevel] || recommendationsByExperience.fresher;
          
          // Randomly select 3 recommendations without repetition
          const recommendations = [];
          const recommendationsCopy = [...experienceRecommendations];
          for (let i = 0; i < 3 && recommendationsCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * recommendationsCopy.length);
            recommendations.push(recommendationsCopy[index]);
            recommendationsCopy.splice(index, 1);
          }
          
          // Add specific resource recommendations
          const resources = [
            "Book: 'Cracking the Coding Interview' by Gayle Laakmann McDowell",
            "Course: 'System Design for Technical Interviews' on educative.io",
            "YouTube: 'Tech Dummies' channel for system design concepts",
            "Practice: Regular mock interviews with peers or platforms like Pramp",
            "Tool: Keep a journal of interview questions and your responses"
          ];
          
          // Randomly select 2 resources
          const selectedResources = [];
          const resourcesCopy = [...resources];
          for (let i = 0; i < 2 && resourcesCopy.length > 0; i++) {
            const index = Math.floor(Math.random() * resourcesCopy.length);
            selectedResources.push(resourcesCopy[index]);
            resourcesCopy.splice(index, 1);
          }
          
          return {
            overallPerformance,
            strengths,
            areasForImprovement,
            recommendations,
            resources: selectedResources
          };
        };
        
        const personalizedReport = generatePersonalizedReport();
        setInterviewReport(personalizedReport);
        
        // Speak a summary of the report
        const reportSummary = `I've prepared your interview report. Overall, ${personalizedReport.overallPerformance.split('.')[0]}. I've identified your key strengths and areas for improvement, along with specific recommendations to help you grow professionally.`;
        
        setTimeout(() => {
          speakQuestion(reportSummary);
          setIsAnalyzing(false);
        }, 1000);
      }, 3000);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Error",
        description: "Failed to generate final report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {!formSubmitted ? (
        <Card>
          <CardHeader>
            <CardTitle>Interview Preparation</CardTitle>
            <CardDescription>
              Choose how you want to personalize your AI interview experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Interview Mode</Label>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${interviewMode === "resume" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    onClick={() => setInterviewMode("resume")}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-center mb-2">Resume-Based</h3>
                    <p className="text-sm text-gray-500 text-center">Upload your resume for personalized questions based on your experience</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${interviewMode === "skills" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    onClick={() => setInterviewMode("skills")}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <User className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-center mb-2">Skills-Based</h3>
                    <p className="text-sm text-gray-500 text-center">Enter your skills for questions tailored to your technical expertise</p>
                  </div>
                </div>
              </div>
              
              {interviewMode === "resume" ? (
                <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                  <Label htmlFor="resumeUpload">Upload Resume (PDF)</Label>
                  <Input
                    id="resumeUpload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                  />
                  {resumeFile && (
                    <p className="text-sm text-green-500">{resumeFile.name} uploaded</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                  <Label htmlFor="skills">Key Skills</Label>
                  <Textarea
                    id="skills"
                    placeholder="Enter your key skills, separated by commas (e.g., JavaScript, React, Node.js)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select 
                    value={experienceLevel} 
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                      <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Interview Type</Label>
                  <Select 
                    value={interviewType} 
                    onValueChange={setInterviewType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="system-design">System Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Submit and Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Video Interview</CardTitle>
                <CardDescription>
                  {isCallActive 
                    ? "You are now in a video call with the AI interviewer" 
                    : "Start the video call to begin your interview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={userVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {!isVideoOn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <User size={48} className="text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      You
                    </div>
                  </div>
                  
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={aiVideoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      AI Interviewer
                    </div>
                    {isAiSpeaking && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        Speaking
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center mt-4 space-x-4">
                  {!isCallActive ? (
                    <Button onClick={startVideoCall}>
                      <Video className="mr-2 h-4 w-4" />
                      Start Video Call
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={toggleMute}>
                        {isMuted ? (
                          <>
                            <Mic className="mr-2 h-4 w-4" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <MicOff className="mr-2 h-4 w-4" />
                            Mute
                          </>
                        )}
                      </Button>
                      
                      <Button variant="outline" onClick={toggleVideo}>
                        {isVideoOn ? (
                          <>
                            <VideoOff className="mr-2 h-4 w-4" />
                            Turn Off Video
                          </>
                        ) : (
                          <>
                            <Video className="mr-2 h-4 w-4" />
                            Turn On Video
                          </>
                        )}
                      </Button>
                      
                      <Button variant="destructive" onClick={endCall}>
                        End Call
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interview Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={interviewProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {interviewProgress}% Complete
                  </p>
                  
                  {currentQuestion ? (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium">Current Question:</h3>
                      <p>{currentQuestion.question}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentQuestion.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Button 
                        onClick={startInterview} 
                        disabled={!isCallActive || isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          "Start Interview"
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {currentQuestion && !isAiSpeaking && !isAnalyzing && (
                    <div className="text-center mt-4">
                      <Button onClick={processAnswer}>
                        I've Finished Answering
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside text-sm">
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Maintain eye contact with the camera</li>
                  <li>Use the STAR method for behavioral questions</li>
                  <li>Take a moment to think before answering complex questions</li>
                  <li>Have examples ready from your past experiences</li>
                  <li>Ask clarifying questions if needed</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Question Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Technical Accuracy</h3>
                    <Progress value={feedback.technicalAccuracy} className="h-2" />
                    <p className="text-right text-xs text-muted-foreground">{feedback.technicalAccuracy}%</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Communication</h3>
                    <Progress value={feedback.communication} className="h-2" />
                    <p className="text-right text-xs text-muted-foreground">{feedback.communication}%</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Problem Solving</h3>
                    <Progress value={feedback.problemSolving} className="h-2" />
                    <p className="text-right text-xs text-muted-foreground">{feedback.problemSolving}%</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Final Interview Report</CardTitle>
                <CardDescription>
                  A personalized assessment of your interview performance with actionable insights for growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-blue-700">Overall Performance</AlertTitle>
                    <AlertDescription>
                      {interviewReport.overallPerformance}
                    </AlertDescription>
                  </Alert>
                  
                  <Tabs defaultValue="strengths" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="strengths">Strengths</TabsTrigger>
                      <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                      <TabsTrigger value="growth">Growth Plan</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="strengths" className="space-y-4">
                      <div className="p-4 border rounded-lg bg-green-50">
                        <h3 className="font-medium mb-3 text-green-700">Your Key Strengths</h3>
                        <ul className="space-y-2">
                          {interviewReport.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 mt-1 text-green-500">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="improvements" className="space-y-4">
                      <div className="p-4 border rounded-lg bg-amber-50">
                        <h3 className="font-medium mb-3 text-amber-700">Areas for Improvement</h3>
                        <ul className="space-y-2">
                          {interviewReport.areasForImprovement.map((area, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 mt-1 text-amber-500">→</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="growth" className="space-y-4">
                      <div className="p-4 border rounded-lg bg-purple-50">
                        <h3 className="font-medium mb-3 text-purple-700">Personalized Recommendations</h3>
                        <ul className="space-y-2">
                          {interviewReport.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 mt-1 text-purple-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {interviewReport.resources && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <h3 className="font-medium mb-3 text-blue-700">Recommended Resources</h3>
                          <ul className="space-y-2">
                            {interviewReport.resources.map((resource, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2 mt-1 text-blue-500">📚</span>
                                <span>{resource}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-4 p-4 border border-dashed rounded-lg">
                        <h3 className="font-medium mb-2 text-center">Next Steps</h3>
                        <p className="text-center text-muted-foreground">
                          Practice regularly with our AI interviewer to track your improvement over time.
                          Consider focusing on one area at a time for maximum growth.  
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}