"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, RefreshCw } from "lucide-react";

const jobTypes = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
  { id: "temporary", label: "Temporary" },
];

const experienceLevels = [
  { id: "entry", label: "Entry Level" },
  { id: "mid", label: "Mid Level" },
  { id: "senior", label: "Senior Level" },
  { id: "executive", label: "Executive" },
];

const datePostedOptions = [
  { id: 1, label: "Past 24 hours" },
  { id: 7, label: "Past week" },
  { id: 14, label: "Past 2 weeks" },
  { id: 30, label: "Past month" },
];

export default function JobSearchFilters({ onFilterChange, appliedFilters }) {
  const [jobTypeFilters, setJobTypeFilters] = useState(appliedFilters.jobType || []);
  const [experienceFilters, setExperienceFilters] = useState(appliedFilters.experienceLevel || []);
  const [salaryRange, setSalaryRange] = useState(appliedFilters.salary || 0);
  const [datePosted, setDatePosted] = useState(appliedFilters.datePosted || null);
  const [remoteOnly, setRemoteOnly] = useState(appliedFilters.remoteOnly || false);
  
  // Update parent component when filters change
  useEffect(() => {
    onFilterChange({
      jobType: jobTypeFilters,
      experienceLevel: experienceFilters,
      salary: salaryRange > 0 ? salaryRange * 1000 : null,
      datePosted,
      remoteOnly,
    });
  }, [jobTypeFilters, experienceFilters, salaryRange, datePosted, remoteOnly]);

  const handleJobTypeChange = (id) => {
    setJobTypeFilters(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleExperienceChange = (id) => {
    setExperienceFilters(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDatePostedChange = (id) => {
    setDatePosted(datePosted === id ? null : id);
  };

  const resetFilters = () => {
    setJobTypeFilters([]);
    setExperienceFilters([]);
    setSalaryRange(0);
    setDatePosted(null);
    setRemoteOnly(false);
  };

  const hasActiveFilters = (
    jobTypeFilters.length > 0 || 
    experienceFilters.length > 0 || 
    salaryRange > 0 || 
    datePosted !== null || 
    remoteOnly
  );

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        
        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1 mt-2">
            {jobTypeFilters.map(filter => (
              <Badge 
                key={filter} 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {jobTypes.find(t => t.id === filter)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleJobTypeChange(filter)}
                />
              </Badge>
            ))}
            
            {experienceFilters.map(filter => (
              <Badge 
                key={filter} 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {experienceLevels.find(e => e.id === filter)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleExperienceChange(filter)}
                />
              </Badge>
            ))}
            
            {datePosted && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {datePostedOptions.find(d => d.id === datePosted)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setDatePosted(null)}
                />
              </Badge>
            )}
            
            {salaryRange > 0 && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                ${salaryRange}k+
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSalaryRange(0)}
                />
              </Badge>
            )}
            
            {remoteOnly && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                Remote Only
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setRemoteOnly(false)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Job Type */}
        <div className="space-y-3">
          <h3 className="font-medium">Job Type</h3>
          <div className="grid grid-cols-1 gap-2">
            {jobTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`job-type-${type.id}`} 
                  checked={jobTypeFilters.includes(type.id)}
                  onCheckedChange={() => handleJobTypeChange(type.id)}
                />
                <Label htmlFor={`job-type-${type.id}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Experience Level */}
        <div className="space-y-3">
          <h3 className="font-medium">Experience Level</h3>
          <div className="grid grid-cols-1 gap-2">
            {experienceLevels.map((level) => (
              <div key={level.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`exp-level-${level.id}`} 
                  checked={experienceFilters.includes(level.id)}
                  onCheckedChange={() => handleExperienceChange(level.id)}
                />
                <Label htmlFor={`exp-level-${level.id}`} className="text-sm">
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Salary Range */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Salary Range</h3>
            <span className="text-sm font-medium">
              {salaryRange > 0 ? `$${salaryRange}k+` : "Any"}
            </span>
          </div>
          <Slider
            defaultValue={[0]}
            value={[salaryRange]}
            max={200}
            step={10}
            onValueChange={(values) => setSalaryRange(values[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$50k</span>
            <span>$100k</span>
            <span>$150k</span>
            <span>$200k+</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Date Posted */}
        <div className="space-y-3">
          <h3 className="font-medium">Date Posted</h3>
          <div className="grid grid-cols-1 gap-2">
            {datePostedOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`date-posted-${option.id}`} 
                  checked={datePosted === option.id}
                  onCheckedChange={() => handleDatePostedChange(option.id)}
                />
                <Label htmlFor={`date-posted-${option.id}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Remote Only */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Remote Only</h3>
            <p className="text-sm text-muted-foreground">Show only remote positions</p>
          </div>
          <Switch
            checked={remoteOnly}
            onCheckedChange={setRemoteOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}