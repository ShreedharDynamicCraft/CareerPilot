"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiDownload, FiInfo, FiVideo, FiCode, FiTool } from "react-icons/fi";
import { jsPDF } from "jspdf";
import CircularScoreIndicator from "./CircularScoreIndicator";
import ScoreHeatmapBar from "./ScoreHeatmapBar";
import SkillRadarChart from "./SkillRadarChart";

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
  const [activeSkillTab, setActiveSkillTab] = useState('top');
  const [activeProjectTab, setActiveProjectTab] = useState('quality');

  const handleDownload = () => {
    const doc = new jsPDF();
    const indigo = [75, 0, 130];
    const purple = [128, 0, 128];
    const green = [0, 128, 0];
    const red = [255, 0, 0];
    doc.setFont("helvetica", "bold");

    doc.setFontSize(18);
    doc.setTextColor(...indigo);
    doc.text("Resume Analysis Report", 10, 10);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    let yOffset = 20;
    if (textAnalysis) {
      doc.setTextColor(...indigo);
      doc.setFont("helvetica", "bold");
      doc.text("Resume Score:", 10, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`${textAnalysis.score ?? 0}/100`, 50, yOffset);
      yOffset += 10;

      doc.setTextColor(...indigo);
      doc.setFont("helvetica", "bold");
      doc.text("ATS Parse Rate:", 10, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`${textAnalysis.ats_parse_rate ?? 0}%`, 50, yOffset);
      yOffset += 10;

      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Scores:", 10, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      ["content_score", "format_score", "sections_score", "skills_score"].forEach((key) => {
        doc.setTextColor(...(textAnalysis[key] >= 80 ? green : textAnalysis[key] >= 50 ? [255, 165, 0] : red));
        doc.text(`${key.replace("_", " ")}: ${textAnalysis[key] ?? 0}%`, 20, yOffset);
        yOffset += 10;
      });

      yOffset += 5;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Analysis Feedback:", 10, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      (textAnalysis.analysis || []).forEach((item) => {
        doc.setTextColor(...indigo);
        doc.text(`${item.category}:`, 20, yOffset);
        yOffset += 10;
        doc.setTextColor(0, 0, 0);
        doc.text(`Feedback: ${item.feedback || "N/A"}`, 30, yOffset);
        yOffset += 10;
        doc.text(`Suggestions: ${item.suggestions || "N/A"}`, 30, yOffset);
        yOffset += 15;
      });
    }

    if (textAnalysis?.skills_analysis) {
      yOffset += 5;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Skills Analysis:", 10, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");

      doc.setTextColor(...indigo);
      doc.text("Top Skills:", 20, yOffset);
      yOffset += 10;
      (textAnalysis.skills_analysis.top_skills || []).forEach((skill, i) => {
        doc.text(`${i + 1}. ${skill.name} (${skill.frequency}x)`, 30, yOffset);
        yOffset += 10;
      });

      yOffset += 5;
      doc.setTextColor(...indigo);
      doc.text("Recommended Skills:", 20, yOffset);
      yOffset += 10;
      (textAnalysis.skills_analysis.recommended_skills || []).forEach((skill) => {
        doc.text(`• ${skill}`, 30, yOffset);
        yOffset += 10;
      });
    }

    if (textAnalysis?.project_analysis) {
      yOffset += 5;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Project Analysis:", 10, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");

      doc.text(`Projects Found: ${textAnalysis.project_analysis.projects_found ?? 0}`, 20, yOffset);
      yOffset += 10;
      doc.text(`Quality Score: ${textAnalysis.project_analysis.project_quality_score ?? 0}/100`, 20, yOffset);
      yOffset += 10;

      doc.setTextColor(...indigo);
      doc.text("Project Impact:", 20, yOffset);
      yOffset += 10;
      (textAnalysis.project_analysis.project_impact || []).forEach((impact) => {
        const impactText = typeof impact === "string" ? impact : `${impact.project || "Unnamed"}: ${impact.impact || "N/A"}`;
        doc.text(`• ${impactText}`, 30, yOffset);
        yOffset += 10;
      });
    }

    if (jobPrediction) {
      yOffset += 10;
      doc.setTextColor(...purple);
      doc.setFont("helvetica", "bold");
      doc.text("Job Role Predictions:", 10, yOffset);
      yOffset += 10;
      doc.setTextColor(...indigo);
      doc.text(`Model: ${jobPrediction.trained_model?.job_role || "N/A"}`, 20, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.text(`(${jobPrediction.trained_model?.confidence || "0.00%"})`, 70, yOffset);
      yOffset += 10;
      doc.setTextColor(...indigo);
      doc.text(`Gemini: ${jobPrediction.gemini_prediction?.job_role || "N/A"}`, 20, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.text(`(${jobPrediction.gemini_prediction?.confidence || "0.00%"})`, 70, yOffset);
    }

    doc.save("resume_analysis_report.pdf");
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-b from-gray-50 to-indigo-50">
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

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card */}
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
            <div className="flex flex-col items-center">
              <CircularScoreIndicator score={textAnalysis.score ?? 0} />
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold text-indigo-700">
                  ATS Parse Rate: <span className="font-bold">{textAnalysis.ats_parse_rate ?? 0}%</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Machine readability score</p>
              </div>
            </div>
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
                      (textAnalysis[key] ?? 0) >= 80
                        ? "bg-green-200 text-green-800"
                        : (textAnalysis[key] ?? 0) >= 50
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {textAnalysis[key] ?? 0}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Right Column Content */}
        <motion.div
          className="col-span-1 lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
        >
          {/* Skills Analysis Section */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md border border-indigo-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FiTool className="text-indigo-500" /> Skills Analysis
            </h3>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`px-4 py-2 font-medium ${activeSkillTab === 'top' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveSkillTab('top')}
              >
                Top Skills
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeSkillTab === 'categories' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveSkillTab('categories')}
              >
                Categories
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeSkillTab === 'recommended' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveSkillTab('recommended')}
              >
                Recommended
              </button>
            </div>
            {textAnalysis?.skills_analysis ? (
              <>
                {activeSkillTab === 'top' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {textAnalysis.skills_analysis.top_skills?.length > 0 && textAnalysis.skills_analysis.top_skills[0].name !== "None Identified" ? (
                      textAnalysis.skills_analysis.top_skills.map((skill, i) => (
                        <div key={i} className="bg-indigo-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-indigo-700">{skill.name}</span>
                            <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                              {skill.frequency}x
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, skill.frequency * 20)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-2">No top skills identified in the resume.</p>
                    )}
                  </div>
                )}
                {activeSkillTab === 'categories' && (
                  <div className="space-y-4">
                    {textAnalysis.skills_analysis.skill_categories && Object.keys(textAnalysis.skills_analysis.skill_categories).length > 0 && Object.keys(textAnalysis.skills_analysis.skill_categories)[0] !== "General" ? (
                      Object.entries(textAnalysis.skills_analysis.skill_categories).map(([name, skills], i) => (
                        <div key={i}>
                          <h4 className="font-semibold text-indigo-700 mb-2">{name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, j) => (
                              <span key={j} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No skill categories identified.</p>
                    )}
                  </div>
                )}
                {activeSkillTab === 'recommended' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Recommended Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {textAnalysis.skills_analysis.recommended_skills?.length > 0 && textAnalysis.skills_analysis.recommended_skills[0] !== "Add relevant skills" ? (
                          textAnalysis.skills_analysis.recommended_skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No recommended skills provided.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {textAnalysis.skills_analysis.missing_industry_skills?.length > 0 && textAnalysis.skills_analysis.missing_industry_skills[0] !== "Unable to determine" ? (
                          textAnalysis.skills_analysis.missing_industry_skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No missing skills identified.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Skills analysis not available for this resume.</p>
            )}
          </motion.div>

          {/* Project Analysis Section - Fixed */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md border border-indigo-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FiCode className="text-indigo-500" /> Project Analysis
            </h3>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`px-4 py-2 font-medium ${activeProjectTab === 'quality' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveProjectTab('quality')}
              >
                Quality
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeProjectTab === 'impact' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveProjectTab('impact')}
              >
                Impact
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeProjectTab === 'improvements' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveProjectTab('improvements')}
              >
                Improvements
              </button>
            </div>
            {textAnalysis?.project_analysis ? (
              <>
                {activeProjectTab === 'quality' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-indigo-700">Projects Found</span>
                      <span className="text-xl font-bold text-gray-800">
                        {textAnalysis.project_analysis.projects_found ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-indigo-700">Quality Score</span>
                      <span className="text-xl font-bold text-gray-800">
                        {textAnalysis.project_analysis.project_quality_score ?? 0}/100
                      </span>
                    </div>
                    {textAnalysis.project_analysis.project_quality_description && (
                      <div className="mt-2 text-sm text-gray-600">
                        {textAnalysis.project_analysis.project_quality_description}
                      </div>
                    )}
                  </div>
                )}
                {activeProjectTab === 'impact' && (
                  <div className="space-y-3">
                    {textAnalysis.project_analysis.project_impact?.length > 0 ? (
                      textAnalysis.project_analysis.project_impact.map((impactItem, i) => (
                        <div key={i} className="bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 p-2 rounded-full">
                              <FiCode className="text-indigo-600" />
                            </div>
                            <div>
                              {typeof impactItem === 'string' ? (
                                <p className="text-sm text-gray-700">{impactItem}</p>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-indigo-700">
                                    {impactItem.project || 'Unnamed Project'}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {impactItem.impact || 'No impact specified'}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No project impact details available.</p>
                    )}
                  </div>
                )}
                {activeProjectTab === 'improvements' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-indigo-700 mb-2">Improvement Suggestions</h4>
                      {textAnalysis.project_analysis.improvement_suggestions?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                          {textAnalysis.project_analysis.improvement_suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No improvement suggestions provided.</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Missing Elements</h4>
                      {textAnalysis.project_analysis.missing_elements?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                          {textAnalysis.project_analysis.missing_elements.map((element, i) => (
                            <li key={i}>{element}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No missing elements identified.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Project analysis not available for this resume.</p>
            )}
          </motion.div>

          {/* Analysis Feedback Sections */}
          <AnimatePresence>
            {(textAnalysis.analysis || []).map((item, index) => (
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
                  {categoryIcons[item.category] || "📋"} {item.category}
                </h3>
                <p className="mt-2 text-purple-600">
                  <strong>Feedback:</strong> {item.feedback || "N/A"}
                </p>
                <p className="mt-2 text-purple-600">
                  <strong>Suggestions:</strong> {item.suggestions || "N/A"}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Job Prediction Section */}
   {/* Job Prediction Section */}
{jobPrediction && (
  <motion.div
    className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl shadow-md border border-indigo-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    transition={{ duration: 0.4, delay: 0.6 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
        🚀 Job Prediction <FiInfo className="text-indigo-500" title="Predicted roles based on your resume" />
      </h3>
      {jobPrediction.trained_model?.job_role === jobPrediction.gemini_prediction?.job_role && (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Consensus Match
        </span>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 p-2 rounded-full">
            <FiTool className="text-indigo-600" />
          </div>
          <h4 className="font-semibold text-indigo-700">ML Model Prediction</h4>
        </div>
        <p className="text-lg font-medium text-gray-800">
          {jobPrediction.trained_model?.job_role || "N/A"}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${parseFloat(jobPrediction.trained_model?.confidence || 0)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Confidence: {jobPrediction.trained_model?.confidence || "0.00%"}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-2 rounded-full">
            <FiTool className="text-purple-600" />
          </div>
          <h4 className="font-semibold text-purple-700">Gemini AI Prediction</h4>
        </div>
        <p className="text-lg font-medium text-gray-800">
          {jobPrediction.gemini_prediction?.job_role || "N/A"}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-purple-600 h-2.5 rounded-full" 
            style={{ width: `${parseFloat(jobPrediction.gemini_prediction?.confidence || 0)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Confidence: {jobPrediction.gemini_prediction?.confidence || "0.00%"}
        </p>
      </div>
    </div>

    {(jobPrediction.gemini_prediction?.recommended_skills?.length > 0 || 
      jobPrediction.gemini_prediction?.missing_skills?.length > 0) && (
      <div className="space-y-4">
        {jobPrediction.gemini_prediction?.recommended_skills?.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span>✅</span> Recommended Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {jobPrediction.gemini_prediction.recommended_skills.map((skill, i) => (
                <span key={`rec-${i}`} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {jobPrediction.gemini_prediction?.missing_skills?.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
              <span>⚠️</span> Skills to Improve
            </h4>
            <div className="flex flex-wrap gap-2">
              {jobPrediction.gemini_prediction.missing_skills.map((skill, i) => (
                <span key={`miss-${i}`} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </motion.div>
)}



          {/* Skills Visualization Section */}
   {/* Skills Visualization Section */}
<motion.div
  className="bg-white p-6 rounded-xl shadow-md border border-indigo-200 overflow-hidden relative"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.5, 
    delay: 0.7,
    ease: "easeOut" 
  }}
  whileHover={{ 
    boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)",
    borderColor: "rgba(79, 70, 229, 0.3)",
    y: -5
  }}
>
  {/* Background gradient accent */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-60" />
  
  <div className="relative">
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.9 }}
      className="flex items-center mb-5"
    >
      <motion.span 
        className="text-indigo-600 text-2xl mr-2"
        animate={{ rotate: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
      >
        📈
      </motion.span>
      <h3 className="text-xl font-bold text-indigo-700">Skills Visualization</h3>
    </motion.div>

    {textAnalysis?.skills_analysis?.top_skills?.length > 0 && 
     textAnalysis.skills_analysis.top_skills[0].name !== "None Identified" ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <SkillRadarChart
          skills={textAnalysis.skills_analysis.top_skills.map(skill => ({
            name: skill.name,
            value: skill.frequency
          }))}
          recommended={textAnalysis.skills_analysis.recommended_skills || []}
        />
        
        {/* Legend */}
        <motion.div 
          className="flex justify-center mt-4 space-x-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.3 }}
        >
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-sm text-gray-700">Current Skills</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></div>
            <span className="text-sm text-gray-700">Recommended Skills</span>
          </div>
        </motion.div>
      </motion.div>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="flex flex-col items-center justify-center py-8"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 3
          }}
          className="text-4xl mb-3 text-gray-300"
        >
          🔍
        </motion.div>
        <p className="text-gray-500 text-center">No skills data available for visualization.</p>
        <button className="mt-4 text-indigo-600 text-sm hover:text-indigo-800 transition-colors">
          Re-analyze text
        </button>
      </motion.div>
    )}
  </div>
</motion.div>



          {/* Recommended Videos Section */}
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
                  className={`text-2xl cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
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
                Thank you for your feedback! We're glad to help.
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeAnalyzeResult;