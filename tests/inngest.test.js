import { inngest } from '../lib/inngest';

// Test event trigger
async function testInngestFlow() {
  try {
    // Trigger the industry insights generation
    const response = await inngest.send({
      name: "industry/generate.insights",
      data: {
        industry: "Technology",
        timeframe: "2024"
      }
    });
    
    console.log("Event sent:", response);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the test
testInngestFlow();
