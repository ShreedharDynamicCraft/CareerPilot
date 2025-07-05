"use client";

import { useEffect } from "react";
import { pingBackend } from "@/utils/pingBackend";

export default function MainLayout({ children }) {
  useEffect(() => {
    // Ping backend every 5 minutes
    pingBackend(); // initial ping
    const interval = setInterval(pingBackend, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 