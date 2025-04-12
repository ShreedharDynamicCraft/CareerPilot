import { NextResponse } from 'next/server';
import { mockJobs } from '@/app/(main)/job-search/_data/mock-jobs';

// This is a simulated API endpoint for job search
// In a real implementation, this would connect to various job APIs or use web scraping

export async function GET(request) {
  try {
    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const jobType = searchParams.get('jobType')?.split(',') || [];
    const experienceLevel = searchParams.get('experienceLevel')?.split(',') || [];
    const salary = searchParams.get('salary') ? parseInt(searchParams.get('salary')) : null;
    const datePosted = searchParams.get('datePosted') ? parseInt(searchParams.get('datePosted')) : null;
    const remoteOnly = searchParams.get('remoteOnly') === 'true';
    const source = searchParams.get('source') || 'all';
    
    // Filter jobs based on search parameters
    let filteredJobs = [...mockJobs];
    
    // Apply text search filter
    if (query) {
      const queryLower = query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(queryLower) ||
        job.company.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower)
      );
    }
    
    // Apply location filter
    if (location) {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Apply job type filter
    if (jobType.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        jobType.includes(job.jobType)
      );
    }
    
    // Apply experience level filter
    if (experienceLevel.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        experienceLevel.includes(job.experienceLevel)
      );
    }
    
    // Apply remote only filter
    if (remoteOnly) {
      filteredJobs = filteredJobs.filter(job => job.remote);
    }
    
    // Apply date posted filter
    if (datePosted) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - datePosted);
      
      filteredJobs = filteredJobs.filter(job => {
        const postDate = new Date(job.postedDate);
        return postDate >= cutoffDate;
      });
    }
    
    // Apply salary filter
    if (salary) {
      filteredJobs = filteredJobs.filter(job => 
        job.salaryMax >= salary
      );
    }
    
    // Apply source filter
    if (source !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.source.toLowerCase() === source.toLowerCase()
      );
    }
    
    // In a real implementation, this would be where you'd call external APIs
    // or run web scraping functions to get real job data from different sources
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      count: filteredJobs.length,
      sources: {
        linkedin: filteredJobs.filter(job => job.source === 'linkedin').length,
        indeed: filteredJobs.filter(job => job.source === 'indeed').length,
        glassdoor: filteredJobs.filter(job => job.source === 'glassdoor').length,
        google: filteredJobs.filter(job => job.source === 'google').length,
      }
    });
  } catch (error) {
    console.error('Error in job search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}