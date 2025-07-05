"use client";

import { useEffect } from "react";
import { pingBackend } from "@/utils/pingBackend";

export default function MainLayout({ children }) {
  useEffect(() => {
    // Ping backend every 5 minutes
    pingBackend(); // initial ping
    const interval = setInterval(pingBackend, 5 * 60 * 1000);
    
    // Add error handling for any unhandled errors
    const handleError = (error) => {
      console.error("Unhandled error in layout:", error);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 