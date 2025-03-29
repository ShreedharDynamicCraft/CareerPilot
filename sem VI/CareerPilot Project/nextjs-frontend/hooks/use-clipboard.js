// hooks/use-clipboard.js
'use client';

import { useState } from 'react';

export const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  };

  return { copyToClipboard, isCopied };
};