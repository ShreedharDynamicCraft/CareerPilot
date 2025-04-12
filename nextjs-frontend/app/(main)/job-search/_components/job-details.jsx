import { useState } from "react";
import { 
  Building, MapPin, Calendar, DollarSign, Share2, ExternalLink, 
  Bookmark, Globe, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function JobDetails({ job }) {
  const [isSaved, setIsSaved] = useState(false);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Handle share button click
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${job.title} at ${job.company}`,
          text: `Check out this job: ${job.title} at ${job.company}`,
          url: job.job_url || window.location.href
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        await navigator.clipboard.writeText(job.job_url || window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };
  
  // Extract source platform (LinkedIn, Indeed) from the job source field
  const getSourceBadge = () => {
    const source = job.source?.toLowerCase() || '';
    if (source.includes('linkedin')) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 flex items-center gap-1">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
          </svg>
          LinkedIn Job
        </Badge>
      );
    } else if (source.includes('indeed')) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.92,11.2c0-2.33,1.46-4.3,3.88-4.3a3.89,3.89,0,0,1,.67.05V3.8a7,7,0,0,0-.67,0h0C10.17,3.8,6.12,7.92,6.12,13v7.33H11.9V11.21Z" />
            <path d="M17.9,8.08V20.3H23.1V8.08Z" />
            <path d="M20.5,1.5a2.73,2.73,0,1,0,2.71,2.75h0V4.2A2.71,2.71,0,0,0,20.5,1.5Z" />
            <path d="M4.9,8.08H.9V20.3H4.9Z" />
            <path d="M2.9,1.5A2.73,2.73,0,1,0,5.61,4.25,2.71,2.71,0,0,0,2.9,1.5Z" />
          </svg>
          Indeed Job
        </Badge>
      );
    } else {
      return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">{job.title}</h2>
          {getSourceBadge()}
        </div>
        
        <div className="flex items-center mt-2">
          <Building className="mr-2 h-5 w-5 text-gray-500" />
          <span className="font-medium">{job.company}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-3">
          {job.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          
          {job.date_posted && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{formatDate(job.date_posted)}</span>
            </div>
          )}
          
          {job.salary && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="mr-1 h-4 w-4" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {job.job_type && (
          <Badge variant="secondary">{job.job_type}</Badge>
        )}
        
        {job.work_setting && (
          <Badge variant="secondary">{job.work_setting}</Badge>
        )}
      </div>
      
      <Separator />
      
      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setIsSaved(!isSaved)}>
            <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        
        {job.job_url && job.job_url !== '#' && (
          <Button variant="default" onClick={() => window.open(job.job_url, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Apply Now
          </Button>
        )}
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">About this role</h3>
        
        {job.description ? (
          <div 
            className="prose max-w-full"
            dangerouslySetInnerHTML={{ 
              __html: job.description.replace(/\n/g, '<br />') 
            }} 
          />
        ) : (
          <div className="text-gray-500 italic">
            No detailed description available. Please click "Apply Now" to see the complete job listing.
          </div>
        )}
      </div>
      
      {job.company && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-2">About {job.company}</h3>
            <div className="flex flex-wrap gap-4">
              {job.company_url && (
                <Button variant="ghost" size="sm" onClick={() => window.open(job.company_url, '_blank')}>
                  <Globe className="mr-2 h-4 w-4" />
                  Company Website
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Users className="mr-2 h-4 w-4" />
                See all jobs
              </Button>
            </div>
          </div>
        </>
      )}
      
      <div className="flex justify-end mt-6">
        <p className="text-xs text-gray-500">Job ID: {job.id || job.job_id || 'N/A'}</p>
      </div>
    </div>
  );
}
