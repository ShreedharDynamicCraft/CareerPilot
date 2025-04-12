"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MapPin, Building, Clock, Briefcase, DollarSign, Bookmark, Share2, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Map job sources to their brand colors
const sourceColors = {
  linkedin: "bg-blue-100 text-blue-800",
  indeed: "bg-blue-100 text-blue-800",
  glassdoor: "bg-green-100 text-green-800",
  google: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

// Map job types to their colors
const jobTypeColors = {
  "full-time": "bg-blue-100 text-blue-800",
  "part-time": "bg-purple-100 text-purple-800",
  "contract": "bg-amber-100 text-amber-800",
  "internship": "bg-green-100 text-green-800",
  "temporary": "bg-gray-100 text-gray-800",
};

// Map experience levels to their colors
const experienceLevelColors = {
  "entry": "bg-green-100 text-green-800",
  "mid": "bg-blue-100 text-blue-800",
  "senior": "bg-purple-100 text-purple-800",
  "executive": "bg-amber-100 text-amber-800",
};

export default function JobCard({ job, onClick }) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const toggleSaved = () => {
    setSaved(!saved);
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not disclosed";
    if (!min) return `Up to $${max.toLocaleString()}`;
    if (!max) return `From $${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };
  
  const getSourceColor = (source) => {
    if (!source) return sourceColors.default;
    return sourceColors[source.toLowerCase()] || sourceColors.default;
  };
  
  const getJobTypeColor = (jobType) => {
    if (!jobType) return jobTypeColors["temporary"];
    return jobTypeColors[jobType] || jobTypeColors["temporary"];
  }
  
  const getExperienceLevelColor = (level) => {
    if (!level) return experienceLevelColors["entry"];
    return experienceLevelColors[level] || experienceLevelColors["entry"];
  }
  
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };
  
  const getCompanyLogoUrl = (company) => {
    // In a real implementation, you would have actual company logos
    // For now, we'll generate a placeholder with the company's initial
    // Add null check to prevent errors when company is undefined
    if (!company) return `https://ui-avatars.com/api/?name=C&background=random&color=fff&size=100`;
    const initial = company.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=100`;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 border">
              <Image 
                src={job.companyLogo || getCompanyLogoUrl(job.company)}
                alt={job.company}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Job Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={onClick}
                  >
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="mr-3">{job.company}</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}{job.remote && " (Remote)"}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={toggleSaved}
                        >
                          <Bookmark 
                            className={`h-4 w-4 ${saved ? 'fill-blue-500 text-blue-500' : 'text-gray-500'}`} 
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{saved ? 'Remove from saved' : 'Save job'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                        >
                          <Share2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share job</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Job Metadata */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className={getJobTypeColor(job.jobType)}>                  
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.jobType ? job.jobType.split('-').map(word => word ? (word.charAt(0).toUpperCase() + word.slice(1)) : '').join(' ') : 'Not Specified'}
                </Badge>
                
                <Badge variant="secondary" className={getExperienceLevelColor(job.experienceLevel)}>
                  <Info className="h-3 w-3 mr-1" />
                  {job.experienceLevel && job.experienceLevel.length > 0 ? (job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1) + ' Level') : 'Experience Not Specified'}
                </Badge>
                
                <Badge variant="secondary">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </Badge>
                
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeAgo(job.postedDate)}
                </Badge>
                
                <Badge variant="secondary" className={getSourceColor(job.source)}>
                  {job.source && job.source.length > 0 ? (job.source.charAt(0).toUpperCase() + job.source.slice(1)) : 'Unknown Source'}
                </Badge>
              </div>
              
              {/* Job Description */}
              <div className="mt-4">
                <p className={`text-gray-600 text-sm ${!expanded && 'line-clamp-3'}`}>
                  {job.description || 'No description available'}
                </p>
                {job.description && job.description.length > 150 && (
                  <button 
                    onClick={toggleExpanded}
                    className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-800 transition-colors"
                  >
                    {expanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Job Actions */}
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{job.applicants || 0}</span> applicants
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={toggleSaved}>
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={onClick}
            >
              View Details <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}