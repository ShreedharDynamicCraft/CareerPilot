import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.error("User email not found");
      return null;
    }

    // Use upsert to handle both creation and existing user cases
    const loggedInUser = await db.user.upsert({
      where: { email: email },
      update: {
        clerkId: user.id, // Update clerkId if user exists but clerkId is different
      },
      create: {
        clerkId: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        imageUrl: user.imageUrl,
        email: email,
      },
    });

    return loggedInUser;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};