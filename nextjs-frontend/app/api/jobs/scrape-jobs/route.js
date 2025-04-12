import { NextResponse } from 'next/server';

// This is a proxy API route that forwards requests to the backend job scraper
export async function GET(request) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const jobRole = searchParams.get('job_role');
    const location = searchParams.get('location');
    
    // Validate required parameters
    if (!jobRole || !location) {
      return NextResponse.json(
        { error: 'Job role and location are required parameters' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend API
    // In a production environment, you would use an environment variable for the backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/api/jobs/scrape-jobs?job_role=${encodeURIComponent(jobRole)}&location=${encodeURIComponent(location)}`,
      { next: { revalidate: 0 } } // Disable caching to ensure real-time results
    );
    
    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in job scraping API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job listings', message: error.message },
      { status: 500 }
    );
  }
}