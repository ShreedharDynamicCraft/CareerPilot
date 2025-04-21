'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons'
import JobCard from './job-card'
import JobFilters from './job-filters'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  if (!mounted) return null

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row gap-4"
      >
        <Input
          placeholder="Job title or keywords"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-1 border-blue-200 focus:border-blue-400 transition-colors duration-300 h-11"
        />
        <Input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 border-purple-200 focus:border-purple-400 transition-colors duration-300 h-11"
        />
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md h-11"
          >
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
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <JobFilters filters={filters} setFilters={setFilters} />
      </motion.div>

      <AnimatePresence mode="wait">
        {jobs.length > 0 ? (
          <motion.div 
            key="results"
            variants={itemVariants}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }
                }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            variants={itemVariants}
            className="text-center py-12 text-muted-foreground bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
          >
            {role ? 'No jobs found. Try different keywords.' : 'Enter a job title to start searching'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}