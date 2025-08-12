"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");

  console.log("UpdateUser called with data:", data);

  try {
    // Handle industry creation first, separately from user update
    if (data.industry) {
      console.log("Processing industry:", data.industry);
      
      // Check if industry insight exists
      let industryInsight = await db.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      // Create industry insight if it doesn't exist
      if (!industryInsight) {
        console.log("Creating new industry insight for:", data.industry);
        
        try {
          // Create a basic industry insight
          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRanges: [
                { role: "Entry Level", min: 300000, max: 600000, median: 450000, location: "Bangalore" },
                { role: "Mid Level", min: 600000, max: 1200000, median: 900000, location: "Mumbai" },
                { role: "Senior Level", min: 1200000, max: 2500000, median: 1800000, location: "Delhi NCR" },
              ],
              growthRate: 8.5,
              demandLevel: "High",
              topSkills: ["Communication", "Problem Solving", "Technical Skills", "Leadership"],
              marketOutlook: "Positive",
              keyTrends: ["Digital Transformation", "Remote Work", "Automation", "AI Integration"],
              recommendedSkills: ["Digital Literacy", "Data Analysis", "Project Management", "Adaptability"],
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          console.log("Created basic industry insight successfully");
        } catch (createError) {
          console.error("Failed to create industry insight:", createError);
          // If we can't create the industry insight, proceed without industry
          data = { ...data };
          delete data.industry;
        }
      }
    }

    // Now update the user in a single operation
    const updateData = {
      experience: data.experience,
      bio: data.bio,
      skills: data.skills,
      onboardingCompleted: data.onboardingCompleted !== undefined ? data.onboardingCompleted : user.onboardingCompleted,
    };

    // Only add industry if we successfully have an insight for it
    if (data.industry) {
      updateData.industry = data.industry;
    }

    console.log("Updating user with data:", updateData);
    
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
    });

    console.log("User updated successfully");
    revalidatePath("/");
    
    // Try to enhance with AI data asynchronously after successful update
    if (data.industry) {
      generateAIInsights(data.industry)
        .then(async (insights) => {
          try {
            await db.industryInsight.update({
              where: { industry: data.industry },
              data: {
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
            console.log("Enhanced industry insight with AI data");
          } catch (updateError) {
            console.log("Industry insight already up to date or couldn't be enhanced:", updateError.message);
          }
        })
        .catch((error) => {
          console.log("Failed to enhance with AI data, keeping basic data:", error.message);
        });
    }
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      if (!clerkClient || !clerkClient.users || !clerkClient.users.getUser) {
        throw new Error("Clerk client is not properly initialized");
      }
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (!email) {
        throw new Error("User email not found");
      }

      // Use upsert to handle both creation and existing user cases
      user = await db.user.upsert({
        where: { email: email },
        update: {
          clerkId: userId, // Update clerkId if user exists but clerkId is different
        },
        create: {
          clerkId: userId,
          email: email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          onboardingCompleted: false,
        },
      });
    }

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

export async function getUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    let user = await db.user.findUnique({
      where: { clerkId: userId },
      select : {
        id: true,
        name: true,
        email: true,
        industry: true,
        experience: true,
        skills: true,
        bio: true,
        onboardingCompleted: true,
      }
    });

    if (!user) {
      if (!clerkClient || !clerkClient.users || !clerkClient.users.getUser) {
        throw new Error("Clerk client is not properly initialized");
      }
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (!email) {
        throw new Error("User email not found");
      }

      // Use upsert to handle both creation and existing user cases
      user = await db.user.upsert({
        where: { email: email },
        update: {
          clerkId: userId, // Update clerkId if user exists but clerkId is different
        },
        create: {
          clerkId: userId,
          email: email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          onboardingCompleted: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          industry: true,
          experience: true,
          skills: true,
          bio: true,
          onboardingCompleted: true,
        }
      });
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user data");
  }
}

