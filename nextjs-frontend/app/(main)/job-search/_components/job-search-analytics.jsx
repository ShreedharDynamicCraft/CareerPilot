"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, TrendingUp, Users, DollarSign, MapPin } from "lucide-react";

export default function JobSearchAnalytics({ jobs }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate statistics from job data
  const calculateStats = () => {
    if (!jobs || jobs.length === 0) {
      return {
        totalJobs: 0,
        averageSalary: 0,
        remotePercentage: 0,
        topLocations: [],
        topCompanies: [],
        experienceLevelDistribution: {},
        jobTypeDistribution: {},
        sourceDistribution: {}
      };
    }

    // Calculate average salary
    const salaries = jobs.filter(job => job.salaryMax).map(job => job.salaryMax);
    const averageSalary = salaries.length > 0 
      ? Math.round(salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length) 
      : 0;

    // Calculate remote percentage
    const remoteJobs = jobs.filter(job => job.remote).length;
    const remotePercentage = Math.round((remoteJobs / jobs.length) * 100);

    // Get top locations
    const locationCounts = {};
    jobs.forEach(job => {
      const location = job.location;
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Get top companies
    const companyCounts = {};
    jobs.forEach(job => {
      const company = job.company;
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });
    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // Experience level distribution
    const experienceLevelDistribution = {};
    jobs.forEach(job => {
      const level = job.experienceLevel;
      experienceLevelDistribution[level] = (experienceLevelDistribution[level] || 0) + 1;
    });

    // Job type distribution
    const jobTypeDistribution = {};
    jobs.forEach(job => {
      const type = job.jobType;
      jobTypeDistribution[type] = (jobTypeDistribution[type] || 0) + 1;
    });

    // Source distribution
    const sourceDistribution = {};
    jobs.forEach(job => {
      const source = job.source;
      sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
    });

    return {
      totalJobs: jobs.length,
      averageSalary,
      remotePercentage,
      topLocations,
      topCompanies,
      experienceLevelDistribution,
      jobTypeDistribution,
      sourceDistribution
    };
  };

  const stats = calculateStats();

  // Format experience level for display
  const formatExperienceLevel = (level) => {
    switch(level) {
      case 'entry': return 'Entry Level';
      case 'mid': return 'Mid Level';
      case 'senior': return 'Senior Level';
      case 'executive': return 'Executive';
      default: return level;
    }
  };

  // Format job type for display
  const formatJobType = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <BarChart className="mr-2 h-5 w-5 text-blue-600" />
          Job Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Jobs */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Total Jobs</p>
                    <h4 className="text-2xl font-bold text-blue-900">{stats.totalJobs}</h4>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Average Salary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Average Salary</p>
                    <h4 className="text-2xl font-bold text-green-900">
                      {stats.averageSalary > 0 ? `$${stats.averageSalary.toLocaleString()}` : 'N/A'}
                    </h4>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
              
              {/* Remote Jobs */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Remote Jobs</p>
                    <h4 className="text-2xl font-bold text-purple-900">{stats.remotePercentage}%</h4>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Experience Level Distribution */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Experience Level Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(stats.experienceLevelDistribution).map(([level, count]) => {
                    const percentage = Math.round((count / stats.totalJobs) * 100);
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{formatExperienceLevel(level)}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Job Type Distribution */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Job Type Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(stats.jobTypeDistribution).map(([type, count]) => {
                    const percentage = Math.round((count / stats.totalJobs) * 100);
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{formatJobType(type)}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Top Locations</h4>
            <div className="space-y-3">
              {stats.topLocations.map((item, index) => {
                const percentage = Math.round((item.count / stats.totalJobs) * 100);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.location}</span>
                      <span className="font-medium">{item.count} jobs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="companies" className="space-y-4">
            <h4 className="text-sm font-medium mb-3">Top Companies Hiring</h4>
            <div className="space-y-3">
              {stats.topCompanies.map((item, index) => {
                const percentage = Math.round((item.count / stats.totalJobs) * 100);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.company}</span>
                      <span className="font-medium">{item.count} jobs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}