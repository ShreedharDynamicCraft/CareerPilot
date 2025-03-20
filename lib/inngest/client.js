import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "careerpilot", // Unique app ID
  name: "Careerpilot",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
