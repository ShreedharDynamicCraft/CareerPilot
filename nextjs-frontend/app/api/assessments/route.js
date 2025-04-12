import { getAssessments } from "@/actions/interview";

export async function GET() {
  try {
    const assessments = await getAssessments();
    return Response.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}