"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight, Building, MapPin, DollarSign } from "lucide-react";
import { mockJobs } from "../_data/mock-jobs";

export default function JobRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real implementation, this would fetch personalized recommendations
  // based on the user's profile, skills, and search history
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, randomly select 3 jobs from mock data
        const shuffled = [...mockJobs].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        setRecommendations(selected);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Format salary range for display
  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not disclosed";
    if (!min) return `Up to $${max.toLocaleString()}`;
    if (!max) return `From $${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  // Get company logo (placeholder in this demo)
  const getCompanyLogoUrl = (company) => {
    const initial = company.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=100`;
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          // Loading skeleton
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {recommendations.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                <a href="#" className="flex items-start gap-3 group">
                  <div className="relative h-10 w-10 rounded-md overflow-hidden flex-shrink-0 border">
                    <Image 
                      src={job.companyLogo || getCompanyLogoUrl(job.company)}
                      alt={job.company}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Building className="h-3 w-3 mr-1" />
                      <span className="mr-3">{job.company}</span>
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{job.location}{job.remote && " (Remote)"}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </Badge>
                      <Badge variant="outline" className="text-xs ml-2 bg-green-50 text-green-700 border-green-200">
                        {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </a>
              </div>
            ))}
            <div className="p-3 bg-gray-50">
              <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All Recommendations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}