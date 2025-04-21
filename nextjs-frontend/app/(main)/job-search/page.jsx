'use client'

import { Suspense } from 'react'
import JobScraper from './_components/job-scraper'
import { Skeleton } from '@/components/ui/skeleton'

export default function JobSearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Job Search</h1> */}
      <h1 className="font-bold text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
     Smart Job Search
          </h1>
 
      <p className="text-muted-foreground mb-8">
        Find recent job postings from top platforms
      </p>
      
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      }>
        <JobScraper />
      </Suspense>
    </div>
  )
}