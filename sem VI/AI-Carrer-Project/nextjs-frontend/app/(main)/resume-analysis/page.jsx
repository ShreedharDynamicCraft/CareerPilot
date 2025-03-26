"use client";

import { useState, lazy, Suspense } from "react";
import axios from "axios";
import { FiChevronLeft, FiUpload, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
const ResumeAnalyzeResult = lazy(() => import("./_component/ResumeAnalyzeResult"));

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [textAnalysis, setTextAnalysis] = useState(null);
  const [jobPrediction, setJobPrediction] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [step, setStep] = useState(1);

  const handleUpload = (event) => {
    const uploadedFile = event.target.files[0] || event.dataTransfer.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setUploading(true);
      setProgress(0);
      const fileURL = URL.createObjectURL(uploadedFile);
      setFile({ raw: uploadedFile, preview: fileURL });

      let progressInterval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(progressInterval);
            setUploading(false);
            return 100;
          }
          return oldProgress + 10;
        });
      }, 200);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-indigo-500");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500");
    handleUpload(e);
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a PDF first.");
    setLoading(true);
    setStep(2);
    try {
      const formData = new FormData();
      formData.append("file", file.raw);
      const [analysisRes, predictionRes] = await Promise.all([
        axios.post("http://127.0.0.1:8000/upload_resume/", formData),
        axios.post("http://127.0.0.1:8000/predict_job_role/", formData),
      ]);
      setTextAnalysis(analysisRes.data.analysis);
      setJobPrediction(predictionRes.data);
      setAnalyzed(true);
      setStep(3);
    } catch (error) {
      console.error("Error:", error);
      alert("Analysis failed. Try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictJobRole = async () => {
    if (!file) return alert("Please upload a PDF first.");
    setLoading(true);
    setStep(2);
    try {
      const formData = new FormData();
      formData.append("file", file.raw);
      const result = await axios.post("http://127.0.0.1:8000/predict_job_role/", formData);
      setJobPrediction(result.data);
      setTextAnalysis(null);
      setAnalyzed(true);
      setStep(3);
    } catch (error) {
      console.error("Error:", error);
      alert("Prediction failed. Try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8">
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 border-4 border-t-indigo-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full transition-all duration-500 ${
          isFullscreen ? "fixed inset-0 m-0 rounded-none" : "m-4 md:m-8 max-w-6xl"
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center shadow-md">
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Resume Analyzer</h1>
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full hover:bg-indigo-700 transition-all duration-300 text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFullscreen ? <FiMinimize2 size={24} /> : <FiMaximize2 size={24} />}
          </motion.button>
        </div>

        <div className={`flex justify-center gap-4 ${isFullscreen ? "mt-20" : "my-6"}`}>
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className={`w-12 h-2 rounded-full ${
                step >= s ? "bg-indigo-600" : "bg-gray-300"
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: step >= s ? 1 : 0.8 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <div
          className={`flex flex-col md:flex-row ${
            isFullscreen ? "h-screen pt-20 overflow-y-auto" : "h-[calc(100%-8rem)]"
          }`}
        >
          {!analyzed && (
            <motion.div
              className="w-full md:w-1/2 p-6 flex flex-col gap-6"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
            >
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors animate-pulse animate-duration-1000 animate-ease-in-out"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FiUpload className="mx-auto text-4xl text-indigo-500 mb-4" />
                <p className="text-gray-600 mb-4">Drag & Drop or Click to Upload PDF</p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Browse Files
                </label>
                {uploading && (
                  <motion.div
                    className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                  >
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </motion.div>
                )}
              </div>
              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={handleAnalyze}
                  disabled={!file}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-indigo-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Analyze Resume"
                >
                  Analyze Resume
                </motion.button>
                <motion.button
                  onClick={handlePredictJobRole}
                  disabled={!file}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-purple-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Predict Job Role"
                >
                  Predict Job Role
                </motion.button>
              </div>
            </motion.div>
          )}

          <div
            className={`flex-1 p-6 ${analyzed ? "w-full" : "md:w-1/2"} bg-gray-50 ${
              isFullscreen ? "h-full" : ""
            }`}
          >
            <Suspense fallback={<p>Loading results...</p>}>
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
                <iframe
                  src={`${file.preview}#toolbar=0&view=fitH`}
                  className="w-full h-full border-none rounded-lg"
                  title="Resume Preview"
                />
              ) : (
                <p className="text-gray-500 text-center mt-20">Upload a PDF to see preview</p>
              )}
            </Suspense>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeAnalyzer;