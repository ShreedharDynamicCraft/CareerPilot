import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if we can connect to the database
    await db.$queryRaw`SELECT 1`;
    
    // Check if Clerk is working
    const { userId } = await auth();
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      clerk: userId ? "authenticated" : "not authenticated",
      userId: userId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug route error:", error);
    return NextResponse.json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 