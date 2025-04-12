"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { 
  ExternalLink, 
  MapPin, 
  Building, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Bookmark, 
  Share2, 
  Info,
  CheckCircle,
  X,
  Globe,
  Mail,
  ChevronRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

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

export default function JobDetails({ job, onClose }) {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  
  const toggleSaved = () => {
    setSaved(!saved);
  };
  
  const handleApply = () => {
    // In a real implementation, this would track the application
    setApplied(true);
    window.open(job.applyUrl, '_blank');
  };
  
  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not disclosed";
    if (!min) return `Up to $${max.toLocaleString()}`;
    if (!max) return `From $${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };
  
  const getSourceColor = (source) => {
    return sourceColors[source.toLowerCase()] || sourceColors.default;
  };
  
  const getJobTypeColor = (jobType) => {
    return jobTypeColors[jobType] || jobTypeColors["temporary"];
  };
  
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
    const initial = company.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=100`;
  };
  
  // Calculate match score (in a real app, this would be based on user profile)
  const matchScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-99
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="flex items-center text-base font-medium text-gray-700">
            <Building className="h-4 w-4 mr-1" />
            {job.company}
            <span className="mx-2">•</span>
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}{job.remote && " (Remote)"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Metadata */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={getJobTypeColor(job.jobType)}>
                <Briefcase className="h-3 w-3 mr-1" />
                {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
              </Badge>
            </div>
            
            {/* Job Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
            
            {/* Skills Required */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Application Process */}
            <div>
              <h3 className="text-lg font-semibold mb-2">How to Apply</h3>
              <p className="text-gray-700 mb-4">
                Click the "Apply Now" button to submit your application through {job.source}. 
                Make sure your resume is up-to-date before applying.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Easy application process</span>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Company Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 border">
                    <Image 
                      src={job.companyLogo || getCompanyLogoUrl(job.company)}
                      alt={job.company}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{job.company}</CardTitle>
                    <p className="text-sm text-gray-500">{job.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-gray-500" />
                    <a href="#" className="text-blue-600 hover:underline">Company Website</a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>1000-5000 employees</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href="#" className="text-blue-600 hover:underline">Contact Recruiter</a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Match Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profile Match</span>
                    <span className="text-sm font-bold text-blue-600">{matchScore}%</span>
                  </div>
                  <Progress value={matchScore} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Based on your skills, experience, and preferences
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Application Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Application Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Applicants</span>
                    <span className="font-semibold">{job.applicants}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-semibold">{getTimeAgo(job.postedDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Similar Jobs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="group">
                      <a href="#" className="flex items-start py-2 hover:bg-gray-50 rounded-md -mx-2 px-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                            {job.title.split(' ').slice(0, 2).join(' ')} at {['TechCorp', 'InnovateTech', 'DataInsights'][i-1]}
                          </h4>
                          <p className="text-xs text-gray-500">{['San Francisco, CA', 'New York, NY', 'Remote'][i-1]}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </a>
                      {i < 3 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleSaved}
              className={saved ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${saved ? 'fill-blue-500 text-blue-500' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={handleApply}
            disabled={applied}
          >
            {applied ? 'Applied' : 'Apply Now'} <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}