import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  // Verify the request is from Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const industries = await db.industryInsight.findMany({
      select: { industry: true },
    });

    for (const { industry } of industries) {
      const prompt = `
        Analyze the current state of the ${industry} industry...
        // ...existing prompt code...
      `;

      const res = await model.generateContent(prompt);
      const insights = JSON.parse(res.response.text.trim());

      await db.industryInsight.update({
        where: { industry },
        data: {
          ...insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Configure Vercel Cron
export const config = {
  maxDuration: 300, // 5 minutes
};
