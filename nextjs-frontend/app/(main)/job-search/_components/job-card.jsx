import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Calendar, DollarSign, Clock, Briefcase } from "lucide-react";

export default function JobCard({ job, onClick, daysAgo }) {
  // Extract source platform (LinkedIn, Indeed) from the job source field
  const getSourceBadge = () => {
    const source = job.source?.toLowerCase() || '';
    
    if (source.includes('linkedin')) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
          </svg>
          LinkedIn
        </Badge>
      );
    } else if (source.includes('indeed')) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.92,11.2c0-2.33,1.46-4.3,3.88-4.3a3.89,3.89,0,0,1,.67.05V3.8a7,7,0,0,0-.67,0h0C10.17,3.8,6.12,7.92,6.12,13v7.33H11.9V11.21Z" />
            <path d="M17.9,8.08V20.3H23.1V8.08Z" />
            <path d="M20.5,1.5a2.73,2.73,0,1,0,2.71,2.75h0V4.2A2.71,2.71,0,0,0,20.5,1.5Z" />
            <path d="M4.9,8.08H.9V20.3H4.9Z" />
            <path d="M2.9,1.5A2.73,2.73,0,1,0,5.61,4.25,2.71,2.71,0,0,0,2.9,1.5Z" />
          </svg>
          Indeed
        </Badge>
      );
    } else {
      return null;
    }
  };
  
  // Determine how fresh the job posting is
  const getPostingFreshness = () => {
    if (!job.date_posted || !daysAgo) return null;
    
    const daysSincePosted = daysAgo(job.date_posted);
    if (daysSincePosted === "Today" || daysSincePosted === "Yesterday") {
      return (
        <div className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          <Clock className="mr-1 h-3 w-3" />
          <span>{daysSincePosted === "Today" ? "New Today!" : "Posted Yesterday"}</span>
        </div>
      );
    }
    return null;
  };

  // Job type or employment type badge
  const getJobTypeBadge = () => {
    if (!job.job_type) return null;
    
    return (
      <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
        <Briefcase className="mr-1 h-3 w-3" />
        <span>{job.job_type}</span>
      </div>
    );
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 hover:border-l-primary" 
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                {getPostingFreshness()}
              </div>
              {getSourceBadge()}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="mr-1 h-4 w-4" />
              <span>{job.company}</span>
            </div>
            
            {job.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {job.date_posted && daysAgo && !getPostingFreshness() && (
                <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>{daysAgo(job.date_posted)}</span>
                </div>
              )}
              
              {getJobTypeBadge()}
              
              {job.work_setting && (
                <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                  <span>{job.work_setting}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between h-full">
            {job.salary && (
              <div className="flex items-center text-sm font-medium">
                <DollarSign className="mr-1 h-4 w-4 text-green-600" />
                <span>{job.salary}</span>
              </div>
            )}
            <div className="mt-3">
              <Badge variant="secondary">View Details</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
