import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const jobRole = searchParams.get('job_role');
    const location = searchParams.get('location');
    const limit = searchParams.get('limit') || 15;
    
    // Validate required parameters
    if (!jobRole || !location) {
      return NextResponse.json(
        { error: 'Job role and location are required parameters' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    console.log(`Sending request to ${backendUrl}/api/jobs/recent-jobs with params: ${jobRole}, ${location}`);
    
    const response = await fetch(
      `${backendUrl}/api/jobs/recent-jobs?job_role=${encodeURIComponent(jobRole)}&location=${encodeURIComponent(location)}&limit=${limit}`,
      { 
        cache: 'no-store',  // Disable caching to ensure real-time results
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error (${response.status}): ${errorText}`);
      throw new Error(`Backend API returned ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    
    // Add timestamp for debugging/monitoring
    return NextResponse.json({
      ...data,
      _meta: {
        timestamp: new Date().toISOString(),
        params: { jobRole, location, limit }
      }
    });
  } catch (error) {
    console.error('Error in recent jobs API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent job listings',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
