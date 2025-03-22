"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Copy, CheckCircle } from "lucide-react"; // Import icons

const CoverLetterPreview = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset copied state after 3s
      })
      .catch((error) => console.error("Failed to copy text:", error));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">📄 Cover Letter Preview</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Markdown Preview */}
      <MDEditor value={content} preview="preview" height={800} className="rounded-md border border-gray-300" />
    </div>
  );
};

export default CoverLetterPreview;
