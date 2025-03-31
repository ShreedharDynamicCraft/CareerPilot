"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  entrySchema, 
  projectSchema 
} from "@/app/lib/schema";
import { 
  Sparkles, 
  PlusCircle, 
  Pencil, 
  Save, 
  Loader2, 
  Link as LinkIcon, 
  Github, 
  Trash2, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Info,
  GraduationCap,
  Check,
  AlertCircle,
  FileText,
  Code
} from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import DebugPanel from "./debug-panel";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = parse(dateString, "yyyy-MM", new Date());
    return isValid(date) ? format(date, "MMM yyyy") : dateString;
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};

const BULLET_TEMPLATES = {
  project: [
    "Developed {technology} to {solve problem}, resulting in {result}",
    "Implemented {feature} using {technology}, improving {metric} by {percentage}",
    "Built {system} that {functionality}, processing {volume} with {performance}",
    "Optimized {component} achieving {improvement} in {metric}",
    "Created {feature} enabling users to {capability}"
  ],
  experience: [
    "Led {team} to {accomplishment}, resulting in {impact}",
    "Managed {responsibility} delivering {outcome} in {timeframe}",
    "Collaborated with {teams} to implement {project}, improving {metric}",
    "Analyzed {data} identifying {opportunity} resulting in {benefit}",
    "Designed {solution} reducing {problem} by {percentage}"
  ],
  education: [
    "Completed coursework in {subjects} with focus on {specialization}",
    "Maintained {GPA} while {achievement}",
    "Selected for {program} based on {criteria}",
    "Participated in {activity} as {role}",
    "Researched {topic} under {professor}, resulting in {outcome}"
  ]
};

export const EntryForm = ({ type, entries = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentTab, setCurrentTab] = useState("basic");
  const [selectedBulletTemplate, setSelectedBulletTemplate] = useState("");
  const [confirmedDelete, setConfirmedDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const entryType = type.toLowerCase();
  const isProject = entryType === 'project';
  const isEducation = entryType === 'education';
  const isExperience = entryType === 'experience';

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors, isDirty, isValid: isFormValid },
    reset,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm({
    resolver: isProject ? zodResolver(projectSchema) : zodResolver(entrySchema),
    defaultValues: isProject ? {
      title: "",
      description: "",
      technologies: "",
      achievements: "",
      githubUrl: "",
      demoUrl: "",
    } : {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      location: "",
      technologies: "",
      achievements: "",
      gpa: "",
      relevantCourses: "",
      teamSize: "",
      role: "",
    },
  });

  const current = watch("current");
  const description = watch("description");
  const technologies = watch("technologies");
  const formValues = watch();

  useEffect(() => {
    if (typeof window !== 'undefined' && isAdding) {
      const formValues = getValues();
      localStorage.setItem(`entryFormState-${type}`, JSON.stringify(formValues));
    }
  }, [watch(), isAdding, type, getValues]);

  const handleCancel = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`entryFormState-${type}`);
    }
    reset();
    setIsAdding(false);
    setEditingIndex(null);
    setCurrentTab("basic");
  };

  const validateCurrentForm = async () => {
    const result = await trigger();
    if (!result) {
      const fieldErrors = Object.entries(errors).map(([field, error]) => ({
        field,
        message: error.message
      }));
      setValidationErrors(fieldErrors);
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  const handleEdit = (index) => {
    const entryToEdit = entries[index];
    reset({
      ...entryToEdit,
      ...(isProject && {
        organization: undefined,
        startDate: undefined,
        endDate: undefined,
        current: undefined,
        location: undefined
      }),
      ...(!isProject && {
        startDate: entryToEdit.startDate ? parse(entryToEdit.startDate, "MMM yyyy", new Date()).toISOString().substring(0, 7) : "",
        endDate: entryToEdit.endDate && entryToEdit.endDate !== "Present" ? 
          parse(entryToEdit.endDate, "MMM yyyy", new Date()).toISOString().substring(0, 7) : "",
        current: entryToEdit.endDate === "Present"
      })
    });
    setIsAdding(true);
    setEditingIndex(index);
  };

  const handleAdd = handleValidation(async (data) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`entryFormState-${type}`);
      }

      if (isProject) {
        if (!data.title || !data.description) {
          toast.error("Title and Description are required for projects");
          return;
        }
  
        const formattedEntry = {
          title: data.title,
          description: formatDescription(data.description),
          technologies: data.technologies,
          achievements: data.achievements,
          githubUrl: data.githubUrl,
          demoUrl: data.demoUrl,
        };
  
        if (editingIndex !== null) {
          const newEntries = [...entries];
          newEntries[editingIndex] = formattedEntry;
          onChange(newEntries);
        } else {
          onChange([...entries, formattedEntry]);
        }
      } else {
        const isValid = await validateCurrentForm();
        if (!isValid) {
          toast.error("Please fix the errors before saving");
          return;
        }
  
        const formattedEntry = {
          ...data,
          description: formatDescription(data.description),
          startDate: formatDisplayDate(data.startDate),
          endDate: data.current ? "Present" : formatDisplayDate(data.endDate),
        };
  
        if (editingIndex !== null) {
          const newEntries = [...entries];
          newEntries[editingIndex] = formattedEntry;
          onChange(newEntries);
        } else {
          onChange([...entries, formattedEntry]);
        }
      }
  
      reset();
      setIsAdding(false);
      setEditingIndex(null);
      setCurrentTab("basic");
      toast.success(`${editingIndex !== null ? 'Updated' : 'Added'} ${type} entry`);
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save entry. Please try again.");
    }
  });
  
  const formatDescription = (desc) => {
    return desc
      .split("\n")
      .filter(line => line.trim())
      .map(line => line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`)
      .join("\n");
  };

  const handleDelete = (index) => {
    try {
      if (confirmedDelete && deleteIndex === index) {
        const newEntries = entries.filter((_, i) => i !== index);
        onChange(newEntries);
        setConfirmedDelete(false);
        setDeleteIndex(null);
        toast.success(`${type} entry deleted!`);
      } else {
        setDeleteIndex(index);
        setConfirmedDelete(true);
        setTimeout(() => {
          setConfirmedDelete(false);
          setDeleteIndex(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry. Please try again.");
    }
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      console.error("AI improvement error:", improveError);
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  useEffect(() => {
    if (isAdding) {
      setConfirmedDelete(false);
      setDeleteIndex(null);
    }
  }, [isAdding]);

  const handleImproveDescription = async () => {
    try {
      const description = watch("description");
      if (!description) {
        toast.error("Please enter a description first");
        return;
      }
      await improveWithAIFn({
        current: description,
        type: type.toLowerCase(),
      });
    } catch (error) {
      console.error("Error improving description:", error);
      toast.error("Failed to improve description");
    }
  };

  const handleImproveAll = async () => {
    try {
      if (entries.length === 0) {
        toast.error("No entries to improve");
        return;
      }
      
      toast.info("Improving all entries. This may take a moment...");
      const improvedEntries = await Promise.all(
        entries.map(async (entry) => {
          try {
            const improved = await improveWithAIFn({
              current: entry.description,
              type: type.toLowerCase(),
            });
            return { ...entry, description: improved };
          } catch (error) {
            console.error(`Error improving entry ${entry.title}:`, error);
            return entry;
          }
        })
      );
      
      onChange(improvedEntries);
      toast.success("All entries improved!");
    } catch (error) {
      console.error("Error improving all entries:", error);
      toast.error("Failed to improve entries");
    }
  };

  const handleApplyTemplate = () => {
    try {
      if (!selectedBulletTemplate) return;
      const currentDesc = getValues("description") || "";
      const newDesc = currentDesc + (currentDesc ? "\n" : "") + selectedBulletTemplate;
      setValue("description", newDesc);
      setSelectedBulletTemplate("");
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to apply template");
    }
  };

  const renderTechnologyBadges = (techString) => {
    if (!techString) return null;
    try {
      return techString.split(',').map((tech, i) => (
        <Badge key={i} variant="secondary" className="mr-1 mb-1 bg-blue-100 text-blue-800">
          {tech.trim()}
        </Badge>
      ));
    } catch (error) {
      console.error("Error rendering technology badges:", error);
      return null;
    }
  };

  const getTypeColor = () => {
    if (isEducation) return 'bg-purple-100 text-purple-800';
    if (isExperience) return 'bg-green-100 text-green-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getTypeIcon = () => {
    if (isEducation) return <GraduationCap className="h-4 w-4" />;
    if (isExperience) return <Briefcase className="h-4 w-4" />;
    return <Code className="h-4 w-4" />;
  };

  const bulletPointCount = description ? description.split('\n').filter(line => line.trim()).length : 0;
  const idealBulletPoints = isProject ? 5 : (isEducation ? 3 : 4);
  const bulletProgress = Math.min(100, Math.round((bulletPointCount / idealBulletPoints) * 100));

  const sectionCompletion = entries.length > 0 ? 100 : 0;

  return (
    <div className="space-y-6 relative">
      <DebugPanel data={{ entries, formValues, errors, validationErrors }} />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor()}`}>
            {getTypeIcon()}
            <span className="ml-2">{type}</span>
          </span>
          <span className="text-sm text-gray-500">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
          <div className="flex items-center gap-2">
            <Progress value={sectionCompletion} className="h-2 w-20" />
            <span className="text-xs text-gray-500">{sectionCompletion}%</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImproveAll}
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Enhance All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              setIsAdding(true);
              setCurrentTab("basic");
            }}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Fix these errors to continue:</span>
          </div>
          <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>
                {error.field}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No {type} entries</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first {type.toLowerCase()} entry.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add {type}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((item, index) => (
            <Card key={index} className="border-l-4 border-blue-500 hover:shadow-md transition-shadow group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </CardTitle>
                    {!isProject && item.organization && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.organization}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(index)}
                            className="h-8 w-8 text-gray-500 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit this entry</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={confirmedDelete && deleteIndex === index ? "destructive" : "ghost"}
                            size="icon"
                            onClick={() => handleDelete(index)}
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                          >
                            {confirmedDelete && deleteIndex === index ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{confirmedDelete && deleteIndex === index ? "Confirm delete" : "Delete this entry"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {!isProject && item.startDate && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {item.startDate} — {item.endDate || "Present"}
                      {item.location && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="h-4 w-4 mr-1 inline" />
                          {item.location}
                        </>
                      )}
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {item.technologies && (
                  <div className="mt-2 mb-3">
                    <div className="flex flex-wrap">
                      {renderTechnologyBadges(item.technologies)}
                    </div>
                  </div>
                )}

                <ul className="space-y-2 pl-5 list-disc text-sm text-gray-700">
                  {item.description.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i}>
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>

                {item.achievements && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</h4>
                    <ul className="space-y-2 pl-5 list-disc text-sm text-gray-700">
                      {item.achievements.split('\n').filter(line => line.trim()).map((line, i) => (
                        <li key={i}>
                          {line.replace(/^[-•]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(item.githubUrl || item.demoUrl) && (
                  <div className="mt-4 flex space-x-3">
                    {item.githubUrl && (
                      <a 
                        href={item.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <Github className="h-4 w-4 mr-1" /> GitHub
                      </a>
                    )}
                    {item.demoUrl && (
                      <a 
                        href={item.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" /> Live Demo
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAdding && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {editingIndex !== null ? `Edit ${type}` : `Add New ${type}`}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-3 mb-6 bg-gray-100">
                <TabsTrigger value="basic" className="data-[state=active]:bg-white">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-white">
                  Details
                </TabsTrigger>
                <TabsTrigger value="description" className="data-[state=active]:bg-white">
                  Description
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder={isEducation ? "Degree/Program" : isExperience ? "Job Title" : "Project Name"}
                      {...register("title")}
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {!isProject && (
                    <>
                      <div>
                        <Label htmlFor="organization">
                          {isEducation ? "Institution" : "Company"} *
                        </Label>
                        <Input
                          id="organization"
                          placeholder={isEducation ? "University Name" : "Company Name"}
                          {...register("organization")}
                          className="mt-1"
                        />
                        {errors.organization && (
                          <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="month"
                            {...register("startDate")}
                            className="mt-1"
                          />
                          {errors.startDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="month"
                            {...register("endDate")}
                            disabled={current}
                            className="mt-1"
                          />
                          {errors.endDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="current"
                          checked={current}
                          onCheckedChange={(checked) => {
                            setValue("current", checked);
                            if (checked) setValue("endDate", "");
                          }}
                        />
                        <Label htmlFor="current" className="text-sm">
                          Currently {isEducation ? "studying" : "working"} here
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {isEducation && (
                  <>
                    <div>
                      <Label htmlFor="gpa">CGPA/Score</Label>
                      <Input
                        id="gpa"
                        placeholder="e.g., 7.8/10.0 or 85%"
                        {...register("gpa")}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="relevantCourses">Relevant Coursework</Label>
                      <Input
                        id="relevantCourses"
                        placeholder="e.g., Data Structures, Machine Learning"
                        {...register("relevantCourses")}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {isExperience && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Input
                          id="teamSize"
                          placeholder="e.g., 5 members"
                          {...register("teamSize")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          placeholder="e.g., Team Lead, Developer"
                          {...register("role")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!isEducation && (
                  <div>
                    <Label htmlFor="technologies">Technologies</Label>
                    <Input
                      id="technologies"
                      placeholder="e.g., React, Python, AWS"
                      {...register("technologies")}
                      className="mt-1"
                    />
                  </div>
                )}

                {isProject && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        placeholder="https://github.com/username/repo"
                        {...register("githubUrl")}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="demoUrl">Demo URL</Label>
                      <Input
                        id="demoUrl"
                        placeholder="https://your-project-demo.com"
                        {...register("demoUrl")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="achievements">Key Achievements</Label>
                  <Textarea
                    id="achievements"
                    placeholder="List your key achievements (one per line)"
                    {...register("achievements")}
                    className="mt-1 h-24"
                  />
                </div>
              </TabsContent>

              <TabsContent value="description" className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            Use bullet points to describe your {type.toLowerCase()}. 
                            Aim for {idealBulletPoints} concise bullet points.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {bulletPointCount}/{idealBulletPoints}
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${bulletProgress >= 100 
                          ? 'bg-green-500' 
                          : (bulletProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500')}`} 
                        style={{ width: `${bulletProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Textarea
                  id="description"
                  placeholder={`Enter bullet points about your ${type.toLowerCase()}...\n• First achievement\n• Second responsibility\n• Third accomplishment`}
                  {...register("description", { required: "Description is required" })}
                  className="h-40 font-mono text-sm"
                  value={description || ''}
                  onChange={(e) => {
                    setValue("description", e.target.value, { shouldValidate: true });
                  }}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-purple-600">
                    <Sparkles className="h-4 w-4" />
                    AI Assistance
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleImproveDescription}
                      disabled={isImproving || !description}
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      {isImproving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Enhance Text
                        </>
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <Select
                        value={selectedBulletTemplate}
                        onValueChange={setSelectedBulletTemplate}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {BULLET_TEMPLATES[entryType].map((template, i) => (
                            <SelectItem key={i} value={template} className="text-sm">
                              {template.length > 50 ? `${template.substring(0, 47)}...` : template}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={handleApplyTemplate}
                        disabled={!selectedBulletTemplate}
                        className="bg-purple-50 text-purple-600 hover:bg-purple-100"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              {currentTab !== "basic" && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab(currentTab === "description" ? "details" : "basic")}
                >
                  Back
                </Button>
              )}
              {currentTab !== "description" && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    const isValid = await validateCurrentForm();
                    if (isValid) {
                      setCurrentTab(currentTab === "basic" ? "details" : "description");
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setIsAdding(false);
                  setEditingIndex(null);
                  setCurrentTab("basic");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!isDirty || !isFormValid}
              >
                {editingIndex !== null ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Entry
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};