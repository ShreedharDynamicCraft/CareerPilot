import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Create a simpler in-memory rate limiter to avoid Redis dependency issues
const inMemoryStore = new Map();

export const rateLimiter = {
  limit: async (identifier) => {
    const now = Date.now();
    const windowMs = 10000; // 10 seconds
    const maxRequests = 5;
    
    // Clean up old entries
    if (!inMemoryStore.has(identifier)) {
      inMemoryStore.set(identifier, []);
    }
    
    const requests = inMemoryStore.get(identifier);
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    inMemoryStore.set(identifier, validRequests);
    
    // Check if under limit
    if (validRequests.length < maxRequests) {
      validRequests.push(now);
      return { success: true, limit: maxRequests, remaining: maxRequests - validRequests.length };
    } else {
      return { success: false, limit: maxRequests, remaining: 0 };
    }
  }
};