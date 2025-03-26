import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") // yeh check krega kya hum production mode me hai ya nahi like agar hum development mode me hai toh yeh code chalega
  
  {
  globalThis.prisma = db; // yeh global variable banayega prisma jo ki db se equal hoga
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.