import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  const resume = await getResume();  // Server pe data fetch ho raha hai

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
