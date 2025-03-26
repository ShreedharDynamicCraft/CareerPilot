"use client";

import React, { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BriefcaseIcon,
  TrendingUp,
  TrendingDown,
  Brain,
  MapPin,
  IndianRupee,
  Search,
  Download,
  Filter,
  ChevronDown,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const DashboardView = ({ insights, refreshInsights }) => {
  const [locationFilter, setLocationFilter] = useState("All India");
  const [experienceLevel, setExperienceLevel] = useState("All Levels");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);

  // Indian cities for location filter
  const indianLocations = [
    "All India",
    "Bangalore",
    "Mumbai",
    "Delhi NCR",
    "Hyderabad",
    "Chennai",
    "Pune",
  ];

  // Experience levels for filtering
  const experienceLevels = [
    "All Levels",
    "Entry Level (0-2 yrs)",
    "Mid Level (3-5 yrs)",
    "Senior (6-10 yrs)",
    "Leadership (10+ yrs)",
  ];

  // Transform salary data for the chart with location filtering
  const salaryData = insights.salaryRanges
    .filter(
      (range) =>
        locationFilter === "All India" ||
        range.location === locationFilter
    )
    .map((range) => ({
      name: range.role,
      min: range.min / 100000, // Convert to lakhs
      max: range.max / 100000,
      median: range.median / 100000,
      location: range.location,
    }));

  // Historical salary trend data (simulated)
  const historicalSalaryData = [
    { year: 2020, salary: 10.5 },
    { year: 2021, salary: 12.3 },
    { year: 2022, salary: 14.8 },
    { year: 2023, salary: 16.2 },
    { year: 2024, salary: 18.5 },
    { year: 2025, salary: 20.1 },
  ];

  // Location-based demand distribution (simulated)
  const locationDemandData = [
    { name: "Bangalore", value: 35 },
    { name: "Mumbai", value: 20 },
    { name: "Delhi NCR", value: 18 },
    { name: "Hyderabad", value: 12 },
    { name: "Chennai", value: 8 },
    { name: "Others", value: 7 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: TrendingUp, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: TrendingUp, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

  // Format dates using date-fns
  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  );

  // Function to filter skills based on search query
  const filteredSkills = insights.recommendedSkills.filter((skill) =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Enhanced refresh function with loading state and feedback
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (refreshInsights) {
        await refreshInsights();
        toast.success("Dashboard updated successfully!", {
          style: { background: "#4f46e5", color: "white" }
        });
      }
    } catch (error) {
      toast.error("Failed to refresh data", {
        style: { background: "#dc2626", color: "white" }
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced download function with loading state and feedback
  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      const csvData = [
        ["Role", "Min Salary", "Median Salary", "Max Salary", "Location"],
        ...salaryData.map(d => [
          d.name,
          `₹${d.min}L`,
          `₹${d.median}L`,
          `₹${d.max}L`,
          d.location
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${insights.industry}_salary_data.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully!", {
        style: { background: "#059669", color: "white" }
      });
    } catch (error) {
      toast.error("Export failed", {
        style: { background: "#dc2626", color: "white" }
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Add skill selection handler
  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    toast.info(`Selected skill: ${skill}`);
  };

  // Enhanced card gradients
  const cardGradients = {
    outlook: "from-blue-500/10 via-indigo-500/10 to-purple-500/10",
    growth: "from-green-500/10 via-emerald-500/10 to-teal-500/10",
    demand: "from-orange-500/10 via-amber-500/10 to-yellow-500/10",
    skills: "from-pink-500/10 via-rose-500/10 to-red-500/10",
  };

  // Enhanced chart colors
  const chartColors = {
    min: "#4f46e5", // indigo-600
    median: "#0891b2", // cyan-600
    max: "#059669", // emerald-600
    line: "#8b5cf6", // violet-500
    pie: ["#4f46e5", "#0891b2", "#059669", "#d946ef", "#f59e0b", "#dc2626"],
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-background via-background/50 to-background/80"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{insights.industry} Industry Insights</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdatedDate}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Next update {nextUpdateDistance}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="relative overflow-hidden transition-all hover:border-primary"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  {isRefreshing && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10"
                      layoutId="refresh-loading"
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get latest industry insights</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleDownloadCSV}
                  disabled={isExporting}
                  className="relative overflow-hidden transition-all hover:border-primary"
                >
                  <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
                  {isExporting ? 'Exporting...' : 'Export'}
                  {isExporting && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10"
                      layoutId="export-loading"
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as CSV</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-1 rounded-lg">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-primary transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="salary"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-primary transition-all"
          >
            Salary Insights
          </TabsTrigger>
          <TabsTrigger 
            value="skills"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-primary transition-all"
          >
            Skills & Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market Overview Cards with enhanced UI */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredCard('outlook')}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`
                relative overflow-hidden
                transition-all duration-300
                border border-white/10
                bg-gradient-to-br ${cardGradients.outlook}
                ${hoveredCard === 'outlook' ? 'shadow-lg shadow-indigo-500/10' : ''}
              `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Market Outlook
                  </CardTitle>
                  <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.marketOutlook}</div>
                  <p className="text-xs text-muted-foreground">
                    Indian market perspective
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredCard('growth')}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`
                relative overflow-hidden
                transition-all duration-300
                border border-white/10
                bg-gradient-to-br ${cardGradients.growth}
                ${hoveredCard === 'growth' ? 'shadow-lg shadow-emerald-500/10' : ''}
              `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Industry Growth
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {insights.growthRate.toFixed(1)}%
                  </div>
                  <Progress value={insights.growthRate} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Year-over-year growth
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredCard('demand')}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`
                relative overflow-hidden
                transition-all duration-300
                border border-white/10
                bg-gradient-to-br ${cardGradients.demand}
                ${hoveredCard === 'demand' ? 'shadow-lg shadow-amber-500/10' : ''}
              `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.demandLevel}</div>
                  <div
                    className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                      insights.demandLevel
                    )}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current hiring trend
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredCard('skills')}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className={`
                relative overflow-hidden
                transition-all duration-300
                border border-white/10
                bg-gradient-to-br ${cardGradients.skills}
                ${hoveredCard === 'skills' ? 'shadow-lg shadow-rose-500/10' : ''}
              `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {insights.topSkills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {insights.topSkills.length > 4 && (
                      <Badge variant="outline">+{insights.topSkills.length - 4}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Most in-demand skills
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced charts with interactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5">
              <CardHeader>
                <CardTitle>Geographic Demand Distribution</CardTitle>
                <CardDescription>Job opportunities by location in India</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationDemandData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={(_, index) => setSelectedChart(index)}
                        className="transition-all duration-300"
                      >
                        {locationDemandData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={chartColors.pie[index % chartColors.pie.length]}
                            opacity={selectedChart === index ? 1 : 0.7}
                            className="transition-opacity duration-300"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ payload, label }) => (
                          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                            <p className="font-medium">{payload?.[0]?.name}</p>
                            <p className="text-sm text-primary">{payload?.[0]?.value}% of opportunities</p>
                          </div>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5">
              <CardHeader>
                <CardTitle>Key Industry Trends</CardTitle>
                <CardDescription>Current trends shaping the Indian market</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px] pr-4">
                  <ul className="space-y-4">
                    {insights.keyTrends.map((trend, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Salary Analysis</h2>
            <div className="flex flex-wrap gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {indianLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="w-[180px]">
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Ranges Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Ranges by Role</CardTitle>
              <CardDescription>
                Displaying minimum, median, and maximum salaries (in lakhs per annum)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${value}L`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-md">
                              <p className="font-medium">{label}</p>
                              {payload.map((item) => (
                                <p key={item.name} className="text-sm">
                                  {item.name === "min" ? "Minimum" : 
                                   item.name === "max" ? "Maximum" : "Median"}: 
                                  ₹{item.value.toFixed(1)}L
                                </p>
                              ))}
                              {payload[0]?.payload.location && (
                                <p className="text-xs mt-1 text-muted-foreground">
                                  {payload[0].payload.location}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend formatter={(value) => value === "min" ? "Minimum" : value === "max" ? "Maximum" : "Median"} />
                    <Bar 
                      dataKey="min" 
                      fill={chartColors.min} 
                      name="Min Salary"
                      className="hover:opacity-80 cursor-pointer"
                    />
                    <Bar dataKey="median" fill={chartColors.median} name="Median Salary" />
                    <Bar dataKey="max" fill={chartColors.max} name="Max Salary" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <IndianRupee className="h-4 w-4 mr-1" />
              Salary data specific to the Indian market as of {format(new Date(insights.lastUpdated), "MMMM yyyy")}
            </CardFooter>
          </Card>

          {/* Historical Salary Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Growth Trends</CardTitle>
              <CardDescription>
                Historical salary progression in the Indian market (average in lakhs per annum)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalSalaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `₹${value}L`} />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toFixed(1)}L`, "Avg. Salary"]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="salary"
                      stroke={chartColors.line}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      name="Avg. Salary"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Skills & Career Development</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Skills</CardTitle>
                <CardDescription>In-demand skills for career growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant={selectedSkill === skill ? "default" : "outline"} 
                      className="py-1.5 hover:bg-primary/20 transition-all cursor-pointer transform hover:scale-105"
                      onClick={() => handleSkillClick(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                  {filteredSkills.length === 0 && (
                    <p className="text-muted-foreground">No skills found matching your search.</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Based on employer requirements across India
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emerging Technologies</CardTitle>
                <CardDescription>Technologies gaining traction in India</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <ul className="space-y-3">
                  {insights.recommendedSkills.slice(0, 5).map((skill, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill}</span>
                        <span className="text-xs text-muted-foreground">
                          {90 - index * 10}% growth
                        </span>
                      </div>
                      <Progress value={90 - index * 10} className="h-1.5" />
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button variant="outline" size="sm" className="w-full">
                  View All Technologies
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Career Progression Roadmap</CardTitle>
              <CardDescription>Typical career path in this industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                {insights.salaryRanges.slice(0, 4).map((role, index) => (
                  <div key={index} className="ml-10 mb-6 relative">
                    <div className="absolute left-[-2rem] top-0 w-4 h-4 rounded-full bg-primary" />
                    <h3 className="text-lg font-medium">{role.role}</h3>
                    <p className="text-sm text-muted-foreground">
                      {index === 0 ? "0-2" : 
                       index === 1 ? "3-5" : 
                       index === 2 ? "6-8" : "8+"} years experience
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Salary range: </span>
                      ₹{(role.min / 100000).toFixed(1)}L - ₹{(role.max / 100000).toFixed(1)}L
                    </p>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Key skills: </span>
                      {insights.topSkills.slice(0, 3).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardView;