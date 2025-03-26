"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiDownload, FiInfo, FiVideo } from "react-icons/fi";
import { jsPDF } from "jspdf";
import CircularScoreIndicator from "./CircularScoreIndicator";
import ScoreHeatmapBar from "./ScoreHeatmapBar";

const categoryIcons = {
  "Content Suggestions": "✅",
  "Spelling & Grammar": "🔤",
  "Resume Length": "📄",
  "Personal Details": "🆔",
  "Formatting Tips": "🎨",
};

const youtubeRecommendations = [
  {
    title: "How to Write a Resume for CSE Students",
    url: "https://www.youtube.com/watch?v=example_cse",
    description: "A detailed guide for Computer Science students.",
  },
  {
    title: "ECE Resume Tips for Freshers",
    url: "https://www.youtube.com/watch?v=example_ece",
    description: "Tailored advice for Electronics and Communication Engineering.",
  },
  {
    title: "Perfect Resume in 10 Minutes",
    url: "https://www.youtube.com/watch?v=example_general",
    description: "Quick tips for all fields!",
  },
];

const ResumeAnalyzeResult = ({ textAnalysis, jobPrediction, onBack }) => {
  const [rating, setRating] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Set Colors and Fonts
    const indigo = [75, 0, 130];
    const purple = [128, 0, 128];
    const green = [0, 128, 0];
    const red = [255, 0, 0];
    doc.setFont("helvetica", "bold");
  
    // Title
    doc.setFontSize(18);
    doc.setTextColor(...indigo);
    doc.text("Resume Analysis Report", 10, 10);
  
    // Reset for Body
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
  
    let yOffset = 20;
    if (textAnalysis) {
      // Resume Score
      doc.setTextColor(...indigo);
      doc.setFont("helvetica", "bold");
      doc.text("Resume Score:", 10, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`${textAnalysis.score}/100`, 50, yOffset);
      yOffset += 10;
  
      // ATS Parse Rate
      doc.setTextColor(...indigo);
      doc.setFont("helvetica", "bold");
      doc.text("ATS Parse Rate:", 10, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`${textAnalysis.ats_parse_rate}%`, 50, yOffset);
      yOffset += 10;
  
      // Detailed Scores
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Scores:", 10, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      ["content_score", "format_score", "sections_score", "skills_score"].forEach((key) => {
        doc.setTextColor(...(textAnalysis[key] >= 80 ? green : textAnalysis[key] >= 50 ? [255, 165, 0] : red));
        doc.text(`${key.replace("_", " ")}: ${textAnalysis[key]}%`, 20, yOffset);
        yOffset += 10;
      });
  
      // Analysis Feedback
      yOffset += 5;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Analysis Feedback:", 10, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      textAnalysis.analysis.forEach((item) => {
        doc.setTextColor(...indigo);
        doc.text(`${item.category}:`, 20, yOffset);
        yOffset += 10;
        doc.setTextColor(0, 0, 0);
        doc.text(`Feedback: ${item.feedback}`, 30, yOffset);
        yOffset += 10;
        doc.text(`Suggestions: ${item.suggestions}`, 30, yOffset);
        yOffset += 15;
      });
  
      // Additional Insights
      yOffset += 5;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Additional Insights:", 10, yOffset);
      yOffset += 10;
      doc.setTextColor(...green);
      doc.text("ATS Tips:", 20, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.text("Use standard fonts, avoid tables, add keywords.", 40, yOffset);
      yOffset += 10;
      doc.text("Resume vs ATS: Resume Score is quality; ATS is readability.", 20, yOffset);
    }
  
    if (jobPrediction) {
      yOffset += 10;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Job Role Predictions:", 10, yOffset);
      yOffset += 10;
      doc.setTextColor(...indigo);
      doc.text(`Model: ${jobPrediction.trained_model.job_role}`, 20, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.text(`(${jobPrediction.trained_model.confidence})`, 70, yOffset);
      yOffset += 10;
      doc.setTextColor(...indigo);
      doc.text(`Gemini: ${jobPrediction.gemini_prediction.job_role}`, 20, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.text(`(${jobPrediction.gemini_prediction.confidence})`, 70, yOffset);
      yOffset += 10;
      doc.setTextColor(...green);
      doc.text("Confidence:", 20, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.text("How certain the prediction is (higher = better).", 40, yOffset);
    }
  
    doc.save("resume_analysis_report.pdf");
  };


  
  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-gray-50 to-indigo-50">
      {/* Header */}
      <motion.div
        className="sticky top-0 bg-white z-20 p-4 border-b border-indigo-200 flex items-center justify-between shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to upload"
        >
          <FiChevronLeft size={20} /> Back
        </motion.button>
        <h2 className="text-2xl font-extrabold text-indigo-800 tracking-tight">Analysis Results</h2>
        <motion.button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Download Report as PDF"
        >
          <FiDownload size={20} /> Download PDF
        </motion.button>
      </motion.div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Score Section */}
        {textAnalysis && (
          <motion.div
            className="col-span-1 bg-white p-6 rounded-xl shadow-xl border border-indigo-100"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
              Resume Score <FiInfo className="text-indigo-500" title="Overall resume quality" />
            </h3>
            <CircularScoreIndicator score={textAnalysis.score} />
            <div className="mt-6 space-y-4">
              {["content_score", "format_score", "sections_score", "skills_score"].map((key) => (
                <motion.div
                  key={key}
                  className="flex justify-between items-center"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-indigo-700 capitalize font-medium">{key.replace("_", " ")}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      textAnalysis[key] >= 80
                        ? "bg-green-200 text-green-800"
                        : textAnalysis[key] >= 50
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {textAnalysis[key]}%
                  </span>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">
              <strong className="text-indigo-800">Resume Score:</strong> Measures overall quality (0-100).<br />
              <strong className="text-indigo-800">ATS Score:</strong> Indicates machine-readability for Applicant Tracking Systems.
            </p>
            {textAnalysis.ats_parse_rate < 70 && (
              <motion.p
                className="mt-2 text-sm text-red-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <strong>Low ATS Score?</strong> Boost it with:
                <ul className="list-disc ml-4 text-red-500">
                  <li>Use standard fonts (e.g., Arial, Times New Roman)</li>
                  <li>Avoid tables or graphics</li>
                  <li>Add job-specific keywords</li>
                </ul>
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          className="col-span-1 lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
        >
          {textAnalysis && (
            <>
              {/* ATS Parse Rate */}
              <motion.div
                className="bg-indigo-50 p-6 rounded-xl shadow-md border border-indigo-200"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                  📊 ATS Parse Rate <FiInfo className="text-indigo-500" title="Machine-readability score" />
                </h3>
                <ScoreHeatmapBar score={textAnalysis.ats_parse_rate} />
                <p className="mt-4 text-indigo-600 font-semibold">
                  ATS Success: <strong>{textAnalysis.ats_parse_rate}%</strong>
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <strong className="text-indigo-800">What is ATS?</strong> Applicant Tracking Systems filter resumes for employers. A high score ensures your resume gets noticed!
                </p>
              </motion.div>

              {/* Analysis Feedback */}
              <AnimatePresence>
                {textAnalysis.analysis.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-purple-50 p-6 rounded-xl shadow-md border border-purple-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                      {categoryIcons[item.category]} {item.category}
                    </h3>
                    <p className="mt-2 text-purple-600">
                      <strong>Feedback:</strong> {item.feedback}
                    </p>
                    <p className="mt-2 text-purple-600">
                      <strong>Suggestions:</strong> {item.suggestions}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}

          {/* Job Prediction */}
          {jobPrediction && (
            <motion.div
              className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl shadow-md border border-indigo-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                🚀 Job Prediction <FiInfo className="text-indigo-500" title="Predicted roles based on your resume" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-indigo-600 font-medium">
                  <strong>Model:</strong> {jobPrediction.trained_model.job_role} (
                  {jobPrediction.trained_model.confidence})
                </p>
                <p className="text-purple-600 font-medium">
                  <strong>Gemini:</strong> {jobPrediction.gemini_prediction.job_role} (
                  {jobPrediction.gemini_prediction.confidence})
                </p>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                <strong className="text-indigo-800">What is Confidence?</strong> The likelihood (in %) that this role fits your resume. Higher confidence = stronger match!
              </p>
              <motion.p
                className="mt-2 text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <strong className="text-green-600">Pro Tip:</strong>{" "}
                {parseFloat(jobPrediction.gemini_prediction.confidence) < 80 ? (
                  <span className="text-orange-600">
                    Boost confidence by adding skills like{" "}
                    <strong>{jobPrediction.gemini_prediction.job_role}-specific keywords</strong> (e.g., Python for Software Engineer).
                  </span>
                ) : (
                  <span className="text-green-600">
                    Great match! Polish your resume to seal the deal.
                  </span>
                )}
              </motion.p>
            </motion.div>
          )}

          {/* Additional Features: Resume Tips */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md border border-indigo-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <h3
              className="text-lg font-semibold text-indigo-700 mb-4 cursor-pointer flex items-center gap-2"
              onClick={() => setShowTips(!showTips)}
            >
              💡 Resume Improvement Tips{" "}
              <motion.span animate={{ rotate: showTips ? 180 : 0 }} transition={{ duration: 0.3 }}>
                ▼
              </motion.span>
            </h3>
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-700">
                    <span className="text-green-500 font-semibold">✓ Quantify Achievements:</span> E.g., "Increased sales by 20%."
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="text-blue-500 font-semibold">✓ Tailor Your Resume:</span> Match skills to the job description.
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="text-purple-500 font-semibold">✓ Keep It Concise:</span> Aim for 1-2 pages max.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* YouTube Recommendations */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md border border-indigo-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              🎥 Recommended Videos <FiVideo className="text-indigo-500" />
            </h3>
            <div className="space-y-4">
              {youtubeRecommendations.map((video, index) => (
                <motion.a
                  key={index}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                  whileHover={{ scale: 1.03, x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-indigo-700 font-medium">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.description}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Rating Section */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md border border-indigo-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">⭐ Rate this Analysis</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl cursor-pointer ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </motion.span>
              ))}
            </div>
            {rating > 0 && (
              <motion.p
                className="mt-2 text-sm text-green-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Thank you for your feedback! We’re glad to help.
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalyzeResult;