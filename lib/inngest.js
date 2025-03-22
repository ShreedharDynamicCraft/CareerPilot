import { Inngest } from "inngest";
import { generateIndustryInsights } from "@/actions/industry-insights";

if (!process.env.INNGEST_EVENT_KEY) {
  throw new Error("INNGEST_EVENT_KEY is required");
}

// Initialize Inngest with required configuration
export const inngest = new Inngest({
  id: "career-pilot-app", // Unique identifier for your app
  eventKey: process.env.INNGEST_EVENT_KEY, // Add this to your .env file
  options: {
    maxRetries: 3,
    timeout: '30s'
  }
});

// Define the function with proper typing
export const generateInsightsFunction = inngest.createFunction(
  { 
    id: "generate-industry-insights", // Unique function identifier
    name: "Generate Industry Insights" 
  },
  { event: "industry/generate.insights" },
  async ({ event, step }) => {
    const result = await generateIndustryInsights(event.data);
    return { 
      id: event.id,
      data: result 
    };
  }
);
