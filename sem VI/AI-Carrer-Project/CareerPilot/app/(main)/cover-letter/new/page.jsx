import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";

export default function NewCoverLetterPage() {
  return (
    <div className="container mx-auto pt-20 px-4 max-w-4xl min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <Link href="/cover-letter">
          <Button
            variant="ghost"
            className="gap-2 pl-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary hidden sm:block" />
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Craft Cover Letter
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize a professional cover letter that highlights your qualifications
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6">
          <CoverLetterGenerator />
        </div>
      </div>

      {/* Simple Tip Banner */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <span className="font-medium">Pro tip:</span> Tailor your cover letter to match the job requirements and company culture for the best results.
        </p>
      </div>
    </div>
  );
}