// lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis; // Using globalThis instead of global

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Named export for consistent usage
export const db = prisma;
// Default export for backward compatibility
export default prisma;

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.