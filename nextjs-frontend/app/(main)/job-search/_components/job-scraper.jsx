'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons'
import JobCard from './job-card'
import JobFilters from './job-filters'
import { useToast } from '@/hooks/use-toast'

export default function JobScraper() {
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    platforms: ['linkedin', 'indeed'],
    experience: '',
    jobType: ''
  })
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!role.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a job role',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/job-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role,
          location,
          platforms: filters.platforms
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to fetch jobs')

      setJobs(data.jobs)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Job title or keywords"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
              Search Jobs
            </>
          )}
        </Button>
      </div>

      <JobFilters filters={filters} setFilters={setFilters} />

      {jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {role ? 'No jobs found. Try different keywords.' : 'Enter a job title to start searching'}
        </div>
      )}
    </div>
  )
}