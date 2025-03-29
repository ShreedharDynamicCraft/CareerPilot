'use client';
import { useState, useEffect } from 'react';
import { resumeSchema } from '@/app/lib/schema';

export const useResumeData = (initialData = null) => {
  const [resumeData, setResumeData] = useState(() => {
    // Default empty data - this runs on both server and client
    const defaultData = {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
      achievements: "",
      languages: "",
    };

    // Only access localStorage on client side
    if (typeof window === 'undefined') return defaultData;

    // First try to load from database
    if (initialData?.structuredData) {
      try {
        return JSON.parse(initialData.structuredData);
      } catch (error) {
        console.error("Error parsing structured data", error);
      }
    }
    
    // Fallback to localStorage
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const validated = resumeSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      } catch (error) {
        console.error('Failed to parse saved data', error);
      }
    }
    
    return defaultData;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeData) {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }
  }, [resumeData]);

  const saveResumeData = (data) => {
    const validated = resumeSchema.safeParse(data);
    if (validated.success) {
      setResumeData(validated.data);
      return validated;
    }
    return { success: false, error: validated.error };
  };

  return { resumeData, loading, saveResumeData };
};