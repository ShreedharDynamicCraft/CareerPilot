// Resume section types
export const SECTION_TYPES = [
  "PersonalInfo",
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications",
  "Achievements",
  "Custom",
  "Languages",
  "Interests",
];

// Resume templates
export const RESUME_TEMPLATES = [
  { id: "professional", name: "Professional" },
  { id: "academic", name: "Academic" },
  { id: "minimal", name: "Minimal" },
  { id: "creative", name: "Creative" },
];

// Font options
export const FONT_OPTIONS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "garamond", label: "Garamond" },
  { value: "times-new-roman", label: "Times New Roman" },
  { value: "helvetica", label: "Helvetica" },
  { value: "calibri", label: "Calibri" },
  { value: "arial", label: "Arial" },
  { value: "georgia", label: "Georgia" },
  { value: "cambria", label: "Cambria" },
];

// Default resume data structure
export const DEFAULT_RESUME_DATA = {
  id: "",
  name: "Untitled Resume",
  template: "professional",
  font: "inter",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: {
    PersonalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
    },
    Experience: [],
    Education: [],
    Skills: { categories: [] },
    Projects: [],
    Certifications: [],
    Achievements: [],
    Custom: {
      title: "Custom Section",
      items: []
    },
    Languages: [],
    Interests: [],
  },
};