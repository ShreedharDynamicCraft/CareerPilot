import { serve } from "inngest/next";
import { inngest, generateInsightsFunction } from "@/lib/inngest";

// Create a Next.js API route handler with specific configuration
export const { GET, POST } = serve({
  client: inngest,
  functions: [generateInsightsFunction],
  serving: {
    streaming: true,
    maxResponseSize: '5mb'
  }
});
