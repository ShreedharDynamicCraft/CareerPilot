"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import JobCard from './_components/job-card';
import JobDetails from './_components/job-details';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function JobSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobRole, setJobRole] = useState(searchParams.get('job_role') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);
  const [jobSources, setJobSources] = useState({
    linkedin: 0,
    indeed: 0,
    other: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const initialJobRole = searchParams.get('job_role');
    const initialLocation = searchParams.get('location');
    
    if (initialJobRole && initialLocation) {
      fetchRecentJobs(initialJobRole, initialLocation);
    }
  }, [searchParams]);

  const fetchRecentJobs = async (role, loc) => {
    try {
      setLoading(true);
      setError(null);
      
      // Request up to 30 jobs
      const response = await fetch(`/api/jobs/recent-jobs?job_role=${encodeURIComponent(role)}&location=${encodeURIComponent(loc)}&limit=30`);
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
      setLastUpdated(new Date());
      
      // Count jobs by source
      const sources = {
        linkedin: data.sources?.linkedin || 0,
        indeed: data.sources?.indeed || 0,
        other: (data.jobs || []).length - ((data.sources?.linkedin || 0) + (data.sources?.indeed || 0))
      };
      
      setJobSources(sources);
      
      // Show toast based on results
      if (data.jobs && data.jobs.length > 0) {
        toast.success(`Found ${data.jobs.length} recent job postings!`);
      } else {
        toast.error("No jobs found matching your criteria.");
      }
      
    } catch (err) {
      setError(err.message || "Failed to fetch recent job listings");
      toast.error("Error searching for jobs", {
        description: err.message || "Failed to fetch recent job listings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!jobRole || !location) {
      toast.warning("Please enter both job title and location");
      return;
    }
    
    const params = new URLSearchParams();
    params.set('job_role', jobRole);
    params.set('location', location);
    router.push(`/job-search?${params.toString()}`);
    
    fetchRecentJobs(jobRole, location);
  };

  const handleRefresh = () => {
    const currentJobRole = searchParams.get('job_role');
    const currentLocation = searchParams.get('location');
    
    if (currentJobRole && currentLocation) {
      fetchRecentJobs(currentJobRole, currentLocation);
      toast.info("Refreshing job listings...");
    } else {
      toast.warning("Please search for jobs first before refreshing");
    }
  };

  const daysAgo = (dateString) => {
    if (!dateString) return "";
    try {
      const postedDate = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - postedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Check for invalid dates
      if (isNaN(diffDays)) return "";
      
      return diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Find Real-Time Job Opportunities</h1>
          <p className="text-muted-foreground">
            Search for the most recent job listings from LinkedIn and Indeed
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, skill or keyword"
                  className="pl-10"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="pl-10"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="h-10" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>Search Latest Jobs</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Actions & Source Breakdown */}
        {jobs.length > 0 && (
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {jobSources.linkedin > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-800">LinkedIn: {jobSources.linkedin}</Badge>
              )}
              {jobSources.indeed > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-800">Indeed: {jobSources.indeed}</Badge>
              )}
              {jobSources.other > 0 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-800">Other: {jobSources.other}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Recent Job Postings <Badge variant="outline">{jobs.length} jobs found</Badge>
            </h2>
            
            <div className="grid gap-4">
              {jobs.map((job) => (
                <JobCard 
                  key={job.id || `${job.company}-${job.title}`.replace(/\s+/g,'-')} 
                  job={job} 
                  onClick={() => setSelectedJob(job)}
                  daysAgo={daysAgo}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for the latest real-time job postings...</p>
            <p className="text-xs text-muted-foreground">This may take a moment as we gather the most recent listings</p>
          </div>
        )}

        {/* No Results */}
        {!loading && jobs.length === 0 && searchParams.get('job_role') && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4">
            <h3 className="font-medium">No job postings found</h3>
            <p>We couldn't find any active job listings matching your search criteria. Try broadening your search terms or try a different location.</p>
          </div>
        )}

        {/* Job Detail Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedJob && <JobDetails job={selectedJob} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
