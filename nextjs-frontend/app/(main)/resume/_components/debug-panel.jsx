"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bug, ClipboardCopy } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";

const DebugPanel = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { copyToClipboard } = useClipboard();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg"
      >
        <Bug className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-white rounded-lg shadow-xl border max-w-md max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Debug Information</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
            >
              <ClipboardCopy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;