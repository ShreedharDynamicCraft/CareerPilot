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

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return result.updatedUser;
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

