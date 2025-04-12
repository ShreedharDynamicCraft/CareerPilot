"use client";

import { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "./_components/job-card";
import JobDetails from "./_components/job-details";

export default function JobSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs on initial load and when filters change
  useEffect(() => {
    // Only fetch jobs when both search query and location are provided
    if (!searchQuery || !location) return;
    
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Call our API route that proxies to the backend scraper
        const response = await fetch(
          `/api/jobs/scrape-jobs?job_role=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`
        );
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter by source if not "all"
        let filteredJobs = data.jobs;
        if (activeTab !== "all") {
          filteredJobs = filteredJobs.filter(job => job.source.toLowerCase() === activeTab);
        }
        
        setJobs(filteredJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchQuery, location, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Only trigger search if both fields have values
    if (searchQuery && location) {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Simple Job Search
          </h1>
          <p className="text-muted-foreground text-lg">
            Find recent job postings from multiple job sites in real-time
          </p>
        </div>

        {/* Search Form - Simplified */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Job title or role"
              className="pl-10 py-6 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
          </div>
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Location"
              className="pl-10 py-6 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="py-6 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search Jobs"}
          </Button>
        </form>

        {/* Main Content - Simplified */}
        <div id="search-results">
          {/* Tabs for job sources */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All Sources</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="indeed">Indeed</TabsTrigger>
              <TabsTrigger value="google">Google Jobs</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              {loading ? "Searching for jobs..." : jobs.length > 0 ? `${jobs.length} jobs found` : "Enter job role and location to search"}
            </p>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array(5).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-16 w-full mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={() => setSelectedJob(job)}
                />
              ))
            ) : searchQuery && location ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
                <p className="text-gray-500">
                  Try different search terms or locations
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Enter job role and location</h3>
                <p className="text-gray-500">
                  We'll search multiple job sites in real-time
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Job Details Dialog */}
      {selectedJob && (
        <JobDetails 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}