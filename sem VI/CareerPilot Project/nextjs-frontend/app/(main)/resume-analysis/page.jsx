"use client";

import { useState, lazy, Suspense, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiUpload, FiMaximize2, FiMinimize2, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
// Lazy load the results component to improve initial load time
const ResumeAnalyzeResult = lazy(() => import("./_component/ResumeAnalyzeResult"));

const ResumeAnalyzer = () => {
  // State management
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [textAnalysis, setTextAnalysis] = useState(null);
  const [jobPrediction, setJobPrediction] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle fullscreen toggle with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "F" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen]);

  /**
   * Handles file upload from input or drop events
   * Controls progress animation and validation
   */
  const handleUpload = (event) => {
    const uploadedFile = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    
    if (!uploadedFile) {
      showNotification("No file selected", "error");
      return;
    }
    
    if (uploadedFile.type !== "application/pdf") {
      showNotification("Please upload a PDF file only", "error");
      return;
    }
    
    // Size validation (10MB limit)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      showNotification("File size exceeds 10MB limit", "error");
      return;
    }
    
    setUploading(true);
    setProgress(0);
    const fileURL = URL.createObjectURL(uploadedFile);
    setFile({ raw: uploadedFile, preview: fileURL });
    
    // Simulate upload progress
    let progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(progressInterval);
          setUploading(false);
          showNotification("File uploaded successfully!", "success");
          return 100;
        }
        return Math.min(oldProgress + 5, 100);
      });
    }, 100);
  };

  // Notification helper function
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e);
  };

  /**
   * Comprehensive resume analysis function
   * Handles multiple API requests in parallel to improve performance
   */
  const handleAnalyze = async () => {
    if (!file) {
      showNotification("Please upload a PDF first", "error");
      return;
    }
    
    setLoading(true);
    setStep(2);
    
    try {
      const formData = new FormData(); 
      formData.append("file", file.raw);
      
      // Use Promise.all for concurrent API requests
      const [analysisRes, skillsRes, predictionRes] = await Promise.all([
        axios.post("http://127.0.0.1:8000/upload_resume/", formData, {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }),
        axios.post("http://127.0.0.1:8000/analyze_skills/", formData, {
          timeout: 30000,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }),
        axios.post("http://127.0.0.1:8000/predict_job_role/", formData, {
          timeout: 30000,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }),
      ]);
      
      // Combine all analysis results
      setTextAnalysis({
        ...analysisRes.data.analysis,
        skills_analysis: skillsRes.data,
        project_analysis: analysisRes.data.project_analysis,
        filename: analysisRes.data.filename
      });
      
      setJobPrediction(predictionRes.data || {});
      setAnalyzed(true);
      setStep(3);
      showNotification("Analysis completed successfully!", "success");
    } catch (error) {
      console.error("Analysis Error:", error);
      
      // Provide appropriate error message based on the error type
      if (error.code === "ECONNABORTED") {
        showNotification("Analysis timed out. Server might be busy.", "error");
      } else if (error.response) {
        showNotification(`Server error: ${error.response.status}`, "error");
      } else if (error.request) {
        showNotification("No response from server. Check your connection.", "error");
      } else {
        showNotification("Analysis failed. Please try again.", "error");
      }
      
      // Provide fallback data for better UX
      setTextAnalysis({
        skills_analysis: {
          top_skills: [{ name: "Error loading skills", frequency: 0 }],
          skill_categories: {},
          recommended_skills: [],
          missing_industry_skills: ["Analysis failed"]
        },
        project_analysis: {},
        analysis: {}
      });
      setJobPrediction({});
      setAnalyzed(true);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Job role prediction function
   * Separate from full analysis for users who only need job predictions
   */
  const handlePredictJobRole = async () => {
    if (!file) {
      showNotification("Please upload a PDF first", "error");
      return;
    }
    
    setLoading(true);
    setStep(2);
    
    try {
      const formData = new FormData();
      formData.append("file", file.raw);
      
      const result = await axios.post("http://127.0.0.1:8000/predict_job_role/", formData, {
        timeout: 20000, // 20 second timeout
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setJobPrediction(result.data);
      setTextAnalysis(null);
      setAnalyzed(true);
      setStep(3);
      showNotification("Job role prediction completed!", "success");
    } catch (error) {
      console.error("Prediction Error:", error);
      
      if (error.code === "ECONNABORTED") {
        showNotification("Prediction request timed out", "error");
      } else {
        showNotification("Prediction failed. Please try again.", "error");
      }
      
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Reset the analysis and return to upload state
  const handleReset = () => {
    setFile(null);
    setAnalyzed(false);
    setTextAnalysis(null);
    setJobPrediction(null);
    setStep(1);
    showNotification("Ready for a new resume", "info");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-blue-50 to-indigo-100">
      {/* Application Header */}
      <header className="w-full bg-white shadow-md p-4 md:p-6">
        <motion.h1 
          className="font-bold text-4xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm text-center md:text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Resume Analyzer
        </motion.h1>
        <motion.p
          className="text-gray-600 text-center md:text-left mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Upload your resume to get personalized insights and job role predictions
        </motion.p>
      </header>

      {/* Notification System */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "error" 
                ? "bg-red-100 text-red-800 border-l-4 border-red-500" 
                : notification.type === "success"
                ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
            }`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <FiAlertCircle className="text-red-500" />
              ) : notification.type === "success" ? (
                <FiCheckCircle className="text-green-500" />
              ) : (
                <FiAlertCircle className="text-blue-500" />
              )}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-gray-900/70 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 border-4 border-t-indigo-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p 
              className="text-white mt-4 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {step === 2 ? "Analyzing your resume..." : "Processing..."}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full transition-all duration-500 ${
            isFullscreen ? "fixed inset-0 m-0 z-40 rounded-none" : "max-w-6xl mx-auto"
          }`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Component Header Bar */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center">
              {analyzed && (
                <motion.button
                  onClick={() => {
                    setAnalyzed(false);
                    setStep(1);
                  }}
                  className="p-2 mr-2 rounded-full hover:bg-indigo-700 transition-all duration-300 text-white flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Go back"
                  data-tooltip-id="tooltip-back"
                  data-tooltip-content="Return to upload"
                >
                  <FiChevronLeft size={24} />
                </motion.button>
              )}
              <h2 className="text-white text-xl md:text-2xl font-extrabold tracking-tight">
                {step === 1 ? "Upload Resume" : step === 2 ? "Analyzing..." : "Analysis Results"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {file && !loading && (
                <motion.button
                  onClick={handleReset}
                  className="text-white bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-md text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-tooltip-id="tooltip-reset"
                  data-tooltip-content="Start over"
                >
                  Reset
                </motion.button>
              )}
              <motion.button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-full hover:bg-indigo-700 transition-all duration-300 text-white"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                data-tooltip-id="tooltip-fullscreen"
                data-tooltip-content={isFullscreen ? "Exit fullscreen (Ctrl+F)" : "Enter fullscreen (Ctrl+F)"}
              >
                {isFullscreen ? <FiMinimize2 size={24} /> : <FiMaximize2 size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-4 my-6">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className="relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: step >= s ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-16 h-3 rounded-full ${
                    step > s 
                      ? "bg-green-500" 
                      : step === s 
                      ? "bg-indigo-600 animate-pulse" 
                      : "bg-gray-300"
                  }`}
                />
                <motion.span 
                  className={`absolute -bottom-6 text-xs font-medium ${
                    step >= s ? "text-indigo-600" : "text-gray-500"
                  }`}
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                >
                  {s === 1 ? "Upload" : s === 2 ? "Process" : "Results"}
                </motion.span>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div
            className={`flex flex-col md:flex-row ${
              isFullscreen ? "h-[calc(100vh-150px)]" : "max-h-[800px]"
            }`}
          >
            {/* Upload Section */}
            {!analyzed && (
              <motion.div
                className="w-full md:w-1/2 p-6 flex flex-col gap-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${
                    isDragging 
                      ? "border-indigo-500 bg-indigo-50" 
                      : uploading 
                      ? "border-yellow-400 bg-yellow-50" 
                      : file 
                      ? "border-green-400 bg-green-50" 
                      : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    animate={{ 
                      y: [0, -5, 0],
                      transition: { repeat: Infinity, duration: 2 }
                    }}
                  >
                    <FiUpload className="mx-auto text-4xl text-indigo-500 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {file ? file.raw.name : "Upload Your Resume"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {file 
                      ? `${(file.raw.size / 1024).toFixed(2)} KB - PDF` 
                      : "Drag & Drop or Click to Upload PDF (Max 10MB)"}
                  </p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpload}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors inline-block"
                  >
                    {file ? "Change File" : "Browse Files"}
                  </label>
                  
                  {/* Upload Progress Bar */}
                  {uploading && (
                    <motion.div
                      className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                    >
                      <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={!file || uploading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Analyze Resume"
                    data-tooltip-id="tooltip-analyze"
                    data-tooltip-content="Full resume analysis with skills and job recommendations"
                  >
                    <span>Analyze Resume</span>
                    {file && !uploading && (
                      <motion.span
                        animate={{ 
                          scale: [1, 1.2, 1],
                          transition: { repeat: Infinity, duration: 2 }
                        }}
                      >
                        ✨
                      </motion.span>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handlePredictJobRole}
                    disabled={!file || uploading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Predict Job Role"
                    data-tooltip-id="tooltip-predict"
                    data-tooltip-content="Quick job role prediction only"
                  >
                    <span>Predict Job Role</span>
                    {file && !uploading && (
                      <motion.span
                        animate={{ 
                          rotate: [0, 360],
                          transition: { repeat: Infinity, duration: 3 }
                        }}
                      >
                        🔮
                      </motion.span>
                    )}
                  </motion.button>
                </div>
                
                {/* Features Info */}
                {file && (
                  <motion.div
                    className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-700 text-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h4 className="font-semibold mb-2">What you'll get:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Skills assessment and gap analysis</li>
                      <li>Job role recommendations</li>
                      <li>Resume strengths and weaknesses</li>
                      <li>Keyword optimization suggestions</li>
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Preview/Results Section */}
            <div
              className={`flex-1 p-6 ${analyzed ? "w-full" : "md:w-1/2"} bg-gray-50 ${
                isFullscreen ? "h-full overflow-y-auto" : "max-h-[calc(100%-2rem)] overflow-y-auto"
              }`}
            >
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-gray-600">Loading results...</span>
                  </div>
                }
              >
                {analyzed ? (
                  <ResumeAnalyzeResult
                    textAnalysis={textAnalysis}
                    jobPrediction={jobPrediction}
                    onBack={() => {
                      setAnalyzed(false);
                      setStep(1);
                    }}
                  />
                ) : file ? (
                  <motion.div
                    className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                      <span className="font-medium text-gray-700 truncate max-w-[70%]">
                        {file.raw.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.raw.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <iframe
                      src={`${file.preview}#toolbar=0&view=fitH`}
                      className="w-full h-[calc(100%-40px)] border-none"
                      title="Resume Preview"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-col items-center justify-center h-full text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <FiUpload size={48} className="text-gray-300 mb-4" />
                    <p className="text-center">Upload a PDF resume to see preview</p>
                    <p className="text-sm mt-2 text-gray-400">Supports standard PDF format</p>
                  </motion.div>
                )}
              </Suspense>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Tooltips */}
      <Tooltip id="tooltip-fullscreen" />
      <Tooltip id="tooltip-back" />
      <Tooltip id="tooltip-reset" />
      <Tooltip id="tooltip-analyze" />
      <Tooltip id="tooltip-predict" />
    </div>
  );
};

export default ResumeAnalyzer;