import { NextResponse } from 'next/server'
import { scrapeLinkedInJobs } from '@/lib/scrapers/linkedin'
import { scrapeIndeedJobs } from '@/lib/scrapers/indeed'
import { scrapeInternshalaJobs } from '@/lib/scrapers/internshala'
import { rateLimiter } from '@/lib/utils'

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const limiter = await rateLimiter.limit(ip)
    if (!limiter.success) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { role, location, platforms = ['linkedin', 'indeed', 'internshala'] } = await request.json()

    if (!role) {
      return NextResponse.json(
        { message: 'Job role is required' },
        { status: 400 }
      )
    }

    console.log(`Searching for ${role} jobs in ${location || 'any location'}`)

    const scrapers = {
      linkedin: scrapeLinkedInJobs,
      indeed: scrapeIndeedJobs,
      internshala: scrapeInternshalaJobs
    }

    // Create an array of valid platforms to scrape
    const validPlatforms = platforms.filter(p => scrapers[p])

    if (validPlatforms.length === 0) {
      return NextResponse.json(
        { message: 'No valid platforms specified' },
        { status: 400 }
      )
    }

    const results = await Promise.allSettled(
      validPlatforms.map(platform => 
        scrapers[platform](role, location)
          .catch(e => {
            console.error(`Error scraping ${platform}:`, e)
            return []
          })
      )
    )

    const jobs = results
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          const platformJobs = result.value || []
          console.log(`Found ${platformJobs.length} jobs from ${validPlatforms[index]}`)
          return platformJobs
        } else {
          console.error(`Failed to get jobs from ${validPlatforms[index]}: ${result.reason}`)
          return []
        }
      })
      .flat()
      .filter(Boolean)

    // If no jobs found across all platforms
    if (jobs.length === 0) {
      return NextResponse.json({ 
        jobs: [],
        message: "No jobs found at this time. Our scrapers could not retrieve real-time job listings. Please try a different job role or location, or check back later.",
        stats: {
          total: 0,
          sources: validPlatforms.reduce((acc, platform) => {
            acc[platform] = 0;
            return acc;
          }, {})
        }
      })
    }

    return NextResponse.json({ 
      jobs,
      stats: {
        total: jobs.length,
        sources: validPlatforms.reduce((acc, platform, i) => {
          const result = results[i];
          acc[platform] = result.status === 'fulfilled' ? (result.value || []).length : 0;
          return acc;
        }, {})
      }
    })
  } catch (error) {
    console.error('Job scraping error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error.message,
        jobs: [] 
      },
      { status: 500 }
    )
  }
}