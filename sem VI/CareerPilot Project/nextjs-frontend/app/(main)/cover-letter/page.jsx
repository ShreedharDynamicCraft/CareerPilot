import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();
  console.log("Cover letters fetched:", coverLetters.length); // Debug log

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl min-h-screen py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <FileText className="h-10 w-10 text-primary hidden md:block" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                My Cover Letters
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-md">
              Effortlessly craft and manage tailored cover letters to boost your job applications.
            </p>
          </div>

          <Link href="/cover-letter/new">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New
            </Button>
          </Link>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-4"></div>

        {coverLetters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No Cover Letters Yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start by creating a personalized cover letter to showcase your skills and experience.
            </p>
            <Link href="/cover-letter/new">
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Cover Letter
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <CoverLetterList coverLetters={coverLetters} />
          </div>
        )}
      </div>
    </div>
  );
}