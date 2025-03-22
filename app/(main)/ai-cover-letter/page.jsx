import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-5xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary hidden md:block" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                My Cover Letters
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
            Easily create and manage personalized cover letters for your job applications.
            </p>
          </div>
          
          <Link href="/ai-cover-letter/new">
            <Button size="lg" className="shadow-sm hover:shadow transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 my-2"></div>

        {coverLetters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No cover letters yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first personalized cover letter to highlight your skills and experience for job applications
            </p>
            <Link href="/ai-cover-letter/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
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